/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {CloudTasksClient} from "@google-cloud/tasks";
import {setGlobalOptions, logger, https} from "firebase-functions";
import {onDocumentUpdated} from "firebase-functions/v2/firestore";
import {onTaskDispatched} from "firebase-functions/v2/tasks";
import {onRequest} from "firebase-functions/v2/https";
import {z} from "zod";
import {Timestamp} from "firebase-admin/firestore";
import * as admin from "firebase-admin";
import {transformRiotDataToMatchResult} from "./riotApiTransformer";
import axios from "axios";
import {defineSecret} from "firebase-functions/params";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function"s options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

admin.initializeApp({
  serviceAccountId: "grumble-5885f@appspot.gserviceaccount.com",
});
const db = admin.firestore();
const tasksClient = new CloudTasksClient();

interface AuthData {
  accessCode: string;
}

const GameNotificationSchema = z.object({
  startTime: z.optional(z.number()),
  shortCode: z.optional(z.string()),
  metadata: z.optional(z.string()),
  gameId: z.optional(z.number()),
  gameName: z.optional(z.string()),
  gameType: z.optional(z.string()),
  gameMap: z.optional(z.number()),
  gameMode: z.optional(z.string()),
  region: z.optional(z.string()),
});

const UpdateStandingsSchema = z.object({
  shortCode: z.optional(z.string()),
});

const DRAFT_PICK_TIME_LIMIT_IN_SECONDS = 2 * 60 * 60;
const PROJECT = "grumble-5885f";
const LOCATION = "us-central1"; // Or your function"s location
const QUEUE = "executeautopick"; // The default queue created by Firebase
const WINS_NEEDED_FOR_MATCH = 2;

const riotApiKey = defineSecret("RIOT_API_KEY");

export const getAuthTokenForAdminAccessCode = https.onCall<AuthData>(
  async (rawRequest) => {
    const accessCode = rawRequest.data.accessCode;
    if (!accessCode || typeof accessCode !== "string") {
      throw new https.HttpsError(
        "invalid-argument",
        "You must provide a valid access code."
      );
    }

    const codesRef = db.collection("adminAccessCodes");
    const snapshot = await codesRef
      .where("accessCode", "==", accessCode)
      .limit(1)
      .get();
    if (snapshot.empty) {
      throw new https.HttpsError(
        "not-found",
        "Invalid access code."
      );
    }

    // Get the adminId from the matched document"s ID
    const adminId = snapshot.docs[0].id;
    const uid = `admin-${adminId}`; // Create a unique ID for this user

    // Create a custom auth token with the adminId as a custom claim
    const customToken = await admin.auth().createCustomToken(uid, {adminId});

    return {token: customToken};
  }
);

export const getAuthTokenForAccessCode = https.onCall<AuthData>(
  async (rawRequest) => {
    const accessCode = rawRequest.data.accessCode;
    logger.debug(`Requesting access for ${accessCode}`);

    if (!accessCode || typeof accessCode !== "string") {
      throw new https.HttpsError(
        "invalid-argument",
        "You must provide a valid access code."
      );
    }

    // Query the secure collection for a matching access code
    const codesRef = db.collection("teamAccessCodes");
    const snapshot = await codesRef
      .where("accessCode", "==", accessCode)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new https.HttpsError(
        "not-found",
        "Invalid access code."
      );
    }
    logger.debug(
      `Access granted to ${snapshot.docs[0].data().captainName}`);

    // Get the teamId from the matched document"s ID
    const isLegacyTeamId = !Number.isNaN(Number(snapshot.docs[0].id));
    const teamId = isLegacyTeamId ?
      Number(snapshot.docs[0].id) :
      snapshot.docs[0].data().teamId;
    const division = snapshot.docs[0].data().division ?? "";
    logger.debug(`Team access for division ${division}`);
    const uid = `captain-${teamId}`; // Create a unique ID for this user

    // Create a custom auth token with the teamId as a custom claim
    const customToken = await admin
      .auth()
      .createCustomToken(uid, {teamId, division});

    return {token: customToken};
  });

export const scheduleAutoPick = onDocumentUpdated("drafts/grumble2025_",
  async (event) => {
    logger.debug("Event received: ", event);
    const change = event.data;
    if (!change) return;

    const before = change.before.data();
    const after = change.after.data();

    // Only run if the pick has actually changed
    if (before.currentPickIndex === after.currentPickIndex) {
      return;
    }

    // First, cancel any previously scheduled task
    if (before.activeTimerTaskName) {
      const taskPath = tasksClient.taskPath(
        PROJECT,
        LOCATION,
        QUEUE,
        before.activeTimerTaskName);
      try {
        await tasksClient.deleteTask({name: taskPath});
        logger.log(
          `Canceled old task: ${before.activeTimerTaskName}`
        );
      } catch (error) {
        logger.warn(
          "Failed to cancel task, it may have already run:", error
        );
      }
    }

    // Don"t schedule a new task if the draft is over
    if (after.currentPickIndex >= after.pickOrder.length) {
      return;
    }

    const queuePath = tasksClient.queuePath(PROJECT, LOCATION, QUEUE);
    const url = `https://${LOCATION}-${PROJECT}.cloudfunctions.net/executeAutoPick`;
    const serviceAccountEmail = `${PROJECT}@appspot.gserviceaccount.com`;

    const scheduleTime = new Date(
      Date.now() + DRAFT_PICK_TIME_LIMIT_IN_SECONDS * 1000);
    const task = {
      httpRequest: {
        httpMethod: "POST" as const,
        url,
        headers: {"Content-Type": "application/json"},
        body: Buffer
          .from(JSON.stringify({data: {draftId: "grumble2025_"}}))
          .toString("base64"),
        oidcToken: {
          serviceAccountEmail,
        },
      },
      scheduleTime: {
        seconds: Math.floor(scheduleTime.getTime() / 1000),
      },
    };

    const [response] = await tasksClient.createTask({parent: queuePath, task});
    // Extract the short ID from the full path
    const taskName = response.name!.split("/").pop()!;

    // Schedule the new task
    logger.log(`Scheduled new task: ${taskName}`);

    // Update the draft document with the new task name for tracking
    return change.after.ref.update({activeTimerTaskName: taskName});
  });

// This function is CALLED BY CLOUD TASKS when the timer expires.
export const executeAutoPick = onTaskDispatched({
  retryConfig: {maxAttempts: 5, minBackoffSeconds: 60},
  rateLimits: {maxDispatchesPerSecond: 500},
}, async (req: any) => {
  const {draftId} = req.data;
  logger.log(`Executing auto-pick for draft: ${draftId}`);

  const draftRef = db.collection("drafts").doc(draftId);
  const draftDoc = await draftRef.get();
  if (!draftDoc.exists) {
    throw new Error(`Draft ${draftId} not found.`);
  }

  const draftState = draftDoc.data();
  if (!draftState) return;
  logger.log(
    `Draft state current pick index: ${draftState.currentPickIndex}`
  );

  if (!draftState) {
    // No draft state, return
    return;
  }

  // Double-check: Has the pick already been made?
  // This prevents a race condition where a user picks just as the timer expires
  const now = Timestamp.now();
  if (!draftState.pickEndsAt || draftState.pickEndsAt < now) {
    logger.log(
      "Pick was already made or timer was updated. Aborting auto-pick."
    );
    return;
  }

  const dateNow = new Date();
  if (dateNow.getHours() < 8 && dateNow.getHours() >= 5) {
    logger.log(
      "Auto-pick was scheduled outside of draft hours."
    );
    return;
  }

  const allRoles = ["top", "mid", "jungle", "adc", "support"];

  // --- Auto-pick Logic ---
  const teamIdPicking = draftState.pickOrder[draftState.currentPickIndex];
  const pickingTeam = draftState.teams.find((t: any) => t.id === teamIdPicking);
  const availablePlayers = draftState.availablePlayers;

  // 1. Determine the roles already filled on the team
  const filledRoles = new Set(pickingTeam
    .players
    .map((p: any) => p.role)
  );
  const neededRoles = allRoles.filter((role) => !filledRoles.has(role));
  logger.log(`Team ${teamIdPicking} needs roles:`, neededRoles);

  // Fetch the captain"s priority list
  const draftBoardsDoc = await db
    .collection("draftBoards")
    .doc(teamIdPicking.toString())
    .get();
  const priorityPlayerIds: number[] =
    draftBoardsDoc.data ? draftBoardsDoc.data()?.playerIds || [] : [];

  let playerToDraftId: number | undefined;

  // 3. Primary Search: Find the highest priority player who fills a needed role
  if (neededRoles.length > 0) {
    for (const pId of priorityPlayerIds) {
      const player = availablePlayers.find((p: any) => p.id === pId);
      if (player && neededRoles.includes(player.role)) {
        playerToDraftId = pId;
        logger.log(
          `Primary search found: 
Player ${pId} (${player.role}) fills a needed role.`);
        break;
      }
    }
  }

  // Fallback 1: If no role-fit found find the highest priority player available
  if (!playerToDraftId) {
    logger.log(
      `Primary search failed. 
Falling back to best available from priority list.`);
    for (const pId of priorityPlayerIds) {
      if (availablePlayers.some((p: any) => p.id === pId)) {
        playerToDraftId = pId;
        logger.log(
          `Fallback 1 found: 
Player ${pId} is the highest available priority pick.`
        );
        break;
      }
    }
  }


  const convertRankToElo = (rankTier: string, rankDivision: number): number => {
    const rankTierToNumber: {[key: string]: number} = {
      "Challenger": 100,
      "Grandmasters": 90,
      "Masters": 80,
      "Diamond": 70,
      "Emerald": 60,
      "Platinum": 50,
      "Gold": 40,
      "Silver": 30,
      "Bronze": 20,
      "Iron": 10,
      "Unranked": 0,
    };

    if (rankTier === "Masters" ||
        rankTier === "Grandmasters" ||
        rankTier === "Challenger") {
      return 100 + rankDivision;
    }

    return rankTierToNumber[rankTier] + (10 - rankDivision) || 0;
  };

  interface Player {
    id: number;
    name: string;
    peakRankTier: string;
    peakRankDivision: number;
    soloRankTier: string;
    soloRankDivision: number;
    flexRankTier: string;
    flexRankDivision: number;
    timezone: string;
    isCaptain: boolean;
    role: string;
    secondaryRoles: string[];
    teamId?: number | null;
  }

  const compareRanks = (player1: Player, player2: Player): number => {
    return Math.max(
      convertRankToElo(player2.peakRankTier, player2.peakRankDivision),
      convertRankToElo(player2.soloRankTier, player2.soloRankDivision),
      convertRankToElo(player2.flexRankTier, player2.flexRankDivision)) -
        Math.max(
          convertRankToElo(player1.peakRankTier, player1.peakRankDivision),
          convertRankToElo(player1.soloRankTier, player1.soloRankDivision),
          convertRankToElo(player1.flexRankTier, player1.flexRankDivision));
  };


  // Fallback 2: If priority list exhausted, find the highest Elo player overall
  if (!playerToDraftId) {
    logger.log(
      "Fallback 1 failed. Falling back to best available Elo.");
    // Create a mutable copy to sort
    const sortedAvailable = [...availablePlayers];
    sortedAvailable.sort(compareRanks);
    playerToDraftId = sortedAvailable[0]?.id;
    logger.log(
      `Fallback 2 found: Player ${playerToDraftId} has the highest Elo.`);
  }

  // Perform the draft with the selected player
  if (!playerToDraftId) {
    throw new Error("Auto-pick failed: Could not determine a player to draft.");
  }

  if (playerToDraftId) {
    // --- Perform the draft update ---
    const playerToDraft = availablePlayers
      .find((p: any) => p.id === playerToDraftId);

    const newTeams = draftState.teams.map((team: any) =>
      team.id === teamIdPicking ?
        {...team, players: [...team.players, playerToDraft]} :
        team
    );
    const newAvailablePlayers = draftState
      .availablePlayers
      .filter((p: any) => p.id !== playerToDraftId);
    const newCompletedPicks = {
      ...draftState.completedPicks,
      [draftState.currentPickIndex]: playerToDraftId,
    };
    const nextPickIndex = draftState.currentPickIndex + 1;
    const nextDeadline = Date.now() + DRAFT_PICK_TIME_LIMIT_IN_SECONDS * 1000;

    const updatedDraftState = {
      ...draftState,
      teams: newTeams,
      availablePlayers: newAvailablePlayers,
      completedPicks: newCompletedPicks,
      currentPickIndex: nextPickIndex,
      pickEndsAt: nextDeadline,
    };
    await draftRef.update(updatedDraftState);
    logger.log(
      `Auto-picked player ${playerToDraft.name} for team ${teamIdPicking}`
    );
    return;
  }

  logger.log(`Auto-pick un-successful for draft: ${draftId}`);
});


/** ****************** **
 *  POST-GAME ENDPOINTS *
 ** ****************** **/
export const gameNotificationEndpoint = onRequest(
  {secrets: [riotApiKey]},
  async (req, res) => {
    logger.info(
      `Received post game notification 
      ${req} with body ${JSON.stringify(req.body)}`);
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const notificationData = GameNotificationSchema.parse(req.body);
      logger.info(
        `Received valid notification for match: ${notificationData.shortCode}`
      );

      logger.info(
        `Processing request for game with Riot gameId 
${notificationData.gameId}`
      );

      let matchResultData = {
        winner: -1,
        blueTeam: {
          players: [{playerName: ""}],
        },
        redTeam: {
          players: [{playerName: ""}],
        },
      };

      try {
        const riotApiUrl = `https://americas.api.riotgames.com/lol/match/v5/matches/${notificationData.region}_${notificationData.gameId}`;
        const riotApiResponse = await axios.get(riotApiUrl, {
          headers: {"X-Riot-Token": riotApiKey.value()},
        });

        matchResultData =
          await transformRiotDataToMatchResult(riotApiResponse.data);

        logger.info(
          `Fetched match result data ${JSON.stringify(matchResultData)}`);
      } catch (e) {
        logger.error(
          `Failed to fetch match data for ${notificationData.gameId}.`);
        logger.error(`Failed with error ${e}`);
      }

      const matchRef = db
        .collection("matches")
        .doc(notificationData.shortCode ?? "grumble2025_unknown");
      const resultRef = db
        .collection("match_results")
        .doc(notificationData.shortCode ?? "grumble2025_unknown");

      const batch = db.batch();

      const resultPayload = {
        ...notificationData,
        ...matchResultData,
        submittedAt: Timestamp.now(),
      };

      logger.info(
        `Attempting to update results with ${JSON.stringify(resultPayload)}`
      );

      batch.set(resultRef, resultPayload);
      batch.update(matchRef, {
        status: "completed",
        winnerId: matchResultData.winner,
      });

      await batch.commit();

      // ////////////////////
      // Update Standings //
      // ////////////////////
      const shortCodeDocRef = db.doc(`matches/${notificationData.shortCode}`);
      const shortCodeDoc = await shortCodeDocRef.get();
      if (!shortCodeDoc.exists) {
        throw new Error(
          `Document for shortCode '${notificationData.shortCode}' not found.`
        );
      }
      const {division, matchId} = shortCodeDoc.data()!;
      logger.info(`Found division ${division} and matchId ${matchId}`);
      if (!division || !matchId) {
        throw new Error(
          `Document '${notificationData.shortCode}'
is missing 'division' or 'matchId' field.`);
      }
      const winnerId = await findTeamIdByPlayerNames(
        matchResultData.winner === 100 ?
          matchResultData.blueTeam.players.map((p) => p.playerName) :
          matchResultData.redTeam.players.map((p) => p.playerName),
        division);
      updateStandings(
        notificationData.shortCode || "grumble2025_unknown",
        winnerId || -1,
        division,
        matchId);

      logger.info(`Successfully created result for match 
        ${notificationData.shortCode} and updated match status.`);
      res.status(201).send({message: "Match result created successfully."});
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error("Validation failed:", error.message);
        res.status(400).send({
          message: "Invalid request body.", errors: error.message,
        });
      } else {
        logger.error("Internal server error:", error);
        res.status(500).send({message: "An internal error occurred."});
      }
    }
  }
);

const updateStandings = async (
  shortCode: string,
  winnerId: number,
  division: string,
  matchId: number) => {
  logger.info(`Updating standings for ${shortCode}`);

  if (winnerId === -1) {
    throw new Error("Invalid winner id.");
  }

  await db.runTransaction(async (transaction) => {
    const divisionTeamsDocRef = db.doc(`teams/grumble2025_${division}`);
    const divisionMatchesDocRef = db.doc(`matches/grumble2025_${division}`);

    // Read all necessary documents within the transaction
    const [divisionMatchesDoc, divisionTeamsDoc] =
      await transaction.getAll(divisionMatchesDocRef, divisionTeamsDocRef);

    if (!divisionMatchesDoc.exists) {
      throw new Error(
        `Matches document 'grumble2025_${division}' not found.`);
    }
    if (!divisionTeamsDoc.exists) {
      throw new Error(
        `Teams document 'grumble2025_${division}' not found.`);
    }

    const allMatches = divisionMatchesDoc.data()!.matches || [];
    const allTeams = divisionTeamsDoc.data()!.teams || [];

    const currentMatch = allMatches.find((m: any) => m.id === matchId);
    if (!currentMatch) {
      throw new Error(
        `Match with id '${matchId}' not found in division '${division}'.`
      );
    }
    logger.info(`Current match ${JSON.stringify(currentMatch)}`);

    const {team1Id, team2Id} = currentMatch;
    const loserId = winnerId === team1Id ? team2Id : team1Id;

    const winnerIndex = allTeams.findIndex((t: any) => t.id === winnerId);
    const loserIndex = allTeams.findIndex((t: any) => t.id === loserId);
    if (winnerIndex === -1 || loserIndex === -1) {
      throw new Error(
        `One or both teams
(${winnerId}, ${loserId})
not found in division '${division}'.`);
    }

    allTeams[winnerIndex].gameWins += 1;
    allTeams[winnerIndex].gameRecord =
      `${allTeams[winnerIndex].gameWins}-${allTeams[winnerIndex].gameLosses}`;
    allTeams[loserIndex].gameLosses += 1;
    allTeams[loserIndex].gameRecord =
      `${allTeams[loserIndex].gameWins}-${allTeams[loserIndex].gameLosses}`;
    logger.info(
      `Updated game records for match ${matchId}.
Winner: ${allTeams[winnerIndex].gameRecord},
Loser: ${allTeams[loserIndex].gameRecord}`);

    // check if winner has enough games
    if (allTeams[winnerIndex].gameWins >= WINS_NEEDED_FOR_MATCH) {
      logger.info(
        `Match win condition met for Team ${winnerId} in match ${matchId}!`);
      allTeams[winnerIndex].wins += 1;
      allTeams[winnerIndex].record =
        `${allTeams[winnerIndex].wins}-${allTeams[winnerIndex].losses}`;
      allTeams[loserIndex].losses += 1;
      allTeams[loserIndex].record =
        `${allTeams[loserIndex].wins}-${allTeams[loserIndex].losses}`;
    }

    transaction.update(divisionTeamsDocRef, {teams: allTeams});
  });
};


/**
 * Finds the team ID that a given list of player names belongs to.
 * Returns a match if even one player from the list is found on a team.
 *
 * @param {string[]} playerNames - An array of player names to check.
 * @param {string} division - The tournament division
 * @return {Promise<number |null>} Matching team's ID (number)
 */
export async function findTeamIdByPlayerNames(
  playerNames: string[],
  division: "gold" | "master"
): Promise<number | null> {
  if (!playerNames || playerNames.length === 0) {
    logger.info("No player names provided, skipping lookup.");
    return null;
  }

  logger.info(
    `Searching for team in '${division}' division for players:`,
    playerNames
  );

  const teamsDocRef = db.doc(`teams/grumble2025_${division}`);
  const playersDocRef = db.doc(`players/grumble2025_${division}`);

  try {
    const [teamsDocSnap, playersDocSnap] = await Promise.all([
      teamsDocRef.get(),
      playersDocRef.get(),
    ]);

    if (!teamsDocSnap.exists) {
      throw new Error(`Teams document 'grumble2025_${division}' not found.`);
    }
    if (!playersDocSnap.exists) {
      throw new Error(`Players document 'grumble2025_${division}' not found.`);
    }

    const allTeams = teamsDocSnap.data()!.teams;
    const allPlayers = playersDocSnap.data()!.players;

    if (!allTeams || !allPlayers) {
      throw new Error(
        "Required 'teams' or 'players' array field is missing in the documents."
      );
    }

    const playerNamesToFindSet =
      new Set(playerNames.map((p: any) => p.split("#")[0]));
    const playerIdsToFindSet = new Set<number>();

    logger.info(`Searching for ${playerNames}`);

    for (const player of allPlayers) {
      if (playerNamesToFindSet.has(player.name.split("#")[0])) {
        playerIdsToFindSet.add(player.id);
      }
    }

    if (playerIdsToFindSet.size === 0) {
      logger.info(
        "None of the player names were found in the master player list."
      );
      return null;
    }

    for (const team of allTeams) {
      for (const playerIdOnTeam of team.players) {
        if (playerIdsToFindSet.has(playerIdOnTeam)) {
          logger.info(
            `Found match!
Player ID ${playerIdOnTeam} is on
Team ID ${team.id} (${team.name}).`);
          return team.id;
        }
      }
    }

    logger.info("No team found containing any of the specified players.");
    return null;
  } catch (error) {
    logger.info("Error finding team by player names:", error);
    // In case of an error, we should not return a team ID.
    return null;
  }
}

export const updateStandingsWithExistingMatchResult = onRequest(
  {secrets: [riotApiKey]},
  async (req, res) => {
    const reqData = UpdateStandingsSchema.parse(req.body);

    const resultRef = db
      .collection("match_results")
      .doc(reqData.shortCode ?? "grumble2025_unknown");

    try {
      const resultData = await resultRef.get();
      if (!resultData.exists) {
        throw new Error(
          `Result doc for ${reqData.shortCode} not found.`
        );
      }

      const {winner, blueTeam, redTeam} = resultData.data()!;

      const shortCodeDocRef = db.doc(`matches/${reqData.shortCode}`);
      const shortCodeDoc = await shortCodeDocRef.get();
      if (!shortCodeDoc.exists) {
        throw new Error(
          `Document for shortCode '${reqData.shortCode}' not found.`
        );
      }
      const {division, matchId} = shortCodeDoc.data()!;
      logger.info(`Found division ${division} and matchId ${matchId}`);
      if (!division || !matchId) {
        throw new Error(
          `Document '${reqData.shortCode}'
is missing 'division' or 'matchId' field.`);
      }
      const winnerId = await findTeamIdByPlayerNames(
        winner === 100 ?
          blueTeam.players.map((p: any) => p.playerName) :
          redTeam.players.map((p: any) => p.playerName),
        division);
      updateStandings(
        reqData.shortCode || "grumble2025_unknown",
        winnerId || -1,
        division,
        matchId);
    } catch (e) {
      logger.error(
        `Failed to fetch match data for ${reqData.shortCode}.`);
      logger.error(`Failed with error ${e}`);
    }
    res.status(201).send({message: "Standings updated successfully."});
  });

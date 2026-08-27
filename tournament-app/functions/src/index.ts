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
import {onRequest, onCall, HttpsError} from "firebase-functions/v2/https";
import {z} from "zod";
import {Timestamp} from "firebase-admin/firestore";
import * as admin from "firebase-admin";
import {transformRiotDataToMatchResult} from "./riotApiTransformer";
import {updateBracketForGameResult} from "./bracketUtils";
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

type GameNotification = z.infer<typeof GameNotificationSchema>;


const DRAFT_PICK_TIME_LIMIT_IN_SECONDS = 40 * 60;
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

    const year = (rawRequest.data as any).year || "2026";
    const prefix = `grumble${year}`;

    const masterRef = db.collection("teamAccessCodes").doc(`${prefix}_master`);
    const goldRef = db.collection("teamAccessCodes").doc(`${prefix}_gold`);
    const testRef = db.collection("teamAccessCodes").doc(`${prefix}_test`);
    const subsRef = db.collection("teamAccessCodes").doc(`${prefix}_subs`);
    const castersRef = db.collection("teamAccessCodes")
      .doc(`${prefix}_casters`);

    const [
      masterSnap,
      goldSnap,
      testSnap,
      subsSnap,
      castersSnap,
    ] = await Promise.all([
      masterRef.get(),
      goldRef.get(),
      testRef.get(),
      subsRef.get(),
      castersRef.get(),
    ]);

    let matchedData: any = null;
    let matchedId: string | null = null;
    let isSub = false;
    let isCaster = false;

    if (masterSnap.exists) {
      const data = masterSnap.data();
      for (const [id, entry] of Object.entries(data || {})) {
        if ((entry as any).accessCode === accessCode) {
          matchedData = entry;
          matchedId = id;
          break;
        }
      }
    }

    if (!matchedData && goldSnap.exists) {
      const data = goldSnap.data();
      for (const [id, entry] of Object.entries(data || {})) {
        if ((entry as any).accessCode === accessCode) {
          matchedData = entry;
          matchedId = id;
          break;
        }
      }
    }

    if (!matchedData && testSnap.exists) {
      const data = testSnap.data();
      for (const [id, entry] of Object.entries(data || {})) {
        if ((entry as any).accessCode === accessCode) {
          matchedData = entry;
          matchedId = id;
          break;
        }
      }
    }

    if (!matchedData && subsSnap.exists) {
      const data = subsSnap.data();
      for (const [id, entry] of Object.entries(data || {})) {
        if ((entry as any).accessCode === accessCode) {
          matchedData = entry;
          matchedId = id;
          isSub = true;
          break;
        }
      }
    }

    if (!matchedData && castersSnap.exists) {
      const data = castersSnap.data();
      for (const [id, entry] of Object.entries(data || {})) {
        if ((entry as any).accessCode === accessCode) {
          matchedData = entry;
          matchedId = id;
          isCaster = true;
          break;
        }
      }
    }

    if (!matchedData) {
      throw new https.HttpsError(
        "not-found",
        "Invalid access code."
      );
    }

    let customToken;
    if (isSub) {
      logger.debug(`Access granted to Sub: ${matchedData.name}`);
      const uid = `sub-${matchedId}`;
      customToken = await admin.auth().createCustomToken(
        uid,
        {isSub: true, subName: matchedData.name}
      );
    } else if (isCaster) {
      logger.debug(`Access granted to Caster: ${matchedData.name}`);
      const uid = `caster-${matchedId}`;
      customToken = await admin.auth().createCustomToken(
        uid,
        {isCaster: true, casterName: matchedData.name}
      );
    } else {
      logger.debug(`Access granted to ${matchedData.captainName}`);

      // Get the teamId from the matched document"s ID
      const isLegacyTeamId = !Number.isNaN(Number(matchedId));
      const teamId = isLegacyTeamId ?
        Number(matchedId) :
        matchedData.teamId;
      const division = matchedData.division ?? "";
      logger.debug(`Team access for division ${division}`);
      const uid = `captain-${teamId}`; // Create a unique ID for this user

      // Create a custom auth token with the teamId as a custom claim
      customToken = await admin
        .auth()
        .createCustomToken(uid, {teamId, division, isTeamMember: true});
    }

    return {token: customToken};
  });

export const scheduleAutoPick = onDocumentUpdated("drafts/grumble2026_",
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
          .from(JSON.stringify({data: {draftId: "grumble2026_"}}))
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

  // --- Auto-pick Logic ---
  const teamIdPicking = draftState.pickOrder[draftState.currentPickIndex];
  const availablePlayers = draftState.availablePlayers;

  // Fetch the captain's priority list
  const draftBoardsDoc = await db
    .collection("draftBoards")
    .doc(teamIdPicking.toString())
    .get();
  const priorityPlayerIds: number[] =
    draftBoardsDoc.data ? draftBoardsDoc.data()?.playerIds || [] : [];

  let playerToDraftId: number | undefined;

  // Find the highest priority player available from the captain's list
  for (const pId of priorityPlayerIds) {
    if (availablePlayers.some((p: any) => p.id === pId)) {
      playerToDraftId = pId;
      logger.log(`Auto-pick found player from priority list: ${pId}`);
      break;
    }
  }


  const convertRankToElo = (rankTier: string, rankDivision: number): number => {
    const rankTierToNumber: {[key: string]: number} = {
      "Challenger": 100,
      "Grandmasters": 100,
      "Grandmaster": 100,
      "Masters": 100,
      "Master": 100,
      "Diamond": 70,
      "Emerald": 60,
      "Platinum": 50,
      "Gold": 40,
      "Silver": 30,
      "Bronze": 20,
      "Iron": 10,
      "Unranked": 0,
    };

    if (
      rankTier === "Masters" ||
      rankTier === "Master" ||
      rankTier === "Grandmasters" ||
      rankTier === "Challenger"
    ) {
      return rankTierToNumber[rankTier] + rankDivision;
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
    const p1Max = Math.max(
      convertRankToElo(player1.peakRankTier, player1.peakRankDivision),
      convertRankToElo(player1.soloRankTier, player1.soloRankDivision),
      convertRankToElo(player1.flexRankTier, player1.flexRankDivision)
    );
    const p2Max = Math.max(
      convertRankToElo(player2.peakRankTier, player2.peakRankDivision),
      convertRankToElo(player2.soloRankTier, player2.soloRankDivision),
      convertRankToElo(player2.flexRankTier, player2.flexRankDivision)
    );

    if (p1Max === p2Max) {
      let p1Sum = convertRankToElo(
        player1.peakRankTier,
        player1.peakRankDivision
      );
      let p2Sum = convertRankToElo(
        player2.peakRankTier,
        player2.peakRankDivision
      );
      if (player1.soloRankDivision !== -1 && player2.soloRankDivision !== -1) {
        p1Sum += convertRankToElo(
          player1.soloRankTier,
          player1.soloRankDivision
        );
        p2Sum += convertRankToElo(
          player2.soloRankTier,
          player2.soloRankDivision
        );
      }
      if (player1.flexRankDivision !== -1 && player2.flexRankDivision !== -1) {
        p1Sum += convertRankToElo(
          player1.flexRankTier,
          player1.flexRankDivision
        );
        p2Sum += convertRankToElo(
          player2.flexRankTier,
          player2.flexRankDivision
        );
      }
      if (p1Sum === p2Sum) {
        return player1.id - player2.id;
      }
      return p1Sum - p2Sum;
    }

    return p1Max - p2Max;
  };


  // Fallback 2: If priority list exhausted, find the highest Elo player overall
  if (!playerToDraftId) {
    logger.log(
      "Fallback 1 failed. Falling back to best available Elo.");
    // Create a mutable copy to sort
    const sortedAvailable = [...availablePlayers];
    sortedAvailable.sort((a, b) => compareRanks(b, a));
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

    const numTeams = draftState.teams.length;
    const newPickOrder = [...draftState.pickOrder];

    if ((draftState.currentPickIndex + 1) % numTeams === 0) {
      const currentRound =
        Math.floor(draftState.currentPickIndex / numTeams) + 1;

      if (currentRound < 5) {
        const teamElos = newTeams.map((team: any) => {
          const totalElo = team.players.reduce((sum: number, p: any) => {
            const maxElo = Math.max(
              convertRankToElo(p.peakRankTier, p.peakRankDivision),
              convertRankToElo(p.soloRankTier, p.soloRankDivision),
              convertRankToElo(p.flexRankTier, p.flexRankDivision)
            );
            return sum + maxElo;
          }, 0);
          return {id: team.id, elo: totalElo};
        });

        teamElos.sort((a: any, b: any) => {
          if (a.elo === b.elo) {
            return a.id - b.id;
          }
          return a.elo - b.elo;
        });

        const sortedTeamIds = teamElos.map((t: any) => t.id);

        for (let r = currentRound + 1; r <= 5; r++) {
          const startIdx = (r - 1) * numTeams;
          const roundOrder = [...sortedTeamIds];

          // Snake prediction: alternate order for future rounds
          if ((r - currentRound) % 2 === 0) {
            roundOrder.reverse();
          }

          for (let j = 0; j < numTeams; j++) {
            newPickOrder[startIdx + j] = roundOrder[j];
          }
        }

        const allPlayers: Player[] = [...newAvailablePlayers];
        for (const team of newTeams) {
          if (team.players) {
            allPlayers.push(...team.players);
          }
        }

        const captains = allPlayers
          .filter((p: Player) => p.isCaptain)
          .sort((a: Player, b: Player) => compareRanks(b, a));
        const captainsReversed = [...captains].reverse();
        const allPlayersSorted = [...allPlayers]
          .sort((a: Player, b: Player) => compareRanks(b, a))
          .reverse();

        const playerSkipSlot: { [playerId: number]: number } = {};
        allPlayersSorted.forEach((player: Player, index: number) => {
          if (player.isCaptain) {
            playerSkipSlot[player.id] = index / allPlayers.length;
          }
        });

        captainsReversed.forEach((captain: Player) => {
          const captainPercent = playerSkipSlot[captain.id];
          if (captainPercent !== undefined) {
            let forcedRound = 0;
            if (captainPercent <= 0.2) forcedRound = 5;
            else if (captainPercent <= 0.4) forcedRound = 4;
            else if (captainPercent <= 0.6) forcedRound = 3;
            else if (captainPercent <= 0.8) forcedRound = 2;
            else if (captainPercent <= 1.0) forcedRound = 1;

            if (forcedRound > currentRound) {
              const startIdx = (forcedRound - 1) * numTeams;
              for (let j = 0; j < numTeams; j++) {
                if (newPickOrder[startIdx + j] === captain.teamId) {
                  newPickOrder[startIdx + j] = captain.name;
                  break;
                }
              }
            }
          }
        });
      }
    }

    let nextPickIndex = draftState.currentPickIndex + 1;
    // Update skipped picks
    while (
      typeof newPickOrder[nextPickIndex] === "string" &&
      nextPickIndex < newPickOrder.length
    ) {
      nextPickIndex++;
    }

    const nextDeadline = Date.now() + DRAFT_PICK_TIME_LIMIT_IN_SECONDS * 1000;

    const updatedDraftState = {
      ...draftState,
      teams: newTeams,
      availablePlayers: newAvailablePlayers,
      completedPicks: newCompletedPicks,
      currentPickIndex: nextPickIndex,
      pickOrder: newPickOrder,
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
/**
 * Processes a completed game using the provided notification data by fetching
 * match details from the Riot API, resolving teams, and updating standings.
 *
 * @param {GameNotification} notificationData - The game notification data.
 * @return {Promise<void>} A promise that resolves when processing is complete.
 */
async function executeGameNotificationProcessing(
  notificationData: GameNotification
): Promise<void> {
  logger.info(
    `Processing request for game with Riot gameId ${notificationData.gameId}`
  );
  logger.debug(
    "executeGameNotificationProcessing entry: " +
    `shortCode=${notificationData.shortCode}, ` +
    `gameId=${notificationData.gameId}, region=${notificationData.region}`
  );

  // Fetch match metadata to determine division
  const shortCodeDocRef = db.doc(`matches/${notificationData.shortCode}`);
  const shortCodeDoc = await shortCodeDocRef.get();
  if (!shortCodeDoc.exists) {
    throw new Error(
      `Document for shortCode '${notificationData.shortCode}' not found.`
    );
  }
  const {division, matchId} = shortCodeDoc.data()!;
  if (!division || !matchId) {
    throw new Error(
      `Document '${notificationData.shortCode}' ` +
      "is missing 'division' or 'matchId' field."
    );
  }
  logger.debug(
    `Fetched match metadata: division=${division}, matchId=${matchId}`
  );

  logger.info(`Proceeding with processing for match ${matchId}.`);

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
    logger.debug(`Calling Riot API: url=${riotApiUrl}`);
    const riotApiResponse = await axios.get(riotApiUrl, {
      headers: {"X-Riot-Token": riotApiKey.value()},
    });

    matchResultData =
      await transformRiotDataToMatchResult(riotApiResponse.data);

    logger.info(
      `Fetched match result data ${JSON.stringify(matchResultData)}`);
    logger.debug(
      `Transformed Riot data: winner=${matchResultData.winner}, ` +
      `blue players count=${matchResultData.blueTeam.players.length}, ` +
      `red players count=${matchResultData.redTeam.players.length}`
    );
  } catch (e) {
    logger.error(
      `Failed to fetch match data for ${notificationData.gameId}.`);
    logger.error(`Failed with error ${e}`);
    throw e;
  }

  // Fetch teams and players once
  const teamsDocRef = db.doc(`teams/grumble2026_${division}`);
  const playersDocRef = db.doc(`players/grumble2026_${division}`);
  const [teamsDocSnap, playersDocSnap] = await Promise.all([
    teamsDocRef.get(),
    playersDocRef.get(),
  ]);

  if (!teamsDocSnap.exists) {
    throw new Error(`Teams document 'grumble2026_${division}' not found.`);
  }
  if (!playersDocSnap.exists) {
    throw new Error(
      `Players document 'grumble2026_${division}' not found.`
    );
  }

  const allTeams = teamsDocSnap.data()!.teams || [];
  const allPlayers = playersDocSnap.data()!.players || [];

  // Resolve side team names
  const bluePlayerNames =
    matchResultData.blueTeam.players.map((p) => p.playerName);
  const redPlayerNames =
    matchResultData.redTeam.players.map((p) => p.playerName);
  logger.debug(
    `Resolving team names: bluePlayers=[${bluePlayerNames.join(", ")}], ` +
    `redPlayers=[${redPlayerNames.join(", ")}]`
  );
  const blueTeamInfo = resolveTeamIdAndName(
    bluePlayerNames,
    allTeams,
    allPlayers
  );
  const redTeamInfo = resolveTeamIdAndName(
    redPlayerNames,
    allTeams,
    allPlayers
  );
  logger.debug(
    `Resolved team info: blueTeamInfo=${JSON.stringify(blueTeamInfo)}, ` +
    `redTeamInfo=${JSON.stringify(redTeamInfo)}`
  );

  if (blueTeamInfo) {
    matchResultData.blueTeam = {
      ...matchResultData.blueTeam,
      teamId: blueTeamInfo.id,
      teamName: blueTeamInfo.name,
    } as any;
  }
  if (redTeamInfo) {
    matchResultData.redTeam = {
      ...matchResultData.redTeam,
      teamId: redTeamInfo.id,
      teamName: redTeamInfo.name,
    } as any;
  }

  const winnerId = matchResultData.winner === 100 ?
    blueTeamInfo?.id :
    redTeamInfo?.id;

  const matchRef = db
    .collection("matches")
    .doc(notificationData.shortCode ?? "grumble2026_unknown");
  const resultRef = db
    .collection("match_results")
    .doc(notificationData.shortCode ?? "grumble2026_unknown");

  const batch = db.batch();

  const resultPayload = {
    ...notificationData,
    ...matchResultData,
    submittedAt: Timestamp.now(),
  };

  if (notificationData.shortCode) {
    const resultRef = db
      .collection("match_results")
      .doc(notificationData.shortCode);
    logger.debug(
      `Checking if match result document already exists: path=${resultRef.path}`
    );
    const resultDoc = await resultRef.get();
    if (resultDoc.exists) {
      logger.info(
        `Match result for shortCode ${notificationData.shortCode} ` +
        "already exists. Skipping duplicate processing."
      );
      return;
    }
  }

  logger.info(
    `Attempting to update results with ${JSON.stringify(resultPayload)}`
  );

  batch.set(resultRef, resultPayload);
  batch.update(matchRef, {
    status: "completed",
    winnerId: winnerId || -1,
  });

  logger.debug(
    `Writing to Firestore batch: matchRef=${matchRef.path}, ` +
    `resultRef=${resultRef.path}, winnerId=${winnerId}`
  );
  await batch.commit();
  logger.debug("Successfully committed Firestore batch.");

  // ////////////////////
  // Update Standings //
  // ////////////////////
  await updateStandings(
    notificationData.shortCode || "grumble2026_unknown",
    winnerId || -1,
    division,
    matchId);
}

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

      let lockRef: admin.firestore.DocumentReference | null = null;
      if (notificationData.shortCode) {
        lockRef = db
          .collection("match_lock")
          .doc(notificationData.shortCode);
        const lockDoc = await lockRef.get();
        if (lockDoc.exists) {
          logger.info(
            `Match lock for shortCode ${notificationData.shortCode} ` +
            "already exists. Skipping duplicate processing."
          );
          res.status(200).send({message: "Match is already being processed."});
          return;
        }
        await lockRef.set({
          createdAt: Timestamp.now(),
        });
      }

      try {
        if (notificationData.shortCode) {
          const resultRef = db
            .collection("match_results")
            .doc(notificationData.shortCode);
          const resultDoc = await resultRef.get();
          if (resultDoc.exists) {
            logger.info(
              `Match result for shortCode ${notificationData.shortCode} ` +
                "already exists. Skipping duplicate processing."
            );
            res.status(200).send({message: "Match result already processed."});
            return;
          }
        }

        await executeGameNotificationProcessing(notificationData);

        logger.info(`Successfully created result for match 
          ${notificationData.shortCode} and updated match status.`);
        res.status(201).send({message: "Match result created successfully."});
      } finally {
        if (lockRef) {
          await lockRef.delete();
        }
      }
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

export const processGameFromNotification = onCall(
  {secrets: [riotApiKey]},
  async (request) => {
    if (!request.auth || !request.auth.token.adminId) {
      throw new HttpsError(
        "failed-precondition",
        "Must be an administrator to perform this action."
      );
    }

    const notificationData = GameNotificationSchema.parse(request.data);
    if (
      !notificationData.shortCode ||
      !notificationData.gameId ||
      !notificationData.region
    ) {
      throw new HttpsError(
        "invalid-argument",
        "The notificationData must contain 'shortCode', 'gameId', and 'region'."
      );
    }

    try {
      await executeGameNotificationProcessing(notificationData);
      return {success: true, message: "Game processed successfully."};
    } catch (e: any) {
      logger.error(`Failed to process game from notification: ${e}`);
      throw new HttpsError(
        "internal",
        e.message || "An internal error occurred."
      );
    }
  }
);


const updateStandings = async (
  shortCode: string,
  winnerId: number,
  division: string,
  matchId: number | string
) => {
  logger.info(`Updating standings for ${shortCode}`);

  if (winnerId === -1) {
    throw new Error("Invalid winner id.");
  }

  await db.runTransaction(async (transaction) => {
    const divisionTeamsDocRef = db.doc(`teams/grumble2026_${division}`);
    const divisionMatchesDocRef = db.doc(`matches/grumble2026_${division}`);
    const divisionBracketDocRef = db.doc(`bracket/grumble2026_${division}`);

    // Read all necessary documents within the transaction
    const [divisionMatchesDoc, divisionTeamsDoc, divisionBracketDoc] =
      await transaction.getAll(
        divisionMatchesDocRef,
        divisionTeamsDocRef,
        divisionBracketDocRef
      );

    if (!divisionMatchesDoc.exists) {
      throw new Error(
        `Matches document 'grumble2026_${division}' not found.`);
    }
    if (!divisionTeamsDoc.exists) {
      throw new Error(
        `Teams document 'grumble2026_${division}' not found.`);
    }

    const allMatches = divisionMatchesDoc.data()!.matches || [];
    const allTeams = divisionTeamsDoc.data()!.teams || [];

    const currentMatchIndex = allMatches.findIndex((m: any) =>
      m.id === matchId ||
      String(m.id) === String(matchId) ||
      (Array.isArray(m.tournamentCodes) &&
        m.tournamentCodes.includes(shortCode)) ||
      String(m.id).replace(/^ko_/, "") === String(matchId).replace(/^ko_/, "")
    );

    let currentMatch: any = null;

    if (currentMatchIndex !== -1) {
      currentMatch = allMatches[currentMatchIndex];
      logger.info(`Current match: ${JSON.stringify(currentMatch)}`);

      const {team1Id, team2Id} = currentMatch;
      currentMatch.results = currentMatch.results || {};

      const alreadyProcessed = !!currentMatch.results[shortCode];
      const isTeam1 = winnerId === team1Id;

      currentMatch.results[shortCode] = {
        winnerId: winnerId,
        team1Win: isTeam1 ? 1 : 0,
        team2Win: isTeam1 ? 0 : 1,
      };

      const resultsList = Object.values(currentMatch.results);
      const team1Wins = resultsList.reduce(
        (sum: number, r: any) => sum + (r.team1Win || 0),
        0
      );
      const team2Wins = resultsList.reduce(
        (sum: number, r: any) => sum + (r.team2Win || 0),
        0
      );

      currentMatch.team1Wins = team1Wins;
      currentMatch.team2Wins = team2Wins;
      currentMatch.score = `${team1Wins}-${team2Wins}`;

      logger.debug(`Updated wins: Team 1 ${team1Wins} and team 2 ${team2Wins}`);

      if (!alreadyProcessed) {
        const loserId = winnerId === team1Id ? team2Id : team1Id;
        const winnerIndex = allTeams.findIndex((t: any) => t.id === winnerId);
        const loserIndex = allTeams.findIndex((t: any) => t.id === loserId);
        if (winnerIndex === -1 || loserIndex === -1) {
          throw new Error(
            `One or both teams (${winnerId}, ${loserId}) ` +
            `not found in division '${division}'.`
          );
        }

        allTeams[winnerIndex].gameWins += 1;
        const winRecord =
          `${allTeams[winnerIndex].gameWins}-` +
          `${allTeams[winnerIndex].gameLosses}`;
        allTeams[winnerIndex].gameRecord = winRecord;
        allTeams[loserIndex].gameLosses += 1;
        const loseRecord =
          `${allTeams[loserIndex].gameWins}-` +
          `${allTeams[loserIndex].gameLosses}`;
        allTeams[loserIndex].gameRecord = loseRecord;
        logger.info(
          `Updated game records for match ${matchId}. ` +
          `Winner: ${allTeams[winnerIndex].gameRecord}, ` +
          `Loser: ${allTeams[loserIndex].gameRecord}`
        );

        // check if winner has enough games
        const newTotalWins = winnerId === team1Id ? team1Wins : team2Wins;
        logger.debug(`Checking if enough wins ${newTotalWins}`);
        if (newTotalWins >= WINS_NEEDED_FOR_MATCH) {
          logger.info(
            `Match win condition met for Team ${winnerId} in match ${matchId}!`
          );
          allTeams[winnerIndex].wins += 1;
          allTeams[winnerIndex].record =
            `${allTeams[winnerIndex].wins}-${allTeams[winnerIndex].losses}`;
          allTeams[loserIndex].losses += 1;
          allTeams[loserIndex].record =
            `${allTeams[loserIndex].wins}-${allTeams[loserIndex].losses}`;
          currentMatch.status = "completed";
          currentMatch.winnerId = winnerId;
        } else {
          currentMatch.status = "in_progress";
        }
      } else {
        logger.info(
          `Match result for shortCode ${shortCode} ` +
          "already factored into standings. " +
          "Skipping incremental standings update."
        );
      }
    } else {
      logger.warn(
        `Match with id '${matchId}' not found in ` +
        `division '${division}' matches list.`
      );
    }

    if (divisionBracketDoc && divisionBracketDoc.exists) {
      const rawBracket = divisionBracketDoc.data()?.bracket;
      if (Array.isArray(rawBracket) && rawBracket.length > 0) {
        logger.info(`Updating bracket document for division '${division}'`);
        const updatedBracket = updateBracketForGameResult(
          rawBracket,
          shortCode,
          winnerId,
          matchId,
          allTeams,
          allMatches,
          currentMatch
        );
        transaction.update(divisionBracketDocRef, {bracket: updatedBracket});
        logger.info(
          `Successfully updated bracket document for division '${division}'`
        );

        // Synchronize all knockout match progressions into allMatches
        for (const round of updatedBracket) {
          for (const seed of round.seeds) {
            const koMatchIndex = allMatches.findIndex((m: any) =>
              m.id === `ko_${seed.id}` || String(m.id) === String(seed.id)
            );
            if (koMatchIndex !== -1) {
              const existingMatch = allMatches[koMatchIndex];
              allMatches[koMatchIndex] = {
                ...existingMatch,
                team1Id: seed.team1Id || existingMatch.team1Id || 0,
                team2Id: seed.team2Id || existingMatch.team2Id || 0,
                status: seed.status || existingMatch.status || "upcoming",
                score: seed.score || existingMatch.score || "",
                winnerId: seed.winnerId ?? existingMatch.winnerId ?? null,
                tournamentCodes: Array.from(
                  new Set([
                    ...(existingMatch.tournamentCodes || []),
                    ...(seed.tournamentCodes || []),
                  ])
                ),
                isKnockout: true,
                stage: round.title,
                coinFlipResult:
                  seed.coinFlipResult ?? existingMatch.coinFlipResult ?? null,
                firstGameSideSelection:
                  seed.firstGameSideSelection ??
                  existingMatch.firstGameSideSelection ??
                  null,
              };
            }
          }
        }
      }
    }

    transaction.update(divisionTeamsDocRef, {teams: allTeams});
    transaction.update(divisionMatchesDocRef, {matches: allMatches});
  });
};


/**
 * Resolves the team ID and name for a list of player names by finding the team
 * with the majority of players in the list.
 *
 * @param {string[]} playerNames - An array of player names to check.
 * @param {any[]} teams - All teams in the division.
 * @param {any[]} players - All players in the division.
 * @return {{id: number, name: string} | null} The resolved team, or null.
 */
export function resolveTeamIdAndName(
  playerNames: string[],
  teams: any[],
  players: any[]
): {id: number; name: string} | null {
  if (!playerNames || playerNames.length === 0) {
    return null;
  }

  const playerNamesToFindSet = new Set(
    playerNames.map((p) => p.split("#")[0].trim().toLowerCase())
  );
  const playerIdsToFindSet = new Set<number>();

  for (const player of players) {
    const cleanPlayerName = player.name.split("#")[0].trim().toLowerCase();
    if (playerNamesToFindSet.has(cleanPlayerName)) {
      playerIdsToFindSet.add(player.id);
    }
  }

  if (playerIdsToFindSet.size === 0) {
    return null;
  }

  const teamMatchCounts = new Map<number, number>();
  for (const team of teams) {
    let matchCount = 0;
    for (const playerIdOnTeam of team.players) {
      if (playerIdsToFindSet.has(playerIdOnTeam)) {
        matchCount++;
      }
    }
    if (matchCount > 0) {
      teamMatchCounts.set(team.id, matchCount);
    }
  }

  let bestTeamId: number | null = null;
  let maxMatches = 0;
  for (const [teamId, count] of teamMatchCounts.entries()) {
    if (count > maxMatches) {
      maxMatches = count;
      bestTeamId = teamId;
    }
  }

  if (bestTeamId !== null) {
    const bestTeam = teams.find((t) => t.id === bestTeamId);
    if (bestTeam) {
      return {id: bestTeam.id, name: bestTeam.name};
    }
  }

  return null;
}


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

  const teamsDocRef = db.doc(`teams/grumble2026_${division}`);
  const playersDocRef = db.doc(`players/grumble2026_${division}`);

  try {
    const [teamsDocSnap, playersDocSnap] = await Promise.all([
      teamsDocRef.get(),
      playersDocRef.get(),
    ]);

    if (!teamsDocSnap.exists) {
      throw new Error(`Teams document 'grumble2026_${division}' not found.`);
    }
    if (!playersDocSnap.exists) {
      throw new Error(`Players document 'grumble2026_${division}' not found.`);
    }

    const allTeams = teamsDocSnap.data()!.teams;
    const allPlayers = playersDocSnap.data()!.players;

    if (!allTeams || !allPlayers) {
      throw new Error(
        "Required 'teams' or 'players' array field is missing in the documents."
      );
    }

    const resolved = resolveTeamIdAndName(playerNames, allTeams, allPlayers);
    if (resolved) {
      logger.info(
        `Found match!
Majority of players belong to Team ID ${resolved.id} (${resolved.name}).`
      );
      return resolved.id;
    }

    logger.info("No team found containing any of the specified players.");
    return null;
  } catch (error) {
    logger.error("Error finding team by player names:", error);
    // In case of an error, we should not return a team ID.
    return null;
  }
}

export const updateStandingsWithExistingMatchResult = onCall(
  {secrets: [riotApiKey]},
  async (request) => {
    if (!request.auth || !request.auth.token.adminId) {
      throw new HttpsError(
        "failed-precondition",
        "Must be an administrator to perform this action."
      );
    }

    const {shortCode} = request.data as {shortCode?: string};
    if (!shortCode) {
      throw new HttpsError(
        "invalid-argument",
        "The function must be called with a valid 'shortCode'."
      );
    }

    const resultRef = db
      .collection("match_results")
      .doc(shortCode);

    try {
      const resultData = await resultRef.get();
      if (!resultData.exists) {
        throw new HttpsError(
          "not-found",
          `Result doc for ${shortCode} not found.`
        );
      }

      const {winner, blueTeam, redTeam} = resultData.data()!;

      const shortCodeDocRef = db.doc(`matches/${shortCode}`);
      const shortCodeDoc = await shortCodeDocRef.get();
      if (!shortCodeDoc.exists) {
        throw new HttpsError(
          "not-found",
          `Document for shortCode '${shortCode}' not found.`
        );
      }
      const {division, matchId} = shortCodeDoc.data()!;
      logger.info(`Found division ${division} and matchId ${matchId}`);
      if (!division || !matchId) {
        throw new HttpsError(
          "failed-precondition",
          `Document '${shortCode}' is missing 'division' or 'matchId' field.`
        );
      }
      const winnerId = await findTeamIdByPlayerNames(
        winner === 100 ?
          blueTeam.players.map((p: any) => p.playerName) :
          redTeam.players.map((p: any) => p.playerName),
        division);
      await updateStandings(
        shortCode,
        winnerId || -1,
        division,
        matchId);

      return {success: true, message: "Standings updated successfully."};
    } catch (e: any) {
      logger.error(`Failed to update standings for ${shortCode}: ${e}`);
      throw new HttpsError("internal",
        e.message || "An internal error occurred.");
    }
  });

export const generateTournamentCodesForMatch = onCall(
  {secrets: [riotApiKey]},
  async (request) => {
    if (!request.auth || !request.auth.token.adminId) {
      throw new HttpsError(
        "failed-precondition",
        "Must be an administrator to perform this action."
      );
    }

    const {division, matchId, count, isKnockout, year} = request.data as {
      division: string;
      matchId: string | number;
      count: number;
      isKnockout?: boolean;
      year?: string;
    };

    if (!division || !matchId || !count) {
      throw new HttpsError(
        "invalid-argument",
        "Parameters 'division', 'matchId', and 'count' are required."
      );
    }

    const activeYear = year || "2026";
    const prefix = `grumble${activeYear}`;

    // 1. Get the tournamentId from tournamentMetadata/grumble
    const metadataDocRef = db.collection("tournamentMetadata").doc("grumble");
    const metadataDoc = await metadataDocRef.get();

    if (!metadataDoc.exists) {
      throw new HttpsError(
        "not-found",
        "Tournament metadata document 'tournamentMetadata/grumble' not found."
      );
    }

    const tournamentId = metadataDoc.data()?.[
      `${prefix}_tournamentId` || "grumble2026_tournamentId"
    ];
    if (!tournamentId) {
      throw new HttpsError(
        "not-found",
        `Tournament ID field '${prefix}_tournamentId' not found ` +
        "in metadata document."
      );
    }

    try {
      // 2. Call Riot Tournament API to generate codes
      const riotResponse = await axios.post(
        "https://americas.api.riotgames.com/lol/tournament/v5/codes" +
        `?tournamentId=${tournamentId}&count=${count}`,
        {
          pickType: "TOURNAMENT_DRAFT",
          mapType: "SUMMONERS_RIFT",
          spectatorType: "ALL",
          teamSize: 5,
          metadata: `${prefix}_${division}_${matchId}`,
        },
        {
          headers: {
            "X-Riot-Token": riotApiKey.value(),
            "Content-Type": "application/json",
          },
        }
      );

      const codes = riotResponse.data as string[];
      if (!codes || !Array.isArray(codes) || codes.length === 0) {
        throw new Error("No codes returned from Riot API.");
      }

      // 3. Update matches in Firestore in a transaction / batch
      const batch = db.batch();

      // Write code mappings
      for (const code of codes) {
        const matchRef = db.collection("matches").doc(code);
        batch.set(matchRef, {
          matchId: matchId,
          division: division,
          isKnockout: isKnockout || false,
        });
      }

      await batch.commit();

      // Update matches document array
      const divisionMatchesRef = db.doc(`matches/${prefix}_${division}`);
      await db.runTransaction(async (transaction) => {
        const matchesDoc = await transaction.get(divisionMatchesRef);
        if (!matchesDoc.exists) {
          throw new Error(
            `Matches document '${prefix}_${division}' not found.`
          );
        }

        const allMatches = matchesDoc.data()!.matches || [];
        const matchIndex = allMatches.findIndex((m: any) => m.id === matchId);
        if (matchIndex === -1) {
          throw new Error(
            `Match with ID '${matchId}' not found in matches list.`
          );
        }

        const currentMatch = allMatches[matchIndex];
        const currentCodes = currentMatch.tournamentCodes || [];
        currentMatch.tournamentCodes = [...currentCodes, ...codes];
        allMatches[matchIndex] = currentMatch;

        transaction.update(divisionMatchesRef, {matches: allMatches});
      });

      return {codes};
    } catch (err: any) {
      logger.error("Error generating tournament codes:", err);
      const errMsg =
        err.response?.data?.status?.message ||
        err.message ||
        "Unknown error";
      throw new HttpsError(
        "internal",
        `Riot API error: ${errMsg}`
      );
    }
  }
);

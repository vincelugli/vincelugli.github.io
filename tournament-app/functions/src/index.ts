/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {CloudTasksClient} from "@google-cloud/tasks";
import {setGlobalOptions} from "firebase-functions";
import {onDocumentUpdated} from "firebase-functions/v2/firestore";
import {onTaskDispatched} from "firebase-functions/v2/tasks";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
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

const DRAFT_PICK_TIME_LIMIT_IN_SECONDS = 4 * 60 * 60;
const PROJECT = "grumble-5885f";
const LOCATION = "us-central1"; // Or your function's location
const QUEUE = "executeautopick"; // The default queue created by Firebase

export const getAuthTokenForAccessCode = functions.https.onCall<AuthData>(
  async (rawRequest) => {
    const accessCode = rawRequest.data.accessCode;

    if (!accessCode || typeof accessCode !== "string") {
      throw new functions.https.HttpsError(
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
      throw new functions.https.HttpsError(
        "not-found",
        "Invalid access code."
      );
    }

    // Get the teamId from the matched document's ID
    const teamId = snapshot.docs[0].id;
    const uid = `captain-${teamId}`; // Create a unique ID for this user

    // Create a custom auth token with the teamId as a custom claim
    const customToken = await admin.auth().createCustomToken(uid, {teamId});

    return {token: customToken};
  });

export const scheduleAutoPick = onDocumentUpdated("drafts/liveDraft",
  async (event) => {
    functions.logger.debug("Event received: ", event);
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
        functions.logger.log(
          `Canceled old task: ${before.activeTimerTaskName}`
        );
      } catch (error) {
        functions.logger.warn(
          "Failed to cancel task, it may have already run:", error
        );
      }
    }

    // Don't schedule a new task if the draft is over
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
          .from(JSON.stringify({data: {draftId: "liveDraft"}}))
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
    functions.logger.log(`Scheduled new task: ${taskName}`);

    // Update the draft document with the new task name for tracking
    return change.after.ref.update({activeTimerTaskName: taskName});
  });

// This function is CALLED BY CLOUD TASKS when the timer expires.
export const executeAutoPick = onTaskDispatched({
  retryConfig: {maxAttempts: 5, minBackoffSeconds: 60},
  rateLimits: {maxDispatchesPerSecond: 500},
}, async (req: any) => {
  const {draftId} = req.data;
  functions.logger.log(`Executing auto-pick for draft: ${draftId}`);

  const draftRef = db.collection("drafts").doc(draftId);
  const draftDoc = await draftRef.get();
  if (!draftDoc.exists) {
    throw new Error(`Draft ${draftId} not found.`);
  }

  const draftState = draftDoc.data();
  if (!draftState) return;
  functions.logger.log(
    `Draft state current pick index: ${draftState.currentPickIndex}`
  );

  if (!draftState) {
    // No draft state, return
    return;
  }

  // Double-check: Has the pick already been made?
  // This prevents a race condition where a user picks just as the timer expires
  const now = admin.firestore.Timestamp.now();
  if (!draftState.pickEndsAt || draftState.pickEndsAt < now) {
    functions.logger.log(
      "Pick was already made or timer was updated. Aborting auto-pick."
    );
    return;
  }
  
  const all_roles = ['top', 'mid', 'jungle', 'adc', 'support'];
  
  // --- Auto-pick Logic ---
  const teamIdPicking = draftState.pickOrder[draftState.currentPickIndex];
  const pickingTeam = draftState.teams.find((t: any) => t.id === teamIdPicking);
  const availablePlayers = draftState.availablePlayers;

  // 1. Determine the roles already filled on the team
  const filledRoles = new Set(pickingTeam.players.map((p: any) => p.primaryRole));
  const neededRoles = all_roles.filter(role => !filledRoles.has(role));
  functions.logger.log(`Team ${teamIdPicking} needs roles:`, neededRoles);

  // 2. Fetch the captain's priority list
  // This assumes you have a way to link team ID to an access code/priority list ID
  const draftBoardsDoc = await db
    .collection("draftBoards")
    .doc(teamIdPicking.toString())
    .get();
  const priorityPlayerIds: number[] = draftBoardsDoc.data()?.playerIds || [];
  
  let playerToDraftId: number | undefined;

  // 3. Primary Search: Find the highest priority player who fills a needed role
  if (neededRoles.length > 0) {
      for (const pId of priorityPlayerIds) {
          const player = availablePlayers.find((p: any) => p.id === pId);
          if (player && neededRoles.includes(player.primaryRole)) {
              playerToDraftId = pId;
              functions.logger.log(`Primary search found: Player ${pId} (${player.primaryRole}) fills a needed role.`);
              break;
          }
      }
  }
  
  // 4. Fallback 1: If no role-fit found, find the highest priority player available
  if (!playerToDraftId) {
      functions.logger.log("Primary search failed. Falling back to best available from priority list.");
      for (const pId of priorityPlayerIds) {
          if (availablePlayers.some((p: any) => p.id === pId)) {
              playerToDraftId = pId;
              functions.logger.log(`Fallback 1 found: Player ${pId} is the highest available priority pick.`);
              break;
          }
      }
  }

  // 5. Fallback 2: If priority list exhausted, find the highest Elo player overall
  if (!playerToDraftId) {
      functions.logger.log("Fallback 1 failed. Falling back to best available Elo.");
      // Create a mutable copy to sort
      const sortedAvailable = [...availablePlayers];
      sortedAvailable.sort((a: any, b: any) => b.elo - a.elo);
      playerToDraftId = sortedAvailable[0]?.id;
      functions.logger.log(`Fallback 2 found: Player ${playerToDraftId} has the highest Elo.`);
  }

  // 6. Perform the draft with the selected player
  if (!playerToDraftId) {
      throw new Error("Auto-pick failed: Could not determine a player to draft.");
  }

  
  if (playerToDraftId) {
    // --- Perform the draft update ---
    const playerToDraft = availablePlayers.find((p: any) => p.id === playerToDraftId);

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
    functions.logger.log(
      `Auto-picked player ${playerToDraft.name} for team ${teamIdPicking}`
    );
    return;
  }

  functions.logger.log(`Auto-pick un-successful for draft: ${draftId}`);
});

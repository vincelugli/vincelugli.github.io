/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onDocumentUpdated} from "firebase-functions/v2/firestore";
import {onTaskDispatched} from "firebase-functions/v2/tasks";
import {getFunctions} from "firebase-admin/functions";
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

interface AuthData {
  accessCode: string;
}

const DRAFT_PICK_TIME_LIMIT_IN_SECONDS = 4 * 60 * 60;

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
    const change = event.data;
    if (!change) return;

    const before = change.before.data();
    const after = change.after.data();

    // Only run if the pick has actually changed
    if (before.currentPickIndex === after.currentPickIndex) {
      return;
    }

    // Target function name must be lowercase
    const taskQueue = getFunctions().taskQueue("executeautopick");

    // Cancel any previously scheduled task to prevent duplicates
    if (before.activeTimerTaskName) {
      try {
        await taskQueue.delete(before.activeTimerTaskName);
        functions.logger.log(`Cancel old task: ${before.activeTimerTaskName}`);
      } catch (error) {
        // Task has already executed, safe to ignore error
        functions.logger.warn(
          `Failed to cancel task ${before.activeTimerTaskName}:`, error
        );
      }
    }

    // Don't schedule a new task if the draft is over
    if (after.currentPickIndex >= after.pickOrder.length) {
      return;
    }

    // Schedule the new task
    const scheduleTimeInSeconds = DRAFT_PICK_TIME_LIMIT_IN_SECONDS;
    const taskName = await taskQueue.enqueue(
      {draftId: "liveDraft"}, // Pass the draft ID in the body
      {scheduleDelaySeconds: scheduleTimeInSeconds, dispatchDeadlineSeconds: 60}
    );

    functions.logger.log(`Scheduled new task: ${taskName}`);

    // Update the draft document with the new task name for tracking
    return change.after.ref.update({activeTimerTaskName: taskName});
  });

// This function is CALLED BY CLOUD TASKS when the timer expires.
export const executeAutoPick = onTaskDispatched({
  retryConfig: {maxAttempts: 5, minBackoffSeconds: 60},
  rateLimits: {maxDispatchesPerSecond: 500},
}, async (req) => {
  const {draftId} = req.data;
  functions.logger.log(`Executing auto-pick for draft: ${draftId}`);

  const draftRef = db.collection("drafts").doc(draftId);
  const draftDoc = await draftRef.get();
  if (!draftDoc.exists) {
    throw new Error(`Draft ${draftId} not found.`);
  }

  const draftState = draftDoc.data();

  if (!draftState) {
    // No draft state, return
    return;
  }

  // Double-check: Has the pick already been made?
  // This prevents a race condition where a user picks just as the timer expires
  const now = admin.firestore.Timestamp.now();
  if (!draftState.pickEndsAt || draftState.pickEndsAt > now) {
    functions.logger.log(
      "Pick was already made or timer was updated. Aborting auto-pick."
    );
    return;
  }

  // --- Auto-pick Logic ---
  const teamIdPicking = draftState.pickOrder[draftState.currentPickIndex];
  if (teamIdPicking === null) {
    // This was a skipped pick, just advance it
    const nextPickIndex = draftState.currentPickIndex + 1;
    const nextDeadline = admin
      .firestore
      .Timestamp
      .fromMillis(Date.now() + 90000);
    const updatedDraftState = {
      ...draftState,
      currentPickIndex: nextPickIndex,
      pickEndsAt: nextDeadline,
    };

    await draftRef.update(updatedDraftState);
    functions.logger.log(
      `Team picking was null, so pick was skipped: ${draftId}`
    );
    return;
  }

  const draftBoardsDoc = await db
    .collection("draftBoards")
    .doc(teamIdPicking)
    .get();
  const priorityPlayerIds: number[] = draftBoardsDoc.data()?.playerIds || [];

  // Find the highest priority player who is still available
  let playerToDraftId: number | undefined = undefined;
  for (const pId of priorityPlayerIds) {
    if (draftState.availablePlayers.some((p: any) => p.id === pId)) {
      playerToDraftId = pId;
      break; // Found our player
    }
  }

  // Fallback: If no priority players are available, pick the highest Elo player
  if (!playerToDraftId) {
    const available = draftState.availablePlayers;
    if (available.length > 0) {
      available.sort((a: any, b: any) => b.elo - a.elo);
      playerToDraftId = available[0].id;
    }
  }

  if (playerToDraftId) {
    // --- Perform the draft update ---
    const playerToDraft = draftState
      .availablePlayers
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
    const nextDeadline = admin.firestore.Timestamp.fromMillis(
      Date.now() + DRAFT_PICK_TIME_LIMIT_IN_SECONDS * 1000
    );

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

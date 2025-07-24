/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

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

export const getAuthTokenForAccessCode = functions.https.onCall<AuthData>(
  async (rawRequest) => {
    logger.debug("Request with rawRequest: ", rawRequest);

    const accessCode = rawRequest.data.accessCode;
    logger.debug("Request for accessCode: ", accessCode);

    if (!accessCode || typeof accessCode !== "string") {
      logger.debug("No access code found");
      throw new functions.https.HttpsError(
        "invalid-argument",
        "You must provide a valid access code."
      );
    }

    // Query the secure collection for a matching access code
    const codesRef = db.collection("teamAccessCodes");
    logger.debug("Retrieved collection");
    const snapshot = await codesRef
      .where("accessCode", "==", accessCode)
      .limit(1)
      .get();
    logger.debug("Retrieved snapshot: ", snapshot);

    if (snapshot.empty) {
      logger.debug("snapshot is empty");
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
    logger.debug("Created custom token");

    return {token: customToken};
  }
);

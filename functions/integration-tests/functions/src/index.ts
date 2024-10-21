/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {INVOICE_CONVERTER} from "./invoice";

admin.initializeApp();

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

export const placeTestInvoice = onRequest(async (request, response) => {
  const db = admin.firestore();

  try {
    await db.doc(`invoices/${request.body.invoiceId}`)
      .withConverter(INVOICE_CONVERTER)
      .set(request.body);
    response.send("Test invoice placed.");
  } catch (error) {
    logger.error("Error placing test invoice:", error);
    response.status(500).send("Error placing test invoice.");
  }
});


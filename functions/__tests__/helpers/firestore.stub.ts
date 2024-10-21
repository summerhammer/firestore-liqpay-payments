import {CheckoutSession} from "../../src/types";
import {WriteResult} from "firebase-admin/firestore";
import {firestore} from "firebase-admin";
import Firestore = firestore.Firestore;

export function firestoreCreateCheckoutSession(
  firestore: Firestore,
  session: CheckoutSession,
  invoiceId: string,
): Promise<WriteResult> {
  return firestore.doc(`checkout-sessions/${invoiceId}`).set(session);
}

export function firestoreCreatePendingCheckoutSession(
  firestore: Firestore,
  invoiceId: string,
  paymentPageURL: string,
): Promise<WriteResult> {
  return firestoreCreateCheckoutSession(firestore, {
    status: "pending",
    paymentPageURL,
    invoiceId,
    transactionId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    errorCode: null,
    errorDetails: null,
    errorMessage: null,
  },
  invoiceId);
}

export function firestoreCreateFailedCheckoutSession(
  firestore: Firestore,
  invoiceId: string,
  errorCode: string,
  errorMessage: string,
  errorDetails?: string,
): Promise<WriteResult> {
  return firestoreCreateCheckoutSession(firestore, {
    status: "failure",
    paymentPageURL: null,
    invoiceId,
    transactionId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    errorCode,
    errorDetails: errorDetails ?? null,
    errorMessage,
  },
  invoiceId);
}

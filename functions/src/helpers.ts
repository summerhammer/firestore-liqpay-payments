import {PaymentStatus} from "./liqpay/dto/payment-status.response";
import * as admin from "firebase-admin";
import config from "./config";
import {Timestamp} from "firebase-admin/firestore";
import {EphemeralCheckoutRequest} from "./liqpay/dto/checkout.request";
import jsonata from "jsonata";
import {CHECKOUT_SESSION_CONVERTER, CheckoutSession} from "./types";
import {LiqPayError} from "./liqpay/client";
import * as events from "./events";

// MARK: Firestore

export async function firestoreUpdateDatabaseWithPaymentPageURL(
  invoice: Record<any, any>,
  invoiceId: string,
  paymentPageURL: string,
): Promise<void> {

  const session: CheckoutSession = {
    status: "pending",
    paymentPageURL,
    invoiceId,
    transactionId: null,
    errorCode: null,
    errorMessage: null,
    errorDetails: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const db = admin.firestore();

  await db.doc(configResolveCheckoutSessionDocumentPath(invoice, invoiceId))
    .withConverter(CHECKOUT_SESSION_CONVERTER)
    .create(session);

  await events.recordCheckoutSessionCreatedEvent(
    invoiceId,
    paymentPageURL,
  );
}

export async function firestoreUpdateDatabaseWithFailedCheckout(
  invoice: Record<any, any>,
  invoiceId: string,
  error: LiqPayError,
): Promise<void> {

  const session: CheckoutSession = {
    status: "failure",
    paymentPageURL: null,
    invoiceId,
    transactionId: null,
    errorCode: error.code,
    errorMessage: error.message,
    errorDetails: error.details ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const db = admin.firestore();

  await db.doc(configResolveCheckoutSessionDocumentPath(invoice, invoiceId))
    .withConverter(CHECKOUT_SESSION_CONVERTER)
    .create(session)
}

export async function firestoreUpdateDatabaseWithPaymentStatus(
  status: PaymentStatus,
): Promise<void> {

  await events.recordPaymentStatusReceivedEvent(
    status.order_id,
    status.status,
    `${status.transaction_id}`,
  );

  const errorOrNull = translatePaymentStatusToCheckoutSessionError(status);

  const session: Partial<CheckoutSession> = {
    status: translatePaymentStatusToCheckoutSessionStatus(status),
    transactionId: status.transaction_id ? `${status.transaction_id}` : null,
    errorCode: errorOrNull?.code ?? null,
    errorMessage: errorOrNull?.message ?? null,
    errorDetails: errorOrNull?.details ?? null,
  };

  const db = admin.firestore();

  const invoiceId = status.order_id;
  const invoice = firestoreFindInvoiceById(invoiceId);

  await db.doc(configResolveCheckoutSessionDocumentPath(invoice, invoiceId))
    .set(session, {merge: true});

  await events.recordCheckoutSessionUpdatedEvent(
    status.order_id,
    session.status!,
    session.transactionId!,
  );

  await db.collection(`${config.invoicesCollection}/${invoiceId}/statuses`)
    .add(status);
}

export async function firestoreFindInvoiceById(
  invoiceId: String,
): Promise<Record<any, any> | undefined> {
  const snapshot = await admin.firestore().doc(
    `${config.invoicesCollection}/${invoiceId}`
  ).get();
  return snapshot.data();
}

// MARK: Config

export function configResolveWebhookURL(): string {
  return utilReplaceTokensInString(config.webhookURL ?? config.defaultWebhookURL, {
    ...process.env
  });
}

export function configResolveCheckoutSessionDocumentPath(
  invoice: Record<any, any>,
  invoiceId: string,
): string {
  const collection = utilReplaceTokensInString(config.sessionsCollection, {
    ...Object.fromEntries(Object.entries(invoice).map(([key, value]) => [key, value?.toString()])),
  });
  return `${collection}/${invoiceId}`;
}

// MARK: Translation

export async function translateInvoiceToCheckoutRequest(
  invoice: Record<any, any>,
  invoiceId: string,
): Promise<EphemeralCheckoutRequest> {
  async function translate(): Promise<EphemeralCheckoutRequest> {
    invoice = utilConvertTimestampsToFormattedDates(invoice);
    const schema = config.invoiceToCheckoutRequestJSONata;
    if (!schema) {
      return invoice as EphemeralCheckoutRequest;
    }

    const expression = jsonata(schema);

    return await expression.evaluate(invoice);
  }

  const result = await translate();

  return {
    ...result,
    order_id: invoiceId,
    server_url: configResolveWebhookURL(),
    action: result.action ?? "pay",
    version: 3,
    language: result.language ?? "en",
  } as EphemeralCheckoutRequest;

}

export function translatePaymentStatusToCheckoutSessionStatus(
  status: PaymentStatus,
): CheckoutSession["status"] {
  switch (status.status) {
  case "success":
  case "subscribed":
    return "success";
  case "error":
  case "failure":
    return "failure";
  case "reversed":
  case "unsubscribed":
    return "cancelled";
  default:
    return "pending";
  }
}

export function translatePaymentStatusToCheckoutSessionError(
  status: PaymentStatus,
): {  code: string, message: string | null, details: string | null } | null {
  if (!status.err_code && !status.err_code) {
    return null;
  }
  return {
    code: status.err_code ?? "UNKNOWN",
    message: status.err_description ?? null,
    details: status.info ?? null,
  };
}

// MARK: Util

export function utilReplaceTokensInString(
  string: string,
  tokens: Record<string, string | undefined>,
): string {
  function resolve(token: string): string {
    const value = tokens[token];
    if (value == "") {
      return "";
    }
    return value ?? `{${token}}`;
  }
  return string
    .replace(/{(.*?)}/g, (_, token) => resolve(token));
}

export function utilConvertTimestampsToFormattedDates(obj: any): any {
  if (obj instanceof Timestamp) {
    return utilFormatDateToString(obj.toDate());
  } else if (Array.isArray(obj)) {
    return obj.map(utilConvertTimestampsToFormattedDates);
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, utilConvertTimestampsToFormattedDates(value)])
    );
  }
  return obj;
}

export function utilFormatDateToString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


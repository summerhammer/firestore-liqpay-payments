import {logger} from "firebase-functions";
import {PaymentStatus} from "./liqpay/dto/payment-status.response";
import {CheckoutSession} from "./types";

export function checkoutInvoiceWithId(
  invoiceId: string,
) {
  logger.log(`⚙️ Checking out invoice [${invoiceId}].`);
}

export function checkoutInvoiceWithIdSuccess(
  invoiceId: string,
  paymentPageURL: string | null,
) {
  logger.log(`✅ Checkout for invoice [${invoiceId}] was successful. Payment page URL: ${paymentPageURL}.`);
}

export function checkoutInvoiceWithIdError(
  id: string,
  error: unknown,
) {
  logger.error(`❌ Error checking out invoice [${id}]: ${error}`);
}

export function handlePaymentStatus(body: any) {
  logger.log(`⚙️ Handling payment status: ${JSON.stringify(body)}`);
}

export function handlePaymentStatusError(error: unknown) {
  logger.error(`❌ Error handling payment status: ${error}`);
}

export function handlePaymentStatusSuccess(status: PaymentStatus) {
  logger.log(`✅ Payment status handled for invoice [${status.order_id}].`);
}

export function getPaymentStatus(invoiceId: string) {
  logger.log(`⚙️ Getting payment status for invoice [${invoiceId}].`);
}

export function getPaymentStatusSuccess(body: any) {
  logger.log(`✅ Payment status received: ${JSON.stringify(body)}`);
}

// MARK: - Helpers

export function updateDatabaseWithPaymentPageURL(
  invoiceId: string,
  paymentPageURL: string,
) {
  logger.log(`⚙️ Updating database with payment page URL for invoice [${invoiceId}], payment page URL: ${paymentPageURL}.`);
}

export function updateDatabaseWithPaymentPageURLSuccess(
  invoiceId: string,
) {
  logger.log(`✅ Database updated with payment page URL for invoice [${invoiceId}].`);
}

export function updateDatabaseWithPaymentPageURLSuccessFailed(
  invoiceId: string,
  error: unknown,
) {
  logger.error(`❌ Error updating database with payment page URL for invoice [${invoiceId}]: ${error}`);
}

export function updateDatabaseWithFailedCheckout(
  invoiceId: string,
  error: unknown,
) {
  logger.log(`⚙️ Updating database with failed checkout for invoice [${invoiceId}]: ${error}.`);
}

export function updateDatabaseWithFailedCheckoutSuccess(
  invoiceId: string,
) {
  logger.log(`✅ Database updated with failed checkout for invoice [${invoiceId}].`);
}

export function updateDatabaseWithFailedCheckoutFailed(
  invoiceId: string,
  error: unknown,
) {
  logger.error(`❌ Error updating database with failed checkout for invoice [${invoiceId}]: ${error}`);
}

export function updateDatabaseWithPaymentStatus(
  invoiceId: string,
  status: PaymentStatus,
) {
  logger.log(`⚙️ Updating database with payment status for invoice [${invoiceId}]. Payment status: ${status.status}, error_code: ${status.err_code}, error_description: ${status.err_description}, transaction_id: ${status.transaction_id}.`);
}

export function updateDatabaseWithPaymentStatusSuccess(
  invoiceId: string,
) {
  logger.log(`✅ Database updated with payment status for invoice [${invoiceId}].`);
}

export function updateDatabaseWithPaymentStatusLogSession(
  session: Partial<CheckoutSession>,
  path: string,
) {
  logger.log(`⚙️ Updating database with payment status for session: ${JSON.stringify(session)}, path: ${path}`);
}

export function updateDatabaseWithPaymentStatusFailed(
  invoiceId: string,
  error: unknown,
) {
  logger.error(`❌ Error updating database with payment status for invoice [${invoiceId}]: ${error}`);
}

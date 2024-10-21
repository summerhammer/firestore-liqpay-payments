import { logger } from "firebase-functions";
import {PaymentStatus} from "./liqpay/dto/payment-status.response";

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
  logger.log(`✅ Payment status handled: ${JSON.stringify(status)}`);
}

export function getPaymentStatus(invoiceId: string) {
  logger.log(`⚙️ Getting payment status for invoice [${invoiceId}].`);
}

export function getPaymentStatusSuccess(body: any) {
  logger.log(`✅ Payment status received: ${JSON.stringify(body)}`);
}

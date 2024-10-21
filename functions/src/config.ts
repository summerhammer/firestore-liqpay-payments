export default {
  location: process.env.LOCATION!,
  liqpayPrivateKey: process.env.LIQPAY_PRIVATE_KEY!,
  liqpayPublicKey: process.env.LIQPAY_PUBLIC_KEY!,
  liqpayBaseURL: process.env.LIQPAY_BASE_URL,
  invoicesCollection: process.env.INVOICES_COLLECTION!,
  sessionsCollection: process.env.SESSIONS_COLLECTION!,
  webhookURL: process.env.WEBHOOK_URL,
  defaultWebhookURL: "https://{LOCATION}-{PROJECT_ID}.cloudfunctions.net/ext-{EXT_INSTANCE_ID}-handlePaymentStatus",
  handleInvoicePlacedMinInstances: Number(process.env.HANDLE_INVOICE_PLACED_MIN_INSTANCES) ?? 0,
  invoiceToCheckoutRequestJSONata: process.env.INVOICE_TO_CHECKOUT_REQUEST_JSONATA
}

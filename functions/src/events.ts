import { Channel, getEventarc } from "firebase-admin/eventarc";

let eventChannel: Channel | undefined;

export const setupEventChannel = () => {
  eventChannel =
    process.env.EVENTARC_CHANNEL
      ? getEventarc().channel(process.env.EVENTARC_CHANNEL, {
        allowedEventTypes: process.env.EXT_SELECTED_EVENTS,
      })
      : undefined;
};

export const recordCheckoutSessionCreatedEvent = async (
  invoiceId: string,
  paymentPageURL: string,
): Promise<void> => {
  if (!eventChannel) return;

  return eventChannel.publish({
    type: "dev.summerhammer.firestore-liqpay-payments.v1.checkout-session.created",
    subject: invoiceId,
    data: { paymentPageURL },
  });
};

export const recordCheckoutSessionUpdatedEvent = async (
  invoiceId: string,
  status: string,
  transactionId: string,
): Promise<void> => {
  if (!eventChannel) return;

  return eventChannel.publish({
    type: "dev.summerhammer.firestore-liqpay-payments.v1.checkout-session.updated",
    subject: invoiceId,
    data: { status, transactionId },
  });
};

export const recordPaymentStatusReceivedEvent = async (
  invoiceId: string,
  status: string,
  transactionId: string,
): Promise<void> => {
  if (!eventChannel) return;

  return eventChannel.publish({
    type: "dev.summerhammer.firestore-liqpay-payments.v1.payment-status.received",
    subject: invoiceId,
    data: { status, transactionId },
  });
};

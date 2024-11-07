import * as admin from "firebase-admin";
import {
  firestoreWaitForDocumentExist,
  firestoreWaitForDocumentToExistWithFields
} from "../helpers/firestore.util";
import {configResolveCheckoutSessionDocumentPath} from "../../src/helpers";
import {CheckoutSession} from "../../src/types";
import {firebaseInitializeAppIfNeeded} from "../helpers/firebase.util";
import {Tunnel} from "localtunnel";
import {webhookExposeEndpoints} from "../helpers/webhook.util";
import {submit} from "../helpers/website.util";

firebaseInitializeAppIfNeeded();

const firestore = admin.firestore();

describe("checkout", async () => {
  let tunnel: Tunnel;

  before(async () => {
    tunnel = await webhookExposeEndpoints();
  });

  after(() => {
    tunnel.close();
  });

  async function checkout(invoice: any): Promise<void> {
    // Step 1: Place an invoice

    console.log("Step 1: Place an invoice");

    const invoiceId = await firestore.collection("invoices")
      .add(invoice)
      .then(doc => doc.id);

    // Step 2: Wait for the checkout session to be created and get the payment page URL

    console.log("Step 2: Wait for the checkout session to be created and get the payment page URL");

    let session = await firestoreWaitForDocumentExist(
      firestore.doc(
        configResolveCheckoutSessionDocumentPath(invoice, invoiceId),
      ),
    );

    const paymentPageURL = session.paymentPageURL;

    // Step 3: Simulate the user completing the payment on the payment page

    console.log("Step 3: Simulate the user completing the payment on the payment page");

    await submit(paymentPageURL, "4242424242424242");

    // Step 4: Verify the Checkout Session was completed successfully

    console.log("Step 4: Verify the Checkout Session was completed successfully");

    await firestoreWaitForDocumentToExistWithFields(
      firestore.doc(
        configResolveCheckoutSessionDocumentPath(invoice, invoiceId),
      ),
      {
        status: "success",
      } as CheckoutSession,
    );
  }

  context("pay product", async () => {

    it("should complete Checkout Session with success status", async () => {

      await checkout({
        orderId: "order-1001",
        amount: 100,
        currency: "USD",
        description: "Order #1001",
      });

    });

  });

  context("subscribe product", async () => {

    it("should complete Checkout Session with success status", async () => {

      await checkout({
        orderId: "order-1002",
        amount: 100,
        currency: "USD",
        subscription: {
          start: new Date(),
          periodicity: "monthly",
        },
        description: "Subscription to Silver for monthly. Order #order-1002.",
      });

    });

  });

});

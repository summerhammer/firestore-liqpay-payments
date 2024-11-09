import * as admin from "firebase-admin";
import * as chai from "chai";
import {expect} from "chai";
import * as sinon from "sinon";
import {
  FirestoreLiqPayError,
  PaymentsClient,
  PaymentsClientOptions
} from "../src";
import {DEFAULT_PAYMENTS_TIMEOUT_IN_MILLISECONDS} from "../src/payments";
import {createDocumentReference} from "./helpers/firestore.util";
import chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

describe("PaymentsClient", () => {
  const options: PaymentsClientOptions = {
    invoicesCollection: "invoices",
    sessionsCollection: "users/{userId}/checkout-sessions",
    timeoutInMilliseconds: 30000,
  };

  const invoice = { amount: 100, currency: "USD", userId: "user123" };
  let client: PaymentsClient;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    client = new PaymentsClient(options);
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("places an invoice and returns a CheckoutSession with paymentPageURL", async () => {

    sandbox.stub(admin.firestore(), "collection").callsFake((collectionPath: string) => {
      if (collectionPath === options.invoicesCollection) {
        return {
          add: sinon.stub().resolves({id: "invoice123"}),
        } as any;
      }
      throw new Error(`Unexpected collection path: ${collectionPath}`);
    });

    sandbox.stub(admin.firestore(), "doc").callsFake((path: string) => {
      if (path === `users/${invoice.userId}/checkout-sessions/invoice123`) {
        return createDocumentReference({ data: { paymentPageURL: "https://example.com" } });
      }
      throw new Error(`Unexpected document path: ${path}`);
    });

    const result = await client.placeInvoice(invoice);

    expect(result.paymentPageURL).to.equal("https://example.com");
  });

  it("throws timeout error if CheckoutSession is not created within timeout", async () => {

    sandbox.stub(admin.firestore(), "collection").callsFake((collectionPath: string) => {
      if (collectionPath === options.invoicesCollection) {
        return {
          add: sinon.stub().resolves({id: "invoice123"}),
        } as any;
      }
      throw new Error(`Unexpected collection path: ${collectionPath}`);
    });

    await expect(client.placeInvoice(invoice, { timeoutInMilliseconds: 1 })).to.be.rejectedWith(
      FirestoreLiqPayError,
      "Timeout waiting for checkout session to be created"
    );
  });

  it("throws internal error if Firestore onSnapshot fails", async () => {
    sandbox.stub(admin.firestore(), "collection").callsFake((collectionPath: string) => {
      if (collectionPath === options.invoicesCollection) {
        return {
          add: sinon.stub().resolves({id: "invoice123"}),
        } as any;
      }
      throw new Error(`Unexpected collection path: ${collectionPath}`);
    });

    sandbox.stub(admin.firestore(), "doc").callsFake((path: string) => {
      if (path === `users/${invoice.userId}/checkout-sessions/invoice123`) {
        return createDocumentReference({
          error: new Error("Firestore error"),
        });
      }
      throw new Error(`Unexpected document path: ${path}`);
    });

    await expect(client.placeInvoice(invoice)).to.be.rejectedWith(
      FirestoreLiqPayError,
      "Error waiting for checkout session to be created"
    );
  });

  it("throws internal error if Firestore add fails", async () => {
    sandbox.stub(admin.firestore(), "collection").callsFake((collectionPath: string) => {
      if (collectionPath === options.invoicesCollection) {
        return {
          add: sinon.stub().rejects(new Error("Firestore error")),
        } as any;
      }
      throw new Error(`Unexpected collection path: ${collectionPath}`);
    });

    await expect(client.placeInvoice(invoice)).to.be.rejectedWith(
      FirestoreLiqPayError,
      "Error placing invoice in Firestore"
    );
  });

  it("returns default timeout if no timeout is provided", () => {
    const timeout = client["getTimeoutInMilliseconds"](undefined);
    expect(timeout).to.equal(DEFAULT_PAYMENTS_TIMEOUT_IN_MILLISECONDS);
  });

  it("throws error if provided timeout is not a positive number", () => {
    expect(() => client["getTimeoutInMilliseconds"](-1)).to.throw(
      FirestoreLiqPayError,
      "timeout must be a positive number"
    );
  });
});

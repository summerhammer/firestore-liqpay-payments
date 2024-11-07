import * as admin from "firebase-admin";
import {firestore} from "firebase-admin";
import * as chai from "chai";
import {expect} from "chai";
import chaiAsPromised = require("chai-as-promised");
import * as sinon from "sinon";
import {
  FirestoreLiqPayError,
  PaymentsClient,
  PaymentsClientOptions
} from "../src";
import {DEFAULT_PAYMENTS_TIMEOUT_IN_MILLISECONDS} from "../src/payments";
import DocumentReference = firestore.DocumentReference;

chai.use(chaiAsPromised);

describe("PaymentsClient", () => {
  const options: PaymentsClientOptions = {
    invoicesCollection: "invoices",
    sessionsCollection: "checkout-sessions",
    timeoutInMilliseconds: 30000,
  };

  const invoice = { amount: 100, currency: "USD" };
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
    const mockRef = {
      withConverter: sinon.stub().returnsThis(),
      onSnapshot: sinon.stub().callsFake((onNext) => {
        onNext({
          data: () => ({
            paymentPageURL: "https://example.com",
          }),
        });
        return () => {};
      }),
    } as unknown as DocumentReference;

    sandbox.stub(admin.firestore(), "collection").returns({
      add: sinon.stub().resolves(mockRef),
    } as any);

    const result = await client.placeInvoice(invoice);

    expect(result.paymentPageURL).to.equal("https://example.com");
  });

  it("throws timeout error if CheckoutSession is not created within timeout", async () => {
    const mockRef = {
      withConverter: sinon.stub().returnsThis(),
      onSnapshot: sinon.stub().returns(() => {}),
    } as unknown as DocumentReference;

    sandbox.stub(admin.firestore(), "collection").returns({
      add: sinon.stub().resolves(mockRef),
    } as any);

    expect(client.placeInvoice(invoice, { timeoutInMilliseconds: 1 })).to.be.rejectedWith(
      FirestoreLiqPayError,
      "Timeout waiting for checkout session to be created"
    );
  });

  it("throws internal error if Firestore onSnapshot fails", async () => {
    const mockRef = {
      withConverter: sinon.stub().returnsThis(),
      onSnapshot: sinon.stub().callsFake((_, onError) => {
        onError(new Error("Firestore error"));
        return () => {};
      }),
    } as unknown as DocumentReference;

    sandbox.stub(admin.firestore(), "collection").returns({
      add: sinon.stub().resolves(mockRef),
    } as any);

    expect(client.placeInvoice(invoice)).to.be.rejectedWith(
      FirestoreLiqPayError,
      "Error waiting for checkout session to be created"
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

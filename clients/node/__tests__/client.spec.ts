import { expect } from "chai";
import * as sinon from "sinon";
import { FirestoreLiqPayClient, FirestoreLiqPayClientOptions } from "../src";
import { PaymentsClient } from "../src";

describe("FirestoreLiqPayClient", () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("creates a default instance with default options", () => {
    const client = FirestoreLiqPayClient.createDefault();
    expect(client).to.be.instanceOf(FirestoreLiqPayClient);
  });

  it("creates an instance with provided options", () => {
    const options: FirestoreLiqPayClientOptions = {
      timeoutInMilliseconds: 5000,
      payments: {
        invoicesCollection: "custom-invoices",
        sessionsCollection: "custom-sessions",
        timeoutInMilliseconds: 10000,
      },
    };
    const client = new FirestoreLiqPayClient(options);
    expect(client).to.be.instanceOf(FirestoreLiqPayClient);
  });

  it("returns a PaymentsClient instance with default options", () => {
    const client = FirestoreLiqPayClient.createDefault();
    const paymentsClient = client.payments;
    expect(paymentsClient).to.be.instanceOf(PaymentsClient);
  });

  it("returns a PaymentsClient instance with provided options", () => {
    const options: FirestoreLiqPayClientOptions = {
      payments: {
        invoicesCollection: "custom-invoices",
        sessionsCollection: "custom-sessions",
      },
    };
    const client = new FirestoreLiqPayClient(options);
    const paymentsClient = client.payments;
    expect(paymentsClient).to.be.instanceOf(PaymentsClient);
    expect(paymentsClient.options["invoicesCollection"]).to.equal("custom-invoices");
    expect(paymentsClient.options["sessionsCollection"]).to.equal("custom-sessions");
  });

  it("reuses the same PaymentsClient instance", () => {
    const client = FirestoreLiqPayClient.createDefault();
    const paymentsClient1 = client.payments;
    const paymentsClient2 = client.payments;
    expect(paymentsClient1).to.equal(paymentsClient2);
  });

  it("uses the timeout from payments options if provided", () => {
    const options: FirestoreLiqPayClientOptions = {
      payments: {
        invoicesCollection: "custom-invoices",
        sessionsCollection: "custom-sessions",
        timeoutInMilliseconds: 10000,
      },
    };
    const client = new FirestoreLiqPayClient(options);
    const paymentsClient = client.payments;
    expect(paymentsClient.options["timeoutInMilliseconds"]).to.equal(10000);
  });

  it("uses the timeout from client options if payments timeout is not provided", () => {
    const options: FirestoreLiqPayClientOptions = {
      timeoutInMilliseconds: 5000,
    };
    const client = new FirestoreLiqPayClient(options);
    const paymentsClient = client.payments;
    expect(paymentsClient.options["timeoutInMilliseconds"]).to.equal(5000);
  });
});

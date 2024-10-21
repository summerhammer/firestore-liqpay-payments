import { expect } from "chai";
import * as sinon from "sinon";
import { logger } from "firebase-functions";
import {
  checkoutInvoiceWithId,
  checkoutInvoiceWithIdSuccess,
  checkoutInvoiceWithIdError,
  handlePaymentStatus,
  handlePaymentStatusError,
  handlePaymentStatusSuccess,
  getPaymentStatus,
  getPaymentStatusSuccess
} from "../../src/logs";
import { PaymentStatus } from "../../src/liqpay/dto/payment-status.response";

describe("checkoutInvoiceWithId", () => {
  after(() => {
    sinon.restore();
  });
  it("logs the checkout invoice message", () => {
    const logStub = sinon.stub(logger, "log");
    checkoutInvoiceWithId("invoice123");
    expect(logStub.calledWith("⚙️ Checking out invoice [invoice123].")).to.be.true;
    logStub.restore();
  });
});

describe("checkoutInvoiceWithIdSuccess", () => {
  after(() => {
    sinon.restore();
  });
  it("logs the success message with payment page URL", () => {
    const logStub = sinon.stub(logger, "log");
    checkoutInvoiceWithIdSuccess("invoice123", "http://payment.page.url");
    expect(logStub.calledWith("✅ Checkout for invoice [invoice123] was successful. Payment page URL: http://payment.page.url.")).to.be.true;
    logStub.restore();
  });

  it("logs the success message with null payment page URL", () => {
    const logStub = sinon.stub(logger, "log");
    checkoutInvoiceWithIdSuccess("invoice123", null);
    expect(logStub.calledWith("✅ Checkout for invoice [invoice123] was successful. Payment page URL: null.")).to.be.true;
    logStub.restore();
  });
});

describe("checkoutInvoiceWithIdError", () => {
  it("logs the error message", () => {
    const errorStub = sinon.stub(logger, "error");
    checkoutInvoiceWithIdError("invoice123", new Error("Test error"));
    expect(errorStub.calledWith("❌ Error checking out invoice [invoice123]: Error: Test error")).to.be.true;
    errorStub.restore();
  });
});

describe("handlePaymentStatus", () => {
  after(() => {
    sinon.restore();
  });
  it("logs the handling payment status message", () => {
    const logStub = sinon.stub(logger, "log");
    handlePaymentStatus({ status: "paid" });
    expect(logStub.calledWith("⚙️ Handling payment status: {\"status\":\"paid\"}")).to.be.true;
    logStub.restore();
  });
});

describe("handlePaymentStatusError", () => {
  after(() => {
    sinon.restore();
  });
  it("logs the error handling payment status message", () => {
    const errorStub = sinon.stub(logger, "error");
    handlePaymentStatusError(new Error("Test error"));
    expect(errorStub.calledWith("❌ Error handling payment status: Error: Test error")).to.be.true;
    errorStub.restore();
  });
});

describe("handlePaymentStatusSuccess", () => {
  after(() => {
    sinon.restore();
  });
  it("logs the payment status handled message", () => {
    const logStub = sinon.stub(logger, "log");
    const status = { order_id: "order123", transaction_id: 123456, payment_id: 123456 } as PaymentStatus;
    handlePaymentStatusSuccess(status);
    expect(logStub.calledWith("✅ Payment status handled: {\"order_id\":\"order123\",\"transaction_id\":123456,\"payment_id\":123456}")).to.be.true;
    logStub.restore();
  });
});

describe("getPaymentStatus", () => {
  after(() => {
    sinon.restore();
  });
  it("logs the getting payment status message", () => {
    const logStub = sinon.stub(logger, "log");
    getPaymentStatus("invoice123");
    expect(logStub.calledWith("⚙️ Getting payment status for invoice [invoice123].")).to.be.true;
    logStub.restore();
  });
});

describe("getPaymentStatusSuccess", () => {
  after(() => {
    sinon.restore();
  });
  it("logs the payment status successfully retrieved message", () => {
    const logStub = sinon.stub(logger, "log");
    const status = { order_id: "order-09876" };
    getPaymentStatusSuccess(status);
    expect(logStub.calledWith(`✅ Payment status received: ${JSON.stringify(status)}`)).to.be.true;
    logStub.restore();
  });
});

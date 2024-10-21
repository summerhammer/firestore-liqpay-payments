import {expect} from "chai";
import config from "../../src/config";
import {
  configResolveCheckoutSessionDocumentPath,
  configResolveWebhookURL,
  translateInvoiceToCheckoutRequest,
  utilConvertTimestampsToFormattedDates,
  utilFormatDateToString,
  utilReplaceTokensInString
} from "../../src/helpers";
import {Timestamp} from "firebase-admin/firestore";
import * as sinon from "sinon";

// MARK: Config

describe("configResolveWebhookURL", () => {
  it("creates webhook URL with tokens replaced", () => {
    const result = configResolveWebhookURL();
    expect(result).to.equal(utilReplaceTokensInString(config.webhookURL ?? config.defaultWebhookURL, { ...process.env }));
  });
});

describe("configResolveCheckoutSessionDocumentPath", () => {
  it("creates checkout session path for invoice with valid tokens", () => {
    const invoice = { some: "value" };
    const result = configResolveCheckoutSessionDocumentPath(invoice, "invoiceId");
    const expectedCollection = utilReplaceTokensInString(config.sessionsCollection, { some: "value" });
    expect(result).to.equal(`${expectedCollection}/invoiceId`);
  });

  it("handles missing tokens gracefully", () => {
    const invoice = { some: undefined };
    const result = configResolveCheckoutSessionDocumentPath(invoice, "invoiceId");
    const expectedCollection = utilReplaceTokensInString(config.sessionsCollection, { some: undefined });
    expect(result).to.equal(`${expectedCollection}/invoiceId`);
  });
});

// MARK: Translation

describe("translateInvoiceToCheckoutRequest", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("converts an invoice DocumentData to EphemeralCheckoutRequest without schema", async () => {
    const doc = {
      order_id: "order-0001",
    };

    sinon.stub(config, "invoiceToCheckoutRequestJSONata").get(() => undefined);

    const result = await translateInvoiceToCheckoutRequest(doc, "inv-0001");
    expect(result).to.deep.equal({
      action: "pay",
      version: 3,
      language: "en",
      server_url: configResolveWebhookURL(),
      order_id: "inv-0001"
    });
  });

  context("with default schema", () => {

    it("converts an invoice DocumentData to EphemeralCheckoutRequest", async () => {
      const doc = {
        "invoiceId": "inv-0002",
        "description": "Invoice for order #123",
        "amount": 101.99,
        "currency": "USD",
      }
      const result = await translateInvoiceToCheckoutRequest(doc, "inv-0002");
      expect(result).to.deep.equal({
        order_id: "inv-0002",
        description: "Invoice for order #123",
        amount: 101.99,
        currency: "USD",
        action: "pay",
        version: 3,
        language: "en",
        server_url: configResolveWebhookURL(),
      });
    });

    it("converts a subscription invoice DocumentData to EphemeralCheckoutRequest", async () => {
      const now = new Date();
      const doc = {
        "invoiceId": "inv-0002",
        "description": "Invoice for order #123",
        "amount": 101.99,
        "currency": "USD",
        "subscription": {
          "start": Timestamp.fromDate(now),
          "periodicity": "monthly",
        }
      }
      const result = await translateInvoiceToCheckoutRequest(doc, "inv-0002");
      expect(result).to.deep.equal({
        order_id: "inv-0002",
        description: "Invoice for order #123",
        amount: 101.99,
        currency: "USD",
        action: "subscribe",
        subscribe: "1",
        subscribe_date_start: utilFormatDateToString(now),
        subscribe_periodicity: "month",
        version: 3,
        language: "en",
        server_url: configResolveWebhookURL(),
      });
    });
  });

  context("with custom schema", () => {
    it("converts an order DocumentData to EphemeralCheckoutRequest", async () => {
      const doc = {
        "orderId": "ord-0003",
        "description": "Order #456",
        "total": 201.99,
        "currency": "USD",
        "products": [
          { "name": "Product A", "price": 100.99 },
          { "name": "Product B", "price": 101.00 }
        ]
      };
      const schema = `
      {
          "order_id": orderId,
          "description": description,
          "amount": total,
          "currency": currency,
          "product_name": $join(products.name.$string(), ", ")
      }`;
      sinon.stub(config, "invoiceToCheckoutRequestJSONata").get(() => schema);
      const result = await translateInvoiceToCheckoutRequest(doc, "ord-0003");
      expect(result).to.deep.equal({
        order_id: "ord-0003",
        description: "Order #456",
        amount: 201.99,
        currency: "USD",
        product_name: "Product A, Product B",
        action: "pay",
        version: 3,
        language: "en",
        server_url: configResolveWebhookURL(),
      });
    });
  });
});

// MARK: Util

describe("utilReplaceTokensInString", () => {
  it("replaces multiple tokens in string", () => {
    const result = utilReplaceTokensInString("Hello, {name} from {place}!", { name: "World", place: "Earth" });
    expect(result).to.equal("Hello, World from Earth!");
  });

  it("handles null and undefined tokens", () => {
    const result = utilReplaceTokensInString("Hello, {name}!", { });
    expect(result).to.equal("Hello, {name}!");
  });

  it("handles empty string tokens", () => {
    const result = utilReplaceTokensInString("Hello, {name}!", { name: "" });
    expect(result).to.equal("Hello, !");
  });

  it("replaces tokens in default Webhook URL", () => {
    const webhookURL = "https://{LOCATION}-{PROJECT_ID}.cloudfunctions.net/ext-{EXT_INSTANCE_ID}-handlePaymentStatus";

    const env = {
      "LOCATION": "us-central1",
      "PROJECT_ID": "my-project",
      "EXT_INSTANCE_ID": "firestore-liqpay-payments",
    }

    const result = utilReplaceTokensInString(webhookURL, env);

    expect(result).to.equal("https://us-central1-my-project.cloudfunctions.net/ext-firestore-liqpay-payments-handlePaymentStatus");
  });
});

describe("utilConvertTimestampsToFormattedDates", () => {
  it("converts a Timestamp to LiqPay date string", () => {
    const timestamp = Timestamp.fromDate(new Date("2015-03-31T00:00:00Z"));
    const result = utilConvertTimestampsToFormattedDates(timestamp);
    expect(result).to.equal("2015-03-31 00:00:00");
  });

  it("converts an object with nested Timestamps to LiqPay date strings", () => {
    const obj = {
      date: Timestamp.fromDate(new Date("2015-03-31T00:00:00Z")),
      nested: {
        date: Timestamp.fromDate(new Date("2016-04-01T00:00:00Z"))
      }
    };
    const result = utilConvertTimestampsToFormattedDates(obj);
    expect(result).to.deep.equal({
      date: "2015-03-31 00:00:00",
      nested: {
        date: "2016-04-01 00:00:00"
      }
    });
  });

  it("returns the original value if it is not a Timestamp, array, or object", () => {
    const value = "not a timestamp";
    const result = utilConvertTimestampsToFormattedDates(value);
    expect(result).to.equal(value);
  });
});

describe("utilFormatDateToString", () => {
  it("formats a Date object to LiqPay date string", () => {
    const date = new Date("2024-10-19T08:20:28.438Z");
    const result = utilFormatDateToString(date);
    expect(result).to.equal("2024-10-19 08:20:28");
  });
});

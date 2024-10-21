import {EphemeralCheckoutRequest} from "../dto/checkout.request";
import {EphemeralPaymentStatusRequest} from "../dto/payment-status.request";
import {PaymentStatus,} from "../dto/payment-status.response";
import {LiqPayCrypto} from "../crypto/liq-pay-crypto";
import {LiqPayClient, LiqPayClientConfig, LiqPayError} from "../client";

export class NodeFetchLiqPayClient implements LiqPayClient {

  private readonly crypto: LiqPayCrypto;

  private readonly publicKey: string;
  private readonly baseURL: string;

  constructor(config: LiqPayClientConfig) {
    this.publicKey = config.publicKey;
    this.baseURL = config.baseURL || "https://www.liqpay.ua/api";
    this.crypto = new LiqPayCrypto(config.privateKey);
  }

  async checkout(
    request: EphemeralCheckoutRequest,
  ): Promise<string> {
    console.log(`LiqPay: checkout request: ${JSON.stringify(request)}`);
    const response = await fetch(`${this.baseURL}/3/checkout`, {
      method: "POST",
      body: this.encodeRequest({...request, public_key: this.publicKey}),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      redirect: "manual",
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("Location");
      if (!location) {
        throw new LiqPayError(
          "No redirect location",
          "NO_REDIRECT_LOCATION",
          undefined,
          "The response did not contain a redirect Location header",
        );
      }
      return location;
    } else {
      throw new LiqPayError(
        await response.text(),
        `HTTP_${response.status}`,
        undefined,
        "Unexpected response status code, expected 3xx",
      );
    }
  }

  async getPaymentStatus(
    request: EphemeralPaymentStatusRequest,
  ): Promise<PaymentStatus> {
    console.log(`LiqPay: getPaymentStatus request: ${JSON.stringify(request)}`);
    const response = await fetch(`${this.baseURL}/request`, {
      method: "POST",
      body: this.encodeRequest({...request, public_key: this.publicKey}),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (response.status !== 200) {
      throw new LiqPayError(
        await response.text(),
        `HTTP_${response.status}`,
        undefined,
        "Unexpected response status code, expected 200",
      );
    }

    return JSON.parse(await response.text())
  }

  decodePaymentStatus(
    json: any,
  ): PaymentStatus {
    console.log(`LiqPay: decodePaymentStatus: ${JSON.stringify(json)}`);

    if (!json) {
      throw new LiqPayError(
        "Invalid JSON",
        "BAD_ARGUMENT",
        undefined,
        `The JSON object is: ${json}`,
      );
    }

    const { data, signature } = json;

    if (!this.crypto.verify(data, signature)) {
      throw new LiqPayError(
        "Invalid signature",
        "INVALID_SIGNATURE",
        undefined,
        "The signature is invalid",
      );
    }

    return JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
  }

  encodeRequest(request: Record<any, any>): URLSearchParams {
    const data = Buffer.from(JSON.stringify(request)).toString("base64");
    const signature = this.crypto.encode(data);
    return new URLSearchParams({
      data: data,
      signature: signature
    });
  }

}

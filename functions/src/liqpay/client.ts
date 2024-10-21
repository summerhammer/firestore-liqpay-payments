import {EphemeralPaymentStatusRequest} from "./dto/payment-status.request";
import {PaymentStatus} from "./dto/payment-status.response";
import {EphemeralCheckoutRequest} from "./dto/checkout.request";

export interface LiqPayClient {

  checkout(
    request: EphemeralCheckoutRequest,
  ): Promise<string>

  getPaymentStatus(
    request: EphemeralPaymentStatusRequest,
  ): Promise<PaymentStatus>;

  decodePaymentStatus(
    json: any,
  ): PaymentStatus;

}

export interface LiqPayClientConfig {
  publicKey: string;
  privateKey: string;
  baseURL?: string;
}

export class LiqPayError extends Error {
  public readonly timestamp: number = Date.now();

  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error,
    public readonly details?: string,
  ) {
    super(message);
  }
}

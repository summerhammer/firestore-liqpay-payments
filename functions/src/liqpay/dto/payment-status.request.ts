export interface EphemeralPaymentStatusRequest {
  version: 3;
  action: "status";
  order_id: string;
}

export interface PaymentStatusRequest extends EphemeralPaymentStatusRequest {
  public_key: string;
}

export interface EphemeralCheckoutRequest {
  version: 3;
  action: "pay" | "subscribe";
  amount: number;
  currency: string;
  description: string;
  order_id: string;
  result_url?: string;
  server_url: string;
  expired_date?: string;
  paytypes?: string;
  verifycode?: string;
  language?: string;
  // regular payment
  subscribe?: "1";
  subscribe_date_start?: string;
  subscribe_periodicity?: "day" | "week" | "month" | "year";
  // sender
  sender_address?: string;
  sender_city?: string;
  sender_country_code?: string;
  sender_first_name?: string;
  sender_last_name?: string;
  sender_postal_code?: string;
  // other
  dae?: string;
  info?: string;
  // product
  product_category?: string;
  product_description?: string;
  product_name?: string;
  product_url?: string;
}

export interface CheckoutRequest extends EphemeralCheckoutRequest {
  public_key: string;
}

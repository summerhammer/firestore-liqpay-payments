export interface PaymentStatusResponse {
  data: PaymentStatus,
  signature: string,
}

export interface PaymentStatus {
  payment_id: number;
  action: LiqPayActionUnion;
  status: LiqPayStatusUnion;
  err_code: string;
  err_description: string;
  err_erc: string;
  info: string;
  version: number;
  type: string;
  paytype: LiqPayPayTypeUnion;
  public_key: string;
  acq_id: number;
  order_id: string;
  transaction_id: number;
  liqpay_order_id: string;
  description: string;
  amount: number;
  amount_debit: number;
  amount_credit: number
  currency: string;
  currency_debit: string;
  currency_credit: string;
  bonus_type: LiqPayBonusTypeUnion;
  bonus_procent: number;
  card_token: string;

  sender_phone: string;
  sender_card_mask2: string;
  sender_card_bank: string;
  sender_card_type: string;
  sender_card_country: number;
  commission_debit: number;
  commission_credit: number;
  agent_commission: number;
  sender_commission: number;
  receiver_commission: number;
  sender_bonus: number;
  amount_bonus: number;

  mpi_eci: LiqPayPlugInElectronicCommerceIndicatorUnion;
  is_3ds: boolean;

  language: string;
  create_date: number;
  end_date: number;
  refund_date_last: number;
  completion_date: number;
}

// MARK: LiqPayActionsEnum

export enum LiqPayActionEnum {
  pay = "pay",
  hold = "hold",
  paysplit = "paysplit",
  subscribe = "subscribe",
  paydonate = "paydonate",
  auth = "auth",
  regular = "regular",
}

export type LiqPayActionUnion = `${LiqPayActionEnum}`;

// MARK: LiqPayStatusEnum

export enum LiqPayStatusEnum {
  error = "error",
  failure = "failure",
  reversed = "reversed",
  subscribed = "subscribed",
  success = "success",
  unsubscribed = "unsubscribed",
  three_domains_verify = "3ds_verify",
  captcha_verify = "captcha_verify",
  cvv_verify = "cvv_verify",
  ivr_verify = "ivr_verify",
  otp_verify = "otp_verify",
  password_verify = "password_verify",
  phone_verify = "phone_verify",
  pin_verify = "pin_verify",
  receiver_verify = "receiver_verify",
  sender_verify = "sender_verify",
  senderapp_verify = "senderapp_verify",
  wait_qr = "wait_qr",
  wait_sender = "wait_sender",
  cash_wait = "cash_wait",
  hold_wait = "hold_wait",
  invoice_wait = "invoice_wait",
  prepared = "prepared",
  processing = "processing",
  wait_accept = "wait_accept",
  wait_card = "wait_card",
  wait_compensation = "wait_compensation",
  wait_lc = "wait_lc",
  wait_reserve = "wait_reserve",
  wait_secure = "wait_secure",
}

export type LiqPayStatusUnion = `${LiqPayStatusEnum}`;

// MARK: LiqPayPayTypeEnum

export enum LiqPayPayTypeEnum {
  apay = "apay",
  gpay = "gpay",
  card = "card",
  liqpay = "liqpay",
  privat24 = "privat24",
  masterpass = "masterpass",
  moment_part = "moment_part",
  paypart = "paypart",
  cash = "cash",
  invoice = "invoice",
  qr = "qr",
}

export type LiqPayPayTypeUnion = `${LiqPayPayTypeEnum}`;

// MARK: LiqPayBonusTypeEnum

export enum LiqPayBonusTypeEnum {
  bonusplus = "bonusplus",
  discount_club = "discount_club",
  personal = "personal",
  promo = "promo",
}

export type LiqPayBonusTypeUnion = `${LiqPayBonusTypeEnum}`;

// MARK: LiqPayPlugInElectronicCommerceIndicatorEnum

export type LiqPayPlugInElectronicCommerceIndicatorUnion = 5 | 6 | 7;



export interface RroInfo {
  amount: number;
  cost: number;
  id: number;
  price: number;
}

export enum LiqPayCommissionPayerEnum {
  sender = "sender",
  receiver = "receiver",
}

export type LiqPayCommissionPayerUnion = `${LiqPayCommissionPayerEnum}`;

export interface SplitRule {
  public_key: string;
  amount: number;
  commission_payer: LiqPayCommissionPayerUnion;
  server_url: string;
}


export enum LiqPayCurrencyEnum {
  USD = "USD",
  EUR = "EUR",
  UAH = "UAH",
  BYN = "BYN",
  KZT = "KZT",
}

export type LiqPayCurrencyUnion = `${LiqPayCurrencyEnum}`;

export enum LiqPayLanguageEnum {
  uk = "uk",
  en = "en",
}

export type LiqPayLanguageUnion = `${LiqPayLanguageEnum}`;

export enum LiqPaySubscribePeriodicityEnum {
  month = "month",
  year = "year",
}

export type LiqPaySubscribePeriodicityUnion = `${LiqPaySubscribePeriodicityEnum}`;

export interface LiqPayData {
  public_key: string;
  private_key: string;
  version: number;
  action: LiqPayActionUnion;
  amount: number;
  currency: LiqPayCurrencyUnion;
  description: string;
  order_id: string;
  rro_info?: RroInfo[];
  expired_date?: string;
  language?: LiqPayLanguageUnion;
  paytypes?: LiqPayPayTypeUnion;
  result_url?: string;
  server_url?: string;
  verifycode?: string;
  split_rules?: string; // SplitRule[] json string
  sender_address?: string;
  sender_city?: string;
  sender_country_code?: string;
  sender_first_name?: string;
  sender_last_name?: string;
  sender_postal_code?: string;
  letter_of_credit?: "1";
  letter_of_credit_date?: string;
  subscribe?: string;
  subscribe_date_start?: string;
  subscribe_periodicity?: LiqPaySubscribePeriodicityUnion;
  customer?: string;
  recurringbytoken?: "1";
  customer_user_id?: string;
  dae?: string; // DetailAddend json string
  info?: string;
  product_category?: string; // 25 max
  product_description?: string // 500 max
  product_name?: string; // 100 max
  product_url?: string; // 2000 max
}

export type Credentials = {
  data: string,
  signature: string,
}

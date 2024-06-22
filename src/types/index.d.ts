export interface OrderApprovedEvent {
  order_ref: string;
  order_status: string;
  product_type: string;
  payment_method: string;
  store_id: string;
  payment_merchant_id: string;
  installments: number;
  card_type: string | null;
  card_last4digits: string | null;
  card_rejection_reason: string | null;
  boleto_URL: string | null;
  boleto_barcode: string | null;
  boleto_expiry_date: Date | null;
  pix_code: string | null;
  pix_expiration: Date | null;
  sale_type: string;
  created_at: string;
  updated_at: string;
  approved_date: string | null;
  refunded_at: string | null;
  webhook_event_type: string;
  Product: {
    product_id: string;
    product_name: string;
  };
  Customer: {
    full_name: string;
    first_name: string;
    email: string;
    mobile: string;
    CPF: string;
    ip: string;
  };
  Commissions: {
    charge_amount: number;
    product_base_price: number;
    kiwify_fee: number;
    commissioned_stores: Array<{
      id: string;
      type: string;
      customName: string;
      email: string;
      value: string;
      commissionId: string;
    }>;
    currency: string;
    my_commission: number;
    funds_status: string | null;
    estimated_deposit_date: Date | null;
    deposit_date: Date | null;
  };
  TrackingParameters: {
    src: null;
    sck: null;
    utm_source: null;
    utm_medium: null;
    utm_campaign: null;
    utm_content: null;
    utm_term: null;
  };
  Subscription: {
    id: string;
    start_date: string;
    next_payment: string;
    status: string;
    plan: {
      id: string;
      name: string;
      frequency: string;
      qty_charges: number;
    };
    charges: { completed: Array<any>; future: Array<any> };
  };
  subscription_id: string;
  access_url: null;
}

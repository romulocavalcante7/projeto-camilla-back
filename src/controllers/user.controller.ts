import httpStatus from "http-status";
import crypto from "crypto";
import pick from "../utils/pick";
import ApiError from "../utils/ApiError";
import catchAsync from "../utils/catchAsync";
import { userService } from "../services";
import { OrderApprovedEvent } from "../types";

const secret = "qma8i8fdwmd";

const handleOrderApproved = catchAsync(async (req, res) => {
  const order = req.body;
  const { signature } = req.query;
  const calculatedSignature = crypto
    .createHmac("sha1", secret)
    .update(JSON.stringify(order))
    .digest("hex");
  console.log("signature", signature);
  console.log("calculatedSignature", calculatedSignature);
  if (signature !== calculatedSignature) {
    return res.status(400).send({ error: "Incorrect signature" });
  }

  console.log("Received order:", order);

  // Extract relevant data from the order event
  const event: OrderApprovedEvent = {
    order_ref: order.order_ref,
    order_status: order.order_status,
    product_type: order.product_type,
    payment_method: order.payment_method,
    store_id: order.store_id,
    payment_merchant_id: order.payment_merchant_id,
    installments: order.installments,
    card_type: order.card_type,
    card_last4digits: order.card_last4digits,
    card_rejection_reason: order.card_rejection_reason,
    boleto_URL: order.boleto_URL,
    boleto_barcode: order.boleto_barcode,
    boleto_expiry_date: order.boleto_expiry_date ? new Date(order.boleto_expiry_date) : null,
    pix_code: order.pix_code,
    pix_expiration: order.pix_expiration ? new Date(order.pix_expiration) : null,
    sale_type: order.sale_type,
    created_at: order.created_at,
    updated_at: order.updated_at,
    approved_date: order.approved_date ? order.approved_date : null,
    refunded_at: order.refunded_at ? order.refunded_at : null,
    webhook_event_type: order.webhook_event_type,
    Product: {
      product_id: order.Product.product_id,
      product_name: order.Product.product_name,
    },
    Customer: {
      full_name: order.Customer.full_name,
      first_name: order.Customer.first_name,
      email: order.Customer.email,
      mobile: order.Customer.mobile,
      CPF: order.Customer.CPF,
      ip: order.Customer.ip,
    },
    Commissions: {
      charge_amount: order.Commissions.charge_amount,
      product_base_price: order.Commissions.product_base_price,
      kiwify_fee: order.Commissions.kiwify_fee,
      commissioned_stores: order.Commissions.commissioned_stores.map((store: any) => ({
        id: store.id,
        type: store.type,
        customName: store.customName,
        email: store.email,
        value: store.value,
        commissionId: store.commissionId,
      })),
      currency: order.Commissions.currency,
      my_commission: order.Commissions.my_commission,
      funds_status: order.Commissions.funds_status,
      deposit_date: order.Commission?.deposit_date || null,
      estimated_deposit_date: order.Commission?.estimated_deposit_date || null,
    },
    TrackingParameters: {
      src: order.TrackingParameters.src,
      sck: order.TrackingParameters.sck,
      utm_source: order.TrackingParameters.utm_source,
      utm_medium: order.TrackingParameters.utm_medium,
      utm_campaign: order.TrackingParameters.utm_campaign,
      utm_content: order.TrackingParameters.utm_content,
      utm_term: order.TrackingParameters.utm_term,
    },
    Subscription: {
      id: order.Subscription.id,
      start_date: order.Subscription.start_date,
      next_payment: order.Subscription.next_payment,
      status: order.Subscription.status,
      plan: {
        id: order.Subscription.plan.id,
        name: order.Subscription.plan.name,
        frequency: order.Subscription.plan.frequency,
        qty_charges: order.Subscription.plan.qty_charges,
      },
      charges: {
        completed: order.Subscription.charges.completed,
        future: order.Subscription.charges.future,
      },
    },
    subscription_id: order.subscription_id,
    access_url: order.access_url,
  };

  try {
    await userService.handleOrderApproved(event);
    res.status(httpStatus.CREATED).send({ message: "Order processed successfully" });
  } catch (error) {
    console.error("Error processing order:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error");
  }
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["name", "role"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  handleOrderApproved,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};

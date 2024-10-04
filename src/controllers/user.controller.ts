/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import httpStatus from "http-status";
import crypto from "crypto";
import prisma from "../client";
import ApiError from "../utils/ApiError";
import catchAsync from "../utils/catchAsync";
import { userService } from "../services";
import { OrderApprovedEvent } from "../types";
import config from "../config/config";
import { Request, Response } from "express";
import { getUserDetailById } from "../services/user.service";

const handleOrderApproved = catchAsync(async (req: Request, res: Response) => {
  const order = req.body;
  const { signature } = req.query;
  //@ts-ignore
  const tokenType = req.tokenType;
  const secretToken =
    tokenType === "singleToken" ? config.secretTokenSingle : config.secretTokenSubscription;

  const calculatedSignature = crypto
    .createHmac("sha1", secretToken)
    .update(JSON.stringify(order))
    .digest("hex");

  if (signature !== calculatedSignature) {
    return res.status(400).send({ error: "Incorrect signature" });
  }

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
      id: order?.Subscription?.id,
      start_date: order?.Subscription?.start_date,
      next_payment: order?.Subscription?.next_payment,
      status: order?.Subscription?.status,
      plan: {
        id: order?.Subscription?.plan?.id,
        name: order?.Subscription?.plan?.name,
        frequency: order?.Subscription?.plan?.frequency,
        qty_charges: order?.Subscription?.plan?.qty_charges,
      },
      charges: {
        completed: order?.Subscription?.charges?.completed,
        future: order?.Subscription?.charges?.future,
      },
    },
    subscription_id: order?.subscription_id,
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

const getUsers = catchAsync(async (req: Request, res: Response) => {
  const { search, role } = req.query;

  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
  const sortField = (req.query.sortField as string) || "createdAt";
  const sortOrder = (req.query.sortOrder as string) === "asc" ? "asc" : "desc";

  const orderBy: any = {};
  orderBy[sortField] = sortOrder;

  try {
    const where: any = {
      OR: [
        {
          name: {
            contains: search?.toString() || "",
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search?.toString() || "",
            mode: "insensitive",
          },
        },
      ],
    };

    if (role) {
      const roleEnum = role.toString().toUpperCase() as Role;
      if (Object.values(Role).includes(roleEnum)) {
        where.role = roleEnum;
      } else {
        return res.status(httpStatus.BAD_REQUEST).json({ error: "Role inválido." });
      }
    }
    const totalCount = await prisma.user.count({
      where,
    });

    const users = await prisma.user.findMany({
      where,
      include: {
        avatar: true,
        orders: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            subscription: {
              include: {
                plan: true,
              },
            },
          },
        },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      firstAccess: user.firstAccess,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      avatar: user.avatar
        ? {
            id: user.avatar.id,
            filename: user.avatar.filename,
            filetype: user.avatar.filetype,
            filesize: user.avatar.filesize,
            url: user.avatar.url,
            createdAt: user.avatar.createdAt.toISOString(),
            updatedAt: user.avatar.updatedAt.toISOString(),
          }
        : undefined,
      subscription:
        user.orders.length > 0 && user.orders[0].subscription
          ? {
              status: user.orders[0].subscription.status,
              nextPayment: user.orders[0].subscription.nextPayment.toISOString(),
              startDate: user.orders[0].subscription.startDate.toISOString(),
              planName: user.orders[0].subscription.plan.name,
            }
          : undefined,
      orderStatus: user.orders.length > 0 ? user.orders[0].orderStatus : undefined,
      status: user.status,
    }));

    const totalPages = Math.ceil(totalCount / pageSize);

    res.status(httpStatus.OK).json({
      page,
      pageSize,
      total: totalCount,
      totalPages,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao buscar usuários." });
  }
});

const getUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.body.userId, [
    "id",
    "email",
    "name",
    "password",
    "role",
    "isEmailVerified",
    "createdAt",
    "firstAccess",
    "updatedAt",
    "avatar",
    "status",
  ]);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.send(user);
});

const getUserDetail = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.body || {};
  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "O campo userId é obrigatório");
  }
  const user = await getUserDetailById(userId, {
    avatar: true,
    tokens: true,
    orders: {
      orderBy: {
        createdAt: "desc",
      },
      include: {
        product: true,
        customer: true,
        commission: true,
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    },
    favorites: true,
    stickers: true,
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.send(user);
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const inactiveUser = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body || {};
  await userService.inactiveUser(req.params.userId, status);
  res.status(httpStatus.NO_CONTENT).send();
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  handleOrderApproved,
  getUsers,
  getUser,
  getUserDetail,
  updateUser,
  inactiveUser,
  deleteUser,
};

/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { User, Role, Prisma, Customer } from "@prisma/client";
import httpStatus from "http-status";
import prisma from "../client";
import ApiError from "../utils/ApiError";
import { encryptPassword, generateRandomPassword } from "../utils/encryption";
import { OrderApprovedEvent } from "../types";
import emailService from "./email.service";
import config from "../config/config";

interface UserIncludes {
  avatar?: boolean;
  tokens?: boolean;
  orders?: boolean;
  favorites?: boolean;
  stickers?: boolean;
  subscription?: {
    include: {
      plan: boolean;
    };
  };
}

/**
 * Create a user
 * @param {string} email
 * @param {string} password
 * @param {string} [name]
 * @param {Role} [role]
 * @param {boolean} [isManuallyCreated] - Indica se o usuário foi criado manualmente
 * @param {Date} [expirationDate] - Data de expiração do usuário
 * @returns {Promise<User>}
 */
const createUser = async (
  email: string,
  password: string,
  name?: string,
  role: Role = Role.USER,
  isManuallyCreated = false,
  expirationDate?: Date
): Promise<User> => {
  if (await getUserByEmail(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email já existe");
  }
  return prisma.user.create({
    data: {
      email,
      name,
      password: await encryptPassword(password),
      role,
      isManuallyCreated,
      expirationDate,
    },
  });
};

/**
 * Handle approved order event
 * @param {OrderApprovedEvent} event
 * @returns {Promise<void>}
 */
const handleOrderApproved = async (event: OrderApprovedEvent): Promise<void> => {
  const email = event.Customer.email;
  const fullName = event.Customer.full_name;

  // Verifica se o usuário já existe
  let user;
  try {
    user = await prisma.user.findUnique({ where: { email: email } });
    if (!user) {
      // Gerar senha aleatória
      const randomPassword = generateRandomPassword(12);

      // Criar usuário no banco de dados
      user = await createUser(email, randomPassword, fullName);

      // Enviar senha ao usuário (implementação futura)
      await emailService.sendEmail({
        to: email,
        subject: "Acesso da plataforma",
        template: "access",
        data: {
          user: { name: fullName, email: email },
          password: randomPassword,
          appUrl: config.appUrl,
        },
      });
    }

    // Verifica se o cliente já existe ou cria um novo
    let customer = await prisma.customer.findUnique({
      where: { email: event.Customer.email || "" },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          email: event.Customer.email,
          fullName: event.Customer.full_name,
          firstName: event.Customer.first_name,
          mobile: event.Customer.mobile,
          cpf: event?.Customer?.CPF || " ",
          ip: event.Customer.ip,
        },
      });
    }

    // Verifica se o produto já existe ou cria um novo
    let product = await prisma.product.findUnique({ where: { id: event.Product.product_id } });
    if (!product) {
      product = await prisma.product.create({
        data: {
          id: event.Product.product_id,
          name: event.Product.product_name,
        },
      });
    }

    // Verifica se a assinatura já existe ou cria uma nova
    let subscription;
    if (event?.subscription_id) {
      subscription = await prisma.subscription.upsert({
        where: { id: event.subscription_id },
        update: {
          startDate: new Date(event.Subscription.start_date),
          nextPayment: new Date(event.Subscription.next_payment),
          status: event.Subscription.status,
          plan: {
            connectOrCreate: {
              where: { id: event.Subscription.plan.id },
              create: {
                id: event.Subscription.plan.id,
                name: event.Subscription.plan.name,
                frequency: event.Subscription.plan.frequency,
                qtyCharges: event.Subscription.plan.qty_charges,
              },
            },
          },
        },
        create: {
          id: event.Subscription.id,
          startDate: new Date(event.Subscription.start_date),
          nextPayment: new Date(event.Subscription.next_payment),
          status: event.Subscription.status,
          plan: {
            connectOrCreate: {
              where: { id: event.Subscription.plan.id },
              create: {
                id: event.Subscription.plan.id,
                name: event.Subscription.plan.name,
                frequency: event.Subscription.plan.frequency,
                qtyCharges: event.Subscription.plan.qty_charges,
              },
            },
          },
        },
      });
    }

    // Verifica se a comissão já existe ou cria uma nova
    let commissionData;
    if (event.Commissions.commissioned_stores.length > 0) {
      const commission = event.Commissions.commissioned_stores[0];
      let existingCommission = await prisma.commission.findUnique({
        where: { id: commission.commissionId || "" },
      });
      if (!existingCommission) {
        existingCommission = await prisma.commission.create({
          data: {
            id: commission.commissionId,
            chargeAmount: Number(event.Commissions.charge_amount),
            currency: event.Commissions.currency,
            kiwifyFee: Number(event.Commissions.kiwify_fee),
            myCommission: Number(event.Commissions.my_commission),
            productBasePrice: Number(event.Commissions.product_base_price),
            fundsStatus: event.Commissions.funds_status,
            estimatedDepositDate: event.Commissions.estimated_deposit_date
              ? new Date(event.Commissions.estimated_deposit_date)
              : null,
            depositDate: event.Commissions.deposit_date
              ? new Date(event.Commissions.deposit_date)
              : null,
          },
        });
      }
      commissionData = { connect: { id: existingCommission.id } };
    }

    const objectSubscription = event.subscription_id
      ? { connect: { id: subscription.id } }
      : undefined;

    // Cria a ordem associada ao usuário
    const orderData: any = {
      orderRef: event.order_ref,
      orderStatus: event.order_status,
      productType: event.product_type,
      paymentMethod: event.payment_method,
      storeId: event.store_id,
      paymentMerchantId: event.payment_merchant_id,
      installments: event.installments,
      cardType: event.card_type,
      cardLast4Digits: event.card_last4digits,
      cardRejectionReason: event.card_rejection_reason,
      boletoURL: event.boleto_URL,
      boletoBarcode: event.boleto_barcode,
      boletoExpiryDate: event.boleto_expiry_date ? new Date(event.boleto_expiry_date) : undefined,
      pixCode: event.pix_code,
      pixExpiration: event.pix_expiration ? new Date(event.pix_expiration) : undefined,
      saleType: event.sale_type,
      createdAt: new Date(event.created_at),
      updatedAt: new Date(event.updated_at),
      approvedDate: event.approved_date ? new Date(event.approved_date) : undefined,
      refundedAt: event.refunded_at ? new Date(event.refunded_at) : undefined,
      webhookEventType: event.webhook_event_type,
      user: { connect: { id: user.id } },
      product: { connect: { id: product.id } },
      subscription: objectSubscription,
      customer: { connect: { email: customer.email } },
    };

    if (commissionData) {
      orderData.commission = commissionData;
    }

    await prisma.order.create({ data: orderData });
    console.log("Order processed successfully");
  } catch (error) {
    console.error("Error creating user or order:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error");
  }
};

/**
 * Query for users
 * @param {object} filter - Prisma filter
 * @param {object} options - Query options
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {"asc" | "desc"} [options.sortType] - Sort type (default = "desc")
 * @returns {Promise<Pick<User, Key>[]>}
 */
const queryUsers = async <Key extends keyof User>(
  filter: Prisma.UserWhereInput,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: "asc" | "desc";
  },
  keys: Key[] = [
    "id",
    "email",
    "name",
    "role",
    "isEmailVerified",
    "createdAt",
    "updatedAt",
  ] as Key[]
): Promise<Pick<User, Key>[]> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? "desc";
  const users = await prisma.user.findMany({
    where: filter,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
    skip: (page - 1) * limit,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : undefined,
  });
  return users as Pick<User, Key>[];
};

/**
 * Get user by id
 * @param {string} id
 * @param {Key[]} [keys]
 * @returns {Promise<Pick<User, Key> | null>}
 */

const getUserById = async <Key extends keyof any>(
  id: string,
  keys?: Key[]
): Promise<
  | (Pick<User, Key> & {
      subscription?: { status: string; frequency: string; nextPayment: string };
      orderStatus?: string;
    })
  | null
> => {
  const user = (await prisma.user.findUnique({
    where: { id },
    select: keys
      ? keys.reduce((obj, k) => ({ ...obj, [k]: true }), {
          orders: {
            orderBy: {
              createdAt: "desc",
            },
            select: {
              orderStatus: true,
              subscription: {
                select: {
                  status: true,
                  nextPayment: true,
                  plan: {
                    select: {
                      frequency: true,
                    },
                  },
                },
              },
            },
          },
        })
      : undefined,
  })) as Promise<
    | (Pick<User, Key> & {
        subscription?: { status: string; frequency: string; nextPayment: string };
        orderStatus?: string;
      })
    | null
  >;

  if (!user) {
    return null;
  }

  const orderWithSubscription = user?.orders?.find((order) => order?.subscription);
  const subscription = orderWithSubscription?.subscription;
  const orderStatus = user?.orders?.length > 0 ? user.orders[0].orderStatus : undefined;

  return {
    ...user,
    subscription: subscription
      ? {
          status: subscription.status,
          frequency: subscription.plan.frequency,
          nextPayment: subscription.nextPayment.toISOString(),
        }
      : undefined,
    orderStatus: orderStatus,
  };
};

export const getUserDetailById = async (
  userId: string,
  includes?: UserIncludes
): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: includes,
  });
};

/**
 * Get user by email
 * @param {string} email
 * @param {Key[]} [keys]
 * @returns {Promise<Pick<User, Key> | null>}
 */
const getUserByEmail = async <Key extends keyof any>(
  email: string,
  keys?: Key[]
): Promise<
  | (Pick<User, Key> & {
      subscription?: { status: string; frequency: string; nextPayment: string };
      orderStatus?: string;
    })
  | null
> => {
  const user = (await prisma.user.findUnique({
    where: { email },
    select: keys
      ? keys.reduce((obj, k) => ({ ...obj, [k]: true }), {
          orders: {
            orderBy: {
              createdAt: "desc",
            },
            select: {
              orderStatus: true,
              subscription: {
                select: {
                  status: true,
                  nextPayment: true,
                  plan: {
                    select: {
                      frequency: true,
                    },
                  },
                },
              },
            },
          },
        })
      : undefined,
  })) as Promise<
    | (Pick<User, Key> & {
        subscription?: { status: string; frequency: string; nextPayment: string };
        orderStatus?: string;
      })
    | null
  >;

  if (!user) {
    return null;
  }

  const orderWithSubscription = user?.orders?.find((order) => order?.subscription);
  const subscription = orderWithSubscription?.subscription;
  const orderStatus = user?.orders?.length > 0 ? user.orders[0].orderStatus : undefined;

  return {
    ...user,
    subscription: subscription
      ? {
          status: subscription.status,
          frequency: subscription.plan.frequency,
          nextPayment: subscription.nextPayment.toISOString(),
        }
      : undefined,
    orderStatus: orderStatus,
  };
};

/**
 * Update user by id
 * @param {string} userId
 * @param {Prisma.UserUpdateInput} updateBody
 * @param {Key[]} [keys]
 * @returns {Promise<Pick<User, Key> | null>}
 */
const updateUserById = async <Key extends keyof any>(
  userId: string,
  updateBody: Prisma.UserUpdateInput,
  keys?: Key[]
): Promise<Pick<User, Key> | null> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (updateBody.email && (await getUserByEmail(updateBody.email as string))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: updateBody,
    select: keys ? keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}) : undefined,
  });
  return updatedUser as Pick<User, Key> | null;
};

export const inactiveUser = async (userId: string, status: boolean): Promise<void> => {
  try {
    console.log({ userId, status });
    const user = await getUserById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        status,
      },
    });
  } catch (error) {
    console.error("Error inactive user:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to inactive user");
  }
};

/**
 * Delete user by id
 * @param {string} userId
 * @returns {Promise<void>}
 */
export const deleteUserById = async (userId: string): Promise<void> => {
  try {
    await prisma.$transaction(async (tx) => {
      // Deletar favoritos relacionados
      await tx.favoriteSticker.deleteMany({
        where: { userId },
      });

      // Deletar tokens relacionados
      await tx.token.deleteMany({
        where: { userId },
      });

      // Deletar stickers relacionados
      await tx.sticker.deleteMany({
        where: { userId },
      });

      // Deletar orders relacionados
      await tx.order.deleteMany({
        where: { userId },
      });

      // Deletar attachment relacionado (avatar)
      await tx.attachment.deleteMany({
        where: { userId },
      });

      // Finalmente, deletar o usuário
      const deletedUser = await tx.user.delete({
        where: { id: userId },
      });

      if (!deletedUser) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
      }
    });
  } catch (error) {
    console.error("Error deleting user and related records:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to delete user");
  }
};

export default {
  createUser,
  handleOrderApproved,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  inactiveUser,
  deleteUserById,
};

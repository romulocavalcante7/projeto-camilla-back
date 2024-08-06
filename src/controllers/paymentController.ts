import { Request, Response } from "express";
import httpStatus from "http-status";
import prisma from "../client";

const getUserPaymentStatus = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { orders: { some: { userId } } },
      include: {
        plan: true,
        orders: {
          where: { userId },
        },
      },
    });

    if (subscriptions.length === 0) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "No subscriptions found for user." });
    }

    const paymentStatus = subscriptions.map((subscription) => {
      const { startDate, nextPayment, status, plan } = subscription;
      return {
        startDate,
        nextPayment,
        status,
        planType: plan.frequency,
        totalCharges: plan.qtyCharges,
      };
    });

    res.status(httpStatus.OK).json(paymentStatus);
  } catch (error) {
    console.error("Error fetching user payment status:", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Error fetching user payment status." });
  }
};

export default {
  getUserPaymentStatus,
};

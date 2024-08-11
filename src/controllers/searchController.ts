import { Request, Response } from "express";
import httpStatus from "http-status";
import prisma from "../client";
import { Prisma } from "@prisma/client";

const searchCategoriesAndSubniches = async (req: Request, res: Response) => {
  const { search, importantFirst } = req.query;

  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
  const sortField = (req.query.sortField as string) || "createdAt";
  const sortOrder = (req.query.sortOrder as string) === "asc" ? "asc" : "desc";

  let orderBy: any = {};

  if (sortField === "createdAt") {
    orderBy = {
      createdAt: sortOrder,
    };
  } else if (sortField === "category") {
    orderBy = {
      category: {
        name: sortOrder,
      },
    };
  } else {
    orderBy[sortField] = sortOrder;
  }

  let orderArray: any[] = [];

  if (importantFirst === "true") {
    orderArray = [{ isImportant: "desc" }, { displayOrder: "asc" }, orderBy];
  } else {
    orderArray = [orderBy];
  }

  try {
    const categoryFilter: Prisma.CategoryWhereInput = {
      name: {
        contains: search as string,
        mode: Prisma.QueryMode.insensitive,
      },
    };

    const subnicheFilter: Prisma.SubnicheWhereInput = {
      OR: [
        {
          category: {
            name: {
              contains: search as string,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
        {
          name: {
            contains: search as string,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ],
    };

    const [totalCategories, totalSubniches] = await Promise.all([
      prisma.category.count({ where: categoryFilter }),
      prisma.subniche.count({ where: subnicheFilter }),
    ]);

    const [categories, subniches] = await Promise.all([
      prisma.category.findMany({
        orderBy: orderArray,
        where: categoryFilter,
        include: {
          attachment: true,
          subniches: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.subniche.findMany({
        orderBy: orderArray,
        where: subnicheFilter,
        include: {
          category: true,
          attachment: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    res.status(httpStatus.OK).json({
      page,
      pageSize,
      totalCategories,
      totalSubniches,
      total: totalCategories + totalSubniches,
      totalPages: Math.ceil((totalCategories + totalSubniches) / pageSize),
      categories,
      subniches,
    });
  } catch (error) {
    console.error("Erro ao buscar categorias e subnichos:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao buscar categorias e subnichos.",
    });
  }
};

export default {
  searchCategoriesAndSubniches,
};

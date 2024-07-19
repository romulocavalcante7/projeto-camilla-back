import { Request, Response } from "express";
import httpStatus from "http-status";
import prisma from "../client";

const createCategory = async (req: Request, res: Response) => {
  const { name, attachmentId } = req.body;

  try {
    const category = await prisma.category.create({
      data: {
        name,
        attachmentId,
      },
    });

    res.status(httpStatus.CREATED).json(category);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao criar categoria." });
  }
};

const getAllCategories = async (req: Request, res: Response) => {
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
  } else {
    orderBy[sortField] = sortOrder;
  }

  let orderArray: any[] = [];

  if (importantFirst === "true") {
    orderArray = [
      { isImportant: "desc" }, // Categorias importantes primeiro
      { displayOrder: "asc" }, // Ordem de exibição para categorias importantes
      orderBy, // Outras ordenações
    ];
  } else {
    orderArray = [orderBy]; // Apenas outras ordenações
  }

  try {
    const totalCount = await prisma.category.count({
      where: {
        name: {
          contains: (search as string) || "",
          mode: "insensitive",
        },
      },
    });

    const categories = await prisma.category.findMany({
      orderBy: orderArray,
      where: {
        name: {
          contains: (search as string) || "",
          mode: "insensitive",
        },
      },
      include: {
        attachment: true,
        subniches: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    res.status(httpStatus.OK).json({
      page,
      pageSize,
      total: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      categories,
    });
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao buscar categorias.",
    });
  }
};

const getTotalCategories = async (req: Request, res: Response) => {
  try {
    const totalCount = await prisma.category.count();
    res.status(httpStatus.OK).json({
      total: totalCount,
    });
  } catch (error) {
    console.error("Erro ao buscar subnichos:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao buscar subnichos." });
  }
};

const getImportantCategories = async (req: Request, res: Response) => {
  try {
    const importantCategories = await prisma.category.findMany({
      where: {
        isImportant: true,
      },
      orderBy: {
        displayOrder: "asc",
      },
      include: {
        attachment: true,
        subniches: true,
      },
    });

    res.status(httpStatus.OK).json(importantCategories);
  } catch (error) {
    console.error("Erro ao buscar categorias importantes:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao buscar categorias importantes.",
    });
  }
};

const getCategoryById = async (req: Request, res: Response) => {
  const { categoryId } = req.params;

  try {
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        attachment: true,
      },
    });

    if (!category) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "Categoria não encontrada." });
    }

    res.status(httpStatus.OK).json(category);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao buscar categoria." });
  }
};

const markCategoryAsImportant = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        isImportant: true,
        displayOrder: null,
      },
    });

    res.status(httpStatus.OK).json(updatedCategory);
  } catch (error) {
    console.error("Erro ao marcar categoria como importante:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao marcar categoria como importante.",
    });
  }
};

const removeCategoryImportant = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { isImportant: false, displayOrder: null },
    });

    res.status(httpStatus.OK).json(updatedCategory);
  } catch (error) {
    console.error("Erro ao remover status importante da categoria:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao remover status importante da categoria.",
    });
  }
};

const setCategoryDisplayOrder = async (req: Request, res: Response) => {
  const { id, displayOrder } = req.body;

  try {
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { displayOrder },
    });

    res.status(httpStatus.OK).json(updatedCategory);
  } catch (error) {
    console.error("Erro ao definir a ordem de exibição da categoria:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao definir a ordem de exibição da categoria.",
    });
  }
};

const updateCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const { name, attachmentId } = req.body;

  try {
    const updatedCategory = await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        name,
        attachmentId,
      },
    });

    res.status(httpStatus.OK).json(updatedCategory);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao atualizar categoria." });
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;

  try {
    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });

    res.status(httpStatus.OK).json({ message: "Categoria deletada com sucesso." });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao deletar categoria." });
  }
};

export default {
  createCategory,
  getAllCategories,
  getTotalCategories,
  getImportantCategories,
  getCategoryById,
  markCategoryAsImportant,
  removeCategoryImportant,
  setCategoryDisplayOrder,
  updateCategory,
  deleteCategory,
};

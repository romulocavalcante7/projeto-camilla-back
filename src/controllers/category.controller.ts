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
  const { search } = req.query;

  try {
    const totalCount = await prisma.category.count({
      where: {
        name: {
          contains: (search as string) || "",
          mode: "insensitive",
        },
      },
    });

    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
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
  getCategoryById,
  updateCategory,
  deleteCategory,
};

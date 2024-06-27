import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import httpStatus from "http-status";

const prisma = new PrismaClient();

const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body;

  try {
    const category = await prisma.category.create({
      data: {
        name,
      },
    });

    res.status(httpStatus.CREATED).json(category);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao criar categoria." });
  }
};

const getAllCategories = async (req: Request, res: Response) => {
  const { search, sortBy, limit, page } = req.query;
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        name: {
          contains: search?.toString() || "",
          mode: "insensitive",
        },
      },
    });
    res.status(httpStatus.OK).json(categories);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao buscar categorias." });
  }
};

const getCategoryById = async (req: Request, res: Response) => {
  console.log("req.params", req.params);
  const { categoryId } = req.params;

  try {
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
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
  const { name } = req.body;

  try {
    const updatedCategory = await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        name,
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

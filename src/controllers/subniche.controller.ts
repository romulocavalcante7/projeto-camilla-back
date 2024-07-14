import { Request, Response } from "express";
import httpStatus from "http-status";
import prisma from "../client";

const createSubniche = async (req: Request, res: Response) => {
  const { name, categoryId, attachmentId } = req.body;

  try {
    const subniche = await prisma.subniche.create({
      data: {
        name,
        categoryId,
        attachmentId,
      },
    });

    res.status(httpStatus.CREATED).json(subniche);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao criar subnicho." });
  }
};

const getAllSubniches = async (req: Request, res: Response) => {
  const { search } = req.query;

  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

    const totalCount = await prisma.subniche.count({
      where: {
        name: {
          contains: search?.toString() || "",
          mode: "insensitive",
        },
      },
    });

    const subniches = await prisma.subniche.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        name: {
          contains: search?.toString() || "",
          mode: "insensitive",
        },
      },
      include: {
        category: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    res.status(httpStatus.OK).json({
      page,
      pageSize,
      total: totalCount,
      totalPages,
      subniches,
    });
  } catch (error) {
    console.error("Erro ao buscar subnichos:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao buscar subnichos." });
  }
};

const getSubnichesByCategoryId = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const { search } = req.query;

  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

    const totalCount = await prisma.subniche.count({
      where: {
        categoryId,
        name: {
          contains: (search as string) || "",
          mode: "insensitive",
        },
      },
    });

    const subniches = await prisma.subniche.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        categoryId,
        name: {
          contains: (search as string) || "",
          mode: "insensitive",
        },
      },

      include: {
        category: true,
        attachment: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    res.status(httpStatus.OK).json({
      page,
      pageSize,
      total: totalCount,
      totalPages,
      subniches,
    });
  } catch (error) {
    console.error("Erro ao buscar subnichos da categoria:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao buscar subnichos da categoria.",
    });
  }
};

const getStickersBySubnicheId = async (req: Request, res: Response) => {
  const { subnicheId } = req.params;

  try {
    const stickers = await prisma.sticker.findMany({
      where: {
        subnicheId,
      },
      include: {
        attachment: true,
      },
    });

    if (stickers.length === 0) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Nenhum sticker encontrado para este subnicho." });
    }

    res.status(httpStatus.OK).json(stickers);
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Erro ao buscar stickers do subnicho." });
  }
};

const getSubnicheById = async (req: Request, res: Response) => {
  const { subnicheId } = req.params;

  try {
    const subniche = await prisma.subniche.findUnique({
      where: {
        id: subnicheId,
      },
      include: {
        category: true,
        attachment: true,
      },
    });

    if (!subniche) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "Subnicho não encontrado." });
    }

    res.status(httpStatus.OK).json(subniche);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao buscar subnicho." });
  }
};

const updateSubniche = async (req: Request, res: Response) => {
  const { subnicheId } = req.params;
  const { name, categoryId, attachmentId } = req.body;

  try {
    const updatedSubniche = await prisma.subniche.update({
      where: {
        id: subnicheId,
      },
      data: {
        name,
        categoryId,
        attachmentId,
      },
    });

    res.status(httpStatus.OK).json(updatedSubniche);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao atualizar subnicho." });
  }
};

const deleteSubniche = async (req: Request, res: Response) => {
  const { subnicheId } = req.params;

  try {
    await prisma.subniche.delete({
      where: {
        id: subnicheId,
      },
    });

    res.status(httpStatus.OK).json({ message: "Subnicho deletado com sucesso." });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao deletar subnicho." });
  }
};

export default {
  createSubniche,
  getAllSubniches,
  getSubnichesByCategoryId,
  getStickersBySubnicheId,
  getSubnicheById,
  updateSubniche,
  deleteSubniche,
};

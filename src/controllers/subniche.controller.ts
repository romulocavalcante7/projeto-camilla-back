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
    const totalCount = await prisma.subniche.count({
      where: {
        OR: [
          {
            category: {
              name: {
                contains: search?.toString() || "",
                mode: "insensitive",
              },
            },
          },
          {
            name: {
              contains: search?.toString() || "",
              mode: "insensitive",
            },
          },
        ],
      },
    });

    const subniches = await prisma.subniche.findMany({
      orderBy: orderArray,
      where: {
        OR: [
          {
            category: {
              name: {
                contains: search?.toString() || "",
                mode: "insensitive",
              },
            },
          },
          {
            name: {
              contains: search?.toString() || "",
              mode: "insensitive",
            },
          },
        ],
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
    console.error("Erro ao buscar subnichos:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao buscar subnichos." });
  }
};

const getTotalSubniches = async (req: Request, res: Response) => {
  try {
    const totalCount = await prisma.subniche.count();
    res.status(httpStatus.OK).json({
      total: totalCount,
    });
  } catch (error) {
    console.error("Erro ao buscar subnichos:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao buscar subnichos." });
  }
};

const getImportantSubniches = async (req: Request, res: Response) => {
  try {
    const importantSubniches = await prisma.subniche.findMany({
      where: {
        isImportant: true,
      },
      orderBy: {
        displayOrder: "asc",
      },
      include: {
        attachment: true,
      },
    });

    res.status(httpStatus.OK).json(importantSubniches);
  } catch (error) {
    console.error("Erro ao buscar subnichos importantes:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao buscar subnichos importantes.",
    });
  }
};

const getImportantSubnichesByCategoryId = async (req: Request, res: Response) => {
  const { categoryId } = req.params;

  try {
    const subniches = await prisma.subniche.findMany({
      where: {
        categoryId,
        isImportant: true,
      },
      orderBy: {
        displayOrder: "asc",
      },
      include: {
        category: true,
        attachment: true,
      },
    });

    res.status(httpStatus.OK).json(subniches);
  } catch (error) {
    console.error("Erro ao buscar subnichos importantes do subnicho:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao buscar subnichos importantes do subnicho.",
    });
  }
};

const getSubnichesByCategoryId = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const { search, importantFirst } = req.query;

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

    let orderArray: any[] = [];

    if (importantFirst === "true") {
      orderArray = [{ isImportant: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }];
    } else {
      orderArray = [{ createdAt: "desc" }];
    }

    const subniches = await prisma.subniche.findMany({
      orderBy: orderArray,
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

const markSubnicheAsImportant = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    const updatedSubniche = await prisma.subniche.update({
      where: { id },
      data: {
        isImportant: true,
        displayOrder: null,
      },
    });

    res.status(httpStatus.OK).json(updatedSubniche);
  } catch (error) {
    console.error("Erro ao marcar subnicho como importante:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao marcar subnicho como importante.",
    });
  }
};

const removeSubnicheImportant = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    const updatedSubniche = await prisma.subniche.update({
      where: { id },
      data: { isImportant: false, displayOrder: null },
    });

    res.status(httpStatus.OK).json(updatedSubniche);
  } catch (error) {
    console.error("Erro ao remover status importante do subnicho:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao remover status importante do subnicho.",
    });
  }
};

const setSubnicheDisplayOrder = async (req: Request, res: Response) => {
  const { id, displayOrder } = req.body;

  try {
    const updatedSubniche = await prisma.subniche.update({
      where: { id },
      data: { displayOrder },
    });

    res.status(httpStatus.OK).json(updatedSubniche);
  } catch (error) {
    console.error("Erro ao definir a ordem de exibição do subnicho:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao definir a ordem de exibição do subnicho.",
    });
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
  getTotalSubniches,
  getSubnichesByCategoryId,
  getStickersBySubnicheId,
  getImportantSubniches,
  getImportantSubnichesByCategoryId,
  getSubnicheById,
  markSubnicheAsImportant,
  removeSubnicheImportant,
  setSubnicheDisplayOrder,
  updateSubniche,
  deleteSubniche,
};

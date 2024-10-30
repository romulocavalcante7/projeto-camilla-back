import { Request, Response } from "express";
import httpStatus from "http-status";
import prisma from "../client";

const createIcon = async (req: Request, res: Response) => {
  const { name, attachmentId } = req.body;

  try {
    const icon = await prisma.icon.create({
      data: {
        name,
        attachmentId,
      },
    });

    res.status(httpStatus.CREATED).json(icon);
  } catch (error) {
    console.error("Erro ao criar ícone:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao criar ícone." });
  }
};

const getAllIcons = async (req: Request, res: Response) => {
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
    orderArray = [{ isImportant: "desc" }, { displayOrder: "asc" }, orderBy];
  } else {
    orderArray = [orderBy];
  }

  try {
    const totalCount = await prisma.icon.count({
      where: {
        name: {
          contains: (search as string) || "",
          mode: "insensitive",
        },
      },
    });

    const icons = await prisma.icon.findMany({
      orderBy: orderArray,
      where: {
        name: {
          contains: (search as string) || "",
          mode: "insensitive",
        },
      },
      include: {
        attachment: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    res.status(httpStatus.OK).json({
      page,
      pageSize,
      total: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      icons,
    });
  } catch (error) {
    console.error("Erro ao buscar ícones:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao buscar ícones.",
    });
  }
};

const getTotalIcons = async (req: Request, res: Response) => {
  try {
    const totalCount = await prisma.icon.count();
    res.status(httpStatus.OK).json({
      total: totalCount,
    });
  } catch (error) {
    console.error("Erro ao buscar total de ícones:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao buscar total de ícones." });
  }
};

const getImportantIcons = async (req: Request, res: Response) => {
  try {
    const importantIcons = await prisma.icon.findMany({
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

    res.status(httpStatus.OK).json(importantIcons);
  } catch (error) {
    console.error("Erro ao buscar ícones importantes:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao buscar ícones importantes.",
    });
  }
};

const getIconById = async (req: Request, res: Response) => {
  const { iconId } = req.params;

  try {
    const icon = await prisma.icon.findUnique({
      where: {
        id: iconId,
      },
      include: {
        attachment: true,
      },
    });

    if (!icon) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "Ícone não encontrado." });
    }

    res.status(httpStatus.OK).json(icon);
  } catch (error) {
    console.error("Erro ao buscar ícone:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao buscar ícone." });
  }
};

const markIconAsImportant = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    const updatedIcon = await prisma.icon.update({
      where: { id },
      data: {
        isImportant: true,
        displayOrder: null,
      },
    });

    res.status(httpStatus.OK).json(updatedIcon);
  } catch (error) {
    console.error("Erro ao marcar ícone como importante:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao marcar ícone como importante.",
    });
  }
};

const removeIconImportant = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    const updatedIcon = await prisma.icon.update({
      where: { id },
      data: { isImportant: false, displayOrder: null },
    });

    res.status(httpStatus.OK).json(updatedIcon);
  } catch (error) {
    console.error("Erro ao remover status importante do ícone:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao remover status importante do ícone.",
    });
  }
};

const setIconDisplayOrder = async (req: Request, res: Response) => {
  const { id, displayOrder } = req.body;

  try {
    const updatedIcon = await prisma.icon.update({
      where: { id },
      data: { displayOrder },
    });

    res.status(httpStatus.OK).json(updatedIcon);
  } catch (error) {
    console.error("Erro ao definir a ordem de exibição do ícone:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao definir a ordem de exibição do ícone.",
    });
  }
};

const updateIcon = async (req: Request, res: Response) => {
  const { iconId } = req.params;
  const { name, attachmentId } = req.body;

  try {
    const updatedIcon = await prisma.icon.update({
      where: {
        id: iconId,
      },
      data: {
        name,
        attachmentId,
      },
    });

    res.status(httpStatus.OK).json(updatedIcon);
  } catch (error) {
    console.error("Erro ao atualizar ícone:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao atualizar ícone." });
  }
};

const deleteIcon = async (req: Request, res: Response) => {
  const { iconId } = req.params;
  try {
    await prisma.icon.delete({
      where: {
        id: iconId,
      },
    });

    res.status(httpStatus.OK).json({ message: "Ícone deletado com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar ícone:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao deletar ícone." });
  }
};

export default {
  createIcon,
  getAllIcons,
  getTotalIcons,
  getImportantIcons,
  getIconById,
  markIconAsImportant,
  removeIconImportant,
  setIconDisplayOrder,
  updateIcon,
  deleteIcon,
};

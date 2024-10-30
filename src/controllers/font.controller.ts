import { Request, Response } from "express";
import httpStatus from "http-status";
import prisma from "../client";

const createFont = async (req: Request, res: Response) => {
  const { name, attachmentId } = req.body;

  try {
    const font = await prisma.font.create({
      data: {
        name,
        attachmentId,
      },
    });

    res.status(httpStatus.CREATED).json(font);
  } catch (error) {
    console.error("Erro ao criar fonte:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao criar fonte." });
  }
};

const getAllFonts = async (req: Request, res: Response) => {
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
    const totalCount = await prisma.font.count({
      where: {
        name: {
          contains: (search as string) || "",
          mode: "insensitive",
        },
      },
    });

    const fonts = await prisma.font.findMany({
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
      fonts,
    });
  } catch (error) {
    console.error("Erro ao buscar fontes:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao buscar fontes.",
    });
  }
};

const getTotalFonts = async (req: Request, res: Response) => {
  try {
    const totalCount = await prisma.font.count();
    res.status(httpStatus.OK).json({
      total: totalCount,
    });
  } catch (error) {
    console.error("Erro ao buscar total de fontes:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao buscar total de fontes." });
  }
};

const getImportantFonts = async (req: Request, res: Response) => {
  try {
    const importantFonts = await prisma.font.findMany({
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

    res.status(httpStatus.OK).json(importantFonts);
  } catch (error) {
    console.error("Erro ao buscar fontes importantes:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao buscar fontes importantes.",
    });
  }
};

const getFontById = async (req: Request, res: Response) => {
  const { fontId } = req.params;

  try {
    const font = await prisma.font.findUnique({
      where: {
        id: fontId,
      },
      include: {
        attachment: true,
      },
    });

    if (!font) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "Fonte não encontrada." });
    }

    res.status(httpStatus.OK).json(font);
  } catch (error) {
    console.error("Erro ao buscar fonte:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao buscar fonte." });
  }
};

const markFontAsImportant = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    const updatedFont = await prisma.font.update({
      where: { id },
      data: {
        isImportant: true, // Caso queira adicionar este campo
        displayOrder: null,
      },
    });

    res.status(httpStatus.OK).json(updatedFont);
  } catch (error) {
    console.error("Erro ao marcar fonte como importante:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao marcar fonte como importante.",
    });
  }
};

const removeFontImportant = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    const updatedFont = await prisma.font.update({
      where: { id },
      data: { isImportant: false, displayOrder: null }, // Se esse campo for adicionado
    });

    res.status(httpStatus.OK).json(updatedFont);
  } catch (error) {
    console.error("Erro ao remover status importante da fonte:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao remover status importante da fonte.",
    });
  }
};

const setFontDisplayOrder = async (req: Request, res: Response) => {
  const { id, displayOrder } = req.body;

  try {
    const updatedFont = await prisma.font.update({
      where: { id },
      data: { displayOrder }, // Se adicionar o campo de ordem de exibição
    });

    res.status(httpStatus.OK).json(updatedFont);
  } catch (error) {
    console.error("Erro ao definir a ordem de exibição da fonte:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao definir a ordem de exibição da fonte.",
    });
  }
};

const updateFont = async (req: Request, res: Response) => {
  const { fontId } = req.params;
  const { name, attachmentId } = req.body;

  try {
    const updatedFont = await prisma.font.update({
      where: {
        id: fontId,
      },
      data: {
        name,
        attachmentId,
      },
    });

    res.status(httpStatus.OK).json(updatedFont);
  } catch (error) {
    console.error("Erro ao atualizar fonte:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao atualizar fonte." });
  }
};

const deleteFont = async (req: Request, res: Response) => {
  const { fontId } = req.params;
  console.log("fontId", fontId);
  try {
    await prisma.font.delete({
      where: {
        id: fontId,
      },
    });

    res.status(httpStatus.OK).json({ message: "Fonte deletada com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar fonte:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao deletar fonte." });
  }
};

export default {
  createFont,
  getAllFonts,
  getTotalFonts,
  getImportantFonts,
  getFontById,
  markFontAsImportant,
  removeFontImportant,
  setFontDisplayOrder,
  updateFont,
  deleteFont,
};

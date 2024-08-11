import { Request, Response } from "express";
import httpStatus from "http-status";
import prisma from "../client";

const createTutorial = async (req: Request, res: Response) => {
  const { name, youtubeLink, attachmentId } = req.body;

  try {
    const tutorial = await prisma.tutorial.create({
      data: {
        name,
        youtubeLink,
        attachmentId,
      },
    });

    res.status(httpStatus.CREATED).json(tutorial);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao criar tutorial." });
  }
};

const getAllTutorials = async (req: Request, res: Response) => {
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
    const totalCount = await prisma.tutorial.count({
      where: {
        name: {
          contains: (search as string) || "",
          mode: "insensitive",
        },
      },
    });

    const tutorials = await prisma.tutorial.findMany({
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
      tutorials,
    });
  } catch (error) {
    console.error("Erro ao buscar tutoriais:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao buscar tutoriais.",
    });
  }
};

const getTotalTutorials = async (req: Request, res: Response) => {
  try {
    const totalCount = await prisma.tutorial.count();
    res.status(httpStatus.OK).json({
      total: totalCount,
    });
  } catch (error) {
    console.error("Erro ao buscar tutoriais:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao buscar tutoriais." });
  }
};

const getImportantTutorials = async (req: Request, res: Response) => {
  try {
    const importantTutorials = await prisma.tutorial.findMany({
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
    console.log("importantTutorials", importantTutorials);
    res.status(httpStatus.OK).json(importantTutorials);
  } catch (error) {
    console.error("Erro ao buscar tutoriais importantes:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao buscar tutoriais importantes.",
    });
  }
};

const getTutorialById = async (req: Request, res: Response) => {
  const { tutorialId } = req.params;

  try {
    const tutorial = await prisma.tutorial.findUnique({
      where: {
        id: tutorialId,
      },
      include: {
        attachment: true,
      },
    });

    if (!tutorial) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "Tutorial não encontrado." });
    }

    res.status(httpStatus.OK).json(tutorial);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao buscar tutorial." });
  }
};

const markTutorialAsImportant = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    const updatedTutorial = await prisma.tutorial.update({
      where: { id },
      data: {
        isImportant: true,
        displayOrder: null,
      },
    });

    res.status(httpStatus.OK).json(updatedTutorial);
  } catch (error) {
    console.error("Erro ao marcar tutorial como importante:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao marcar tutorial como importante.",
    });
  }
};

const removeTutorialImportant = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    const updatedTutorial = await prisma.tutorial.update({
      where: { id },
      data: { isImportant: false, displayOrder: null },
    });

    res.status(httpStatus.OK).json(updatedTutorial);
  } catch (error) {
    console.error("Erro ao remover status importante do tutorial:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao remover status importante do tutorial.",
    });
  }
};

const setTutorialDisplayOrder = async (req: Request, res: Response) => {
  const { id, displayOrder } = req.body;

  try {
    const updatedTutorial = await prisma.tutorial.update({
      where: { id },
      data: { displayOrder },
    });

    res.status(httpStatus.OK).json(updatedTutorial);
  } catch (error) {
    console.error("Erro ao definir a ordem de exibição do tutorial:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Erro interno ao definir a ordem de exibição do tutorial.",
    });
  }
};

const updateTutorial = async (req: Request, res: Response) => {
  const { tutorialId } = req.params;
  const { name, youtubeLink, attachmentId } = req.body;

  try {
    const updatedTutorial = await prisma.tutorial.update({
      where: {
        id: tutorialId,
      },
      data: {
        name,
        youtubeLink,
        attachmentId,
      },
    });

    res.status(httpStatus.OK).json(updatedTutorial);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao atualizar tutorial." });
  }
};

const deleteTutorial = async (req: Request, res: Response) => {
  const { tutorialId } = req.params;

  try {
    await prisma.tutorial.delete({
      where: {
        id: tutorialId,
      },
    });

    res.status(httpStatus.OK).json({ message: "Tutorial deletado com sucesso." });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao deletar tutorial." });
  }
};

export default {
  createTutorial,
  getAllTutorials,
  getTotalTutorials,
  getImportantTutorials,
  getTutorialById,
  markTutorialAsImportant,
  removeTutorialImportant,
  setTutorialDisplayOrder,
  updateTutorial,
  deleteTutorial,
};

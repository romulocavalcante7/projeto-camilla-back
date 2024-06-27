import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import httpStatus from "http-status";

const prisma = new PrismaClient();

const createSticker = async (req: Request, res: Response) => {
  const { name, attachmentId, categoryId, subnicheId, userId, translations } = req.body;

  try {
    const sticker = await prisma.sticker.create({
      data: {
        name,
        attachmentId,
        categoryId,
        subnicheId,
        userId,
        translations: {
          create: translations || undefined,
        },
      },
      include: {
        translations: true,
      },
    });

    res.status(httpStatus.CREATED).json(sticker);
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao criar figurinha." });
  }
};

const getAllStickers = async (req: Request, res: Response) => {
  try {
    const stickers = await prisma.sticker.findMany({
      include: {
        category: true,
        attachment: true,
        translations: true,
        subniche: true,
      },
    });
    res.status(httpStatus.OK).json(stickers);
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao buscar figurinhas." });
  }
};

const getStickerById = async (req: Request, res: Response) => {
  const { stickerId } = req.params;

  try {
    const sticker = await prisma.sticker.findUnique({
      where: {
        id: stickerId,
      },
      include: {
        attachment: true,
        translations: true,
      },
    });

    if (!sticker) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "Figurinha não encontrada." });
    }

    res.status(httpStatus.OK).json(sticker);
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao buscar figurinha." });
  }
};

const updateSticker = async (req: Request, res: Response) => {
  const { stickerId } = req.params;
  const { name, attachmentId, categoryId, subnicheId, userId, translations } = req.body;

  try {
    const updatedSticker = await prisma.sticker.update({
      where: {
        id: stickerId,
      },
      data: {
        name,
        attachmentId,
        categoryId,
        subnicheId,
        userId,
        translations: {
          deleteMany: {}, // Remove todas as traduções antigas
          create: translations, // Adiciona as novas traduções
        },
      },
      include: {
        translations: true,
      },
    });

    res.status(httpStatus.OK).json(updatedSticker);
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao atualizar figurinha." });
  }
};

const deleteSticker = async (req: Request, res: Response) => {
  const { stickerId } = req.params;

  try {
    await prisma.sticker.delete({
      where: {
        id: stickerId,
      },
    });

    res.status(httpStatus.OK).json({ message: "Figurinha deletada com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao deletar figurinha." });
  }
};

export default {
  createSticker,
  getAllStickers,
  getStickerById,
  updateSticker,
  deleteSticker,
};

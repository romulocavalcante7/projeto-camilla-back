/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from "express";
import httpStatus from "http-status";
import prisma from "../client";

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
  const { search } = req.query;
  //@ts-ignore
  const userId = req.user?.id;

  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: "Usuário não autenticado." });
  }

  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

  try {
    const totalStickers = await prisma.sticker.count({
      where: {
        name: {
          contains: (search as string) || "",
          mode: "insensitive",
        },
      },
    });

    const stickers = await prisma.sticker.findMany({
      where: {
        name: {
          contains: (search as string) || "",
          mode: "insensitive",
        },
      },
      include: {
        category: true,
        attachment: true,
        translations: true,
        subniche: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Consulta para obter os IDs dos stickers favoritos do usuário
    const favoriteStickers = await prisma.favoriteSticker.findMany({
      where: { userId },
      select: { stickerId: true },
    });

    const favoriteStickerIds = favoriteStickers.map((fav) => fav.stickerId);

    // Adicionando o campo isFavorite a cada sticker
    const stickersWithFavorite = stickers.map((sticker) => ({
      ...sticker,
      isFavorite: favoriteStickerIds.includes(sticker.id),
    }));

    res.status(httpStatus.OK).json({
      page,
      pageSize,
      total: totalStickers,
      totalPages: Math.ceil(totalStickers / pageSize),
      stickers: stickersWithFavorite,
    });
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

const getStickersBySubnicheId = async (req: Request, res: Response) => {
  const { subnicheId } = req.params;
  const { search } = req.query;
  //@ts-ignore
  const userId = req.user.id;

  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: "Usuário não autenticado." });
  }

  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

  try {
    const totalStickers = await prisma.sticker.count({
      where: {
        subnicheId,
        name: {
          contains: (search as string) || "",
          mode: "insensitive",
        },
      },
    });

    const stickers = await prisma.sticker.findMany({
      where: {
        subnicheId,
        name: {
          contains: (search as string) || "",
          mode: "insensitive",
        },
      },
      include: {
        attachment: true,
        translations: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Consulta para obter os IDs dos stickers favoritos do usuário
    const favoriteStickers = await prisma.favoriteSticker.findMany({
      where: { userId },
      select: { stickerId: true },
    });

    const favoriteStickerIds = favoriteStickers.map((fav) => fav.stickerId);

    // Adicionando o campo isFavorite a cada sticker
    const stickersWithFavorite = stickers.map((sticker) => ({
      ...sticker,
      isFavorite: favoriteStickerIds.includes(sticker.id),
    }));

    res.status(httpStatus.OK).json({
      page,
      pageSize,
      total: totalStickers,
      totalPages: Math.ceil(totalStickers / pageSize),
      stickers: stickersWithFavorite,
    });
  } catch (error) {
    console.error(error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Erro ao buscar figurinhas pelo subnicho." });
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
  getStickersBySubnicheId,
  updateSticker,
  deleteSticker,
};

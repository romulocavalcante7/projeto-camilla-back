// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { Request, Response } from "express";
import httpStatus from "http-status";
import prisma from "../client";

const favoriteStickerController = {
  getAllFavoriteStickers: async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(httpStatus.UNAUTHORIZED).json({ error: "Usuário não autenticado." });
    }

    try {
      const favorites = await prisma.favoriteSticker.findMany({
        where: {
          userId,
        },
        include: {
          sticker: true,
        },
      });

      res.status(httpStatus.OK).json(favorites);
    } catch (error) {
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: "Erro ao buscar figurinhas favoritas." });
    }
  },

  addFavoriteSticker: async (req: Request, res: Response) => {
    const { stickerId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(httpStatus.UNAUTHORIZED).json({ error: "Usuário não autenticado." });
    }

    try {
      const favorite = await prisma.favoriteSticker.create({
        data: {
          userId,
          stickerId,
        },
      });

      res.status(httpStatus.CREATED).json(favorite);
    } catch (error) {
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: "Erro ao adicionar figurinha aos favoritos." });
    }
  },

  removeFavoriteSticker: async (req: Request, res: Response) => {
    const { stickerId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(httpStatus.UNAUTHORIZED).json({ error: "Usuário não autenticado." });
    }

    try {
      await prisma.favoriteSticker.delete({
        where: {
          userId_stickerId: {
            userId,
            stickerId,
          },
        },
      });

      res.status(httpStatus.OK).json({ message: "Figurinha removida dos favoritos com sucesso." });
    } catch (error) {
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: "Erro ao remover figurinha dos favoritos." });
    }
  },
};

export default favoriteStickerController;

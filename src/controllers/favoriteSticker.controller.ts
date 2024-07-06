// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { Request, Response } from "express";
import httpStatus from "http-status";
import prisma from "../client";

const favoriteStickerController = {
  getAllFavoriteStickers: async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { search } = req.query;

    if (!userId) {
      return res.status(httpStatus.UNAUTHORIZED).json({ error: "Usuário não autenticado." });
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

    try {
      const totalFavorites = await prisma.favoriteSticker.count({
        where: {
          userId,
          sticker: {
            name: {
              contains: (search as string) || "",
              mode: "insensitive",
            },
          },
        },
      });

      const favorites = await prisma.favoriteSticker.findMany({
        where: {
          userId,
          sticker: {
            name: {
              contains: (search as string) || "",
              mode: "insensitive",
            },
          },
        },
        include: {
          sticker: {
            include: {
              attachment: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      const simplifiedFavorites = favorites.map((favorite) => ({
        id: favorite.id,
        stickerId: favorite.stickerId,
        createdAt: favorite.createdAt,
        updatedAt: favorite.updatedAt,
        sticker: {
          id: favorite.sticker.id,
          name: favorite.sticker.name,
          createdAt: favorite.sticker.createdAt,
          updatedAt: favorite.sticker.updatedAt,
          categoryId: favorite.sticker.categoryId,
          subnicheId: favorite.sticker.subnicheId,
          attachment: {
            id: favorite.sticker.attachment.id,
            filename: favorite.sticker.attachment.filename,
            filetype: favorite.sticker.attachment.filetype,
            filesize: favorite.sticker.attachment.filesize,
            url: favorite.sticker.attachment.url,
            createdAt: favorite.sticker.attachment.createdAt,
          },
        },
      }));

      res.status(httpStatus.OK).json({
        page,
        pageSize,
        total: totalFavorites,
        totalPages: Math.ceil(totalFavorites / pageSize),
        favorites: simplifiedFavorites,
      });
    } catch (error) {
      console.log("error", error);
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

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from "express";
import httpStatus from "http-status";
import prisma from "../client";

const createSticker = async (req: Request, res: Response) => {
  const { name, attachmentId, translations } = req.body || {};

  //@ts-ignore
  const userId = req.user?.id;

  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: "Usuário não autenticado." });
  }

  if (!attachmentId) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ error: "O campo 'attachmentId' é obrigatório." });
  }

  try {
    const sticker = await prisma.sticker.create({
      data: {
        name,
        attachmentId,
        userId,
        isUserCreated: true,
        translations: {
          create: translations || undefined,
        },
      },
      include: {
        translations: true,
        attachment: true,
      },
    });

    res.status(httpStatus.CREATED).json(sticker);
  } catch (error) {
    console.error("Erro ao criar figurinha:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao criar figurinha." });
  }
};

const getUserStickers = async (req: Request, res: Response) => {
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
        userId,
        isUserCreated: true,
      },
    });

    const stickers = await prisma.sticker.findMany({
      where: {
        userId,
        isUserCreated: true,
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

    res.status(httpStatus.OK).json({
      page,
      pageSize,
      total: totalStickers,
      totalPages: Math.ceil(totalStickers / pageSize),
      stickers,
    });
  } catch (error) {
    console.error("Erro ao buscar figurinhas do usuário:", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Erro ao buscar figurinhas do usuário." });
  }
};

const getStickerById = async (req: Request, res: Response) => {
  const { stickerId } = req.params;
  //@ts-ignore
  const userId = req.user?.id;

  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: "Usuário não autenticado." });
  }

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

    // Se a figurinha for criada pelo usuário, garantir que ele é o dono
    if (sticker.isUserCreated && sticker.userId !== userId) {
      return res.status(httpStatus.FORBIDDEN).json({ error: "Acesso negado à figurinha." });
    }

    res.status(httpStatus.OK).json(sticker);
  } catch (error) {
    console.error("Erro ao buscar figurinha:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao buscar figurinha." });
  }
};

const updateSticker = async (req: Request, res: Response) => {
  const { stickerId } = req.params;
  const { name, translations } = req.body;
  //@ts-ignore
  const userId = req.user?.id;

  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: "Usuário não autenticado." });
  }

  try {
    const sticker = await prisma.sticker.findUnique({
      where: { id: stickerId },
    });

    if (!sticker) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "Figurinha não encontrada." });
    }

    // Verificar se o usuário é o criador da figurinha
    if (sticker.userId !== userId || !sticker.isUserCreated) {
      return res.status(httpStatus.FORBIDDEN).json({ error: "Acesso negado à figurinha." });
    }

    const updatedSticker = await prisma.sticker.update({
      where: {
        id: stickerId,
      },
      data: {
        name,
        translations: {
          deleteMany: {}, // Remove todas as traduções antigas
          create: translations || [], // Adiciona as novas traduções
        },
      },
      include: {
        translations: true,
        attachment: true,
      },
    });

    res.status(httpStatus.OK).json(updatedSticker);
  } catch (error) {
    console.error("Erro ao atualizar figurinha:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao atualizar figurinha." });
  }
};

const deleteSticker = async (req: Request, res: Response) => {
  const { stickerId } = req.params;
  //@ts-ignore
  const userId = req.user?.id;

  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({ error: "Usuário não autenticado." });
  }

  try {
    const sticker = await prisma.sticker.findUnique({
      where: { id: stickerId },
    });

    if (!sticker) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "Figurinha não encontrada." });
    }

    // Verificar se o usuário é o criador da figurinha
    if (sticker.userId !== userId || !sticker.isUserCreated) {
      return res.status(httpStatus.FORBIDDEN).json({ error: "Acesso negado à figurinha." });
    }

    // Deletar a figurinha
    await prisma.sticker.delete({
      where: {
        id: stickerId,
      },
    });

    // Opcional: deletar o attachment associado, se ele não estiver sendo usado por outra figurinha
    const attachmentUsageCount = await prisma.sticker.count({
      where: {
        attachmentId: sticker.attachmentId,
      },
    });

    if (attachmentUsageCount === 0) {
      await prisma.attachment.delete({
        where: {
          id: sticker.attachmentId,
        },
      });
    }

    res.status(httpStatus.OK).json({ message: "Figurinha deletada com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar figurinha:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro ao deletar figurinha." });
  }
};

export default {
  createSticker,
  getUserStickers,
  getStickerById,
  updateSticker,
  deleteSticker,
};

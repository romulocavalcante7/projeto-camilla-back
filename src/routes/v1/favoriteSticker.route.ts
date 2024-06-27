import express from "express";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import favoriteStickerValidation from "../../validations/favoriteSticker.validation";
import favoriteStickerController from "../../controllers/favoriteSticker.controller";

const router = express.Router();

router.route("/all").get(auth(), favoriteStickerController.getAllFavoriteStickers);

router
  .route("/create")
  .post(
    auth(),
    validate(favoriteStickerValidation.addFavoriteSticker),
    favoriteStickerController.addFavoriteSticker
  );

router
  .route("/:stickerId")
  .delete(
    auth(),
    validate(favoriteStickerValidation.removeFavoriteSticker),
    favoriteStickerController.removeFavoriteSticker
  );

/**
 * @swagger
 * tags:
 *   name: FavoriteStickers
 *   description: Gerenciamento e recuperação de figurinhas favoritas
 */

/**
 * @swagger
 * /favoriteStickers:
 *   get:
 *     summary: Recuperar todas as figurinhas favoritas do usuário autenticado
 *     description: Apenas usuários autenticados podem recuperar suas figurinhas favoritas.
 *     tags: [FavoriteStickers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FavoriteSticker'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /favoriteStickers/{stickerId}:
 *   delete:
 *     summary: Remover uma figurinha dos favoritos
 *     description: Apenas usuários autenticados podem remover figurinhas dos favoritos.
 *     tags: [FavoriteStickers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stickerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da figurinha
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Figurinha removida dos favoritos com sucesso.
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

export default router;

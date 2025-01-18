import express from "express";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import stickerValidation from "../../validations/sticker.validation";
import stickerController from "../../controllers/sticker.controller";

const router = express.Router();

router
  .route("/all")
  .get(auth(), validate(stickerValidation.getAllStickers), stickerController.getAllStickers);

router.route("/total").get(auth(), stickerController.getTotalStickers);

router
  .route("/create")
  .post(auth("admin"), validate(stickerValidation.createSticker), stickerController.createSticker);

router
  .route("/:stickerId")
  .get(auth(), validate(stickerValidation.getStickerById), stickerController.getStickerById)
  .patch(auth("admin"), validate(stickerValidation.updateSticker), stickerController.updateSticker)
  .delete(
    auth("admin"),
    validate(stickerValidation.deleteSticker),
    stickerController.deleteSticker
  );

router
  .route("/category/:categoryId")
  .get(
    auth(),
    validate(stickerValidation.getStickersByCategoryId),
    stickerController.getStickersByCategoryId
  );

router
  .route("/subniche/:subnicheId")
  .get(
    auth(),
    validate(stickerValidation.getStickersBySubnicheId),
    stickerController.getStickersBySubnicheId
  );

export default router;

/**
 * @swagger
 * tags:
 *   name: Stickers
 *   description: Sticker management and retrieval
 */

/**
 * @swagger
 * /stickers/create:
 *   post:
 *     summary: Create a sticker
 *     description: Only admins can create stickers.
 *     tags: [Stickers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - attachmentId
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *               attachmentId:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               subnicheId:
 *                 type: string
 *               userId:
 *                 type: string
 *               translations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     language:
 *                       type: string
 *                     name:
 *                       type: string
 *             example:
 *               name: Example Sticker
 *               attachmentId: example-attachment-id
 *               categoryId: example-category-id
 *               subnicheId: example-subniche-id
 *               userId: example-user-id
 *               translations:
 *                 - language: en
 *                   name: Example Sticker (English)
 *                 - language: es
 *                   name: Example Sticker (Spanish)
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Sticker'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /stickers/all:
 *   get:
 *     summary: Get all stickers
 *     description: Only admins can retrieve all stickers.
 *     tags: [Stickers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of stickers
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sticker'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /stickers/{stickerId}:
 *   get:
 *     summary: Get a sticker
 *     description: Only admins can fetch a sticker by ID.
 *     tags: [Stickers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stickerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Sticker id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Sticker'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a sticker
 *     description: Only admins can update stickers.
 *     tags: [Stickers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stickerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Sticker id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               attachmentId:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               subnicheId:
 *                 type: string
 *               userId:
 *                 type: string
 *               translations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     language:
 *                       type: string
 *                     name:
 *                       type: string
 *             example:
 *               name: Updated Sticker Name
 *               attachmentId: updated-attachment-id
 *               categoryId: updated-category-id
 *               subnicheId: updated-subniche-id
 *               userId: updated-user-id
 *               translations:
 *                 - language: en
 *                   name: Updated Sticker (English)
 *                 - language: es
 *                   name: Updated Sticker (Spanish)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Sticker'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a sticker
 *     description: Only admins can delete stickers.
 *     tags: [Stickers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stickerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Sticker id
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /stickers/subniche/{subnicheId}:
 *   get:
 *     summary: Get stickers by subniche ID
 *     description: Only admins can fetch stickers by subniche ID.
 *     tags: [Stickers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subnicheId
 *         required: true
 *         schema:
 *           type: string
 *         description: Subniche id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Sticker'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

import express from "express";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import subnicheValidation from "../../validations/subniche.validation";
import subnicheController from "../../controllers/subniche.controller";

const router = express.Router();

router
  .route("/all")
  .get(auth(), validate(subnicheValidation.getAllSubniches), subnicheController.getAllSubniches);

router.route("/total").get(auth(), subnicheController.getTotalSubniches);

router
  .route("/create")
  .post(
    auth("admin"),
    validate(subnicheValidation.createSubniche),
    subnicheController.createSubniche
  );

router
  .route("/:subnicheId")
  .get(auth(), validate(subnicheValidation.getSubnicheById), subnicheController.getSubnicheById)
  .patch(
    auth("admin"),
    validate(subnicheValidation.updateSubniche),
    subnicheController.updateSubniche
  )
  .delete(
    auth("admin"),
    validate(subnicheValidation.deleteSubniche),
    subnicheController.deleteSubniche
  );

router
  .route("/category/:categoryId")
  .get(
    auth(),
    validate(subnicheValidation.getSubnichesByCategoryId),
    subnicheController.getSubnichesByCategoryId
  );

export default router;

/**
 * @swagger
 * tags:
 *   name: Subniches
 *   description: Subniche management and retrieval
 */

/**
 * @swagger
 * /subniches/create:
 *   post:
 *     summary: Create a subniche
 *     description: Only admins can create subniches.
 *     tags: [Subniches]
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
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *               categoryId:
 *                 type: string
 *             example:
 *               name: Example Subniche
 *               categoryId: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Subniche'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /subniches/all:
 *   get:
 *     summary: Get all subniches
 *     description: Only admins can retrieve all subniches.
 *     tags: [Subniches]
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
 *         description: Maximum number of subniches
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
 *                     $ref: '#/components/schemas/Subniche'
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
 * /subniches/{subnicheId}:
 *   get:
 *     summary: Get a subniche
 *     description: Only admins can fetch a subniche by ID.
 *     tags: [Subniches]
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
 *                $ref: '#/components/schemas/Subniche'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a subniche
 *     description: Only admins can update subniches.
 *     tags: [Subniches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subnicheId
 *         required: true
 *         schema:
 *           type: string
 *         description: Subniche id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               categoryId:
 *                 type: string
 *             example:
 *               name: Updated Subniche Name
 *               categoryId: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Subniche'
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
 *     summary: Delete a subniche
 *     description: Only admins can delete subniches.
 *     tags: [Subniches]
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
 * /subniches/category/{categoryId}:
 *   get:
 *     summary: Get all subniches by category ID
 *     description: Retrieve all subniches that belong to a specific category.
 *     tags: [Subniches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subniche'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

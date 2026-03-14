// server/routes/todos.js
import express from 'express';
import * as controller from '../controllers/todos.controller.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.use(auth);

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Todo:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - status
 *         - priority
 *         - tags
 *         - sortOrder
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         dueDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         status:
 *           type: string
 *           enum:
 *             - pending
 *             - in-progress
 *             - completed
 *         priority:
 *           type: string
 *           enum:
 *             - low
 *             - medium
 *             - high
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         boardId:
 *           type: string
 *           nullable: true
 *         sortOrder:
 *           type: integer
 *           minimum: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Error:
 *       type: object
 *       required:
 *         - error
 *         - code
 *       properties:
 *         error:
 *           type: string
 *         code:
 *           type: string
 *         details:
 *           type: array
 *           description: Present for validation errors.
 *           items:
 *             type: object
 *             required:
 *               - field
 *               - msg
 *             properties:
 *               field:
 *                 type: string
 *               msg:
 *                 type: string
 *     TodoListResponse:
 *       type: object
 *       required:
 *         - items
 *         - page
 *         - limit
 *         - total
 *         - pages
 *         - sort
 *         - filters
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Todo'
 *         page:
 *           type: integer
 *           minimum: 1
 *         limit:
 *           type: integer
 *           minimum: 1
 *         total:
 *           type: integer
 *           minimum: 0
 *         pages:
 *           type: integer
 *           minimum: 0
 *         sort:
 *           type: string
 *           example: createdAt:desc
 *         filters:
 *           type: object
 *           required:
 *             - status
 *             - tag
 *             - priority
 *             - q
 *           properties:
 *             status:
 *               type: string
 *               nullable: true
 *             tag:
 *               type: string
 *               nullable: true
 *             priority:
 *               type: string
 *               nullable: true
 *             q:
 *               type: string
 *               nullable: true
 */

/**
 * @openapi
 * /todos:
 *   post:
 *     tags:
 *       - Todos
 *     summary: Create a todo
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum:
 *                   - pending
 *                   - in-progress
 *                   - completed
 *               priority:
 *                 type: string
 *                 enum:
 *                   - low
 *                   - medium
 *                   - high
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               boardId:
 *                 type: string
 *               sortOrder:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 1000000
 *     responses:
 *       '201':
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       '400':
 *         description: Validation or model validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Server configuration error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', controller.validateCreate, controller.handleValidation, controller.createTodo);

/**
 * @openapi
 * /todos:
 *   get:
 *     tags:
 *       - Todos
 *     summary: List todos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - pending
 *             - in-progress
 *             - completed
 *         description: Filter by todo status.
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum:
 *             - low
 *             - medium
 *             - high
 *         description: Filter by priority.
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Comma-separated tags. Matches if any tag is present.
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Case-insensitive title search.
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: createdAt:desc
 *         description: "field:direction. Allowed fields: createdAt, updatedAt, dueDate, title, status, sortOrder. Direction: asc or desc."
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (minimum 1).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Page size (1-100).
 *       - in: query
 *         name: boardId
 *         schema:
 *           type: string
 *         description: Filter by board ID.
 *     responses:
 *       '200':
 *         description: Todo list with pagination and filters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TodoListResponse'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', controller.getTodos);

/**
 * @openapi
 * /todos/{id}:
 *   put:
 *     tags:
 *       - Todos
 *     summary: Update a todo by id
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum:
 *                   - pending
 *                   - in-progress
 *                   - completed
 *               priority:
 *                 type: string
 *                 enum:
 *                   - low
 *                   - medium
 *                   - high
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               boardId:
 *                 type: string
 *               sortOrder:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 1000000
 *     responses:
 *       '200':
 *         description: Updated todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       '400':
 *         description: Validation or invalid id error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         description: Todo not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Server configuration error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', controller.validateUpdate, controller.handleValidation, controller.updateTodo);

/**
 * @openapi
 * /todos/{id}:
 *   delete:
 *     tags:
 *       - Todos
 *     summary: Delete a todo by id
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID.
 *     responses:
 *       '204':
 *         description: Deleted successfully
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         description: Todo not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Server configuration error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', controller.deleteTodo);

// ✅ デフォルトエクスポート
export default router;

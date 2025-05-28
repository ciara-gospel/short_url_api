import express from 'express';
import { shortenUrl } from '../controllers/shortenController.js';
import authMiddleware from '../middlewares/authmiddleware.js';

/**
 * @swagger
 * /api/shorten:
 *   post:
 *     summary: Short url
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               originalUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com"
 *     responses:
 *       201:
 *         description: URL shorten successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Url'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

const router = express.Router();

router.post('/', authMiddleware, shortenUrl);

export default router;
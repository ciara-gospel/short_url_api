import express from 'express';
import { getMyUrls } from '../controllers/getMyUrls.js';
import authMiddleware from '../middlewares/authmiddleware.js';

/**
 * @swagger
 * tags:
 *   name: URLs
 *   description: Endpoints pour raccourcir et récupérer des URLs
 */


/**
 * @swagger
 * /api/urls:
 *   get:
 *     summary: Return all thr url which are connected
 *     description: Return all the urls shorten by authentified user.
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of urls
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   original_url:
 *                     type: string
 *                   short_url:
 *                     type: string
 *       401:
 *         description: Not autorised
 */

const router = express.Router();

router.get('/', authMiddleware, getMyUrls);

export default router;
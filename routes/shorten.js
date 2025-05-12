import express from 'express';
import { shortenUrl } from '../controllers/shortenController.js';
import authMiddleware from '../middlewares/authmiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, shortenUrl);

export default router;
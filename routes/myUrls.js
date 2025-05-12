import express from 'express';
import { getMyUrls } from '../controllers/getMyUrls.js';
import authMiddleware from '../middlewares/authmiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getMyUrls);

export default router;
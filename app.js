import express from 'express';

import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { fileURLToPath } from 'node:url';
import path, { dirname } from 'node:path';

import winstonLogger from "./utils/logger.js";
import shortenRouter from './routes/shorten.js';
import myUrlsRouter from './routes/myUrls.js';
import errorHandler from './middlewares/errorHandler.js';
import dotenv from 'dotenv';
import cors from 'cors';


import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import authRouter from './routes/authRoutes.js'

const app = express();

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config();

const morganFormat = process.env.NODE_ENV === "production" ? "combined" : 'dev'
app.use(morgan(morganFormat, { stream: winstonLogger.stream }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}))

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/shorten', shortenRouter);
app.use('/api/my-urls', myUrlsRouter);
app.use(errorHandler);

export default app;

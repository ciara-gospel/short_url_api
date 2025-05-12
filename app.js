import express from 'express';

import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { fileURLToPath } from 'node:url';
import path, { dirname } from 'node:path';


import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';

const app = express();

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

export default app;

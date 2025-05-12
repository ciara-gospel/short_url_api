import winston from "winston";
import { fileURLToPath } from "node:url";
import path, { dirname } from "node:path";
import dotenv from 'dotenv'
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const logDir = path.join(__dirname, "../logs")

const { format: {combine, timestamp, colorize, json, errors, align} } = winston


const logger = winston.createLogger({
    level: process.env.NODE_ENV === "development" ? "debug" : "info",
    format: combine(
        timestamp({format: "YYYY:-MM-DD HH:mm:ss"}),
        errors({stack: true}),
        json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: path.join(logDir, 'app.log'),
            level: "info",
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: "error",
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, 'exceptions.log'),
            level: "error",
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, 'rejections.log'),
            level: "error",
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ],
    exitOnError: false
})


if(process.env.NODE_ENV !== "production") {
    logger.add(new winston.transports.Console({
        level: "debug",
        format: combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        align()
      )
    }))
}

logger.stream = {
    write: (message) => {
      logger.info(message.substring(0, message.lastIndexOf("\n")))
    }
}

export default logger
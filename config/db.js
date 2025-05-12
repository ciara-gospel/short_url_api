import { Pool } from "pg";
import logger from "../utils/logger.js";
import "dotenv/config";

const { DB_USER, DB_HOST, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

if (!DB_USER || !DB_HOST || !DB_PASSWORD || !DB_NAME || !DB_PORT) {
  logger.error("Missing DB environment variables. Check your .env file");
  process.exit(1);
}

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: parseInt(DB_PORT, 10),
  connectionTimeoutMillis: 2000,
});

pool.on("connect", () => {
  logger.info(`Connected to DB (${DB_NAME})`);
});

pool.on("error", (err) => {
  logger.error("DB Pool error", err);
  process.exit(-1);
});

async function connectToDb() {
  const client = await pool.connect();
  logger.info("Database pool initialized");
  client.release();
}

async function initializeDbSchema() {
  const client = await pool.connect();
  try {
    logger.info("Initializing DB schema");
    await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_verified BOOLEAN DEFAULT false,
        verification_token TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS short_urls (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        short_code VARCHAR(10) UNIQUE NOT NULL,
        long_url TEXT NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        clicks INTEGER DEFAULT 0
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_short_urls_user_id ON short_urls(user_id);
    `);

    // ✅ Nouvelle table "urls"
    await client.query(`
      CREATE TABLE IF NOT EXISTS urls (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        original_url TEXT NOT NULL,
        shortened_code VARCHAR(10) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        clicks INTEGER DEFAULT 0
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_urls_user_id ON urls(user_id);
    `);

    logger.info("DB schema initialized successfully");
  } catch (err) {
    logger.error("Schema initialization error", err);
    process.exit(1);
  } finally {
    client.release();
  }
}

async function query(text, params) {
  const start = Date.now();
  try {
    var router = express.Router();
    const res = await pool.query(text, params);
    logger.info(`Executed query in ${Date.now() - start}ms: ${text}`);
    return res;
  } catch (err) {
    logger.error("Query error", err);
    throw err;
  }
}

export { pool, connectToDb, initializeDbSchema, query };

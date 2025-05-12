import pg from "pg"
import logger from "../utils/logger.js"

const { Pool } = pg

const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT, NODE_ENV, DB_NAME_TEST } = process.env

if (!DB_HOST || !DB_PASSWORD || !DB_NAME || !DB_USER || !DB_PORT || !DB_NAME_TEST) {
  logger.error("Database environment variables are missing! Check your .env file.")
  process.exit(1)
}

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: NODE_ENV === "test" ? DB_NAME_TEST : DB_NAME,
  password: DB_PASSWORD,
  port: parseInt(DB_PORT, 10),
  connectionTimeoutMillis: 2000
})

logger.info(`Database is configured for: ${DB_NAME}`)

pool.on("connect", (client) => {
  logger.info(`Client connected from Pool (Total count: ${pool.totalCount}`)
})

pool.on("error", (err, client) => {
  logger.error('Unexpected error on idle client in pool', err)
  process.exit(-1)
})

const initialzeDbSchema = async () => {
  const client = await pool.connect()
  try {
    logger.info("Initializing database schema...")
    await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto")

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        profile_image_url VARCHAR(255),
        created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `)
    logger.info('Users table has been created')

    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        due_date DATE,
        created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `)

    logger.info('Tasks table has been created')

    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(owner_id)');

    logger.info('Indexes have been ensured')

    await client.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
               NEW.updated_at = NOW();
               RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);
    logger.debug('update_updated_at_column function ensured.');

    await client.query(`
        DO $$ BEGIN
          IF NOT EXISTS ( SELECT 1 FROM pg_trigger WHERE tgname = 'update_tasks_updated_at') THEN 
            CREATE TRIGGER update_tasks_updated_at
            BEFORE UPDATE ON tasks 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
          END IF;
        END $$;
      `)
    logger.debug("Tasks update_at Trigger is checked and created")


  } catch (error) {
    logger.error(`Error while initializing the schema`, error)
    process.exit(1)
  } finally {
    client.release()
  }
}

const connectToDb = async () => {
  try {
    const client = await pool.connect()
    logger.info(`Database connection pool established successfully`)
    client.release()
  } catch (error) {
    logger.error('Unable to establish database connection pool', error)
    process.exit(1)
  }
}

const query = async (text, params) => {
  const start = Date.now()
  try {
    const response = await pool.query(text, params)
    const duration = Date.now() - start;
    logger.info(`Executed query: { text: ${text.substring(0, 100)}..., params: ${JSON.stringify(params)}, duration: ${duration}ms, rows: ${response.rowCount}}`);
    return response
  } catch (error) {
    logger.error(`Error executing query: { text: ${text.substring(0, 100)}..., params: ${JSON.stringify(params)}, error: ${error.message}}`);
    throw error
  }
}

export { pool, connectToDb, query, initialzeDbSchema }

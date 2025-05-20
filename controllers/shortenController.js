import { nanoid } from "nanoid";
import { query } from "../config/db.js";
import logger from "../utils/logger.js";

export const shortenUrl = async (req, res) => {
  const { originalUrl } = req.body;
  const userId = req.user?.id;

  if (!originalUrl) {
    return res.status(400).json({ message: "Original URL is required" });
  }

  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User not authenticated" });
  }

  try {
    const existing = await query(
      "SELECT * FROM short_urls WHERE original_url = $1 AND user_id = $2",
      [originalUrl, userId]
    );

    const baseUrl = process.env.BASE_URL || `http://${req.headers.host}`;

    if (existing.rows.length > 0) {
      const shortUrl = `${baseUrl}/s/${existing.rows[0].shortened_code}`;
      return res.status(200).json({
        message: "URL already shortened",
        shortUrl,
      });
    }

    const shortCode = nanoid(6);

    const result = await query(
      `INSERT INTO short_urls (user_id, original_url, shortened_code, created_at, expires_at, clicks)
       VALUES ($1, $2, $3, NOW(), NULL, 0)
       RETURNING *`,
      [userId, originalUrl, shortCode]
    );

    const shortUrl = `${baseUrl}/s/${result.rows[0].shortened_code}`;

    logger.info(`Shortened new URL for user ${userId}`);
    res.status(201).json({
      message: "URL shortened",
      shortUrl,
    });
  } catch (error) {
    logger.error("Shorten URL failed:", error.message, error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

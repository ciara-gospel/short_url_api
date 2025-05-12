import { nanoid } from 'nanoid';
import { query } from '../config/db.js';
import logger from '../utils/logger.js';

export const shortenUrl = async (req, res) => {
  const { originalUrl } = req.body;
  const userId = req.user?.id;

  if (!originalUrl) {
    return res.status(400).json({ message: "Original URL is required" });
  }

  try {
    // Vérifie si cette URL a déjà été raccourcie pour ce user
    const existing = await query(
      'SELECT * FROM urls WHERE original_url = $1 AND user_id = $2',
      [originalUrl, userId]
    );

    const baseUrl = process.env.BASE_URL || `http://${req.headers.host}`;

    if (existing.rows.length > 0) {
      const shortUrl = `${baseUrl}/s/${existing.rows[0].shortened_code}`;
      return res.status(200).json({
        message: "URL already shortened",
        shortUrl
      });
    }

    // Crée un short code unique
    const shortCode = nanoid(6);

    // Sauvegarde dans la base de données (respecte la structure du schéma)
    const result = await query(
      `INSERT INTO urls (user_id, original_url, shortened_code, created_at, expires_at, clicks)
       VALUES ($1, $2, $3, NOW(), NULL, 0)
       RETURNING *`,
      [userId, originalUrl, shortCode]
    );

    const shortUrl = `${baseUrl}/s/${result.rows[0].shortened_code}`;

    logger.info(`Shortened new URL for user ${userId}`);
    res.status(201).json({
      message: "URL shortened",
      shortUrl
    });

  } catch (error) {
    logger.error("Shorten URL failed:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

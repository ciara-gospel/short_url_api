import { nanoid } from 'nanoid';
import { query } from '../config/db.js';
import logger from '../utils/logger.js';

export const shortenUrl = async (req, res) => {
  const { originalUrl } = req.body;
  const userId = req.user?.id; // Assure-toi que ton auth middleware ajoute bien `req.user`

  if (!originalUrl) {
    return res.status(400).json({ message: "Original URL is required" });
  }

  try {
    // Vérifie si cette URL a déjà été raccourcie pour ce user
    const existing = await query(
      'SELECT * FROM urls WHERE original_url = $1 AND user_id = $2',
      [originalUrl, userId]
    );

    if (existing.rows.length > 0) {
      return res.status(200).json({ message: "URL already shortened", shortUrl: existing.rows[0].short_url });
    }

    // Crée un short code unique
    const shortCode = nanoid(6); // 6 caractères aléatoires

    const baseUrl = process.env.BASE_URL || `http://${req.headers.host}`;
    const shortUrl = `${baseUrl}/s/${shortCode}`;

    // Sauvegarde dans la base de données
    const result = await query(
      `INSERT INTO urls (user_id, original_url, short_url, shortened_code)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, originalUrl, shortUrl, shortCode]
    );

    logger.info(`Shortened new URL for user ${userId}`);
    res.status(201).json({ message: "URL shortened", shortUrl: result.rows[0].short_url });

  } catch (error) {
    logger.error("Shorten URL failed:", error);
    res.status(500).json({ message: "Server error", error: error.message }); // utile en dev
  }
};

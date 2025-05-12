import { query } from '../config/db.js';

export const getMyUrls = async (req, res) => {
  const userId = req.user?.id; // injecté par authMiddleware

  if (!userId) {
    return res.status(401).json({ message: 'Non autorisé' });
  }

  try {
    const result = await query(
      `SELECT shortened_code, original_url AS longUrl, created_at AS "createdAt", 
              expires_at AS "expiresAt", clicks
       FROM urls
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json({ urls: result.rows });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

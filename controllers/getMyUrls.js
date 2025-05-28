import { query } from '../config/db.js';

export const getMyUrls = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const result = await query(
      `
        SELECT 
          shortened_code AS "shortCode",
          original_url AS "longUrl",
          created_at AS "createdAt",
          expires_at AS "expiresAt",
          clicks
        FROM urls
        WHERE user_id = $1
        ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({ urls: result.rows });
  } catch (error) {
    console.error('Erreur dans getMyUrls:', error);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

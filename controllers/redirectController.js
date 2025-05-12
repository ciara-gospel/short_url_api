import { query } from '../config/db.js';

export const handleRedirect = async (req, res) => {
  const { shortCode } = req.params;

  try {
    const result = await query('SELECT * FROM urls WHERE shortened_code = $1', [shortCode]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Link not found' });
    }

    const urlData = result.rows[0];

    if (urlData.expires_at && new Date(urlData.expires_at) < new Date()) {
      return res.status(410).json({ message: 'Link has been expired' });
    }

    await query('UPDATE urls SET clicks = COALESCE(clicks, 0) + 1 WHERE shortened_code = $1', [shortCode]);

    return res.redirect(302, urlData.original_url);
  } catch (error) {
    return res.status(500).json({ message: 'server error', error: error.message });
  }
};

import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";
import { query } from "../config/db.js";

const authMiddleware = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'test') {
      const { rows } = await query('SELECT * FROM users LIMIT 1');
      if (rows.length === 0) {
        return res.status(400).json({ message: 'No users found in the database for tests' });
      }

      req.user = { id: rows[0].id };
      return next();
    }

    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("No or invalid Authorization header");
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Standardiser payload (peut dépendre de ta stratégie de signature du token)
    const userId = decoded?.user?.id || decoded?.id;

    if (!userId) {
      throw new Error("Token payload does not contain user ID");
    }

    req.user = { id: userId };

    logger.debug(`User authenticated: ${userId}`);
    next();
  } catch (err) {
    logger.error("Authentication failed:", err.message);
    return res.status(401).json({ 
      message: err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token' 
    });
  }
};

export default authMiddleware;

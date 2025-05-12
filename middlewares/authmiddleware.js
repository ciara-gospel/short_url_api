import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";
import { query } from "../config/db.js";

const authMiddleware = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    const getUserFromDb = async () => {
      const { rows } = await query('SELECT * FROM users LIMIT 1');
      if (rows.length > 0) {
        req.user = { id: rows[0].id };
        return next();
      } else {
        return res.status(400).json({ message: 'No users found in the database for tests' });
      }
    };
    
    getUserFromDb().catch(err => {
      logger.error('Error fetching user from DB:', err);
      return res.status(500).json({ message: 'Internal server error' });
    });

    return;
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    logger.warn("No token provided");
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user || decoded;

    if (!req.user?.id) {
      throw new Error("Invalid token payload");
    }

    logger.debug(`Token verified for user ${req.user.id}`);
    next();
  } catch (err) {
    logger.error("Token verification failed", err);
    return res.status(401).json({ 
      message: err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token' 
    });
  }
};

export default authMiddleware;

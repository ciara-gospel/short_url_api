import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

const authMiddleware = (req, res, next) => {
  // Bypass auth for tests
  if (process.env.NODE_ENV === 'test') {
    req.user = { id: '88ce9fdf-43c3-41a0-9c26-6dff85b0f00b' };
    return next();
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

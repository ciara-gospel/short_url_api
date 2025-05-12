import bcrypt from 'bcrypt';
import { query } from '../config/db.js';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "all aspect is required." });
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "email is already exist." });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insérer l'utilisateur
    const result = await query(
      `INSERT INTO users (username, email, password) 
       VALUES ($1, $2, $3) RETURNING id, username, email`,
      [username, email, hashedPassword]
    );

    const newUser = result.rows[0];
    logger.info(`New user  created : ${newUser.email}`);

    res.status(201).json({ message: "User register successfully", user: newUser });
  } catch (error) {
    logger.error("Error while register", error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password)
      return res.status(400).json({ message: "email and password are required." });
  
    try {
      const result = await query("SELECT * FROM users WHERE email = $1", [email]);
      const user = result.rows[0];
  
      if (!user) {
        return res.status(400).json({ message: "Utilisateur non trouvé" });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Mot de passe invalide" });
      }
  
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
  
      res.status(200).json({ message: "login successfully", token });
    } catch (error) {
      logger.error("Erreur lors du login", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };
  
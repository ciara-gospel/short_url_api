import bcrypt from 'bcrypt';
import { query } from '../config/db.js';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const existingUser = await query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, username, email`,
      [username, email, hashedPassword]
    );

    const newUser = result.rows[0];
    logger.info(`User created: ${newUser.email}`);

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    logger.error("Error during registration:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required." });

  try {
    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password." });
    }

    const payload = {
      user: {
        id: user.id,
        email: user.email,
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    logger.info(`User logged in: ${user.email}`);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    logger.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
};

import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db";

const router = Router();

// SIGNUP
router.post("/signup", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields required" });

    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1", [email]
    );
    if (existing.rows.length > 0)
      return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await client.query("BEGIN");

    try {
      const result = await client.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
        [name, email, hashedPassword]
      );

      await client.query(
        `INSERT INTO personal_information (user_id, full_name)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           updated_at = NOW()`,
        [result.rows[0].id, name]
      );

      await client.query("COMMIT");

      return res.status(201).json({
        message: "Account created",
        user: result.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  } catch {
    return res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

// SIGNIN
router.post("/signin", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "All fields required" });

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1", [email]
    );
    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = result.rows[0];

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Signed in",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
// src/routes/profile.ts
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pool from "../config/db";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// ---------------------------------------------------------------------------
// Avatar upload setup
// ---------------------------------------------------------------------------
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (req: AuthRequest, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.userId}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// ---------------------------------------------------------------------------
// GET /api/profile — current user's info + portfolio stats
// ---------------------------------------------------------------------------
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userResult = await pool.query(
      `SELECT id, name, email, avatar_url, kyc_status, tier, created_at FROM users WHERE id = $1`,
      [req.userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = userResult.rows[0];

    const personalInformationResult = await pool.query(
      `SELECT full_name, phone, date_of_birth, gender, location, age, monthly_sip_budget, risk_appetite, investment_goal
       FROM personal_information WHERE user_id = $1`,
      [req.userId]
    );
    const personalInformation = personalInformationResult.rows[0] ?? null;

    const dateOfBirth = personalInformation?.date_of_birth
      ? new Date(personalInformation.date_of_birth).toISOString().slice(0, 10)
      : null;

    // Portfolio/SIP stats — placeholder zeros until portfolio/sip tables exist.
    const stats = {
      portfolioValue: 0,
      portfolioReturnPercent: 0,
      activeSips: 0,
      monthlySipAmount: 0,
      fundsHeld: 0,
    };

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatar_url,
      kycStatus: user.kyc_status,
      tier: user.tier,
      personalInfo: {
        fullName: personalInformation?.full_name ?? user.name,
        phone: personalInformation?.phone ?? null,
        dateOfBirth,
        gender: personalInformation?.gender ?? null,
        location: personalInformation?.location ?? null,
        age: personalInformation?.age ?? null,
        monthlySipBudget: personalInformation?.monthly_sip_budget ?? null,
        riskAppetite: personalInformation?.risk_appetite ?? null,
        investmentGoal: personalInformation?.investment_goal ?? null,
      },
      memberSince: user.created_at,
      stats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/profile — update editable profile details
// ---------------------------------------------------------------------------
router.patch("/", authenticateToken, async (req: AuthRequest, res) => {
  const client = await pool.connect();
  try {
    const {
      name,
      phone,
      dateOfBirth,
      gender,
      location,
      avatarUrl,
      age,
      monthlySipBudget,
      riskAppetite,
      investmentGoal,
    } = req.body;

    // Validate age if provided
    if (age !== null && age !== undefined) {
      const ageNum = parseInt(age, 10);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
        return res.status(400).json({ error: "Age must be between 18 and 100" });
      }
    }

    // Validate monthly SIP budget if provided
    if (monthlySipBudget !== null && monthlySipBudget !== undefined) {
      const budgetNum = parseFloat(monthlySipBudget);
      if (isNaN(budgetNum) || budgetNum <= 0) {
        return res.status(400).json({ error: "Monthly SIP budget must be a positive number" });
      }
    }

    // Validate risk appetite if provided
    if (riskAppetite && !("Low" === riskAppetite || "Moderate" === riskAppetite || "High" === riskAppetite)) {
      return res.status(400).json({ error: "Risk appetite must be 'Low', 'Moderate', or 'High'" });
    }

    await client.query("BEGIN");

    try {
      const userResult = await client.query(
        `UPDATE users SET
         name = COALESCE($1, name),
         avatar_url = COALESCE($2, avatar_url)
         WHERE id = $3
         RETURNING id, name, email, avatar_url, kyc_status, tier, created_at`,
        [name, avatarUrl, req.userId]
      );

      const personalInformationResult = await client.query(
        `INSERT INTO personal_information (
           user_id,
           full_name,
           phone,
           date_of_birth,
           gender,
           location,
           age,
           monthly_sip_budget,
           risk_appetite,
           investment_goal,
           updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           phone = EXCLUDED.phone,
           date_of_birth = EXCLUDED.date_of_birth,
           gender = EXCLUDED.gender,
           location = EXCLUDED.location,
           age = EXCLUDED.age,
           monthly_sip_budget = EXCLUDED.monthly_sip_budget,
           risk_appetite = EXCLUDED.risk_appetite,
           investment_goal = EXCLUDED.investment_goal,
           updated_at = NOW()
         RETURNING full_name, phone, date_of_birth, gender, location, age, monthly_sip_budget, risk_appetite, investment_goal`,
        [
         req.userId,
         name,
         phone,
         dateOfBirth || null,
         gender,
         location,
         age ?? null,
         monthlySipBudget ?? null,
         riskAppetite ?? null,
         investmentGoal ?? null,
        ]
      );

      await client.query("COMMIT");

      const personalInformation = personalInformationResult.rows[0] ?? null;
      const user = userResult.rows[0];

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatar_url,
        kycStatus: user.kyc_status,
        tier: user.tier,
        personalInfo: {
         fullName: personalInformation?.full_name ?? user.name,
         phone: personalInformation?.phone ?? null,
         dateOfBirth: personalInformation?.date_of_birth
           ? new Date(personalInformation.date_of_birth).toISOString().slice(0, 10)
           : null,
         gender: personalInformation?.gender ?? null,
         location: personalInformation?.location ?? null,
         age: personalInformation?.age ?? null,
         monthlySipBudget: personalInformation?.monthly_sip_budget ?? null,
         riskAppetite: personalInformation?.risk_appetite ?? null,
         investmentGoal: personalInformation?.investment_goal ?? null,
        },
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// POST /api/profile/avatar — upload a new profile picture
// ---------------------------------------------------------------------------
router.post("/avatar", authenticateToken, upload.single("avatar"), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    await pool.query(`UPDATE users SET avatar_url = $1 WHERE id = $2`, [avatarUrl, req.userId]);

    res.json({ avatarUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload avatar" });
  }
});

export default router;
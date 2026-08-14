import { Router } from "express";
import pool from "../config/db";
import { syncScheme, seedStarterFunds, syncAllFunds, syncAllFundsFast } from "../services/fundSync";

const router = Router();

// GET /api/funds?category=Equity&q=hdfc&page=1&limit=20
router.get("/", async (req, res) => {
  try {
    const { category, q } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];

    if (category && category !== "All") {
      values.push(category);
      conditions.push(`f.category = $${values.length}`);
    }
    if (q) {
      values.push(`%${(q as string).toLowerCase()}%`);
      conditions.push(`LOWER(f.name) LIKE $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await pool.query(`SELECT COUNT(*) FROM funds f ${where}`, values);
    const total = Number(countResult.rows[0].count);

    values.push(limit, offset);
    const result = await pool.query(
      `SELECT f.id, f.scheme_code, f.name, f.category, f.subcategory, f.nav,
              f.one_year_return AS "oneYearReturn", fp.return_5y AS "fiveYearReturn", f.rating
       FROM funds f
       LEFT JOIN fund_performance fp ON fp.scheme_code = f.scheme_code
       ${where}
       ORDER BY f.one_year_return DESC NULLS LAST
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    res.json({
      funds: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + result.rows.length < total,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch funds" });
  }
});

// GET /api/funds/:schemeCode/performance — 1M/3M/6M/1Y/3Y/5Y/10Y returns
router.get("/:schemeCode/performance", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT scheme_code, return_1m, return_3m, return_6m, return_1y, return_3y, return_5y, return_10y, updated_at
       FROM fund_performance WHERE scheme_code = $1`,
      [req.params.schemeCode]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No performance data yet for this fund" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch performance" });
  }
});

// GET /api/funds/:schemeCode/details — fund_house, launch_date, plan/option, + returns joined
router.get("/:schemeCode/details", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.scheme_code, f.name, f.category, f.subcategory, f.plan_type, f.option_type,
              f.fund_house, f.launch_date, f.nav, f.nav_date,
              fp.return_1m, fp.return_3m, fp.return_6m, fp.return_1y, fp.return_3y, fp.return_5y, fp.return_10y
       FROM funds f
       LEFT JOIN fund_performance fp ON fp.scheme_code = f.scheme_code
       WHERE f.scheme_code = $1`,
      [req.params.schemeCode]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Fund not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch fund details" });
  }
});

// POST /api/funds/sync/:schemeCode — admin-only in production; manually add a fund by code
router.post("/sync/:schemeCode", async (req, res) => {
  try {
    await syncScheme(Number(req.params.schemeCode));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sync failed" });
  }
});

// POST /api/funds/seed — run once to populate starter funds
router.post("/seed", async (_req, res) => {
  await seedStarterFunds();
  res.json({ success: true });
});

router.post("/sync-fast", async (_req, res) => {
  res.json({ started: true, message: "Fast NAV sync running in background" });
  syncAllFundsFast().catch((err) => console.error("Fast sync failed:", err));
});

router.post("/sync-all", async (_req, res) => {
  res.json({ started: true, message: "Full sync running in background — watch server logs" });
  syncAllFunds().catch((err) => console.error("Full sync failed:", err));
});

export default router;
// src/routes/portfolio.ts
import { Router } from "express";
import pool from "../config/db";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

type AssetClass = "Equity" | "Debt" | "Hybrid";

// Funds are classified into many categories (Equity, Debt, Hybrid, ELSS, Gold)
// by fundSync.ts, but the Portfolio/Home UI only understands three buckets.
// ELSS is equity-oriented and Gold behaves like an alternative/defensive
// asset, so both are folded into the closest bucket for allocation purposes.
function mapAssetClass(category: string | null): AssetClass {
  if (category === "Debt") return "Debt";
  if (category === "Hybrid") return "Hybrid";
  return "Equity"; // Equity, ELSS, Gold, and anything unrecognized
}

// For each scheme code, look up the latest two distinct NAV dates from
// nav_history so we can compute a real day-over-day change. Falls back to
// {latestNav: null, prevNav: null} when history hasn't been synced yet.
async function getDayChangeMap(schemeCodes: number[]) {
  const map = new Map<number, { latestNav: number | null; prevNav: number | null }>();
  if (schemeCodes.length === 0) return map;

  const result = await pool.query(
    `WITH ranked AS (
       SELECT scheme_code, nav, nav_date,
              ROW_NUMBER() OVER (PARTITION BY scheme_code ORDER BY nav_date DESC) AS rn
       FROM nav_history
       WHERE scheme_code = ANY($1::int[])
     )
     SELECT scheme_code,
            MAX(CASE WHEN rn = 1 THEN nav END) AS latest_nav,
            MAX(CASE WHEN rn = 2 THEN nav END) AS prev_nav
     FROM ranked
     GROUP BY scheme_code`,
    [schemeCodes]
  );

  for (const row of result.rows) {
    map.set(row.scheme_code, {
      latestNav: row.latest_nav !== null ? Number(row.latest_nav) : null,
      prevNav: row.prev_nav !== null ? Number(row.prev_nav) : null,
    });
  }
  return map;
}

// ---------------------------------------------------------------------------
// GET /api/portfolio — holdings, totals & allocation breakdown for the
// logged-in user. Backs both the Home screen's portfolio card / holdings
// preview and the full Portfolio screen.
// ---------------------------------------------------------------------------
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const holdingsResult = await pool.query(
      `SELECT up.id, up.scheme_code, up.units, up.avg_purchase_nav, up.invested_amount, up.created_at,
              f.name, f.category, f.nav AS current_nav, f.one_year_return
       FROM user_portfolio up
       JOIN funds f ON f.scheme_code = up.scheme_code
       WHERE up.user_id = $1
       ORDER BY (up.units * f.nav) DESC NULLS LAST`,
      [req.userId]
    );

    const rows = holdingsResult.rows;
    const schemeCodes = rows.map((r) => r.scheme_code);
    const dayChangeMap = await getDayChangeMap(schemeCodes);

    let totalValue = 0;
    let investedValue = 0;
    let todayChangeAmount = 0;
    let earliestDate: Date | null = null;

    const allocationTotals: Record<AssetClass, number> = { Equity: 0, Debt: 0, Hybrid: 0 };

    const holdings = rows.map((r) => {
      const units = Number(r.units);
      const currentNav = Number(r.current_nav ?? r.avg_purchase_nav ?? 0);
      const value = units * currentNav;
      const invested = Number(r.invested_amount ?? 0);
      const gainAmount = value - invested;
      const gainPercent = invested > 0 ? (gainAmount / invested) * 100 : 0;
      const assetClass = mapAssetClass(r.category);

      const dayInfo = dayChangeMap.get(r.scheme_code);
      if (dayInfo?.latestNav != null && dayInfo?.prevNav != null && dayInfo.prevNav > 0) {
        todayChangeAmount += units * (dayInfo.latestNav - dayInfo.prevNav);
      }

      totalValue += value;
      investedValue += invested;
      allocationTotals[assetClass] += value;

      const createdAt = new Date(r.created_at);
      if (!earliestDate || createdAt < earliestDate) earliestDate = createdAt;

      return {
        id: String(r.id),
        schemeCode: r.scheme_code,
        name: r.name,
        assetClass,
        units: Number(units.toFixed(4)),
        avgPurchaseNav: Number(Number(r.avg_purchase_nav ?? 0).toFixed(4)),
        currentNav: Number(currentNav.toFixed(4)),
        value: Number(value.toFixed(2)),
        investedAmount: Number(invested.toFixed(2)),
        gainAmount: Number(gainAmount.toFixed(2)),
        gainPercent: Number(gainPercent.toFixed(2)),
        // 1-year return %, used for the badge/color in the holdings list
        change: Number(r.one_year_return ?? 0),
      };
    });

    const gainValue = totalValue - investedValue;
    const gainPercent = investedValue > 0 ? (gainValue / investedValue) * 100 : 0;
    const previousTotalValue = totalValue - todayChangeAmount;
    const todayChangePercent = previousTotalValue > 0 ? (todayChangeAmount / previousTotalValue) * 100 : 0;

    // Simplified annualized return (not true multi-cash-flow XIRR — we don't
    // track individual transaction dates yet, only the first purchase).
    let xirr = gainPercent;
    if (earliestDate && investedValue > 0 && totalValue > 0) {
      const days = (Date.now() - (earliestDate as Date).getTime()) / (1000 * 60 * 60 * 24);
      const years = days / 365;
      if (years > 0.05) {
        xirr = (Math.pow(totalValue / investedValue, 1 / years) - 1) * 100;
      }
    }

    const allocations = (Object.keys(allocationTotals) as AssetClass[])
      .map((label) => ({
        label,
        value: Number(allocationTotals[label].toFixed(2)),
        percent: totalValue > 0 ? Number(((allocationTotals[label] / totalValue) * 100).toFixed(1)) : 0,
      }))
      .filter((a) => a.value > 0);

    res.json({
      totalValue: Number(totalValue.toFixed(2)),
      investedValue: Number(investedValue.toFixed(2)),
      gainValue: Number(gainValue.toFixed(2)),
      gainPercent: Number(gainPercent.toFixed(2)),
      todayChange: Number(todayChangeAmount.toFixed(2)),
      todayChangePercent: Number(todayChangePercent.toFixed(2)),
      xirr: Number(xirr.toFixed(2)),
      holdings,
      allocations,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch portfolio" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/portfolio/invest — buy units of a fund at its current NAV.
// body: { schemeCode: number, amount: number }
// ---------------------------------------------------------------------------
router.post("/invest", authenticateToken, async (req: AuthRequest, res) => {
  const client = await pool.connect();
  try {
    const schemeCode = Number(req.body.schemeCode);
    const amount = Number(req.body.amount);

    if (!schemeCode || !amount || amount <= 0) {
      return res.status(400).json({ error: "schemeCode and a positive amount are required" });
    }

    const fundResult = await pool.query(
      `SELECT scheme_code, nav, name FROM funds WHERE scheme_code = $1`,
      [schemeCode]
    );
    if (fundResult.rows.length === 0) {
      return res.status(404).json({ error: "Fund not found" });
    }

    const fund = fundResult.rows[0];
    const nav = Number(fund.nav);
    if (!nav || nav <= 0) {
      return res.status(400).json({ error: "Fund NAV unavailable, try again later" });
    }

    const units = amount / nav;

    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT id, units, invested_amount FROM user_portfolio
       WHERE user_id = $1 AND scheme_code = $2 FOR UPDATE`,
      [req.userId, schemeCode]
    );

    let holding;
    if (existing.rows.length > 0) {
      const prevUnits = Number(existing.rows[0].units);
      const prevInvested = Number(existing.rows[0].invested_amount);
      const newUnits = prevUnits + units;
      const newInvested = prevInvested + amount;
      const newAvgNav = newInvested / newUnits;

      const updated = await client.query(
        `UPDATE user_portfolio
         SET units = $1, invested_amount = $2, avg_purchase_nav = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING id, units, invested_amount, avg_purchase_nav`,
        [newUnits, newInvested, newAvgNav, existing.rows[0].id]
      );
      holding = updated.rows[0];
    } else {
      const inserted = await client.query(
        `INSERT INTO user_portfolio (user_id, scheme_code, units, avg_purchase_nav, invested_amount)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, units, invested_amount, avg_purchase_nav`,
        [req.userId, schemeCode, units, nav, amount]
      );
      holding = inserted.rows[0];
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: `Invested ₹${amount.toLocaleString("en-IN")} in ${fund.name}`,
      holding,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Investment failed" });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// POST /api/portfolio/redeem — sell units of a currently held fund.
// body: { schemeCode: number, units: number }
// ---------------------------------------------------------------------------
router.post("/redeem", authenticateToken, async (req: AuthRequest, res) => {
  const client = await pool.connect();
  try {
    const schemeCode = Number(req.body.schemeCode);
    const unitsToSell = Number(req.body.units);

    if (!schemeCode || !unitsToSell || unitsToSell <= 0) {
      return res.status(400).json({ error: "schemeCode and a positive units are required" });
    }

    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT id, units, invested_amount FROM user_portfolio
       WHERE user_id = $1 AND scheme_code = $2 FOR UPDATE`,
      [req.userId, schemeCode]
    );

    if (existing.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "You don't hold this fund" });
    }

    const row = existing.rows[0];
    const currentUnits = Number(row.units);

    if (unitsToSell > currentUnits + 0.0001) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Cannot redeem more units than you hold" });
    }

    const remainingUnits = currentUnits - unitsToSell;
    const investedPerUnit = currentUnits > 0 ? Number(row.invested_amount) / currentUnits : 0;
    const remainingInvested = remainingUnits * investedPerUnit;

    if (remainingUnits <= 0.0001) {
      await client.query(`DELETE FROM user_portfolio WHERE id = $1`, [row.id]);
    } else {
      await client.query(
        `UPDATE user_portfolio SET units = $1, invested_amount = $2, updated_at = NOW() WHERE id = $3`,
        [remainingUnits, remainingInvested, row.id]
      );
    }

    await client.query("COMMIT");
    res.json({
      message: "Redemption successful",
      remainingUnits: Number(remainingUnits.toFixed(4)),
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Redemption failed" });
  } finally {
    client.release();
  }
});

export default router;

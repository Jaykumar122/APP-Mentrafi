import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import authRoutes from "./routes/auth";
import fundsRouter from "./routes/funds";
import { syncAllFunds, syncAllFundsFast, isSyncRunning } from "./services/fundSync";
import profileRoutes from "./routes/profile";
import path from "path";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/funds", fundsRouter);
app.use("/api/profile", profileRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Mentrafi API is running" });
});

// ---------------------------------------------------------------------------
// If a sync is already running when a scheduled job fires (e.g. a manual
// trigger overlapped with a cron job), wait for it to finish instead of
// silently skipping — avoids the "missed execution" node-cron warning
// leaving a scheduled refresh un-run.
// ---------------------------------------------------------------------------
async function runSyncWhenFree(syncFn: () => Promise<void>, label: string) {
  if (isSyncRunning()) {
    console.log(`⏳ ${label} delayed — another sync is already running. Waiting...`);
    while (isSyncRunning()) {
      await new Promise((r) => setTimeout(r, 30_000));
    }
    console.log(`▶️ ${label} starting now that the other sync finished.`);
  }
  await syncFn();
}

// ---------------------------------------------------------------------------
// Scheduled NAV syncs.
//
// Mutual fund NAV is calculated once per day, after market close, and
// published by AMFI typically between 9-11 PM IST.
//
// Daily runs use syncAllFundsFast() — lightweight /latest endpoint, only
// updates NAV + date, finishes in a couple minutes instead of 30+.
//
// A weekly run uses the full syncAllFunds() — fetches complete NAV history
// per fund, needed to recompute accurate 1-year returns. Returns barely
// move day-to-day, so this doesn't need to run daily.
// ---------------------------------------------------------------------------

// 1. Post-market-close check (3:45 PM IST) — early safety check.
//    Mostly a no-op since NAV usually isn't published yet, but harmless.
cron.schedule(
  "45 15 * * 1-5",
  () => {
    console.log("🔄 [3:45 PM] Post-market-close fast sync starting...");
    runSyncWhenFree(syncAllFundsFast, "3:45 PM post-market-close sync")
      .then(() => console.log("✅ [3:45 PM] Post-market-close fast sync finished."))
      .catch((err) => console.error("❌ [3:45 PM] Post-market-close fast sync failed:", err));
  },
  { timezone: "Asia/Kolkata" }
);

// 2. Evening refresh (9:30 PM IST) — the REAL update, once AMFI has
//    actually published that day's official NAV.
cron.schedule(
  "30 21 * * 1-5",
  () => {
    console.log("🔄 [9:30 PM] Evening fast NAV refresh starting...");
    runSyncWhenFree(syncAllFundsFast, "9:30 PM evening sync")
      .then(() => console.log("✅ [9:30 PM] Evening fast NAV refresh finished."))
      .catch((err) => console.error("❌ [9:30 PM] Evening fast NAV refresh failed:", err));
  },
  { timezone: "Asia/Kolkata" }
);

// 3. Morning safety-check (9:00 AM IST, before market opens at 9:15 AM) —
//    retry in case last night's run failed or missed some funds.
cron.schedule(
  "0 9 * * 1-5",
  () => {
    console.log("🔄 [9:00 AM] Morning fast safety-check sync starting...");
    runSyncWhenFree(syncAllFundsFast, "9:00 AM morning safety-check")
      .then(() => console.log("✅ [9:00 AM] Morning fast safety-check sync finished."))
      .catch((err) => console.error("❌ [9:00 AM] Morning fast safety-check sync failed:", err));
  },
  { timezone: "Asia/Kolkata" }
);

// 4. Weekly full sync (Sunday 6:00 AM IST) — recomputes 1-year returns
//    using complete NAV history. Heavier, so it runs only once a week.
cron.schedule(
  "0 6 * * 0",
  () => {
    console.log("🔄 [Sun 6:00 AM] Weekly full sync starting...");
    runSyncWhenFree(syncAllFunds, "Sunday weekly full sync")
      .then(() => console.log("✅ [Sun 6:00 AM] Weekly full sync finished."))
      .catch((err) => console.error("❌ [Sun 6:00 AM] Weekly full sync failed:", err));
  },
  { timezone: "Asia/Kolkata" }
);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`⏰ Fast NAV refresh scheduled: 3:45 PM, 9:30 PM, 9:00 AM IST (Mon-Fri)`);
  console.log(`⏰ Full sync (returns recalc) scheduled: Sunday 6:00 AM IST`);
});
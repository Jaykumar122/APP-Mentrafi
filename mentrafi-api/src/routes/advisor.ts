import { Router } from "express";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import pool from "../config/db";
import { CandidateFund, getAIRecommendation, getAIRecommendationStream, getCandidateFunds, isSuggestRequest as checkSuggestRequest } from "../services/aiAdvisor";

const router = Router();

const GREETING_PATTERNS = /^(hi|hello|hey|hii|hlo|namaste|yo|good morning|good evening|good afternoon|what'?s up|sup)[\s!.?]*$/i;

// General/educational questions ("what is SIP", "explain expense ratio",
// "difference between direct and regular plans") should be answered
// conversationally without pulling irrelevant fund candidates into the
// prompt — that's what was causing random Taiwan/Gold funds to show up
// for a question that had nothing to do with picking a fund.
const GENERAL_QUESTION_PATTERNS = /^(what is|what's|whats|define|explain|meaning of|difference between|how does|how do|why (is|does|should))\b/i;

function buildGreeting(fullName?: string): string {
  if (fullName) {
    const firstName = fullName.split(' ')[0];
    return `Hi ${firstName}! 👋 I'm MentraFi, your personal AI fund advisor. Based on your profile, I can help you find funds perfectly suited to your risk appetite and goals. What would you like to know?`;
  }
  return "Hi! 👋 I'm MentraFi, your mutual fund advisor. Tell me your risk appetite, investment goal, or ask about any fund, and I'll help you find the right fit.";
}

async function getProfile(userId: number | undefined, body: any) {
  const profileResult = await pool.query(
    `SELECT pi.full_name, pi.date_of_birth, pi.age, pi.monthly_sip_budget, pi.risk_appetite, pi.investment_goal
     FROM personal_information pi
     WHERE pi.user_id = $1`,
    [userId]
  );

  const row = profileResult.rows[0] ?? {};

  return {
    full_name: row.full_name,
    age: row.age ?? undefined,
    monthly_sip_budget: row.monthly_sip_budget ?? undefined,
    risk_appetite: body.risk_appetite ?? row.risk_appetite ?? undefined,
    goal: body.goal ?? row.investment_goal ?? undefined,
    investment_horizon: body.investment_horizon,
  };
}



function mapFundCard(fund: CandidateFund) {
  return {
    id: String(fund.scheme_code),
    schemeCode: fund.scheme_code,
    name: fund.name,
    category: fund.category,
    subcategory: fund.subcategory,
    rating: Number(fund.rating) || 4,
    oneYearReturn: fund.return_1y != null ? Number(fund.return_1y) : null,
    fiveYearReturn: fund.return_5y != null ? Number(fund.return_5y) : null,
    nav: fund.nav != null ? Number(fund.nav) : null,
  };
}

// -----------------------------------------------------------------------
// POST /api/advisor/chat — non-streaming (used by current frontend)
// -----------------------------------------------------------------------
router.post("/chat", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    const trimmedMessage = message.trim();

    // Fast path: simple greetings skip the DB fetch and LLM call entirely.
    if (GREETING_PATTERNS.test(trimmedMessage)) {
      const profile = await getProfile(userId, req.body);
      const greeting = buildGreeting(profile.full_name);
      return res.json({ reply: greeting, candidateFunds: [], recommendedFunds: [] });
    }

    const profile = await getProfile(userId, req.body);

    // General/educational question — answer directly, no fund candidates.
    if (GENERAL_QUESTION_PATTERNS.test(trimmedMessage)) {
      const reply = await getAIRecommendation(profile, [], trimmedMessage);
      return res.json({ reply, candidateFunds: [], recommendedFunds: [] });
    }

    // If user is asking for suggestions, fetch up to 5 funds for personalized recommendations
    const isSuggest = checkSuggestRequest(trimmedMessage);
    const candidateFunds = await getCandidateFunds(profile.risk_appetite, trimmedMessage, profile.goal, isSuggest);
    console.log("Candidate funds count:", candidateFunds.length, candidateFunds.map(f => f.name));

    const reply = await getAIRecommendation(profile, candidateFunds, trimmedMessage);

    res.json({ reply, candidateFunds, recommendedFunds: candidateFunds.map(mapFundCard) });
  } catch (err: any) {
    console.error("AI advisor error:", err.message);
    res.status(500).json({ error: "Failed to get recommendation. Is LM Studio server running?" });
  }
});

// -----------------------------------------------------------------------
// POST /api/advisor/chat/stream — streaming (SSE)
// -----------------------------------------------------------------------
router.post("/chat/stream", authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.userId;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "message is required" });
  }

  const trimmedMessage = message.trim();

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // disable any proxy/nginx buffering
  res.flushHeaders(); // send headers immediately instead of batching with body

  // Keep the socket alive while we wait on a (sometimes slow) local LLM.
  // Mobile networking stacks (OkHttp on Android, NSURLSession on iOS) apply
  // their own idle/read timeouts independent of the JS-level xhr.timeout —
  // if no bytes cross the wire for too long, the OS kills the connection
  // and the client sees a raw network error instead of a clean timeout.
  // A small SSE comment every few seconds keeps the connection "active".
  let ended = false;
  const llmAbortController = new AbortController();
  const heartbeat = setInterval(() => {
    if (!ended) {
      try {
        res.write(`: heartbeat\n\n`);
        if (typeof (res as any).flush === "function") (res as any).flush();
      } catch {
        // connection already gone; heartbeat is a no-op at that point
      }
    }
  }, 8000);

  function endStream() {
    if (ended) return;
    ended = true;
    clearInterval(heartbeat);
    res.end();
  }

  // Stop LM Studio generation when the app navigates away, times out, or
  // loses its network connection. Otherwise abandoned generations keep the
  // local model busy and make the next user request appear hung in a queue.
  res.on("close", () => {
    if (!ended) {
      ended = true;
      clearInterval(heartbeat);
      llmAbortController.abort();
    }
  });

  if (GREETING_PATTERNS.test(trimmedMessage)) {
    try {
      const profile = await getProfile(userId, req.body);
      const greeting = buildGreeting(profile.full_name);
      res.write(`data: ${JSON.stringify({ chunk: greeting })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      return endStream();
    } catch (err: any) {
      const fallbackGreeting = "Hi! 👋 I'm MentraFi, your mutual fund advisor.";
      res.write(`data: ${JSON.stringify({ chunk: fallbackGreeting })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      return endStream();
    }
  }

  try {
    const profile = await getProfile(userId, req.body);

    // General/educational question — stream a direct answer, skip fund lookup.
    if (GENERAL_QUESTION_PATTERNS.test(trimmedMessage)) {
      await getAIRecommendationStream(profile, [], trimmedMessage, (chunk) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        // @ts-ignore — flush exists when compression middleware is present;
        // harmless no-op otherwise.
        if (typeof (res as any).flush === "function") (res as any).flush();
      }, llmAbortController.signal);
      res.write(`data: [DONE]\n\n`);
      return endStream();
    }

    // If user is asking for suggestions, fetch up to 5 funds for personalized recommendations
    const isSuggest = checkSuggestRequest(trimmedMessage);
    const candidateFunds = await getCandidateFunds(profile.risk_appetite, trimmedMessage, profile.goal, isSuggest);
    console.log("Candidate funds count:", candidateFunds.length, candidateFunds.map(f => f.name));

    if (candidateFunds.length > 0) {
      res.write(`data: ${JSON.stringify({ recommendedFunds: candidateFunds.map(mapFundCard) })}\n\n`);
      // @ts-ignore
      if (typeof (res as any).flush === "function") (res as any).flush();
    }

    await getAIRecommendationStream(profile, candidateFunds, trimmedMessage, (chunk) => {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      // @ts-ignore
      if (typeof (res as any).flush === "function") (res as any).flush();
    }, llmAbortController.signal);

    res.write(`data: [DONE]\n\n`);
    endStream();
  } catch (err: any) {
    // A client disconnect intentionally aborts the local LLM request; there
    // is no connected response left to write to in that case.
    if (llmAbortController.signal.aborted || res.destroyed) return;
    console.error("Stream error:", err.message);
    res.write(`data: ${JSON.stringify({ chunk: "I couldn't finish that response. Please try again.", recommendedFunds: [] })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    endStream();
  }
});

export default router;
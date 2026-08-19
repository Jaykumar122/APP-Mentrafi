import pool from "../config/db";

const LM_STUDIO_URL = process.env.LM_STUDIO_URL || "http://localhost:1234/v1/chat/completions";
const LM_STUDIO_MODEL = process.env.LM_STUDIO_MODEL || "local-model";

interface UserProfile {
  full_name?: string;
  age?: number;
  risk_appetite?: string;
  goal?: string;
  investment_horizon?: string;
  monthly_sip_budget?: number;
}

export interface CandidateFund {
  scheme_code: number;
  name: string;
  category: string;
  subcategory: string;
  // PostgreSQL NUMERIC values are returned by `pg` as strings by default.
  nav?: number | string;
  return_1y?: number | string;
  return_3y?: number | string;
  return_5y?: number | string;
  rating?: number | string;
  fund_house?: string;
  launch_date?: string;
}



// Kept intentionally short — every extra sentence here adds prompt tokens
// that the local model has to process before it can start answering, and
// on CPU-only local inference that prefill time is the main source of
// latency (measured: ~45s round-trip with the old, much longer prompt).
const SYSTEM_PROMPT = `You are MentraFi, a friendly AI mutual fund advisor in a mobile app. Reply in plain conversational text only — never JSON or function-call syntax.

Rules:
- Only recommend funds from the given candidate list; never invent funds or numbers.
- Briefly explain why each fund fits THIS user's risk appetite, age, goal, and budget.
- If asked to suggest/recommend funds, mention every candidate exactly once: one short numbered sentence per fund, with no long introduction.
- Keep the whole recommendation under 180 words and do not use Markdown symbols such as ** or #.
- If funds share a fund house, recommend the best performer and say why.
- If no candidates are given, say so and ask the user for more details.
- If key profile info is missing, ask one short clarifying question.
- Keep the tone friendly and human. Add a one-line "not financial advice" note only when recommending funds.`;

function formatNumeric(value: number | string | null | undefined, decimals: number): string {
  if (value === null || value === undefined || value === "") return "N/A";
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(decimals) : "N/A";
}

function buildUserPrompt(profile: UserProfile, funds: CandidateFund[], userQuery: string): string {
  const parts: string[] = [];
  if (profile.age) parts.push(`is ${profile.age} years old`);
  parts.push(profile.risk_appetite ? `has a ${profile.risk_appetite.toLowerCase()} risk appetite` : "has not shared a risk appetite yet");
  parts.push(profile.goal ? `wants to invest for: ${profile.goal}` : "has not shared an investment goal yet");
  parts.push(profile.investment_horizon ? `has an investment horizon of ${profile.investment_horizon}` : "has not shared an investment horizon yet");
  if (profile.monthly_sip_budget) parts.push(`can invest around ₹${profile.monthly_sip_budget} per month`);

  const profileSentence = `The user ${parts.join(", ")}.`;

  const fundLines = funds.length
    ? funds.map((f, i) => {
        const fundDetails = [
          `${f.name}`,
          `Category: ${f.category} (${f.subcategory})`,
          `Fund House: ${f.fund_house || "N/A"}`,
          `NAV: ₹${formatNumeric(f.nav, 2)}`,
          `1Y Return: ${formatNumeric(f.return_1y, 2)}%`,
          `3Y Return: ${formatNumeric(f.return_3y, 2)}%`,
          `5Y Return: ${formatNumeric(f.return_5y, 2)}%`,
          `Rating: ${formatNumeric(f.rating, 1)}/5`,
        ];
        return `${i + 1}. ${fundDetails.join(" | ")}`;
      }).join("\n")
    : "No candidate funds were found matching the user's filters.";

  return `${profileSentence}

Here are the candidate funds retrieved from the database:
${fundLines}

The user just asked: "${userQuery}"

Based on their profile and the candidate funds above, reply now. If recommending funds, mention all ${funds.length} candidates in a numbered list with exactly one concise sentence per fund explaining why it suits this user.`;
}

// ---------------------------------------------------------------------------
// Non-streaming — used by the current /api/advisor/chat route.
// ---------------------------------------------------------------------------
export async function getAIRecommendation(
  profile: UserProfile,
  funds: CandidateFund[],
  userQuery: string
): Promise<string> {
  const userPrompt = buildUserPrompt(profile, funds, userQuery);

  const response = await fetch(LM_STUDIO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: LM_STUDIO_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.35,
      max_tokens: 200,
      stream: false,
      tools: [],
      tool_choice: "none",
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`LM Studio request failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't generate a recommendation right now.";
}

// ---------------------------------------------------------------------------
// Streaming (SSE) — used by /api/advisor/chat/stream, not yet wired to the
// frontend. Kept separate from getAIRecommendation above so the working
// non-streaming route never breaks while streaming support is built out.
// ---------------------------------------------------------------------------
export async function getAIRecommendationStream(
  profile: UserProfile,
  funds: CandidateFund[],
  userQuery: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const userPrompt = buildUserPrompt(profile, funds, userQuery);

  const response = await fetch(LM_STUDIO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: LM_STUDIO_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.35,
      max_tokens: 200,
      stream: true,
      tools: [],
      tool_choice: "none",
    }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`LM Studio stream failed (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const jsonStr = trimmed.slice(5).trim();
      if (jsonStr === "[DONE]") return;
      try {
        const parsed = JSON.parse(jsonStr);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) onChunk(delta);
      } catch {
        // skip malformed chunk
      }
    }
  }
}

export function isSuggestRequest(query: string): boolean {
  const normalized = query.toLowerCase().trim();
  return /^(suggest|recommend|what should i invest in|best funds for|find funds for|funds for me|give me|show me)\b/i.test(normalized);
}

function normalizeRiskAppetite(riskAppetite?: string | null): "Low" | "Moderate" | "High" | null {
  if (!riskAppetite) return null;
  const value = riskAppetite.trim().toLowerCase();
  if (["low", "safe", "conservative"].includes(value)) return "Low";
  if (["moderate", "medium", "balanced"].includes(value)) return "Moderate";
  if (["high", "aggressive", "growth"].includes(value)) return "High";
  return null;
}

function inferCategoryFromQuery(searchTerm?: string): string | null {
  if (!searchTerm) return null;
  const q = searchTerm.toLowerCase();
  if (q.includes("elss") || q.includes("tax")) return "ELSS";
  if (q.includes("debt") || q.includes("liquid") || q.includes("safe") || q.includes("low risk")) return "Debt";
  if (q.includes("hybrid") || q.includes("balanced")) return "Hybrid";
  if (q.includes("gold")) return "Gold";
  if (q.includes("index") || q.includes("equity") || q.includes("small cap") || q.includes("mid cap") || q.includes("large cap") || q.includes("flexi")) return "Equity";
  return null;
}

function inferSubcategories(riskAppetite?: string, searchTerm?: string): string[] | null {
  const q = searchTerm?.toLowerCase() ?? "";
  const explicit: string[] = [];
  if (q.includes("small cap")) explicit.push("Small Cap");
  if (q.includes("mid cap")) explicit.push("Mid Cap");
  if (q.includes("large cap")) explicit.push("Large Cap");
  if (q.includes("flexi")) explicit.push("Flexi Cap");
  if (q.includes("index")) explicit.push("Index Fund");
  if (q.includes("tax") || q.includes("elss")) explicit.push("Tax Saving");
  if (q.includes("balanced") || q.includes("hybrid")) explicit.push("Balanced");
  if (q.includes("debt") || q.includes("liquid")) explicit.push("Debt Fund");
  if (q.includes("gold")) explicit.push("Gold");
  if (explicit.length) return explicit;

  const normalizedRisk = normalizeRiskAppetite(riskAppetite);
  const subcategoryMap: Record<"Low" | "Moderate" | "High", string[]> = {
    Low: ["Debt Fund", "Gold", "Liquid Fund", "Short Duration"],
    Moderate: ["Balanced", "Large Cap", "Tax Saving", "Index Fund"],
    High: ["Small Cap", "Mid Cap", "Flexi Cap", "Sectoral/Thematic"],
  };

  return normalizedRisk ? subcategoryMap[normalizedRisk] : null;
}

export async function getCandidateFunds(riskAppetite?: string, searchTerm?: string, goal?: string, isSuggestMode?: boolean): Promise<CandidateFund[]> {
  const trimmedSearch = searchTerm?.trim();

  if (trimmedSearch && trimmedSearch.length > 1) {
    const nameResult = await pool.query(
      `SELECT f.scheme_code, f.name, f.category, f.subcategory, f.nav, f.rating,
              f.fund_house, f.launch_date,
              fp.return_1y, fp.return_3y, fp.return_5y
       FROM funds f
       JOIN fund_performance fp ON fp.scheme_code = f.scheme_code
       WHERE LOWER(f.name) LIKE LOWER($1) AND fp.return_1y IS NOT NULL
       ORDER BY
         CASE WHEN LOWER(f.name) = LOWER($2) THEN 0 ELSE 1 END,
         CASE WHEN LOWER(f.name) LIKE LOWER($3) THEN 0 ELSE 1 END,
         COALESCE(fp.return_3y, fp.return_1y) DESC
       LIMIT 6`,
      [`%${trimmedSearch}%`, trimmedSearch, `${trimmedSearch}%`]
    );
    if (nameResult.rows.length > 0) {
      return nameResult.rows;
    }
  }

  const derivedCategory = inferCategoryFromQuery(trimmedSearch) || inferCategoryFromQuery(goal);
  const subcategories = inferSubcategories(riskAppetite, `${goal ?? ""} ${trimmedSearch ?? ""}`.trim());

  const conditions: string[] = [
    "fp.return_1y IS NOT NULL",
    // Recommend one investable Growth variant instead of filling the list
    // with duplicate Regular/IDCW versions of the same underlying fund.
    "LOWER(f.name) NOT LIKE '%regular%'",
    "LOWER(f.name) NOT LIKE '%idcw%'",
    "LOWER(f.name) NOT LIKE '%income distribution%'",
  ];
  if (isSuggestMode) {
    // Broad personalized recommendations should have a meaningful track
    // record and use the lower-cost Direct variant. This prevents recent
    // one-year spikes and duplicate unlabeled/Regular variants from filling
    // a user's five recommendation slots.
    conditions.push("fp.return_3y IS NOT NULL");
    conditions.push("LOWER(f.name) LIKE '%direct%'");
  }
  const values: any[] = [];

  if (derivedCategory) {
    values.push(derivedCategory);
    conditions.push(`f.category = $${values.length}`);
  }

  if (subcategories?.length) {
    values.push(subcategories);
    conditions.push(`f.subcategory = ANY($${values.length})`);
  }

  const result = await pool.query(
    `SELECT f.scheme_code, f.name, f.category, f.subcategory, f.nav, f.rating,
            f.fund_house, f.launch_date,
            fp.return_1y, fp.return_3y, fp.return_5y
     FROM funds f
     JOIN fund_performance fp ON fp.scheme_code = f.scheme_code
     WHERE ${conditions.join(" AND ")}
     ORDER BY
       COALESCE(fp.return_3y, fp.return_1y) DESC NULLS LAST,
       fp.return_5y DESC NULLS LAST,
       f.rating DESC NULLS LAST
     LIMIT ${isSuggestMode ? 5 : 6}`,
    values
  );

  if (result.rows.length > 0) {
    return result.rows;
  }

  const fallback = await pool.query(
    `SELECT f.scheme_code, f.name, f.category, f.subcategory, f.nav, f.rating,
            f.fund_house, f.launch_date,
            fp.return_1y, fp.return_3y, fp.return_5y
     FROM funds f
     JOIN fund_performance fp ON fp.scheme_code = f.scheme_code
     WHERE fp.return_1y IS NOT NULL
       AND LOWER(f.name) NOT LIKE '%regular%'
       AND LOWER(f.name) NOT LIKE '%idcw%'
       AND LOWER(f.name) NOT LIKE '%income distribution%'
       ${isSuggestMode ? "AND fp.return_3y IS NOT NULL AND LOWER(f.name) LIKE '%direct%'" : ""}
     ORDER BY
       fp.return_3y DESC NULLS LAST,
       fp.return_5y DESC NULLS LAST,
       f.rating DESC NULLS LAST
     LIMIT ${isSuggestMode ? 5 : 6}`
  );

  return fallback.rows;
}

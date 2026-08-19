# 📊 MentraFi

**MentraFi** is a full-stack mutual fund investment platform with an AI-powered fund advisor, SIP (Systematic Investment Plan) management, portfolio tracking, and a fund explorer — built with **React Native (Expo)** on the frontend and **Node.js + Express + PostgreSQL** on the backend.

🧠 The AI Advisor runs entirely on a **local LLM (Gemma2 via LM Studio)** *{upcoming: MentraFiAI}* — no external AI API keys required.

![Platform](https://img.shields.io/badge/platform-React%20Native%20%7C%20Expo-blue)
![Backend](https://img.shields.io/badge/backend-Node.js%20%7C%20Express-green)
![Database](https://img.shields.io/badge/database-PostgreSQL-336791)
![AI](https://img.shields.io/badge/AI-Local%20LLM%20via%20LM%20Studio-purple)
![License](https://img.shields.io/badge/license-personal%20%2F%20educational-lightgrey)

---

## ✨ Features

- 🤖 **AI Advisor** — chat-based fund recommendations personalized to the user's age, risk appetite, investment goal, and monthly SIP budget. Uses a Retrieval-Augmented Generation (RAG) approach: candidate funds are retrieved from the database first, then explained by a local LLM.
- 🔁 **SIP Dashboard** — create, pause, resume, edit, and cancel recurring SIP mandates. A daily cron job automatically processes due installments.
- 🔎 **Explore** — browse and search all mutual funds with live NAV, returns, and ratings.
- 💼 **Portfolio** — track real holdings, invested amount, current value, and returns.
- 👤 **Profile** — editable personal information (age, risk appetite, goal, budget) that powers personalized recommendations, plus avatar upload with in-app cropping.
- ⏱️ **Automated NAV Sync** — scheduled cron jobs keep fund NAVs and returns up to date from public NAV data.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| 📱 Mobile app | React Native, Expo, Expo Router, TypeScript |
| ⚙️ Backend API | Node.js, Express, TypeScript |
| 🗄️ Database | PostgreSQL |
| 🔐 Auth | JWT + bcrypt |
| 🧠 AI | Local LLM (Gemma2) served via [LM Studio](https://lmstudio.ai/), OpenAI-compatible chat completions API |
| ⏰ Scheduling | node-cron |
| 📎 File uploads | Multer |

---

## 📂 Project Structure

```
mentrafi files/
├── 📱 Mentrafi/              # React Native (Expo) frontend
│   ├── app/
│   │   ├── (auth)/           # 🔑 Login / signup
│   │   ├── (tabs)/           # 🏠 Home, 🔎 Explore, 💼 Portfolio, 🤖 AI Advisor, 👤 Profile, 🔁 SIP Dashboard
│   │   ├── onboarding.tsx
│   │   └── profile-setup.tsx
│   └── utils/api.ts          # 🌐 Backend base URL config
│
└── ⚙️ mentrafi-api/           # Express backend
    ├── src/
    │   ├── config/            # 🗄️ DB pool + migrations
    │   ├── middleware/         # 🔐 JWT auth middleware
    │   ├── routes/             # auth, funds, profile, advisor, portfolio, sip
    │   ├── services/           # aiAdvisor, fundSync, sip business logic
    │   └── index.ts            # 🚀 App entry point + cron schedules
    └── uploads/                # 🖼️ Uploaded avatar images
```

---

## 🚀 Getting Started

### ✅ Prerequisites

- 🟢 Node.js 18+
- 🐘 PostgreSQL 14+
- 🧠 [LM Studio](https://lmstudio.ai/) (for the AI Advisor) with a chat model loaded (e.g. Gemma2)
- 📲 Expo Go app (for testing on a physical device) or an Android/iOS simulator

### 1️⃣ Clone and install

```bash
git clone <your-repo-url>
cd "mentrafi files"

# Backend
cd mentrafi-api
npm install

# Frontend
cd ../Mentrafi
npm install
```

### 2️⃣ Configure the backend

Create a `.env` file inside `mentrafi-api/`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/mentrafi
JWT_SECRET=replace-with-a-long-random-secret
PORT=3001

# Local LLM (LM Studio) — used by the AI Advisor
LM_STUDIO_URL=http://localhost:1234/v1/chat/completions
LM_STUDIO_MODEL=local-model
```

Create the database:

```bash
createdb mentrafi
```

Run migrations (creates all tables — users, funds, SIPs, portfolio, etc.):

```bash
cd mentrafi-api
npm run migrate
```

### 3️⃣ Configure the frontend

Edit `Mentrafi/utils/api.ts` and set your machine's LAN IP (needed for physical devices / iOS simulator to reach your backend):

```ts
const DEFAULT_LAN_HOST = "http://192.168.1.40:3001"; // <- update to your PC's IP
```

📱 Android emulator uses `10.0.2.2:3001` automatically — no change needed there.

### 4️⃣ Start LM Studio (for AI Advisor)

1. 🧠 Open LM Studio and load a chat model (e.g. `gemma-2-9b-it`).
2. ▶️ Start the local server (default: `http://localhost:1234`).
3. ✅ Make sure `LM_STUDIO_MODEL` in your `.env` matches the loaded model's identifier.

### 5️⃣ Run the backend

```bash
cd mentrafi-api
npm run dev
```

🚀 The API starts on `http://localhost:3001` and schedules its cron jobs (NAV sync + SIP processing).

### 6️⃣ Seed fund data (first run only)

```bash
curl -X POST http://localhost:3001/api/funds/seed
curl -X POST http://localhost:3001/api/funds/sync-all
```

### 7️⃣ Run the frontend

```bash
cd Mentrafi
npx expo start
```

📷 Scan the QR code with Expo Go, or press `a` / `i` for an emulator.

---

## 🔌 API Overview

| Method | Endpoint | Description |
|---|---|---|
| 🟢 POST | `/api/auth/signup` | Create an account |
| 🟢 POST | `/api/auth/signin` | Log in, returns JWT |
| 🔵 GET | `/api/profile` | Get current user's profile + stats |
| 🟠 PATCH | `/api/profile` | Update personal info (age, risk appetite, goal, budget) |
| 🟢 POST | `/api/profile/avatar` | Upload profile picture |
| 🔵 GET | `/api/funds` | Search/browse funds (`?q=`, `?category=`, pagination) |
| 🔵 GET | `/api/funds/:schemeCode/details` | Fund details |
| 🔵 GET | `/api/funds/:schemeCode/performance` | 1M–10Y returns |
| 🟢 POST | `/api/advisor/chat` | Non-streaming AI recommendation |
| 🟢 POST | `/api/advisor/chat/stream` | Streaming (SSE) AI recommendation |
| 🔵 GET | `/api/portfolio` | User's holdings |
| 🟢 POST | `/api/portfolio/invest` | Buy units of a fund |
| 🟢 POST | `/api/portfolio/redeem` | Sell units of a fund |
| 🔵 GET | `/api/sip` | Active/paused SIPs + totals |
| 🟢 POST | `/api/sip` | Start a new SIP |
| 🟠 PATCH | `/api/sip/:id` | Edit a SIP |
| 🟠 PATCH | `/api/sip/:id/pause` | Pause a SIP |
| 🟠 PATCH | `/api/sip/:id/resume` | Resume a SIP |
| 🔴 DELETE | `/api/sip/:id` | Cancel a SIP |

🔐 All routes except `/api/auth/*` and `/api/funds` (GET) require `Authorization: Bearer <token>`.

---

## 🧠 How the AI Advisor Works

The AI Advisor uses **Content-Based Filtering + RAG (Retrieval-Augmented Generation)** — not collaborative filtering, and not a trained ML model:

1. 👤 **Profile lookup** — reads the user's age, risk appetite, goal, and budget from the database.
2. 🎯 **Intent detection** — rule-based regex matching classifies the message (greeting, general question, fund suggestion, or fund-specific query).
3. 🗄️ **Candidate retrieval** — SQL query filters funds by category/subcategory mapped from the user's risk appetite, excluding duplicate Regular/IDCW plan variants.
4. 📈 **Ranking** — candidates are sorted by 3-year return, then 5-year return, then rating.
5. 💬 **Explanation (RAG)** — the top candidates (plus the user's profile) are passed to the local Gemma2 model, which explains *why* each fund fits — never inventing funds or numbers outside what was retrieved.

💓 The streaming endpoint also sends periodic SSE heartbeats to keep the connection alive while the local model generates a response, since local CPU inference can take 30–60+ seconds.

---

## 🗄️ Database Schema (Key Tables)

| Table(s) | Purpose |
|---|---|
| 👤 `users`, `personal_information` | Auth + profile (age, risk appetite, goal, budget) |
| 📈 `funds`, `fund_performance`, `nav_history` | Fund master data, returns, daily NAV history |
| 💼 `user_portfolio` | Real holdings (units, avg purchase NAV, invested amount) |
| 🔁 `sips`, `sip_installments` | SIP mandates and their executed installment history |
| 🏆 `fund_scores` | Reserved for a future weighted suitability-scoring algorithm |

---

## ⏰ Scheduled Jobs (cron, IST)

| Time | Job |
|---|---|
| 🕞 3:45 PM (Mon–Fri) | Post-market-close fast NAV sync |
| 🌙 9:30 PM (Mon–Fri) | Evening NAV refresh (official AMFI NAV) |
| ☀️ 9:00 AM (Mon–Fri) | Morning safety-check sync |
| 🔁 9:05 AM (daily) | Process due SIP installments |
| 📅 6:00 AM (Sunday) | Full sync — recomputes 1/3/5-year returns |

---

## ⚠️ Known Limitations

- 📉 SIP returns use a simple `(currentValue - totalInvested) / totalInvested` approximation, not a weighted-average holding-period return.
- 🎯 The AI Advisor ranks funds by historical returns only — it does not yet factor in expense ratio, volatility, or existing portfolio overlap (see `fund_scores` table for the planned upgrade path).
- 🐢 Local LLM inference speed depends entirely on your hardware and the model loaded in LM Studio.

---

## 📄 License

This project is provided as-is for personal/educational use.

---

<div align="center">

Made with 💙 for smarter, simpler mutual fund investing.

</div>

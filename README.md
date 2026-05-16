# 💰 MentraFi

### *Your Personal AI-Powered Mutual Fund Guide*

![Status](https://img.shields.io/badge/Status-Under%20Construction-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![React Native](https://img.shields.io/badge/React%20Native-Expo%2054-black?style=for-the-badge&logo=react)
![NativeWind](https://img.shields.io/badge/NativeWind-Styling-38BDF8?style=for-the-badge&logo=tailwindcss)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql)
![AI](https://img.shields.io/badge/Generative%20AI-Own%20Engine-8A2BE2?style=for-the-badge)

<br/>

> 📱 **MentraFi** is a smart, AI-driven **mobile application** that takes the complexity out of mutual fund investing. Powered by a **custom-built ML backend and Generative AI engine**, MentraFi acts as a personal financial guide — helping beginners grow their wealth without needing expert knowledge.

<br/>

![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-lightgrey?style=flat-square&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)

---

## 📌 Project Overview

Investing in mutual funds can be overwhelming — thousands of options, confusing jargon, and no clear starting point. **MentraFi solves this** by letting users enter a few simple details and instantly receiving personalized, AI-generated fund recommendations they can actually understand.

This repository is a **monorepo** containing two packages:

| Package | Description |
|---|---|
| [`mentrafi/`](#-mentrafi--frontend) | React Native mobile app (Expo 54 + TypeScript + NativeWind) |
| [`mentra-api/`](#-mentra-api--backend) | Node.js REST API backend with PostgreSQL |

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🧑‍💼 **Personalized Profiling** | Tailors suggestions based on age, salary, financial goals, and risk appetite |
| 🤖 **Custom ML Recommendations** | In-house ML algorithms analyze fund data and match best options to each user's profile |
| 🧠 **Generative AI Explanations** | Own-built generative AI engine produces simple, human-readable summaries of each recommendation |
| 🎯 **Goal-Oriented Planning** | Helps users plan for milestones — retirement, emergency fund, buying a car, and more |
| ⚖️ **Unbiased Analysis** | No third-party promotions — decisions are driven purely by returns, risk, and expense data |
| 📱 **Cross-Platform Mobile App** | Runs smoothly on both Android and iOS via Expo 54 |

---

## 🏗️ System Architecture

```
 ┌─────────────────────────────────────────────────────────────────────┐
 │                     mentrafi/  (Mobile App)                          │
 │           React Native • Expo 54 • TypeScript • NativeWind           │
 └───────────────────────────────┬─────────────────────────────────────┘
                                 │  REST API (HTTP/JSON)
                                 ▼
 ┌─────────────────────────────────────────────────────────────────────┐
 │                     mentra-api/  (Backend)                           │
 │                          Node.js • Express                           │
 │                                                                     │
 │   ┌──────────────────┐        ┌──────────────────────────────────┐  │
 │   │  ML Engine        │        │     Generative AI Engine         │  │
 │   │                  │        │                                  │  │
 │   │ • Data Ingestion  │        │ • Takes ML output as input       │  │
 │   │ • Feature Engg.  │        │ • Generates plain-language       │  │
 │   │ • Model Training  │        │   explanation for each fund      │  │
 │   │ • Prediction API  │        │   recommendation                 │  │
 │   └──────────────────┘        └──────────────────────────────────┘  │
 │                                                                     │
 │   ┌──────────────────────────────────────────────────────────────┐  │
 │   │                    Database (PostgreSQL)                       │  │
 │   │          Users • Fund Data • Profiles • Recommendations       │  │
 │   └──────────────────────────────────────────────────────────────┘  │
 └─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
 ┌─────────────────────────────────────────────────────────────────────┐
 │                      Mutual Fund Data Source                         │
 │              Real-time Fund APIs • Historical Data                   │
 └─────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ How It Works

```
Step 1          Step 2               Step 3                  Step 4
────────        ──────────────       ─────────────────       ──────────────────
User enters  →  ML model scores  →   Generative AI       →   User receives
age, income,    thousands of         engine writes a         a personalized
goals &         funds based on       simple explanation      fund report with
risk level      user's profile       for each match          clear reasoning
```

---

## 📁 Repository Structure

```
MentraFi/                          # Monorepo root
│
├── mentrafi/                      # 📱 React Native Mobile App
│   ├── app/                       # Expo Router screens
│   │   ├── (tabs)/                # Bottom tab navigation
│   │   ├── index.tsx              # Entry / splash screen
│   │   └── _layout.tsx            # Root layout
│   ├── components/                # Reusable UI components
│   ├── constants/                 # Colors, fonts, app config
│   ├── hooks/                     # Custom React hooks
│   ├── assets/                    # Images, fonts, icons
│   ├── services/                  # API call handlers
│   │   ├── recommendationService.ts
│   │   └── authService.ts
│   ├── types/                     # TypeScript type definitions
│   ├── app.json                   # Expo config
│   ├── tailwind.config.js         # NativeWind / Tailwind config
│   └── package.json
│
├── mentra-api/                    # ⚙️ Node.js Backend
│   ├── src/
│   │   ├── routes/                # Express route definitions
│   │   ├── controllers/           # Request handlers
│   │   ├── services/              # Business logic
│   │   │   ├── mlEngine/          # ML model integration
│   │   │   └── aiEngine/          # Generative AI explanation module
│   │   ├── models/                # PostgreSQL models / queries
│   │   ├── middleware/            # Auth, validation, error handling
│   │   └── config/               # DB config, env setup
│   ├── migrations/                # PostgreSQL schema migrations
│   ├── .env.example               # Environment variable template
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | v18+ |
| npm | v9+ |
| PostgreSQL | v15+ |
| Expo CLI | v54 |
| Git | latest |

---

## 📱 mentrafi — Frontend

### Setup

```bash
# 1. Navigate into the mobile app directory
cd mentrafi

# 2. Install dependencies
npm install

# 3. Start the Expo development server
npx expo start
```

### Run on Device / Emulator

```bash
# Android
npx expo start --android

# iOS
npx expo start --ios

# Web browser (for UI testing)
npx expo start --web
```

Scan the **QR code** in your terminal using the **Expo Go** app on your [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) or [iOS](https://apps.apple.com/app/expo-go/id982107779) device to instantly preview.

### Environment Variables

Create a `.env` file inside `mentrafi/`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

---

## ⚙️ mentra-api — Backend

### Setup

```bash
# 1. Navigate into the backend directory
cd mentra-api

# 2. Install dependencies
npm install

# 3. Copy environment template and fill in your values
cp .env.example .env

# 4. Run database migrations
npm run migrate

# 5. Start the development server
npm run dev
```

### Environment Variables

Create a `.env` file inside `mentra-api/` based on `.env.example`:

```env
PORT=3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mentrafi
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Auth
JWT_SECRET=your_jwt_secret

# External Fund Data API (optional)
FUND_API_KEY=your_fund_api_key
FUND_API_URL=https://your-fund-data-provider.com
```

### Database Setup (PostgreSQL)

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE mentrafi;"

# Run migrations
npm run migrate

# (Optional) Seed with sample fund data
npm run seed
```

### Available Scripts

```bash
npm run dev       # Start development server with hot reload
npm run build     # Compile TypeScript to dist/
npm run start     # Start production server
npm run migrate   # Run pending DB migrations
npm run seed      # Seed database with initial data
npm run test      # Run test suite
```

---

## 🗄️ Database Schema (PostgreSQL)

> ⚠️ Schema is under active development. Core tables are listed below.

| Table | Description |
|---|---|
| `users` | Registered user accounts |
| `profiles` | Financial profile — age, income, goals, risk level |
| `funds` | Mutual fund data — name, returns, expense ratio, volatility |
| `recommendations` | ML-generated fund matches per user |
| `explanations` | AI-generated text explanations per recommendation |

---

## 🏗️ Tech Stack

### 📱 Mobile App (`mentrafi/`)
![React Native](https://img.shields.io/badge/React%20Native-20232A?style=flat&logo=react&logoColor=61DAFB)
![Expo 54](https://img.shields.io/badge/Expo-54-000020?style=flat&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![NativeWind](https://img.shields.io/badge/NativeWind-v4-38BDF8?style=flat&logo=tailwindcss&logoColor=white)

### ⚙️ Backend (`mentra-api/`)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)

### 🗄️ Database
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)

### 🤖 AI / ML
![ML Engine](https://img.shields.io/badge/ML%20Engine-Custom-FF6F00?style=flat)
![Generative AI](https://img.shields.io/badge/Generative%20AI-Custom%20Engine-8A2BE2?style=flat)

---

## 📈 Roadmap

### 📱 Mobile App
- [ ] Onboarding flow — age, income, goals, risk level input
- [ ] Home dashboard with fund recommendations
- [ ] Fund detail screen with AI-generated explanation
- [ ] User authentication and secure profile management
- [ ] Goal tracker with progress visualization
- [ ] Push notifications for fund performance updates
- [ ] Dark mode support
- [ ] Multi-language support

### ⚙️ Backend & AI
- [ ] Mutual fund data pipeline and preprocessing
- [ ] PostgreSQL schema and migrations
- [ ] REST API for user auth and profile management
- [ ] ML model development for fund scoring and ranking
- [ ] Generative AI module for explanation generation
- [ ] REST API for recommendation serving
- [ ] Model evaluation and backtesting
- [ ] Real-time fund data integration

---

## 🐛 Known Issues

> This project is under active construction. Some features may be incomplete or unstable.

- [ ] ML recommendation engine — in development
- [ ] Generative AI explanation engine — in development
- [ ] Real-time fund data API integration — pending
- [ ] Authentication flow — in progress
- [ ] Database migrations — in progress

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**!

1. **Fork** the project
2. Create your feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

5. Open a **Pull Request**

Please make sure your code follows the existing style and includes appropriate comments.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 📬 Contact

Have a suggestion or found a bug? Feel free to open an [issue](https://github.com/jaykumar122/MentraFi/issues).

---

<div align="center">

**MentraFi** — Making investing easy, clear, and accessible for everyone. 🌱

*Built with ❤️ using React Native, Expo 54, Node.js & PostgreSQL*

⭐ **Star this repo if you find it helpful!**

</div>

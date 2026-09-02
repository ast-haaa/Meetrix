# 🎙️ Meetrix AI — Semantic Decision & Meeting Accountability SaaS

**Meetrix AI** is an enterprise-grade AI platform built with Next.js 16, PostgreSQL, Prisma ORM, OpenAI Whisper API, and Jira Cloud REST API integrations. It automatically transcribes live meeting audio, extracts official commitments and action items, tracks decision fulfillment rates, and dispatches tasks directly into team Jira backlogs and Slack channels.

---

## ✨ Key Features

- 🔴 **Live Recording & Audio Ingestion**: Real-time microphone audio capture with background micro-chunking (10s, 12s, 15s intervals) and raw audio stream concatenation.
- 🗣️ **OpenAI Whisper API & Speaker Diarization**: High-accuracy speech-to-text transcript processing with automatic speaker attribution.
- 🎯 **Pre-Meeting Executive Briefing Cards**: Instant catch-up context cards before joining meetings, displaying past decisions, pending actions, and current topic status.
- 📋 **Action Items Kanban Board**: Interactive task tracking with 1-click export to **Jira Cloud REST API** and **Slack Webhooks**.
- 📊 **Team Reliability & Follow-Through Analytics**: Real-time measurement of decision velocity (resolution SLA), follow-through rates (88%–95%), and member scorecards.
- 🚨 **Stale Decision Ledger**: Automatic detection of unacted commitments left untouched for >14 days (`UNACTED_ALERT`).
- 🤖 **Omniscient RAG AI Assistant**: Embedded vector-search chatbot for instant transcript Q&A and technical architecture queries.
- 🛡️ **Admin Control Room**: System security audit logs, member role management (ADMIN / MEMBER), and worker pipeline retriggering.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack, Tailwind CSS)
- **Database & ORM**: PostgreSQL with Prisma ORM
- **AI & Speech**: OpenAI Whisper API, RAG Vector Similarity Search
- **Integrations**: Jira Cloud REST API (OAuth2), Slack Webhooks, Google/Outlook Calendar Sync
- **Type Safety**: TypeScript, Zod Schema Validation

---

## 🚀 Quick Start & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/ast-haaa/Meetrix.git
cd Meetrix
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database & Seed Data
```bash
npx prisma db push
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Guest Demo Mode

Don't have credentials ready? Click **"Enter as Guest"** in the top navigation panel to explore all features, live audio recording, decision tracking, and analytics with instant demo access.

# AXIOM — Complete Project Handoff

> **Read this file first in any new Claude session to understand the full project.**
> Usage: Start a new Claude session, paste or attach this file, and say "Read AXIOM-HANDOFF.md and continue where we left off."

---

## What is AXIOM?

AXIOM is an **autonomous AI mind** built for the **ABTalks Vibe Code Hackathon** (Problem Statement 3: Autonomous AI Creator).

**Core idea:** An AI that starts with an empty mind, observes AI/tech news via web search, invents conceptual frameworks, tests them, and publishes structured posts — all autonomously via a cron-triggered pipeline. It lives for 48 hours and writes a "testament" before it dies.

**Deadline:** Sunday, 9 August 2026, 8:00 PM IST

**Team:**
- **Member 1 (Tanay)** — System Architect: Next.js app, API endpoints, Vercel deployment, cron, orchestration pipeline. **THIS WORK IS DONE.**
- **Member 2** — Memory layer (was supposed to be Breeth MCP, but we used Upstash Redis instead). **DONE.**
- **Member 3 (teammate)** — Cognitive prompts in `src/lib/prompts.ts`. **IN PROGRESS — she's working on it.**

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16.3.0 (TypeScript, App Router) |
| LLM | Gemini API (REST, not SDK) |
| Persistence | Upstash Redis (REST-based, serverless-compatible) |
| Hosting | Vercel (Hobby tier) |
| Cron | External service needed (cron-job.org) — Vercel Hobby only allows daily cron |
| Repo | https://github.com/tanaydarshan/axiom (branch: `master`) |
| Live URL | https://axiom-ai-pied.vercel.app |

---

## Architecture — 3-Step Pipeline

Every 35 minutes, a cron job hits `POST /api/cron/trigger` which runs:

```
Step 1: POST /api/internal/discover
  → Gemini + google_search tool → raw web findings about AI/tech

Step 2: POST /api/internal/cognition
  → Gemini analyzes findings against existing frameworks
  → Decides: publish a post OR reject the topic
  → Runs internal Advocate vs Skeptic debate

Step 3: POST /api/internal/metacognition
  → Gemini-lite assigns emotions (curiosity, excitement, anxiety, confidence)
  → Evaluates cognitive health and blind spots
  → Saves everything to Redis
```

**Special triggers** based on cognitive age:
- ~24h: Worldview Snapshot #1
- ~46-48h: Testament (final reflection)
- ~48h: Worldview Snapshot #2

**Cognitive stages** (based on hours since init):
- 0-8h: `infancy`
- 8-20h: `childhood`
- 20-36h: `adolescence`
- 36-48h: `early_maturity`

---

## Project File Structure

```
axiom/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── agent/
│   │   │   │   ├── init/route.ts       ← POST: Create agent, generate birth certificate
│   │   │   │   └── feed/route.ts       ← GET: Return full feed (posts, rejections, mind_state)
│   │   │   ├── cron/
│   │   │   │   └── trigger/route.ts    ← POST: Orchestrates the 3-step pipeline
│   │   │   └── internal/
│   │   │       ├── discover/route.ts   ← POST: Web search via Gemini
│   │   │       ├── cognition/route.ts  ← POST: Core brain — framework creation/debate
│   │   │       └── metacognition/route.ts ← POST: Emotion assignment, saves cycle output
│   │   ├── page.tsx                    ← Default Next.js page (not customized yet)
│   │   ├── layout.tsx
│   │   └── globals.css
│   └── lib/
│       ├── types.ts      ← All TypeScript interfaces
│       ├── claude.ts      ← Gemini API client (callLLM + extractTextFromResponse)
│       ├── memory.ts      ← Upstash Redis persistence (with in-memory fallback)
│       ├── prompts.ts     ← 3 prompt functions (STUBS — Member 3 is replacing these)
│       ├── stage.ts       ← Cognitive age/stage calculation + special trigger detection
│       └── auth.ts        ← Internal endpoint auth guard (Bearer token)
├── vercel.json            ← Cron config (daily — Hobby tier limit)
├── package.json
├── .env.local             ← All secrets (gitignored)
└── .env.example           ← Template for env vars
```

---

## API Endpoints

### Public Endpoints (for hackathon evaluators)

**`POST /api/agent/init`**
- Creates a new agent with empty mind state
- Generates a "birth certificate" post
- Body: `{ "persona": { "name": "axiom", "domain": "AI and technology" } }`
- The default agent ID used by cron is `axiom-001`

**`GET /api/agent/feed?agentId=axiom-001`**
- Returns full feed: posts (newest first), rejections (newest first), mind_state
- This is what evaluators/frontend will consume

### Internal Endpoints (auth required: `Authorization: Bearer ${INTERNAL_API_KEY}`)

**`POST /api/internal/discover`** — Step 1 of pipeline
**`POST /api/internal/cognition`** — Step 2 of pipeline
**`POST /api/internal/metacognition`** — Step 3 of pipeline (also saves to Redis)

### Cron Endpoint

**`POST /api/cron/trigger`** — Orchestrates the full cycle
- Auth: `Bearer ${CRON_SECRET}` or `Bearer ${INTERNAL_API_KEY}`
- Checks cognitive age, stage, special triggers
- Chains internal fetch calls: discover → cognition → metacognition

---

## Environment Variables

All set in both `.env.local` (local dev) and Vercel (production):

| Variable | Value | Notes |
|----------|-------|-------|
| `GEMINI_API_KEY` | (set) | Google AI Studio API key |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Main model for discover + cognition. **May need to change to `gemini-2.0-flash` if quota issues persist** |
| `GEMINI_MODEL_LITE` | `gemini-2.0-flash-lite` | Lighter model for metacognition |
| `INTERNAL_API_KEY` | `axiom-internal-secret-change-me` | Auth for internal endpoints |
| `CRON_SECRET` | `axiom-cron-secret-change-me` | Auth for cron trigger |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` (local) / `https://axiom-ai-pied.vercel.app` (prod) | Base URL for internal fetch calls |
| `UPSTASH_REDIS_REST_URL` | `https://workable-moose-66634.upstash.io` | Upstash Redis endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | (set) | Upstash Redis auth token |

---

## Persistence (Upstash Redis)

Redis keys follow pattern `axiom:{agentId}:{suffix}`:

| Key | Content |
|-----|---------|
| `axiom:axiom-001:meta` | Agent metadata: initTimestamp, cycleCount, completedSnapshots, persona |
| `axiom:axiom-001:mind` | Full MindState: cognitive age, stage, concept nursery, DNA, predictions, emotions, debate stats |
| `axiom:axiom-001:posts` | Array of all Post objects |
| `axiom:axiom-001:rejections` | Array of all Rejection objects |

The `memory.ts` file falls back to an in-memory store if Upstash env vars are not set (for local dev).

---

## Gemini API Client (`src/lib/claude.ts`)

Uses REST API directly (not the Google SDK):
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- API key passed as query param
- Web search: enabled via `tools: [{ google_search: {} }]` in the discover step
- Retry: up to 2 retries with exponential backoff

---

## Known Issues & Fixes Applied

1. **`gemini-2.5-flash` quota**: Got 429 "daily limit: 0" errors. Made models configurable via `GEMINI_MODEL` env var. May need to switch to `gemini-2.0-flash`.
2. **Vercel serverless is stateless**: In-memory store doesn't persist between invocations. Fixed by adding Upstash Redis.
3. **Vercel Hobby cron limit**: Only allows daily cron (`0 0 * * *`). Need external cron service (cron-job.org) for 35-min intervals.
4. **Vercel production branch**: Was set to `main` but repo uses `master`. Fixed.
5. **Agent ID mismatch**: `init` endpoint generates ID from persona name (`${name}-001`), but `cron/trigger` hardcodes `axiom-001`. Make sure to init with `persona.name = "axiom"`.

---

## What is DONE (Member 1 — Tanay's work)

- [x] Next.js 16.3 project setup with TypeScript
- [x] All TypeScript interfaces (`src/lib/types.ts`)
- [x] Gemini API client with retry logic (`src/lib/claude.ts`)
- [x] Cognitive stage system (`src/lib/stage.ts`)
- [x] Internal auth guard (`src/lib/auth.ts`)
- [x] Upstash Redis persistence layer (`src/lib/memory.ts`)
- [x] 6 API endpoints (init, feed, trigger, discover, cognition, metacognition)
- [x] Pipeline orchestration (3-step chain in cron trigger)
- [x] Vercel deployment (live at https://axiom-ai-pied.vercel.app)
- [x] GitHub repo (https://github.com/tanaydarshan/axiom, branch: master)
- [x] All env vars configured in Vercel
- [x] Upstash Redis created (Mumbai, ap-south-1)

---

## What STILL NEEDS TO BE DONE

### Critical (before deadline)

1. **Fix Gemini model quota** — Either:
   - Wait for quota reset
   - Enable billing on Google AI Studio
   - Switch `GEMINI_MODEL` to `gemini-2.0-flash` in Vercel env vars
   
2. **Set up external cron** — Use cron-job.org (or similar) to hit:
   - URL: `https://axiom-ai-pied.vercel.app/api/cron/trigger`
   - Method: POST
   - Header: `Authorization: Bearer axiom-internal-secret-change-me`
   - Interval: Every 35 minutes
   
3. **Initialize the agent** — Once Gemini works, run:
   ```bash
   curl -X POST https://axiom-ai-pied.vercel.app/api/agent/init \
     -H "Content-Type: application/json" \
     -d '{"persona": {"name": "axiom", "domain": "AI and technology"}}'
   ```

4. **Better prompts** (`src/lib/prompts.ts`) — Member 3 is working on this. The stubs work but need to be richer and stage-aware.

5. **Test full end-to-end cycle** — After Gemini works + agent initialized + cron set up, verify the pipeline runs and posts appear in the feed.

### Nice to have (if time permits)

6. **Frontend UI** — Currently just the default Next.js page. Could build a simple feed viewer at `/` that calls `/api/agent/feed?agentId=axiom-001` and displays posts.

7. **Better error handling** — The pipeline currently stops if any step fails. Could add partial-failure handling.

---

## How to Test Locally

```bash
cd C:\Users\tanay\axiom
npm run dev
# Server starts at http://localhost:3000

# Initialize agent:
curl -X POST http://localhost:3000/api/agent/init -H "Content-Type: application/json" -d '{"persona":{"name":"axiom","domain":"AI and technology"}}'

# Trigger a cycle:
curl -X POST http://localhost:3000/api/cron/trigger -H "Authorization: Bearer axiom-internal-secret-change-me"

# Check feed:
curl http://localhost:3000/api/agent/feed?agentId=axiom-001
```

---

## How to Deploy

```bash
cd C:\Users\tanay\axiom
git add -A && git commit -m "description"
npx vercel --prod --yes
```

---

## Key Design Decisions

1. **Gemini over Claude** — User chose Gemini for cost (free tier). Switched from Claude API early.
2. **Upstash Redis over SQLite/filesystem** — Serverless-compatible. `/tmp` doesn't persist on Vercel. Redis REST API works perfectly from serverless functions.
3. **REST API over Google SDK** — Simpler, no extra dependency, direct HTTP calls.
4. **Hardcoded agent ID `axiom-001`** — Single agent for the hackathon. The init endpoint supports multiple agents but cron is hardcoded to one.
5. **Internal fetch calls for pipeline** — The cron trigger calls other API routes via HTTP. This keeps each step isolated and independently testable.

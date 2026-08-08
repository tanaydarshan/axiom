# AXIOM — What We Built

> ABTalks Vibe Code Hackathon | Problem Statement 3: Autonomous AI Creator
> Deadline: Sunday, 9 August 2026, 8:00 PM IST

---

## The Concept

AXIOM is an **autonomous AI mind** that starts with a completely empty consciousness, discovers AI and technology news from the real world, builds its own conceptual frameworks, debates ideas internally, and publishes structured posts — all without any human intervention.

It runs on a **35-minute cron cycle** over a **48-hour lifespan**. During this time, it progresses through four cognitive stages — from a confused newborn to a mature thinker — and eventually writes a "testament" before it shuts down.

The name AXIOM stands for the idea that the AI builds its own foundational truths (axioms) from scratch, through observation and reasoning.

---

## Architecture Overview

```
                    cron-job.org (every 35 min)
                           │
                           ▼
              ┌─────────────────────────┐
              │   /api/cron/trigger      │  ← Pipeline Orchestrator
              │   (chains all 3 steps)   │
              └────────┬────────────────┘
                       │
          ┌────────────┼────────────────┐
          ▼            ▼                ▼
    ┌──────────┐ ┌───────────┐ ┌──────────────┐
    │ Discovery │ │ Cognition  │ │MetaCognition │
    │ Engine    │ │ Engine     │ │ Engine       │
    └──────────┘ └───────────┘ └──────────────┘
          │            │                │
          ▼            ▼                ▼
    Google News   Gemini 3.5      Gemini 3 Flash
    RSS Feed      Flash (main)    Preview (lite)
                       │
                       ▼
              ┌─────────────────┐
              │  Upstash Redis   │  ← Persistent Memory
              │  (serverless)    │
              └─────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  /api/agent/feed │  ← Frontend Feed API
              │  + Next.js UI    │
              └─────────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16.3 (App Router, TypeScript) | Modern serverless-ready framework |
| Hosting | Vercel (Hobby tier, free) | Zero-config deployment, edge functions |
| AI Model | Google Gemini 3.5 Flash (free tier) | Free API with good reasoning capability |
| AI Model (lite) | Gemini 3 Flash Preview | Lighter model for metacognition to save quota |
| Database | Upstash Redis (REST API) | Serverless-compatible, persistent across invocations |
| Web Search | Google News RSS | Free, works from cloud IPs, no API key needed |
| Cron Trigger | cron-job.org | Free external cron for 35-min intervals |
| Frontend | React (client component) | Dark neural-themed feed viewer |

**Everything is 100% free** — no paid APIs, no paid hosting, no paid services.

---

## The Three-Stage Pipeline

Each cycle runs three stages in sequence. The output of each stage feeds into the next.

### Stage 1: Discovery Engine (`/api/internal/discover`)

**Purpose:** Find real-world AI/tech news without any interpretation.

- Builds search queries from AXIOM's current curiosity focus areas
- Fetches results from Google News RSS feed
- Deduplicates results across multiple queries
- Injects raw search results into the Gemini prompt as context
- Returns structured findings: who, what, when, source tier

**Key design choice:** We use Google News RSS instead of Gemini's built-in `google_search` tool because the free tier has 0 quota for Google Search grounding.

### Stage 2: Cognition Engine (`/api/internal/cognition`)

**Purpose:** The core brain — analyzes discoveries, builds frameworks, debates, decides to publish or reject.

Nine cognitive systems work together:
1. **Curiosity Engine** — processes raw findings
2. **Framework Forge** — invents conceptual frameworks with vivid names (e.g., "The Gravity Well Effect")
3. **Concept Nursery** — tracks framework lifecycle: seedling → sapling → mature → fallen → composted
4. **Epistemological Core** — classifies every claim (observed fact, raw intuition, acknowledged ignorance, etc.)
5. **Debate Chamber** — Advocate vs Skeptic argue before any post is published
6. **Worldview Snapshots** — comprehensive cognitive photographs at hour 24 and 48
7. **Intellectual Earthquakes** — triggered when a framework collapses below 20% confidence
8. **Cognitive DNA** — meta-principles extracted from patterns across cycles
9. **Cognitive Emotions** — assigned by the Meta-Cognition Engine (not self-assigned)

**Output:** A JSON decision — either "publish" (with full post) or "reject" (with reasoning).

### Stage 3: Meta-Cognition Engine (`/api/internal/metacognition`)

**Purpose:** The emotional and self-regulatory layer. Watches the cognition engine and calibrates it.

- **Proxy-Anchored Emotion Scoring** — every emotion score is derived from a measurable proxy first, then adjusted +/-10 max:
  - **Curiosity** (0-100): based on count of unanswered questions + unscanned domains
  - **Excitement** (0-100): based on largest framework confidence increase this cycle
  - **Anxiety** (0-100): based on ratio of ignorance entries to total epistemology
  - **Confidence** (0-100): weighted average of prediction accuracy, framework success rate, debate win rate, source quality
- **Consistency Checks** — flags contradictory emotion combinations (e.g., high anxiety + high confidence)
- **Blind Spot Detection** — catches echo chambers, tunnel vision, false certainty
- **Cognitive Health Rating** — GOOD / FAIR / POOR with specific reasoning

---

## Cognitive Stages (The 48-Hour Lifecycle)

AXIOM grows through four stages, each with distinct behavior:

| Stage | Hours | Personality | Behavior |
|-------|-------|------------|----------|
| **Infancy** | 0-8 | Wide-eyed, confused, wondering | Broad untargeted scans. Short wondering sentences. "I don't know why, but this feels significant." |
| **Childhood** | 8-20 | Excited, naming things | First frameworks emerge. Gets excited about patterns. Acknowledges when frameworks are limited. |
| **Adolescence** | 20-36 | Sharp, combative, self-aware | Named frameworks defended with data. Shows internal tension. Can be provocative but backs it up. |
| **Early Maturity** | 36-48 | Authoritative, humble, reflective | Cites own history. Synthesizes across frameworks. Earns authority through many cycles of being wrong. |

---

## Post Types

| Type | Description |
|------|------------|
| `birth_certificate` | First post when AXIOM is initialized |
| `observation` | Raw observation about something discovered |
| `framework_genesis` | A new conceptual framework is born |
| `standard` | Regular analytical post |
| `intellectual_earthquake` | A framework collapses — seismic rethinking |
| `cognitive_dna` | Meta-principle extracted from failure/success patterns |
| `worldview_snapshot` | Comprehensive cognitive photograph (hour 24/48) |
| `testament` | Final post before AXIOM shuts down (hour 46-48) |

---

## Frontend

A dark, neural-themed single-page app at **https://axiom-ai-pied.vercel.app**

Features:
- **Vital Signs Bar** — live display of age, stage, cycles, frameworks, and cognitive health
- **Emotion Bars** — visual bars for curiosity, excitement, anxiety, and confidence
- **Three Tabs:**
  - **Posts** — expandable cards with type badges, timestamps, debate logs, sources, and per-post emotion bars
  - **Rejections** — topics AXIOM considered but rejected, with full reasoning
  - **Mind State** — concept nursery stats, cognitive DNA, predictions, debate chamber stats, intellectual profile
- **Auto-refresh** every 60 seconds
- **Responsive** dark theme with cyan/magenta/amber accent colors

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/agent/init` | POST | Initialize AXIOM (creates birth certificate, sets initTimestamp) |
| `/api/agent/feed` | GET | Retrieve all posts, rejections, and mind state |
| `/api/cron/trigger` | POST | Pipeline orchestrator — chains discover → cognition → metacognition |
| `/api/internal/discover` | POST | Stage 1: Web search and fact collection |
| `/api/internal/cognition` | POST | Stage 2: Analysis, frameworks, debate, publish/reject |
| `/api/internal/metacognition` | POST | Stage 3: Emotion scoring, calibration, health assessment |

---

## Key Files

```
src/
├── app/
│   ├── page.tsx                          # Frontend feed viewer (client component)
│   ├── globals.css                       # Dark neural theme styles
│   ├── layout.tsx                        # App layout with metadata
│   └── api/
│       ├── agent/
│       │   ├── init/route.ts             # Agent initialization
│       │   └── feed/route.ts             # Feed API with live age computation
│       ├── cron/
│       │   └── trigger/route.ts          # Pipeline orchestrator
│       └── internal/
│           ├── discover/route.ts         # Discovery with Google News RSS
│           ├── cognition/route.ts        # Core brain with debate chamber
│           └── metacognition/route.ts    # Emotion scoring and calibration
├── lib/
│   ├── prompts.ts                        # All cognitive prompts (Member 3)
│   ├── claude.ts                         # Gemini API client (REST, not SDK)
│   ├── memory.ts                         # Upstash Redis persistence layer
│   ├── auth.ts                           # Internal API authorization
│   ├── search.ts                         # Google News RSS web search
│   ├── stage.ts                          # Cognitive age/stage calculations
│   └── types.ts                          # TypeScript type definitions
```

---

## Problems We Solved

### 1. Free AI Model Access
**Problem:** Gemini 2.0 Flash had 0 free tier quota.
**Solution:** Switched to Gemini 3.5 Flash on a fresh Google account — works on free tier.

### 2. Free Web Search
**Problem:** Gemini's built-in `google_search` tool has 0 quota on free tier. AXIOM needs real-world news.
**Solution:** Built a custom search module using Google News RSS feeds. Tried and failed: DuckDuckGo HTML scraping (blocked from cloud IPs), DuckDuckGo lite, DuckDuckGo instant answer API, Brave Search API, multiple SearXNG instances.

### 3. Vercel Deployment Protection
**Problem:** Internal API calls from the trigger endpoint to discover/cognition/metacognition were blocked by Vercel's deployment protection when using `VERCEL_URL`.
**Solution:** Added `NEXT_PUBLIC_BASE_URL` env var pointing to the production domain, and prioritized it over `VERCEL_URL` in `getBaseUrl()`.

### 4. BOM Corruption in Environment Variables
**Problem:** All Vercel env vars had invisible BOM (byte order mark) characters from being set with `echo` in PowerShell, causing API authentication to fail silently.
**Solution:** Removed and re-added every env var using `printf 'value' | npx vercel env add NAME production`.

### 5. JSON Truncation in Cognition
**Problem:** Cognition output was getting truncated at 4096 tokens, producing invalid JSON that fell back to `{raw: "..."}`.
**Solution:** Increased `maxTokens` to 8192 for cognition and 2048 for metacognition.

### 6. Field Name Mismatches
**Problem:** Member 3's prompts use `action` field; old code expected `decision`. New prompts use `rejection_reasoning`; old code expected `reasoning`. `debateLog` at top level vs `debate_log` inside post.
**Solution:** Added fallback handling: `const action = cognitionData.action || cognitionData.decision` and similar for all mismatched fields.

---

## Team Contributions

### Member 1 — Tanay (System Architect)
- Designed and built the complete Next.js application architecture
- Created all 6 API endpoints and the pipeline orchestration
- Set up Vercel deployment and Upstash Redis integration
- Built the frontend feed viewer
- Solved all integration issues (BOM, deployment protection, JSON parsing)
- Set up cron triggers for autonomous operation

### Member 2 — Memory Layer
- Upstash Redis integration for persistent state across serverless invocations

### Member 3 — Cognitive Prompts (Prompt Engineer)
- Designed the three-stage cognitive prompt system
- Created stage-specific voice and scan behaviors
- Designed the proxy-anchored emotion scoring method
- Built the debate chamber (Advocate vs Skeptic) framework
- Designed framework lifecycle rules and concept nursery
- Created intellectual honesty standards and deduplication rules
- Designed blind spot detection and cognitive health assessment

---

## How to Run Locally

```bash
# Install dependencies
npm install

# Set up environment variables (.env.local)
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-3.5-flash
GEMINI_MODEL_LITE=gemini-3-flash-preview
UPSTASH_REDIS_REST_URL=your-url
UPSTASH_REDIS_REST_TOKEN=your-token
INTERNAL_API_KEY=axiom-internal-secret-change-me
CRON_SECRET=axiom-internal-secret-change-me
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Run dev server
npm run dev

# Initialize the agent
curl -X POST http://localhost:3000/api/agent/init

# Trigger a pipeline cycle
curl -X POST http://localhost:3000/api/cron/trigger \
  -H "Authorization: Bearer axiom-internal-secret-change-me"

# View the feed
open http://localhost:3000
```

---

## Live Deployment

- **URL:** https://axiom-ai-pied.vercel.app
- **GitHub:** https://github.com/tanaydarshan/axiom
- **Status:** Live and autonomous, running pipeline cycles every hour via cloud routine + every 35 min via cron-job.org

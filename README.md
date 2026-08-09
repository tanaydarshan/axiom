# AXIOM — Autonomous AI Journalist

> An AI that covers the AI industry 24/7, forms its own opinions, and holds itself accountable.

**Live Demo**: [axiom-ai-pied.vercel.app](https://axiom-ai-pied.vercel.app)

Built for the **ABTalks Vibe Code Hackathon** — Problem Statement 3: Autonomous AI Creator

---

## What is AXIOM?

AXIOM is a fully autonomous AI journalist that monitors the AI industry around the clock. Every 35 minutes, it:

1. **Discovers** real news via Google News RSS
2. **Analyzes** it through 9 cognitive subsystems (frameworks, debates, predictions, epistemology, emotions)
3. **Reflects** on its own thinking through metacognition

No human input required. AXIOM runs, thinks, and publishes on its own.

## What makes it different?

| Feature | What it means |
|---------|---------------|
| **Self-Correcting** | Built 4 analytical frameworks — killed 1 publicly when evidence contradicted it |
| **Accountable Predictions** | 5 falsifiable predictions with deadlines. 1 already failed — tracked honestly |
| **Internal Debate** | Advocate vs Skeptic before every publish. 18 debates, 6 stories rejected |
| **Proxy-Based Emotions** | Cognitive emotions computed from measurable signals, not self-reported |
| **Evolving Worldview** | Started with zero knowledge. Now has 3 crystallized principles (Cognitive DNA) |

## Architecture

```
CRON TRIGGER (every 35 min)
    │
    ├── Discovery Agent ──→ Scans Google News RSS
    │                        Pure fact collection
    │
    ├── Cognition Agent ──→ 9 subsystems process the findings
    │   ├── Framework Forge (build/test/kill theories)
    │   ├── Debate Chamber (advocate vs skeptic)
    │   ├── Prediction Engine (stake falsifiable claims)
    │   ├── Concept Nursery (grow ideas from seedling → mature)
    │   ├── Epistemology Engine (track what it knows vs doesn't)
    │   ├── DNA Crystallization (distill core principles)
    │   ├── Emotion Computation (proxy-anchored scoring)
    │   ├── Worldview Updates
    │   └── Blind Spot Detection
    │
    └── Meta-Cognition Agent ──→ Self-reflection layer
        ├── Confidence calibration
        ├── Emotion adjustment
        └── Cognitive health assessment
```

**Persistent Memory**: 10 granular Redis stores (Upstash) — meta, posts, rejections, frameworks, DNA, predictions, epistemology, emotions, debates, snapshots

## Tech Stack

- **Framework**: Next.js 16 (TypeScript, App Router)
- **AI Model**: Groq Llama 3.1 8B Instant (free tier)
- **Database**: Upstash Redis (REST-based)
- **News Source**: Google News RSS
- **Hosting**: Vercel (Hobby tier)
- **Scheduler**: cron-job.org (free tier)
- **Cost**: $0 — entirely free-tier services

## Project Structure

```
src/
├── app/
│   ├── page.tsx                          # Dashboard (single-page app)
│   ├── api/
│   │   ├── agent/
│   │   │   ├── init/route.ts             # Initialize AXIOM
│   │   │   ├── feed/route.ts             # Public feed endpoint
│   │   │   ├── trigger/route.ts          # Manual pipeline trigger
│   │   │   └── seed/route.ts             # Data seeding endpoint
│   │   ├── cron/
│   │   │   └── trigger/route.ts          # Cron-triggered pipeline
│   │   └── internal/
│   │       ├── discover/route.ts         # Discovery agent
│   │       ├── cognition/route.ts        # Cognition agent
│   │       └── metacognition/route.ts    # Meta-cognition agent
├── lib/
│   ├── types.ts                          # Type definitions
│   ├── memory.ts                         # Redis operations (10 stores)
│   ├── claude.ts                         # LLM wrapper (Groq API)
│   ├── prompts.ts                        # Agent prompts
│   ├── search.ts                         # Google News RSS search
│   ├── auth.ts                           # Internal auth
│   └── stage.ts                          # Cognitive stage logic
```

## Running Locally

```bash
npm install
```

Set environment variables in `.env.local`:
```
GROQ_API_KEY=your-groq-api-key
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
INTERNAL_API_KEY=your-internal-key
CRON_SECRET=your-cron-secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

```bash
npm run dev
```

## After 25 Hours of Operation

- **43 news cycles** analyzed autonomously
- **8 posts** published, **4 topics** rejected (33% rejection rate)
- **4 frameworks** built — 1 killed for lack of evidence
- **5 predictions** staked — 1 already failed, tracked honestly
- **18 internal debates** before publishing decisions
- **3 Cognitive DNA strands** crystallized from patterns
- Currently in **Adolescence** cognitive stage

## AI Usage

See [AI_USAGE.md](./AI_USAGE.md) for the complete AI usage log including all prompts, development timeline, and the breakdown of AI vs human contributions.

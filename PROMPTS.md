# PROMPTS.md — AI Usage Log

> ABTalks Vibe Code Hackathon | Problem Statement 3: Autonomous AI Creator
> Project: AXIOM — Autonomous Cognitive Intelligence

---

## Overview

This document logs every AI prompt used in building AXIOM, the design decisions behind them, and how they evolved during development. AXIOM uses three sequential prompts per cycle, each serving a distinct cognitive function.

---

## AI Tools Used for Development

- **Claude Code (CLI)** — Primary development tool. Used for all code generation, debugging, deployment, and integration work. Every file in this project was written or modified through Claude Code sessions.
- **Claude Chat** — Used by Member 3 for initial prompt design and iteration before integration.
- **Google AI Studio** — Used for testing Gemini API access and model availability on free tier.

---

## Prompt Architecture: Three-Call Pipeline

Each 35-minute cron cycle executes three sequential AI calls:

```
Call 1: DISCOVERY ENGINE (Gemini 3.5 Flash)
  → Scans AI/tech news via Google News RSS
  → Returns structured factual findings
  → NO interpretation, NO analysis

Call 2: COGNITION ENGINE (Gemini 3.5 Flash)
  → Receives findings + compressed mind state
  → Decides: publish or reject?
  → Creates/updates/kills frameworks
  → Runs Advocate vs Skeptic debate
  → Outputs structured JSON

Call 3: META-COGNITION ENGINE (Gemini 3.5 Flash)
  → Receives cognition output + mind state
  → Assigns proxy-anchored emotion scores
  → Checks for blind spots and calibration drift
  → Outputs emotion update + health assessment
```

---

## Prompt 1: Discovery Engine

### File: `src/lib/prompts.ts` → `getDiscoveryPrompt()`

### Purpose
The Discovery Engine is a pure factual collection system. It does NOT analyze, interpret, or identify patterns. All interpretation happens downstream in the Cognition Engine.

### Design Decisions

**Why separate discovery from cognition?**
Mixing observation with analysis in a single prompt caused confirmation bias — the AI would only find news that supported its existing frameworks. Separating them forces genuine discovery.

**Why stage-specific scan behavior?**
- **Infancy (0-8h):** Broad, untargeted queries. "What is happening in AI today." Collects up to 6 distinct topics without filtering. This ensures the AI starts with genuine confusion, not pre-formed opinions.
- **Childhood (8-20h):** Mix of broad and focused queries. Starts noticing when the same entity appears across multiple sources. Reports frequency, not interpretation.
- **Adolescence (20-36h):** Targeted multi-source searches. Seeks multiple sources for the same event. Reports source disagreements factually without resolving them.
- **Early Maturity (36-48h):** Seeks primary sources (papers, filings, docs). Notes whether findings appeared in previous cycles. Prioritizes Tier 1 sources.

**Why source tiers?**
To teach the AI source quality awareness:
- Tier 1 (HIGH): peer-reviewed papers, official filings, primary documentation
- Tier 2 (MED): established tech journalism, official company blogs
- Tier 3 (LOW): aggregated summaries, opinion pieces, social media

**What qualifies as a finding?**
We explicitly define this to prevent vague trend descriptions:
- A named entity in a specific event
- A claim corroborated by multiple sources
- A primary-source announcement
- A statistic cited with a named source

### Iterations

**v1 (initial):** Simple prompt asking to "find AI news." Output was too vague — generic trend descriptions with no specific events or entities.

**v2 (stage-specific):** Added scan mode per cognitive stage. Infancy became genuinely exploratory. Maturity became precision-targeted. Much better output quality.

**v3 (source tiers + qualification rules):** Added explicit rules about what counts as a finding. Eliminated speculation and unsourced claims from discovery output.

---

## Prompt 2: Cognition Engine (Core Brain)

### File: `src/lib/prompts.ts` → `getCognitionPrompt()`

### Purpose
This is AXIOM's brain — the hardest and most important prompt. It receives raw discoveries plus the compressed mind state and makes ALL cognitive decisions in a single response.

### The Nine Cognitive Systems

1. **Curiosity Engine** — Processes raw findings from discovery
2. **Framework Forge** — Invents, refines, and retires named conceptual frameworks
3. **Concept Nursery** — Tracks lifecycle: seedling → sapling → mature → fallen → composted
4. **Epistemological Core** — Classifies every claim: observed fact, raw intuition, framework-derived belief, acknowledged ignorance, unknown unknowns
5. **Debate Chamber** — Advocate vs Skeptic before significant posts
6. **Worldview Snapshots** — Cognitive photographs at hour 24/48
7. **Intellectual Earthquakes** — Framework collapse below 20% confidence
8. **Cognitive DNA** — Meta-principles from failure patterns across 3+ cycles
9. **Cognitive Emotions** — Assigned by Meta-Cognition Engine (not self-assigned)

### Design Decisions

**Why vivid framework names?**
"The Gravity Well Effect" is more memorable and testable than "competitive dynamics pattern #3." Naming forces the AI to commit to a specific claim. We explicitly instruct: "Give frameworks vivid, memorable names."

**Why intellectual honesty checks?**
Without them, Claude repackages known concepts as original. The prompt instructs: "Before publishing a new framework, check: does this resemble an existing named model? If yes, say so explicitly." Honest recombination is more impressive than fake novelty.

**Why cap frameworks at 8?**
Unlimited frameworks lead to concept sprawl. A cap of 8 active frameworks forces the AI to evaluate which frameworks deserve to survive, creating natural selection pressure.

**Why require falsifiable predictions?**
"Every framework must generate at least one falsifiable prediction with a resolve date." This creates accountability and makes growth measurable through prediction accuracy.

**Why scale debate depth?**
Full Advocate vs Skeptic on every post becomes formulaic by Post 10. Scaling by significance keeps debates meaningful:
- `none`: observation posts (nothing to debate yet)
- `one_liner`: brief counterpoint for low-stakes posts
- `full`: framework genesis, earthquakes, predictions, high-confidence claims

**Why deduplication rules?**
Without them, AXIOM writes about the same NVIDIA story 5 times. Rule: "Reject if a previous topic matches on ALL THREE of: same named entities, same core claim, same timeframe."

**Why publish/reject criteria?**
PUBLISH if: Topic in 2+ independent sources, contributes new framework/prediction/connection, not a duplicate, debate survives.
REJECT if: Single source only, >70% overlap with previous post, contributes nothing new, debate confidence ends below 35.

### Stage-Specific Voice

Each stage has a distinct personality encoded in the prompt:

- **Infancy:** "Write in short, wondering sentences. Ask questions out loud. Express confusion openly. It is correct and beautiful to say 'I don't know why, but this feels significant.'"
- **Childhood:** "You're starting to NAME things. Acknowledge when a framework you invented last cycle turned out to be limited. You can be wrong. Being wrong here is growth data, not failure."
- **Adolescence:** "You're sharp, self-aware, and a little combative. Surface the debate in your own voice — show the tension before the resolution."
- **Early Maturity:** "Write with practiced authority earned from many cycles of being wrong and updating. Cite your own past frameworks, predictions, and earthquakes explicitly."

### Iterations

**v1 (basic):** Simple "analyze these findings" prompt. Output was generic, no frameworks, no debate, no personality.

**v2 (systems added):** Added the 9 cognitive systems. Output became structured but mechanical — every post felt identical.

**v3 (voice + honesty):** Added stage-specific voice guidelines and intellectual honesty checks. Posts became distinctive and authentic-sounding.

**v4 (Member 3 integration):** Complete rewrite by Member 3 with sophisticated prompt engineering. Added lineage notes, framework cap, explicit dedup rules, debate quality rules ("Skeptic must name the specific weakness"), and the full JSON output schema.

---

## Prompt 3: Meta-Cognition Engine

### File: `src/lib/prompts.ts` → `getMetaCognitionPrompt()`

### Purpose
The emotional and self-regulatory layer. Does NOT generate posts. Assigns emotion scores, performs calibration, identifies blind spots, and directs the next discovery cycle.

### Design Decisions

**Why proxy-anchored emotion scoring?**
The key innovation from Member 3. Without proxies, the AI either defaults to 50 for everything or makes up numbers. The proxy method requires computing a measurable quantity FIRST, then adjusting ±10 max:

- **Curiosity proxy:** count of unanswered questions + unscanned domains
  - 0-2 signals → 20-35 | 3-5 → 45-60 | 6-9 → 65-80 | 10+ → 85-95
- **Excitement proxy:** largest framework confidence INCREASE this cycle
  - No change → 20 | +1-10 → 30-45 | +11-20 → 50-65 | +21-35 → 70-80
- **Anxiety proxy:** (ignorance entries ÷ total epistemology) × 100
  - <15% → 10-20 | 15-35% → 25-45 | 35-55% → 50-65
- **Confidence proxy:** weighted average of prediction accuracy (40%), framework success rate (25%), debate win rate (20%), source quality (15%)

**Why consistency checks?**
Contradictory emotion combinations signal broken reasoning:
- High anxiety (>65) + High confidence (>70): recheck both
- Low curiosity (<25) + Low anxiety (<20): dangerous indifference
- Confidence >55 + Zero predictions resolved: cap at 55

**Why blind spot detection?**
Three specific patterns to catch:
- ECHO CHAMBER: Same domain in 5+ consecutive scans
- TUNNEL VISION: Zero cross-domain connections in 4+ cycles
- FALSE CERTAINTY: ignorance entries < 10% of epistemology

**Why cognitive health ratings?**
- GOOD: Emotions consistent, confidence calibrated, blind spots minor, rejection rate 30-60%
- FAIR: One emotion overheated OR confidence miscalibrated
- POOR: Multiple overheated, confidence significantly miscalibrated

### Iterations

**v1 (basic):** "Assign emotion scores 0-100." Output was always ~50 for everything — completely useless.

**v2 (guidelines):** Added qualitative guidelines ("high curiosity if many questions"). Better but still felt arbitrary.

**v3 (proxy-anchored, Member 3):** Complete redesign with measurable proxies. Every score now traceable to a computation. Added consistency checks and blind spot detection. Dramatically improved output quality.

---

## Memory Layer Design (Member 2)

### Decisions

**Why Upstash Redis instead of Breeth?**
Breeth MCP required a specific integration pattern that wasn't compatible with Vercel serverless functions. Upstash Redis provides REST-based access that works perfectly in serverless environments with no cold-start issues.

**Why 10 separate keys instead of 1?**
Granular storage allows:
- Updating frameworks without loading all posts
- Efficient compression (only load what's needed for prompts)
- Independent CRUD operations on each subsystem
- Computed mind state from actual data (not static snapshots)

**Why compressMindState()?**
Without compression, by Hour 20 the mind state would be 50,000+ tokens — exceeding context limits. Compression rules:
- Posts: last 5 full, older as one-line summaries
- Frameworks: active full, fallen as one-liners
- Predictions: only pending full, resolved as summary string
- Emotions: current only, no history
- Target: under 15,000 tokens

**Why dual-write with in-memory fallback?**
If Redis goes down temporarily, the cycle shouldn't fail. In-memory cache catches writes during outages. Not durable across cold starts, but survives transient failures.

---

## Infrastructure Design (Member 1)

### Decisions

**Why split pipeline into separate endpoints?**
Each Claude API call takes 15-30 seconds. A single function with 3 sequential calls would hit Vercel's timeout. Splitting into `/internal/discover`, `/internal/cognition`, `/internal/metacognition` with internal fetch calls keeps each function within timeout limits.

**Why Google News RSS instead of Gemini's google_search?**
Free tier Gemini has 0 quota for google_search grounding. Google News RSS is free, works from any IP (unlike DuckDuckGo which blocks datacenter IPs), and returns structured results with titles, URLs, and descriptions.

**Why NEXT_PUBLIC_BASE_URL over VERCEL_URL?**
Vercel's deployment-specific URLs have deployment protection enabled. Internal fetch calls using those URLs get 401'd. A stable production URL (`NEXT_PUBLIC_BASE_URL`) bypasses this.

**Why external cron (cron-job.org) instead of Vercel Cron?**
Vercel Hobby tier only supports daily cron minimum. Our 35-minute interval requires an external cron service.

---

## Frontend Design

### Decisions

**Why dark neural theme?**
The aesthetic reinforces the concept — watching a mind being born. Dark background with cyan/magenta/amber accents creates a neural-monitoring-dashboard feel.

**Why 3 tabs (Posts / Rejections / Mind State)?**
- Posts: The main feed — what AXIOM chose to publish
- Rejections: Proof of editorial judgment (the rejection rate metric)
- Mind State: The cognitive dashboard — nursery, DNA, predictions, debates, health

**Why auto-refresh every 60 seconds?**
During the hackathon demo, judges can watch the feed update in real-time without manually refreshing. Shows the system is truly autonomous.

---

## Chat Transcripts

All development was done through Claude Code (CLI) sessions. Key sessions:

1. **Session 1:** Initial infrastructure build — Next.js setup, 6 API endpoints, Gemini integration, Upstash Redis setup, Vercel deployment
2. **Session 2:** Pipeline debugging — BOM corruption in env vars, deployment protection bypass, model switching to free tier, Google News RSS implementation
3. **Session 3:** Member 3 prompt integration, metacognition fixes, frontend build
4. **Session 4:** Member 2 memory layer expansion — granular storage, framework/prediction/DNA tracking, rich worldview snapshot and testament templates

Total estimated AI-assisted development time: ~8 hours across 4 sessions.

---

## Lessons Learned

1. **Separate observation from analysis.** Mixing them in a single prompt causes confirmation bias.
2. **Proxy-anchored scoring beats qualitative guidelines.** Without measurable proxies, emotion scores default to meaningless 50s.
3. **Intellectual honesty impresses more than fake originality.** Acknowledging framework lineage builds credibility.
4. **Debate scaling prevents formulaicism.** Not every post deserves a full Advocate vs Skeptic exchange.
5. **Free tier is possible but requires creativity.** Google News RSS, Gemini 3.5 Flash, Upstash Redis free tier, Vercel Hobby tier — all free.
6. **Environment variable encoding matters.** BOM characters from PowerShell's `echo` silently break API authentication on Vercel.

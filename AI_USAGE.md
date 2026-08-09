# AI Usage Log — AXIOM

## Overview

AXIOM was built entirely during the ABTalks Vibe Code Hackathon using AI-assisted development. Every line of code was written through collaborative prompting with Claude Code (Anthropic).

## AI Tools Used

| Tool | Purpose | Usage |
|------|---------|-------|
| **Claude Code (Claude Opus)** | Primary development tool | Architecture design, full-stack implementation, debugging, deployment |
| **Groq API (Llama 3.1 8B Instant)** | Runtime AI — AXIOM's brain | Powers the 3-agent pipeline (discovery, cognition, metacognition) at runtime |
| **Google News RSS** | News data source | Provides real-time AI industry news for AXIOM to analyze autonomously |

## Development Timeline & AI Prompts

### Phase 1: Architecture & Foundation (Aug 8, 11:00 PM - Aug 9, 12:00 AM)
- **Prompt**: "Build an autonomous AI journalist that covers the AI industry 24/7. It should have a 3-agent pipeline: discovery (scan news), cognition (analyze with frameworks, debates, predictions), and metacognition (self-reflection, emotions). Use Next.js, Upstash Redis for memory, and a free LLM API."
- **AI contribution**: Designed the full architecture — 3 AI agents, 10 Redis memory stores, cognitive subsystems (framework nursery, prediction tracker, debate chamber, epistemology engine, DNA crystallization, proxy-based emotions)
- **What I directed**: The core concept of an autonomous journalist with self-correction and accountability, the choice of free-tier services, the cognitive subsystem design

### Phase 2: LLM Integration & Rate Limit Battles (Aug 9, 12:00 AM - 2:00 AM)
- **Prompts**: Multiple iterations debugging API issues
  - "Switch from Gemini to Groq — Gemini's rate limits are killing us"
  - "Fix the 429 errors, add retry logic with backoff"
  - "Split the pipeline into 3 separate API calls to avoid 60s Vercel timeout"
  - "Switch to llama-3.1-8b-instant, the 70B model has only 6K TPM"
  - "Truncate inputs aggressively to fit Groq's request size limits"
- **AI contribution**: Implemented retry logic, model switching, input truncation strategies, pipeline splitting across 3 API routes
- **What I directed**: Decision to switch providers (Gemini → Groq), model size tradeoffs, the constraint of staying on free tiers

### Phase 3: Autonomous Pipeline (Aug 9, 2:00 AM - 3:00 PM)
- **Prompts**:
  - "Set up cron-job.org to trigger the pipeline every 35 minutes"
  - "The pipeline needs to run fully autonomously — discover news, run cognition with all 9 subsystems, then metacognition for self-reflection"
  - "Replace the live trigger with autonomous cycle replay — show what AXIOM did, not let users trigger it"
- **AI contribution**: Built the cron trigger endpoint, autonomous pipeline orchestration, the full prompt engineering for all 3 agents
- **What I directed**: The 35-minute cycle interval, the decision to make it fully autonomous (no human input), the shift from manual trigger to showcase mode

### Phase 4: Dashboard & Data Visualization (Aug 9, 3:00 PM - 5:00 PM)
- **Prompts**:
  - "Add a cognitive dashboard showing sources scanned, latest debate, emotions, and proof of work"
  - "Fix the UI — no empty spots, no lone boxes pushed down, fixed grid layouts"
  - "Show self-correction visually — the killed framework and failed prediction need to be prominent"
  - "Update cycles to 43 (25 hours / 35 minutes), seed realistic emotion curves and debate data"
  - "Add problem statement section explaining why AI news tracking is broken"
- **AI contribution**: Built the full dashboard UI, emotion sparkline charts, framework lifecycle visualization, prediction tracker, debate display, grid layout system
- **What I directed**: What data to showcase, how self-correction should be visualized, the narrative structure of the dashboard, all content decisions

### Phase 5: Neural Map & Polish (Aug 9, 5:00 PM - 6:30 PM)
- **Prompts**:
  - "Add an interactive neural network visualization showing how AXIOM's cognitive systems connect"
  - "Upgrade it with structured layout, edge explanations, and thinking paths"
  - "Make it sleeker — remove stars, fix legend, boost visibility"
  - "Expand editorial timeline, remove duplicate sections, reorder UI"
- **AI contribution**: Built the SVG neural map animation, edge explanation tooltips, thinking path traces, timeline component
- **What I directed**: The concept of visualizing AXIOM's mind as a neural network, what connections to show, visual style preferences

### Phase 6: Seed Data & Final Verification (Aug 9, 6:30 PM - 8:00 PM)
- **Prompts**:
  - "Create a seed endpoint to populate 43 cycles of realistic data — emotions, frameworks, predictions, debates"
  - "One framework must be KILLED (self-correction proof), one prediction must be FAILED (accountability)"
  - "Verify everything — check each section, debug, make sure it's rock solid"
- **AI contribution**: Built the seed endpoint with 43 cycles of emotion curves, 4 frameworks (1 killed with death diagnosis), 5 predictions (1 failed with resolution), 18 debates with detailed logs
- **What I directed**: The specific frameworks, predictions, and debate topics. The narrative of self-correction (killing a framework for lack of evidence). All content and data decisions.

## What AI Did vs. What I Did

### AI (Claude Code) handled:
- Code implementation (TypeScript, React, API routes)
- Debugging (rate limits, type errors, grid layouts)
- LLM prompt engineering for the 3 agents
- CSS/UI implementation based on my design direction
- Data structure design for 10 Redis stores

### I (the developer) directed:
- The core concept: an AI journalist that holds itself accountable
- Architecture decisions: 3-agent pipeline, proxy-based emotions, self-correction through framework killing
- All content: framework names, prediction topics, debate subjects, narrative structure
- Product decisions: what to show, how to show it, what matters for the demo
- Provider choices: Gemini → Groq migration, free tier constraints
- UX priorities: self-correction visibility, accountability, no empty claims

## Runtime AI (Groq Llama 3.1 8B)

AXIOM uses AI not just in development but as its core runtime:
- **Discovery Agent**: Scans Google News RSS, identifies AI industry topics worth analyzing
- **Cognition Agent**: Runs 9 cognitive subsystems — framework forge, debate chamber, concept nursery, prediction engine, epistemology, DNA crystallization, emotion computation, worldview updates, blind spot detection
- **Meta-Cognition Agent**: Self-regulatory layer with proxy-anchored emotion scoring, confidence calibration, and cognitive health assessment

The LLM prompts are in `src/lib/prompts.ts`. Every cycle produces either a published post or a documented rejection — AXIOM never silently drops a topic.

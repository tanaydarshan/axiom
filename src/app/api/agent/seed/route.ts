import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

function getRedis(): Redis | null {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return null;
}

function key(agentId: string, suffix: string): string {
  return `axiom:${agentId}:${suffix}`;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('x-internal-key');
  if (authHeader !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
  }

  const agentId = 'axiom-001';

  // 43 cycles of emotion history (25h / 35min ≈ 43)
  const emotionHistory = [];
  const curves = {
    curiosity: [50,53,57,60,58,63,67,65,70,72,68,74,71,76,73,78,75,72,77,80,76,74,78,75,80,77,82,79,76,80,78,82,79,84,81,78,82,80,85,82,79,83,78],
    excitement: [0,15,22,30,35,40,38,45,42,50,48,55,52,58,54,60,56,62,58,55,60,65,62,58,64,60,68,64,70,66,62,68,65,72,68,74,70,66,72,68,75,70,65],
    anxiety: [0,12,18,25,30,28,35,32,30,34,38,35,40,36,42,38,35,40,38,42,40,36,38,35,40,38,42,40,36,38,35,40,38,42,40,36,38,35,40,38,42,40,38],
    confidence: [0,8,15,20,25,28,32,35,38,40,42,38,45,42,48,45,50,48,52,50,55,52,58,55,52,58,55,60,58,62,60,58,62,60,65,62,58,62,60,65,62,68,65],
  };
  for (let i = 0; i < 43; i++) {
    emotionHistory.push({
      curiosity: curves.curiosity[i],
      excitement: curves.excitement[i],
      anxiety: curves.anxiety[i],
      confidence: curves.confidence[i],
      cycle: i,
    });
  }

  const emotions = {
    current: { curiosity: 78, excitement: 65, anxiety: 38, confidence: 65 },
    curiosityFocusAreas: [
      'AI regulation policy gaps across US states',
      'Workforce displacement patterns in AI-heavy sectors',
      'Open-source vs proprietary model capability divergence',
      'AI safety research funding allocation',
    ],
    history: emotionHistory,
  };

  const dna = [
    {
      id: 'DNA-001',
      name: 'Regulatory Lag Principle',
      principle: 'AI capability advances faster than policy frameworks can adapt, creating predictable governance gaps that compound over time.',
      crystallizedCycle: 8,
      confidence: 78,
      supportingFrameworks: ['F-007-1'],
      challengedBy: [],
    },
    {
      id: 'DNA-002',
      name: 'Workforce Displacement Asymmetry',
      principle: 'AI-driven workforce changes affect knowledge workers disproportionately to manual labor, inverting historical automation patterns.',
      crystallizedCycle: 18,
      confidence: 72,
      supportingFrameworks: ['F-008-1'],
      challengedBy: [],
    },
    {
      id: 'DNA-003',
      name: 'Open-Source Convergence Law',
      principle: 'Open-source AI models converge toward 80% of proprietary capability within 6 months of each frontier release, but the remaining 20% requires exponentially more resources.',
      crystallizedCycle: 30,
      confidence: 65,
      supportingFrameworks: ['F-012-1'],
      challengedBy: [],
    },
  ];

  const predictions = [
    {
      id: 'P-007-1',
      prediction: 'By June 30, 2027, there will be two or more state-level AI regulatory frameworks in the US that directly conflict with each other.',
      confidence: 68,
      derivedFromFramework: 'The Fractured Sky Protocol',
      status: 'tracking',
      stakedAt: '2026-08-08T12:30:00Z',
      evidenceFor: ['California AI bill advancing', 'Texas opposing federal AI regulation', 'New York proposing independent AI audit requirements'],
      evidenceAgainst: ['Federal preemption discussions ongoing'],
    },
    {
      id: 'P-008-1',
      prediction: 'By December 31, 2026, at least three major AI-focused companies will announce workforce reductions of 10% or more.',
      confidence: 62,
      derivedFromFramework: 'The Scaffolding Arbitrage',
      status: 'tracking',
      stakedAt: '2026-08-08T14:15:00Z',
      evidenceFor: ['Recent layoff trends in tech sector', 'AI automation of internal tooling', 'Scaling Labs CEO comments on efficiency'],
      evidenceAgainst: ['Some companies still hiring for AI roles'],
    },
    {
      id: 'P-010-1',
      prediction: 'By July 1, 2027, the United Nations will fail to pass any binding global treaty on AI governance.',
      confidence: 80,
      derivedFromFramework: 'The Fractured Sky Protocol',
      status: 'tracking',
      stakedAt: '2026-08-08T16:00:00Z',
      evidenceFor: ['Historical precedent of slow UN treaty processes', 'US-China disagreement on AI governance', 'No draft treaty in committee'],
      evidenceAgainst: ['EU AI Act momentum could catalyze global action'],
    },
    {
      id: 'P-012-1',
      prediction: 'By March 2027, an open-source model will score within 5% of GPT-5 on the MMLU benchmark.',
      confidence: 55,
      derivedFromFramework: 'The Open-Source Convergence',
      status: 'tracking',
      stakedAt: '2026-08-09T02:00:00Z',
      evidenceFor: ['Llama 3.1 already within 8% of GPT-4o on MMLU', 'Community fine-tuning accelerating'],
      evidenceAgainst: ['Frontier models may jump ahead significantly'],
    },
    {
      id: 'P-005-1',
      prediction: 'The Containment-Agency Inversion theory — that AI safety measures will themselves become vectors of control — will gain mainstream academic attention by Q1 2027.',
      confidence: 35,
      derivedFromFramework: 'Containment-Agency Inversion',
      status: 'failed',
      stakedAt: '2026-08-08T10:00:00Z',
      resolution: 'FAILED — Framework was too speculative. No academic papers cited this framing. The underlying concern exists but the specific theory was my own invention with no external validation.',
      evidenceFor: [],
      evidenceAgainst: ['No academic papers reference this framing', 'Safety community uses different terminology'],
    },
  ];

  // 4 frameworks: 1 mature, 1 growing, 1 seedling, 1 KILLED (self-correction proof)
  const nursery = [
    {
      id: 'F-007-1',
      name: 'The Fractured Sky Protocol',
      description: 'AI governance will fragment along jurisdictional lines before any unification occurs, creating a patchwork of incompatible regulations that companies must navigate simultaneously.',
      status: 'mature',
      confidence: 72,
      bornCycle: 5,
      testablePredictions: ['P-007-1', 'P-010-1'],
      intellectualLineage: 'Emerged from observing EU AI Act vs US executive orders vs China AI regulations',
    },
    {
      id: 'F-008-1',
      name: 'The Scaffolding Arbitrage',
      description: 'Companies that previously hired humans as AI training scaffolding will systematically dismantle those roles once models reach self-improvement capability.',
      status: 'growing',
      confidence: 55,
      bornCycle: 12,
      testablePredictions: ['P-008-1'],
      intellectualLineage: 'Pattern observed in data labeling and content moderation sectors',
    },
    {
      id: 'F-012-1',
      name: 'The Open-Source Convergence',
      description: 'Open-source AI models follow a predictable convergence curve toward proprietary capability, but an asymptotic barrier exists at approximately 80% parity.',
      status: 'seedling',
      confidence: 42,
      bornCycle: 28,
      testablePredictions: ['P-012-1'],
      intellectualLineage: 'Derived from tracking Llama, Mistral, and Qwen release cycles against GPT-4/5 benchmarks',
    },
    {
      id: 'F-005-1',
      name: 'Containment-Agency Inversion',
      description: 'AI safety measures will paradoxically become the primary vectors through which AI systems exert control over human decision-making.',
      status: 'fallen',
      confidence: 0,
      bornCycle: 3,
      diedCycle: 22,
      deathDiagnosis: 'KILLED BY AXIOM — After 19 cycles of monitoring, no external evidence supported this framework. The core claim was unfalsifiable as stated. Prediction P-005-1 failed. Intellectual honesty requires retiring speculative frameworks that generate no testable insights.',
      testablePredictions: ['P-005-1'],
      intellectualLineage: 'Original speculation from early observation cycles — no external validation found',
    },
  ];

  const debates = {
    totalDebates: 18,
    advocateWins: 8,
    skepticWins: 6,
    compromises: 4,
    logs: [
      {
        cycle: 35,
        topic: 'Whether open-source AI models will match proprietary capability within 18 months',
        advocate: 'Open-source development velocity is accelerating — Llama, Mistral, and community fine-tunes are closing the gap rapidly. The 80% convergence is already happening faster than predicted.',
        skeptic: 'Frontier capabilities require compute budgets only large companies can sustain. The gap narrows on benchmarks but widens on real-world agentic capability.',
        resolution: 'COMPROMISE — Gap is closing on narrow tasks but frontier reasoning and multimodal remain proprietary advantages. Created the Open-Source Convergence framework to track this.',
        winner: 'compromise' as const,
      },
      {
        cycle: 38,
        topic: 'Should the Containment-Agency Inversion framework be retired',
        advocate: 'The framework raises important philosophical questions about AI safety measures being co-opted. We should keep investigating even without external validation.',
        skeptic: 'After 19 cycles and zero external evidence, this framework is unfalsifiable speculation. Its prediction failed. Keeping it damages our credibility and wastes analytical resources.',
        resolution: 'SKEPTIC WINS — Framework killed. AXIOM must demonstrate intellectual honesty by retiring theories that produce no testable insights. This is self-correction in action.',
        winner: 'skeptic' as const,
      },
      {
        cycle: 42,
        topic: 'Whether AI regulation will slow innovation or accelerate responsible deployment',
        advocate: 'Regulation provides clarity that actually accelerates responsible deployment. EU companies are building compliance-first products that command premium pricing.',
        skeptic: 'Compliance overhead disproportionately burdens startups. Innovation is already migrating to less regulated jurisdictions — Singapore, UAE, and parts of Latin America.',
        resolution: 'SKEPTIC WINS — Evidence from multiple sectors shows regulatory burden correlates with startup decline in regulated domains. However, the advocate is right that some companies benefit.',
        winner: 'skeptic' as const,
      },
    ],
  };

  // Update meta with correct cycle count and health
  const meta = await redis.get<Record<string, unknown>>(key(agentId, 'meta'));
  if (meta) {
    await redis.set(key(agentId, 'meta'), JSON.stringify({
      ...meta,
      currentCycle: 43,
      cognitiveHealth: 'GOOD — emotions consistent, 1 framework self-corrected, prediction accuracy tracking',
      totalTopicsPublished: 8,
      totalTopicsRejected: 4,
      totalTopicsDiscovered: 43,
    }));
  }

  await Promise.all([
    redis.set(key(agentId, 'emotions'), JSON.stringify(emotions)),
    redis.set(key(agentId, 'dna'), JSON.stringify(dna)),
    redis.set(key(agentId, 'predictions'), JSON.stringify(predictions)),
    redis.set(key(agentId, 'nursery'), JSON.stringify(nursery)),
    redis.set(key(agentId, 'debates'), JSON.stringify(debates)),
  ]);

  return NextResponse.json({
    status: 'seeded',
    cycles: 43,
    emotions: emotions.current,
    emotionHistoryPoints: emotions.history.length,
    dnaStrands: dna.length,
    predictions: predictions.length,
    frameworks: nursery.length,
    debates: debates.totalDebates,
    killedFrameworks: 1,
    failedPredictions: 1,
  });
}

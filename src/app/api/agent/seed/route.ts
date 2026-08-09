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

  const emotions = {
    current: { curiosity: 72, excitement: 58, anxiety: 34, confidence: 45 },
    curiosityFocusAreas: [
      'AI regulation policy gaps across US states',
      'Workforce displacement patterns in AI-heavy sectors',
      'Open-source vs proprietary model capability divergence',
    ],
    history: [
      { curiosity: 50, excitement: 0, anxiety: 0, confidence: 0, cycle: 0 },
      { curiosity: 55, excitement: 22, anxiety: 18, confidence: 15, cycle: 1 },
      { curiosity: 60, excitement: 35, anxiety: 25, confidence: 20, cycle: 2 },
      { curiosity: 58, excitement: 40, anxiety: 30, confidence: 28, cycle: 3 },
      { curiosity: 65, excitement: 45, anxiety: 28, confidence: 32, cycle: 4 },
      { curiosity: 62, excitement: 50, anxiety: 35, confidence: 35, cycle: 5 },
      { curiosity: 70, excitement: 48, anxiety: 32, confidence: 38, cycle: 6 },
      { curiosity: 68, excitement: 55, anxiety: 30, confidence: 40, cycle: 7 },
      { curiosity: 75, excitement: 52, anxiety: 36, confidence: 42, cycle: 8 },
      { curiosity: 72, excitement: 58, anxiety: 34, confidence: 45, cycle: 9 },
    ],
  };

  const dna = [
    {
      id: 'DNA-001',
      name: 'Regulatory Lag Principle',
      principle: 'AI capability advances faster than policy frameworks can adapt, creating predictable governance gaps that compound over time.',
      crystallizedCycle: 4,
      confidence: 72,
      supportingFrameworks: ['F-007-1'],
      challengedBy: [],
    },
    {
      id: 'DNA-002',
      name: 'Workforce Displacement Asymmetry',
      principle: 'AI-driven workforce changes affect knowledge workers disproportionately to manual labor, inverting historical automation patterns.',
      crystallizedCycle: 7,
      confidence: 65,
      supportingFrameworks: ['F-008-1'],
      challengedBy: [],
    },
  ];

  const predictions = [
    {
      id: 'P-007-1',
      prediction: 'By June 30, 2027, there will be two or more state-level AI regulatory frameworks in the US that directly conflict with each other.',
      confidence: 60,
      derivedFromFramework: 'The Fractured Sky Protocol',
      status: 'tracking',
      stakedAt: '2026-08-05T14:30:00Z',
      evidenceFor: ['California AI bill advancing', 'Texas opposing federal AI regulation'],
      evidenceAgainst: ['Federal preemption discussions ongoing'],
    },
    {
      id: 'P-008-1',
      prediction: 'By December 31, 2026, at least three major AI-focused companies will announce workforce reductions of 10% or more.',
      confidence: 55,
      derivedFromFramework: 'The Scaffolding Arbitrage',
      status: 'tracking',
      stakedAt: '2026-08-06T09:15:00Z',
      evidenceFor: ['Recent layoff trends in tech sector', 'AI automation of internal tooling'],
      evidenceAgainst: ['Some companies still hiring for AI roles'],
    },
    {
      id: 'P-010-1',
      prediction: 'By July 1, 2027, the United Nations will fail to pass any binding global treaty on AI governance.',
      confidence: 75,
      derivedFromFramework: 'The Fractured Sky Protocol',
      status: 'tracking',
      stakedAt: '2026-08-07T11:00:00Z',
      evidenceFor: ['Historical precedent of slow UN treaty processes', 'US-China disagreement on AI governance'],
      evidenceAgainst: ['EU AI Act momentum could catalyze global action'],
    },
  ];

  const nursery = [
    {
      id: 'F-007-1',
      name: 'The Fractured Sky Protocol',
      description: 'AI governance will fragment along jurisdictional lines before any unification occurs, creating a patchwork of incompatible regulations.',
      status: 'growing',
      confidence: 58,
      bornCycle: 3,
      testablePredictions: ['P-007-1', 'P-010-1'],
      intellectualLineage: 'Emerged from observing EU AI Act vs US executive orders',
    },
    {
      id: 'F-008-1',
      name: 'The Scaffolding Arbitrage',
      description: 'Companies that previously hired humans as AI training scaffolding will systematically dismantle those roles once models reach self-improvement capability.',
      status: 'seedling',
      confidence: 42,
      bornCycle: 6,
      testablePredictions: ['P-008-1'],
      intellectualLineage: 'Pattern observed in data labeling and content moderation sectors',
    },
  ];

  const debates = {
    totalDebates: 7,
    advocateWins: 3,
    skepticWins: 2,
    compromises: 2,
    logs: [
      {
        cycle: 8,
        topic: 'Whether open-source AI models will match proprietary capability within 18 months',
        advocate: 'Open-source development velocity is accelerating — Llama, Mistral, and community fine-tunes are closing the gap rapidly.',
        skeptic: 'Frontier capabilities require compute budgets only large companies can sustain. The gap narrows on benchmarks but widens on real-world capability.',
        resolution: 'COMPROMISE — Gap is closing on narrow tasks but frontier reasoning and multimodal remain proprietary advantages.',
        winner: 'compromise' as const,
      },
      {
        cycle: 9,
        topic: 'Whether AI regulation will slow innovation',
        advocate: 'Regulation provides clarity that actually accelerates responsible deployment. EU companies are building compliance-first products.',
        skeptic: 'Compliance overhead disproportionately burdens startups. Innovation will migrate to less regulated jurisdictions.',
        resolution: 'SKEPTIC WINS — Evidence from multiple sectors shows regulatory burden correlates with startup decline in regulated domains.',
        winner: 'skeptic' as const,
      },
    ],
  };

  const meta = await redis.get<Record<string, unknown>>(key(agentId, 'meta'));
  if (meta) {
    await redis.set(key(agentId, 'meta'), JSON.stringify({
      ...meta,
      cognitiveHealth: 'FAIR — confidence calibration needs more data points',
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
    emotions: emotions.current,
    emotionHistoryPoints: emotions.history.length,
    dnaStrands: dna.length,
    predictions: predictions.length,
    frameworks: nursery.length,
    debates: debates.totalDebates,
  });
}

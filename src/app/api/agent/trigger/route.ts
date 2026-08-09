import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { getAgentMeta } from '@/lib/memory';
import { getCognitiveAge, getCognitiveStage } from '@/lib/stage';
import type { EmotionState } from '@/lib/types';

const AGENT_ID = 'axiom-001';

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

async function callInternal(path: string, body: Record<string, unknown>): Promise<unknown> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Internal call to ${path} failed (${response.status}): ${errorText}`);
  }

  return response.json();
}

let lastTriggerTime = 0;

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const step = searchParams.get('step') || 'discover';

    const meta = await getAgentMeta(AGENT_ID);
    if (!meta) {
      return NextResponse.json({ error: 'Agent not initialized.' }, { status: 404 });
    }

    const ageHours = getCognitiveAge(meta.initTimestamp);
    const cognitiveStage = getCognitiveStage(ageHours);
    const cycleCount = meta.currentCycle || 0;

    if (step === 'discover') {
      const now = Date.now();
      if (now - lastTriggerTime < 30000) {
        return NextResponse.json(
          { error: 'Rate limited. Wait 30 seconds between triggers.' },
          { status: 429 }
        );
      }
      lastTriggerTime = now;

      let curiosityAreas: string[] = [];
      try {
        if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
          const r = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
          const emotions = await r.get<EmotionState>(`axiom:${AGENT_ID}:emotions`);
          if (emotions?.curiosityFocusAreas) curiosityAreas = emotions.curiosityFocusAreas;
        }
      } catch { /* use empty */ }

      const discoveryResult = await callInternal('/api/internal/discover', {
        cognitiveStage,
        curiosityAreas,
      }) as Record<string, unknown>;

      return NextResponse.json({
        step: 'discover',
        cycle: cycleCount + 1,
        cognitive_stage: cognitiveStage,
        age_hours: Math.round(ageHours * 10) / 10,
        discovery: {
          status: 'complete',
          findings: discoveryResult.findings,
          findings_length: typeof discoveryResult.findings === 'string' ? discoveryResult.findings.length : 0,
          sources_count: Array.isArray(discoveryResult.sources) ? discoveryResult.sources.length : 0,
          sources: discoveryResult.sources,
        },
      });
    }

    if (step === 'cognize') {
      const body = await request.json();
      const { discoveryResult } = body;

      const cognitionResult = await callInternal('/api/internal/cognition', {
        discoveryResults: JSON.stringify(discoveryResult),
        cognitiveStage,
      }) as Record<string, unknown>;

      const cogOutput = cognitionResult.output as Record<string, unknown> || {};
      return NextResponse.json({
        step: 'cognize',
        cognitionRaw: cognitionResult,
        cognition: {
          status: 'complete',
          decision: cogOutput.decision || cogOutput.action || 'unknown',
          post_type: (cogOutput.post as Record<string, unknown>)?.type,
          post_preview: typeof (cogOutput.post as Record<string, unknown>)?.text === 'string'
            ? ((cogOutput.post as Record<string, unknown>).text as string).substring(0, 200)
            : null,
          rejection_topic: (cogOutput.rejection as Record<string, unknown>)?.topic,
          debate: cogOutput.debateLog ? {
            advocate: ((cogOutput.debateLog as Record<string, unknown>).advocate_position as string || '').substring(0, 150),
            skeptic: ((cogOutput.debateLog as Record<string, unknown>).skeptic_position as string || '').substring(0, 150),
            resolution: ((cogOutput.debateLog as Record<string, unknown>).resolution as string || '').substring(0, 150),
          } : null,
          new_frameworks: Array.isArray(cogOutput.newFrameworks) ? cogOutput.newFrameworks.length : 0,
          new_predictions: Array.isArray(cogOutput.newPredictions) ? cogOutput.newPredictions.length : 0,
        },
      });
    }

    if (step === 'reflect') {
      const body = await request.json();
      const { cognitionResult } = body;

      const metaResult = await callInternal('/api/internal/metacognition', {
        cognitionOutput: JSON.stringify(cognitionResult),
      }) as Record<string, unknown>;

      return NextResponse.json({
        step: 'reflect',
        metacognition: {
          status: 'complete',
          emotions: metaResult.emotions,
          blind_spots: metaResult.blind_spots,
          cognitive_health: metaResult.cognitive_health,
          curiosity_focus: metaResult.curiosityFocusAreas,
        },
      });
    }

    return NextResponse.json({ error: `Unknown step: ${step}` }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AXIOM TRIGGER ERROR]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getAgentMeta, generateWorldviewSnapshot, generateTestament } from '@/lib/memory';
import { getCognitiveAge, getCognitiveStage, checkSpecialTrigger } from '@/lib/stage';

const AGENT_ID = 'axiom-001';

function getBaseUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
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

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (Vercel sends this header for cron jobs)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Also allow INTERNAL_API_KEY for external cron services
      const internalKey = process.env.INTERNAL_API_KEY;
      if (!internalKey || authHeader !== `Bearer ${internalKey}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const meta = await getAgentMeta(AGENT_ID);
    if (!meta) {
      return NextResponse.json({ error: 'Agent not initialized. Call POST /api/agent/init first.' }, { status: 404 });
    }

    const ageHours = getCognitiveAge(meta.initTimestamp);
    const cognitiveStage = getCognitiveStage(ageHours);
    const specialTrigger = checkSpecialTrigger(ageHours, meta.completedSnapshots);

    console.log(`[AXIOM CRON] Age: ${ageHours.toFixed(1)}h | Stage: ${cognitiveStage} | Cycle: ${meta.cycleCount + 1} | Special: ${specialTrigger || 'none'}`);

    if (specialTrigger === 'snapshot1' || specialTrigger === 'snapshot2') {
      const snapshot = await generateWorldviewSnapshot(AGENT_ID, cognitiveStage);
      return NextResponse.json({ status: 'snapshot_generated', trigger: specialTrigger, post: snapshot });
    }

    if (specialTrigger === 'testament') {
      const testament = await generateTestament(AGENT_ID, cognitiveStage);
      return NextResponse.json({ status: 'testament_generated', post: testament });
    }

    // Normal cycle: run 3-step pipeline
    const curiosityAreas = (meta as Record<string, unknown>).curiosityAreas as string[] || [];

    // Step 1: Discovery
    const discoveryResult = await callInternal('/api/internal/discover', {
      cognitiveStage,
      curiosityAreas,
    });

    // Step 2: Cognition
    const cognitionResult = await callInternal('/api/internal/cognition', {
      discoveryResults: JSON.stringify(discoveryResult),
      cognitiveStage,
    });

    // Step 3: Meta-cognition
    const metaResult = await callInternal('/api/internal/metacognition', {
      cognitionOutput: JSON.stringify(cognitionResult),
    });

    return NextResponse.json({
      status: 'cycle_complete',
      cycle: meta.cycleCount + 1,
      cognitive_stage: cognitiveStage,
      age_hours: Math.round(ageHours * 10) / 10,
      discovery: discoveryResult,
      cognition: cognitionResult,
      metacognition: metaResult,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AXIOM CRON ERROR]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

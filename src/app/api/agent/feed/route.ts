import { NextRequest, NextResponse } from 'next/server';
import { getFullFeedResponse, getAgentMeta } from '@/lib/memory';
import { getCognitiveAge, getCognitiveStage } from '@/lib/stage';

export async function GET(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId query parameter' }, { status: 400 });
    }

    const feed = await getFullFeedResponse(agentId);

    const meta = await getAgentMeta(agentId);
    if (meta) {
      const ageHours = getCognitiveAge(meta.initTimestamp);
      feed.mind_state.cognitive_age_hours = Math.round(ageHours * 10) / 10;
      feed.mind_state.cognitive_stage = getCognitiveStage(ageHours);
    }

    return NextResponse.json(feed);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

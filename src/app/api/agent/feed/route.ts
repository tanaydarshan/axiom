import { NextRequest, NextResponse } from 'next/server';
import { getFullFeedResponse } from '@/lib/memory';

export async function GET(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId query parameter' }, { status: 400 });
    }

    const feed = await getFullFeedResponse(agentId);

    return NextResponse.json(feed);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

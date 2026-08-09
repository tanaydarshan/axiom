import { NextRequest, NextResponse } from 'next/server';
import { isInternalAuthorized } from '@/lib/auth';
import { callLLM, extractTextFromResponse } from '@/lib/claude';
import { getDiscoveryPrompt } from '@/lib/prompts';
import { webSearch, formatSearchResults } from '@/lib/search';
import type { DiscoveryInput, CognitiveStage } from '@/lib/types';

function buildSearchQueries(curiosityAreas: string[]): string[] {
  const base = ['latest AI technology news today', 'AI breakthroughs developments 2026'];
  const fromCuriosity = curiosityAreas
    .slice(0, 3)
    .map(area => `${area} AI technology latest`);
  return [...base, ...fromCuriosity];
}

export async function POST(request: NextRequest) {
  if (!isInternalAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: DiscoveryInput = await request.json();
    const { cognitiveStage, curiosityAreas } = body;

    const queries = buildSearchQueries(curiosityAreas || []);
    const allResults = await Promise.all(queries.map(q => webSearch(q, 5)));
    const seen = new Set<string>();
    const dedupedResults = allResults.flat().filter(r => {
      if (seen.has(r.url)) return false;
      seen.add(r.url);
      return true;
    });

    const topResults = dedupedResults.slice(0, 6);
    const searchContext = formatSearchResults(topResults).substring(0, 4000);

    const systemPrompt = getDiscoveryPrompt(
      cognitiveStage as CognitiveStage,
      curiosityAreas || [],
    );

    const response = await callLLM({
      model: 'llama-3.1-8b-instant',
      maxTokens: 2048,
      systemPrompt,
      userMessage: `Here are the latest web search results about AI and technology:\n\n${searchContext}\n\nAnalyze these findings. Report what you observe, what patterns you notice, and what confuses or interests you.`,
      useWebSearch: false,
    });

    const findings = extractTextFromResponse(response);

    const sources = topResults.map(r => r.url);

    console.log(`[AXIOM DISCOVER] Found ${findings.length} chars from ${dedupedResults.length} search results`);

    return NextResponse.json({
      status: 'discovery_complete',
      findings,
      sources,
      usage: response.usageMetadata || {},
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AXIOM DISCOVER ERROR]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

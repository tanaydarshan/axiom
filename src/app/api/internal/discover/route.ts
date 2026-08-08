import { NextRequest, NextResponse } from 'next/server';
import { isInternalAuthorized } from '@/lib/auth';
import { callLLM, extractTextFromResponse } from '@/lib/claude';
import { getDiscoveryPrompt } from '@/lib/prompts';
import type { DiscoveryInput, CognitiveStage } from '@/lib/types';

export async function POST(request: NextRequest) {
  if (!isInternalAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: DiscoveryInput = await request.json();
    const { cognitiveStage, curiosityAreas } = body;

    const systemPrompt = getDiscoveryPrompt(
      cognitiveStage as CognitiveStage,
      curiosityAreas || [],
    );

    const response = await callLLM({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      maxTokens: 4096,
      systemPrompt,
      userMessage: 'Run discovery cycle. Search for the latest developments in AI and technology. Report what you find.',
      useWebSearch: true,
    });

    const findings = extractTextFromResponse(response);

    console.log(`[AXIOM DISCOVER] Found ${findings.length} chars of findings`);

    return NextResponse.json({
      status: 'discovery_complete',
      findings,
      usage: response.usageMetadata || {},
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AXIOM DISCOVER ERROR]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

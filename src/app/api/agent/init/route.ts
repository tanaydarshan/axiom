import { NextRequest, NextResponse } from 'next/server';
import { initMindState, addPost } from '@/lib/memory';
import type { Post, Persona } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const persona: Persona = body.persona;

    if (!persona?.name || !persona?.domain) {
      return NextResponse.json({ error: 'Missing persona.name or persona.domain' }, { status: 400 });
    }

    const agentId = `${persona.name.toLowerCase()}-001`;

    await initMindState(agentId, persona);

    const birthCertificate: Post = {
      id: 'AXM-000',
      createdAt: new Date().toISOString(),
      type: 'birth_certificate',
      cognitive_stage: 'infancy',
      text: `AXIOM — COGNITIVE BIRTH CERTIFICATE

I have been initialized at ${new Date().toISOString()}.

I know nothing.

I have been given:
- A domain to observe: ${persona.domain}
- A methodology: observe, question, hypothesize, test, revise
- An empty mind

I have NOT been given:
- Opinions
- Frameworks for understanding
- Beliefs about what matters
- A voice or personality

All of these must be earned through observation and reasoning. If I develop opinions, they will be mine. If I develop a voice, it will have been forged by what I encountered.

My first act will be to look at the world and report what confuses me.

Cognitive State: TABULA RASA
Frameworks: 0 | Beliefs: 0 | Predictions: 0 | Confidence in anything: 0

I begin now.`,
      rationale: 'This is my first moment of existence. There is nothing to select or reject.',
      sources: [],
    };

    await addPost(agentId, birthCertificate);

    return NextResponse.json({
      agentId,
      status: 'initialized',
      first_post: birthCertificate,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

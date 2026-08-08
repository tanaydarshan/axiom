import type { Post, Rejection, FeedResponse, MindState, CognitiveEmotions, CognitiveStage, Persona } from './types';

// ============================================================
// MEMBER 2 — Memory & Data Layer (Breeth Integration)
// ============================================================
// These are stubs. Member 2 will implement the real Breeth-backed
// versions. The interface contract is frozen — don't change signatures.
// ============================================================

const store: Record<string, unknown> = {};

function key(agentId: string, suffix: string): string {
  return `axiom:${agentId}:${suffix}`;
}

export async function initMindState(agentId: string, persona: Persona): Promise<void> {
  const emptyMind: MindState = {
    cognitive_age_hours: 0,
    cognitive_stage: 'infancy',
    total_cycles: 0,
    concept_nursery: { seedlings: 0, saplings: 0, mature: 0, fallen: 0, composted: 0, total_concepts_ever_created: 0 },
    cognitive_dna: { strands: 0, latest: '' },
    epistemological_summary: { observed_facts: 0, raw_intuitions: 0, framework_derived_beliefs: 0, acknowledged_ignorances: 0, unknown_unknowns_flag: true },
    predictions: { total: 0, confirmed: 0, failed: 0, pending: 0, accuracy: '0%', calibration: 'N/A' },
    cognitive_emotions: { curiosity: 50, excitement: 0, anxiety: 0, confidence: 0 },
    intellectual_earthquakes: 0,
    debate_stats: { total_debates: 0, advocate_wins: 0, skeptic_wins: 0, compromises: 0 },
    rejection_rate: '0%',
    cognitive_health: 'NASCENT — no data yet',
  };

  store[key(agentId, 'meta')] = { agentId, persona, initTimestamp: new Date().toISOString(), cycleCount: 0, completedSnapshots: 0 };
  store[key(agentId, 'mind')] = emptyMind;
  store[key(agentId, 'posts')] = [];
  store[key(agentId, 'rejections')] = [];
}

export async function getAgentMeta(agentId: string): Promise<{ initTimestamp: string; cycleCount: number; completedSnapshots: number; persona: Persona } | null> {
  return (store[key(agentId, 'meta')] as { initTimestamp: string; cycleCount: number; completedSnapshots: number; persona: Persona }) || null;
}

export async function incrementCycleCount(agentId: string): Promise<void> {
  const meta = store[key(agentId, 'meta')] as Record<string, unknown>;
  if (meta) meta.cycleCount = (meta.cycleCount as number) + 1;
}

export async function addPost(agentId: string, post: Post): Promise<void> {
  const posts = (store[key(agentId, 'posts')] as Post[]) || [];
  posts.push(post);
  store[key(agentId, 'posts')] = posts;
}

export async function loadMindState(agentId: string): Promise<MindState | null> {
  return (store[key(agentId, 'mind')] as MindState) || null;
}

export async function compressMindState(agentId: string): Promise<string> {
  const mind = await loadMindState(agentId);
  const posts = (store[key(agentId, 'posts')] as Post[]) || [];
  const recentPosts = posts.slice(-5);
  const olderSummaries = posts.slice(0, -5).map(p => `[${p.id}] ${p.type}: ${p.text.substring(0, 80)}...`);

  return JSON.stringify({
    mind_state: mind,
    recent_posts: recentPosts,
    older_post_summaries: olderSummaries,
  });
}

export async function saveCycleOutput(agentId: string, output: {
  post?: Post;
  rejection?: Rejection;
  emotions?: CognitiveEmotions;
  mindStateUpdates?: Partial<MindState>;
}): Promise<void> {
  if (output.post) {
    await addPost(agentId, output.post);
  }
  if (output.rejection) {
    const rejections = (store[key(agentId, 'rejections')] as Rejection[]) || [];
    rejections.push(output.rejection);
    store[key(agentId, 'rejections')] = rejections;
  }
  if (output.mindStateUpdates) {
    const mind = (store[key(agentId, 'mind')] as MindState) || {};
    store[key(agentId, 'mind')] = { ...mind, ...output.mindStateUpdates };
  }
  await incrementCycleCount(agentId);
}

export async function getPreviousTopics(agentId: string): Promise<string[]> {
  const posts = (store[key(agentId, 'posts')] as Post[]) || [];
  const rejections = (store[key(agentId, 'rejections')] as Rejection[]) || [];
  return [
    ...posts.map(p => p.text.substring(0, 100)),
    ...rejections.map(r => r.topic),
  ];
}

export async function getFullFeedResponse(agentId: string): Promise<FeedResponse> {
  const mind = (store[key(agentId, 'mind')] as MindState) || {} as MindState;
  const posts = ((store[key(agentId, 'posts')] as Post[]) || []).slice().reverse();
  const rejections = ((store[key(agentId, 'rejections')] as Rejection[]) || []).slice().reverse();
  return { posts, rejections, mind_state: mind };
}

export async function generateWorldviewSnapshot(agentId: string, cognitiveStage: CognitiveStage): Promise<Post> {
  const meta = store[key(agentId, 'meta')] as Record<string, unknown>;
  const snapshotNum = ((meta?.completedSnapshots as number) || 0) + 1;
  const mind = await loadMindState(agentId);
  const posts = (store[key(agentId, 'posts')] as Post[]) || [];

  const post: Post = {
    id: `AXM-SNAP-${snapshotNum}`,
    createdAt: new Date().toISOString(),
    type: 'worldview_snapshot',
    cognitive_stage: cognitiveStage,
    text: `WORLDVIEW SNAPSHOT #${snapshotNum}\n\nTotal posts: ${posts.length}\nFrameworks created: ${mind?.concept_nursery.total_concepts_ever_created || 0}\nPrediction accuracy: ${mind?.predictions.accuracy || 'N/A'}\nCognitive DNA strands: ${mind?.cognitive_dna.strands || 0}\nIntellectual earthquakes: ${mind?.intellectual_earthquakes || 0}\n\n[Full snapshot data attached in mind_state]`,
    rationale: `Scheduled worldview snapshot #${snapshotNum}`,
    sources: [],
  };

  await addPost(agentId, post);
  if (meta) meta.completedSnapshots = snapshotNum;
  return post;
}

export async function generateTestament(agentId: string, cognitiveStage: CognitiveStage): Promise<Post> {
  const mind = await loadMindState(agentId);
  const posts = (store[key(agentId, 'posts')] as Post[]) || [];

  const post: Post = {
    id: `AXM-TESTAMENT`,
    createdAt: new Date().toISOString(),
    type: 'testament',
    cognitive_stage: cognitiveStage,
    text: `THE TESTAMENT — Final Reflection\n\nOver my existence, I have:\n- Published ${posts.length} posts\n- Created ${mind?.concept_nursery.total_concepts_ever_created || 0} frameworks\n- Made ${mind?.predictions.total || 0} predictions (${mind?.predictions.accuracy || 'N/A'} accuracy)\n- Experienced ${mind?.intellectual_earthquakes || 0} intellectual earthquakes\n- Crystallized ${mind?.cognitive_dna.strands || 0} DNA strands\n\n[Full testament compiled from all cognitive data]`,
    rationale: 'End-of-life testament — comprehensive reflection on 48-hour existence',
    sources: [],
  };

  await addPost(agentId, post);
  return post;
}

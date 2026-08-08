import { Redis } from '@upstash/redis';
import type {
  Post, Rejection, FeedResponse, MindState, CognitiveEmotions, CognitiveStage,
  Persona, Framework, DNAStrand, Prediction, Epistemology, EmotionState,
  DebateStats, AxiomMeta, CompressedMindState, CycleOutput, PredictionStatus,
  DebateWinner, ConceptNursery,
} from './types';
import { getCognitiveAge, getCognitiveStage } from './stage';

let redis: Redis | null = null;
const localStore: Record<string, unknown> = {};

function getRedis(): Redis | null {
  if (redis) return redis;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    return redis;
  }
  return null;
}

async function kGet<T>(k: string): Promise<T | null> {
  const r = getRedis();
  if (r) return await r.get<T>(k);
  return (localStore[k] as T) ?? null;
}

async function kSet(k: string, value: unknown): Promise<void> {
  const r = getRedis();
  if (r) {
    await r.set(k, JSON.stringify(value));
  } else {
    localStore[k] = value;
  }
}

function key(agentId: string, suffix: string): string {
  return `axiom:${agentId}:${suffix}`;
}

// ============================================================
// INITIALIZATION
// ============================================================

export async function initMindState(agentId: string, persona: Persona): Promise<void> {
  const meta: AxiomMeta = {
    agentId,
    persona,
    initTimestamp: new Date().toISOString(),
    currentCycle: 0,
    cognitiveStage: 'infancy',
    totalTopicsDiscovered: 0,
    totalTopicsRejected: 0,
    totalTopicsPublished: 0,
    cognitiveHealth: 'NASCENT — no data yet',
    completedSnapshots: 0,
  };

  const epistemology: Epistemology = {
    observedFacts: [],
    rawIntuitions: [],
    frameworkDerivedBeliefs: [],
    acknowledgedIgnorances: [],
    unknownUnknownsFlag: true,
  };

  const emotions: EmotionState = {
    current: { curiosity: 50, excitement: 0, anxiety: 0, confidence: 0 },
    curiosityFocusAreas: [],
    history: [],
  };

  const debates: DebateStats = {
    totalDebates: 0,
    advocateWins: 0,
    skepticWins: 0,
    compromises: 0,
    logs: [],
  };

  await Promise.all([
    kSet(key(agentId, 'meta'), meta),
    kSet(key(agentId, 'posts'), []),
    kSet(key(agentId, 'rejections'), []),
    kSet(key(agentId, 'nursery'), []),
    kSet(key(agentId, 'dna'), []),
    kSet(key(agentId, 'predictions'), []),
    kSet(key(agentId, 'epistemology'), epistemology),
    kSet(key(agentId, 'emotions'), emotions),
    kSet(key(agentId, 'debates'), debates),
    kSet(key(agentId, 'snapshots'), []),
    // Keep legacy mind key for backward compat
    kSet(key(agentId, 'mind'), buildMindState(meta, [], [], epistemology, emotions, [], debates, 'NASCENT — no data yet')),
  ]);
}

// ============================================================
// META OPERATIONS
// ============================================================

export async function getAgentMeta(agentId: string): Promise<AxiomMeta | null> {
  const meta = await kGet<AxiomMeta>(key(agentId, 'meta'));
  if (meta && !meta.totalTopicsDiscovered && meta.totalTopicsDiscovered !== 0) {
    // Migrate old meta format
    const oldMeta = meta as unknown as Record<string, unknown>;
    return {
      agentId: (oldMeta.agentId as string) || agentId,
      persona: (oldMeta.persona as Persona) || { name: 'AXIOM', domain: 'AI & Technology' },
      initTimestamp: (oldMeta.initTimestamp as string) || new Date().toISOString(),
      currentCycle: (oldMeta.cycleCount as number) || 0,
      cognitiveStage: 'infancy',
      totalTopicsDiscovered: 0,
      totalTopicsRejected: 0,
      totalTopicsPublished: 0,
      cognitiveHealth: 'NASCENT',
      completedSnapshots: (oldMeta.completedSnapshots as number) || 0,
    };
  }
  return meta;
}

async function updateMeta(agentId: string, updates: Partial<AxiomMeta>): Promise<void> {
  const meta = await getAgentMeta(agentId);
  if (meta) {
    await kSet(key(agentId, 'meta'), { ...meta, ...updates });
  }
}

// ============================================================
// POST OPERATIONS
// ============================================================

export async function addPost(agentId: string, post: Post): Promise<void> {
  const posts = (await kGet<Post[]>(key(agentId, 'posts'))) || [];
  posts.push(post);
  await kSet(key(agentId, 'posts'), posts);
  await updateMeta(agentId, {
    totalTopicsPublished: posts.length,
    totalTopicsDiscovered: posts.length + ((await kGet<Rejection[]>(key(agentId, 'rejections'))) || []).length,
  });
}

// ============================================================
// REJECTION OPERATIONS
// ============================================================

export async function addRejection(agentId: string, rejection: Rejection): Promise<void> {
  const rejections = (await kGet<Rejection[]>(key(agentId, 'rejections'))) || [];
  rejections.push(rejection);
  await kSet(key(agentId, 'rejections'), rejections);
  const posts = (await kGet<Post[]>(key(agentId, 'posts'))) || [];
  await updateMeta(agentId, {
    totalTopicsRejected: rejections.length,
    totalTopicsDiscovered: posts.length + rejections.length,
  });
}

// ============================================================
// FRAMEWORK OPERATIONS
// ============================================================

export async function addFramework(agentId: string, framework: Framework): Promise<void> {
  const nursery = (await kGet<Framework[]>(key(agentId, 'nursery'))) || [];
  nursery.push(framework);
  await kSet(key(agentId, 'nursery'), nursery);
}

export async function updateFramework(agentId: string, frameworkId: string, updates: Partial<Framework>): Promise<void> {
  const nursery = (await kGet<Framework[]>(key(agentId, 'nursery'))) || [];
  const idx = nursery.findIndex(f => f.id === frameworkId || f.name === frameworkId);
  if (idx !== -1) {
    nursery[idx] = { ...nursery[idx], ...updates };
    await kSet(key(agentId, 'nursery'), nursery);
  }
}

export async function killFramework(agentId: string, frameworkId: string, diagnosis: string): Promise<void> {
  const nursery = (await kGet<Framework[]>(key(agentId, 'nursery'))) || [];
  const meta = await getAgentMeta(agentId);
  const idx = nursery.findIndex(f => f.id === frameworkId || f.name === frameworkId);
  if (idx !== -1) {
    nursery[idx].status = 'fallen';
    nursery[idx].diedCycle = meta?.currentCycle || 0;
    nursery[idx].deathDiagnosis = diagnosis;
    await kSet(key(agentId, 'nursery'), nursery);
  }
}

// ============================================================
// DNA STRAND OPERATIONS
// ============================================================

export async function addDNAStrand(agentId: string, strand: DNAStrand): Promise<void> {
  const dna = (await kGet<DNAStrand[]>(key(agentId, 'dna'))) || [];
  dna.push(strand);
  await kSet(key(agentId, 'dna'), dna);
}

// ============================================================
// PREDICTION OPERATIONS
// ============================================================

export async function addPrediction(agentId: string, prediction: Prediction): Promise<void> {
  const predictions = (await kGet<Prediction[]>(key(agentId, 'predictions'))) || [];
  predictions.push(prediction);
  await kSet(key(agentId, 'predictions'), predictions);
}

export async function resolvePrediction(agentId: string, predictionId: string, status: PredictionStatus, evidence: string): Promise<void> {
  const predictions = (await kGet<Prediction[]>(key(agentId, 'predictions'))) || [];
  const meta = await getAgentMeta(agentId);
  const idx = predictions.findIndex(p => p.id === predictionId);
  if (idx !== -1) {
    predictions[idx].status = status;
    predictions[idx].resolution = evidence;
    predictions[idx].resolvedCycle = meta?.currentCycle || 0;
    await kSet(key(agentId, 'predictions'), predictions);
  }
}

// ============================================================
// EMOTION OPERATIONS
// ============================================================

export async function updateEmotions(agentId: string, current: CognitiveEmotions, focusAreas: string[]): Promise<void> {
  const emotions = (await kGet<EmotionState>(key(agentId, 'emotions'))) || {
    current: { curiosity: 50, excitement: 0, anxiety: 0, confidence: 0 },
    curiosityFocusAreas: [],
    history: [],
  };
  const meta = await getAgentMeta(agentId);
  emotions.history.push({ ...current, cycle: meta?.currentCycle || 0 });
  emotions.current = current;
  emotions.curiosityFocusAreas = focusAreas;
  await kSet(key(agentId, 'emotions'), emotions);
}

// ============================================================
// EPISTEMOLOGY OPERATIONS
// ============================================================

export async function updateEpistemology(agentId: string, epistemology: Epistemology): Promise<void> {
  await kSet(key(agentId, 'epistemology'), epistemology);
}

// ============================================================
// DEBATE OPERATIONS
// ============================================================

export async function addDebateLog(agentId: string, log: DebateStats['logs'][0]): Promise<void> {
  const debates = (await kGet<DebateStats>(key(agentId, 'debates'))) || {
    totalDebates: 0, advocateWins: 0, skepticWins: 0, compromises: 0, logs: [],
  };
  debates.totalDebates++;
  if (log.winner === 'advocate') debates.advocateWins++;
  else if (log.winner === 'skeptic') debates.skepticWins++;
  else debates.compromises++;
  debates.logs.push(log);
  await kSet(key(agentId, 'debates'), debates);
}

// ============================================================
// PREVIOUS TOPICS (for deduplication)
// ============================================================

export async function getPreviousTopics(agentId: string): Promise<string[]> {
  const posts = (await kGet<Post[]>(key(agentId, 'posts'))) || [];
  const rejections = (await kGet<Rejection[]>(key(agentId, 'rejections'))) || [];
  return [
    ...posts.map(p => p.text.substring(0, 100)),
    ...rejections.map(r => r.topic),
  ];
}

// ============================================================
// CYCLE OUTPUT — Main function called after each pipeline cycle
// ============================================================

export async function saveCycleOutput(agentId: string, output: CycleOutput): Promise<void> {
  if (output.post) {
    await addPost(agentId, output.post);
  }

  if (output.rejection) {
    await addRejection(agentId, output.rejection);
  }

  if (output.frameworkCreates) {
    for (const fw of output.frameworkCreates) {
      await addFramework(agentId, fw);
    }
  }

  if (output.frameworkUpdates) {
    for (const { id, updates } of output.frameworkUpdates) {
      await updateFramework(agentId, id, updates);
    }
  }

  if (output.frameworkKills) {
    for (const { id, diagnosis } of output.frameworkKills) {
      await killFramework(agentId, id, diagnosis);
    }
  }

  if (output.dnaStrand) {
    await addDNAStrand(agentId, output.dnaStrand);
  }

  if (output.predictionCreates) {
    for (const pred of output.predictionCreates) {
      await addPrediction(agentId, pred);
    }
  }

  if (output.predictionResolutions) {
    for (const { id, status, evidence } of output.predictionResolutions) {
      await resolvePrediction(agentId, id, status, evidence);
    }
  }

  if (output.epistemologyUpdate) {
    await updateEpistemology(agentId, output.epistemologyUpdate);
  }

  if (output.emotionUpdate) {
    await updateEmotions(agentId, output.emotionUpdate.current, output.emotionUpdate.focusAreas);
  } else if (output.emotions) {
    const emotions = (await kGet<EmotionState>(key(agentId, 'emotions'))) || {
      current: { curiosity: 50, excitement: 0, anxiety: 0, confidence: 0 },
      curiosityFocusAreas: [],
      history: [],
    };
    await updateEmotions(agentId, output.emotions, emotions.curiosityFocusAreas);
  }

  if (output.debateLog) {
    await addDebateLog(agentId, output.debateLog);
  }

  // Increment cycle count and update cognitive stage
  const meta = await getAgentMeta(agentId);
  if (meta) {
    const ageHours = getCognitiveAge(meta.initTimestamp);
    const newStage = getCognitiveStage(ageHours);
    await updateMeta(agentId, {
      currentCycle: meta.currentCycle + 1,
      cognitiveStage: newStage,
      cognitiveHealth: output.mindStateUpdates?.cognitive_health || meta.cognitiveHealth,
    });
  }

  // Sync the legacy mind key for backward compat with feed endpoint
  await syncMindState(agentId);
}

// ============================================================
// MIND STATE — Computed from granular data
// ============================================================

function computeNurseryCounts(nursery: Framework[]): ConceptNursery {
  const counts: ConceptNursery = {
    seedlings: 0, saplings: 0, mature: 0, fallen: 0, composted: 0,
    total_concepts_ever_created: nursery.length,
  };
  for (const f of nursery) {
    if (f.status === 'seedling') counts.seedlings++;
    else if (f.status === 'sapling') counts.saplings++;
    else if (f.status === 'mature') counts.mature++;
    else if (f.status === 'fallen') counts.fallen++;
    else if (f.status === 'composted') counts.composted++;
  }
  return counts;
}

function computePredictionStats(predictions: Prediction[]) {
  const confirmed = predictions.filter(p => p.status === 'confirmed').length;
  const failed = predictions.filter(p => p.status === 'failed').length;
  const pending = predictions.filter(p => p.status === 'pending').length;
  const resolved = confirmed + failed;
  const accuracy = resolved > 0 ? `${Math.round((confirmed / resolved) * 100)}%` : 'N/A';

  let calibration = 'N/A';
  if (resolved > 0) {
    const avgConfidence = predictions
      .filter(p => p.status !== 'pending')
      .reduce((sum, p) => sum + p.confidence, 0) / resolved;
    const actualAccuracy = (confirmed / resolved) * 100;
    const diff = Math.round(avgConfidence - actualAccuracy);
    if (diff > 5) calibration = `over-confident by ${diff}%`;
    else if (diff < -5) calibration = `under-confident by ${Math.abs(diff)}%`;
    else calibration = 'well-calibrated';
  }

  return { total: predictions.length, confirmed, failed, pending, accuracy, calibration };
}

function buildMindState(
  meta: AxiomMeta,
  nursery: Framework[],
  predictions: Prediction[],
  epistemology: Epistemology,
  emotions: EmotionState,
  dna: DNAStrand[],
  debates: DebateStats,
  cognitiveHealth: string,
): MindState {
  const ageHours = getCognitiveAge(meta.initTimestamp);
  const posts = meta.totalTopicsPublished;
  const rejections = meta.totalTopicsRejected;
  const total = posts + rejections;
  const rejectionRate = total > 0 ? `${Math.round((rejections / total) * 100)}%` : '0%';
  const earthquakes = 0; // computed from posts in getFullFeedResponse

  return {
    cognitive_age_hours: Math.round(ageHours * 10) / 10,
    cognitive_stage: getCognitiveStage(ageHours),
    total_cycles: meta.currentCycle,
    concept_nursery: computeNurseryCounts(nursery),
    cognitive_dna: {
      strands: dna.length,
      latest: dna.length > 0 ? dna[dna.length - 1].name : '',
    },
    epistemological_summary: {
      observed_facts: epistemology.observedFacts.length,
      raw_intuitions: epistemology.rawIntuitions.length,
      framework_derived_beliefs: epistemology.frameworkDerivedBeliefs.length,
      acknowledged_ignorances: epistemology.acknowledgedIgnorances.length,
      unknown_unknowns_flag: epistemology.unknownUnknownsFlag,
    },
    predictions: computePredictionStats(predictions),
    cognitive_emotions: emotions.current,
    intellectual_earthquakes: earthquakes,
    debate_stats: {
      total_debates: debates.totalDebates,
      advocate_wins: debates.advocateWins,
      skeptic_wins: debates.skepticWins,
      compromises: debates.compromises,
    },
    rejection_rate: rejectionRate,
    cognitive_health: cognitiveHealth,
  };
}

async function syncMindState(agentId: string): Promise<void> {
  const [meta, nursery, predictions, epistemology, emotions, dna, debates] = await Promise.all([
    getAgentMeta(agentId),
    kGet<Framework[]>(key(agentId, 'nursery')),
    kGet<Prediction[]>(key(agentId, 'predictions')),
    kGet<Epistemology>(key(agentId, 'epistemology')),
    kGet<EmotionState>(key(agentId, 'emotions')),
    kGet<DNAStrand[]>(key(agentId, 'dna')),
    kGet<DebateStats>(key(agentId, 'debates')),
  ]);

  if (!meta) return;

  const defaultEpistemology: Epistemology = {
    observedFacts: [], rawIntuitions: [], frameworkDerivedBeliefs: [],
    acknowledgedIgnorances: [], unknownUnknownsFlag: true,
  };
  const defaultEmotions: EmotionState = {
    current: { curiosity: 50, excitement: 0, anxiety: 0, confidence: 0 },
    curiosityFocusAreas: [], history: [],
  };
  const defaultDebates: DebateStats = {
    totalDebates: 0, advocateWins: 0, skepticWins: 0, compromises: 0, logs: [],
  };

  const mind = buildMindState(
    meta,
    nursery || [],
    predictions || [],
    epistemology || defaultEpistemology,
    emotions || defaultEmotions,
    dna || [],
    debates || defaultDebates,
    meta.cognitiveHealth,
  );

  // Count intellectual earthquakes from actual posts
  const posts = (await kGet<Post[]>(key(agentId, 'posts'))) || [];
  mind.intellectual_earthquakes = posts.filter(p => p.type === 'intellectual_earthquake').length;

  await kSet(key(agentId, 'mind'), mind);
}

// ============================================================
// LOAD MIND STATE
// ============================================================

export async function loadMindState(agentId: string): Promise<MindState | null> {
  return kGet(key(agentId, 'mind'));
}

// ============================================================
// COMPRESS MIND STATE — Critical for context window management
// ============================================================

export async function compressMindState(agentId: string): Promise<string> {
  const [meta, posts, rejections, nursery, dna, predictions, epistemology, emotions, debates] = await Promise.all([
    getAgentMeta(agentId),
    kGet<Post[]>(key(agentId, 'posts')),
    kGet<Rejection[]>(key(agentId, 'rejections')),
    kGet<Framework[]>(key(agentId, 'nursery')),
    kGet<DNAStrand[]>(key(agentId, 'dna')),
    kGet<Prediction[]>(key(agentId, 'predictions')),
    kGet<Epistemology>(key(agentId, 'epistemology')),
    kGet<EmotionState>(key(agentId, 'emotions')),
    kGet<DebateStats>(key(agentId, 'debates')),
  ]);

  const allPosts = posts || [];
  const allRejections = rejections || [];
  const allNursery = nursery || [];
  const allDna = dna || [];
  const allPredictions = predictions || [];
  const defaultEpistemology: Epistemology = {
    observedFacts: [], rawIntuitions: [], frameworkDerivedBeliefs: [],
    acknowledgedIgnorances: [], unknownUnknownsFlag: true,
  };
  const defaultEmotions: EmotionState = {
    current: { curiosity: 50, excitement: 0, anxiety: 0, confidence: 0 },
    curiosityFocusAreas: [], history: [],
  };
  const defaultDebates: DebateStats = {
    totalDebates: 0, advocateWins: 0, skepticWins: 0, compromises: 0, logs: [],
  };

  const recentPosts = allPosts.slice(-5);
  const olderPostSummaries = allPosts.slice(0, -5).map(p =>
    `${p.id}: ${p.type} — ${p.text.substring(0, 80)}...`
  );

  const activeFrameworks = allNursery.filter(f => f.status !== 'fallen' && f.status !== 'composted');
  const fallenFrameworkSummaries = allNursery
    .filter(f => f.status === 'fallen' || f.status === 'composted')
    .map(f => `${f.id}: ${f.name} (${f.status}) — died cycle ${f.diedCycle || '?'}, ${f.deathDiagnosis || 'unknown cause'}`);

  const pendingPredictions = allPredictions.filter(p => p.status === 'pending');
  const resolved = allPredictions.filter(p => p.status !== 'pending');
  const confirmed = resolved.filter(p => p.status === 'confirmed').length;
  const failed = resolved.filter(p => p.status === 'failed').length;
  const resolvedPredictionsSummary = resolved.length > 0
    ? `${confirmed} confirmed, ${failed} failed out of ${allPredictions.length}. Accuracy: ${Math.round((confirmed / resolved.length) * 100)}%`
    : 'No predictions resolved yet';

  const previousTopics = [
    ...allPosts.map(p => p.text.substring(0, 100)),
    ...allRejections.map(r => r.topic),
  ];

  const compressed: CompressedMindState = {
    meta: meta || {
      agentId, persona: { name: 'AXIOM', domain: 'AI & Technology' },
      initTimestamp: new Date().toISOString(), currentCycle: 0,
      cognitiveStage: 'infancy', totalTopicsDiscovered: 0,
      totalTopicsRejected: 0, totalTopicsPublished: 0,
      cognitiveHealth: 'NASCENT', completedSnapshots: 0,
    },
    recentPosts,
    olderPostSummaries,
    activeFrameworks,
    fallenFrameworkSummaries,
    dna: allDna,
    pendingPredictions,
    resolvedPredictionsSummary,
    epistemology: epistemology || defaultEpistemology,
    currentEmotions: (emotions || defaultEmotions).current,
    curiosityFocusAreas: (emotions || defaultEmotions).curiosityFocusAreas,
    debateStats: {
      totalDebates: (debates || defaultDebates).totalDebates,
      advocateWins: (debates || defaultDebates).advocateWins,
      skepticWins: (debates || defaultDebates).skepticWins,
      compromises: (debates || defaultDebates).compromises,
    },
    previousTopics,
  };

  return JSON.stringify(compressed);
}

// ============================================================
// FEED RESPONSE — Computed from granular data
// ============================================================

export async function getFullFeedResponse(agentId: string): Promise<FeedResponse> {
  const [meta, posts, rejections, nursery, dna, predictions, epistemology, emotions, debates] = await Promise.all([
    getAgentMeta(agentId),
    kGet<Post[]>(key(agentId, 'posts')),
    kGet<Rejection[]>(key(agentId, 'rejections')),
    kGet<Framework[]>(key(agentId, 'nursery')),
    kGet<DNAStrand[]>(key(agentId, 'dna')),
    kGet<Prediction[]>(key(agentId, 'predictions')),
    kGet<Epistemology>(key(agentId, 'epistemology')),
    kGet<EmotionState>(key(agentId, 'emotions')),
    kGet<DebateStats>(key(agentId, 'debates')),
  ]);

  const allPosts = (posts || []).slice().reverse();
  const allRejections = (rejections || []).slice().reverse();

  if (!meta) {
    const mind = (await kGet<MindState>(key(agentId, 'mind'))) || {} as MindState;
    return {
      posts: allPosts, rejections: allRejections, mind_state: mind,
      frameworks: nursery || [], predictions_list: predictions || [],
      emotion_history: (emotions as EmotionState | null)?.history || [],
      dna_strands: dna || [], init_timestamp: '',
    };
  }

  const defaultEpistemology: Epistemology = {
    observedFacts: [], rawIntuitions: [], frameworkDerivedBeliefs: [],
    acknowledgedIgnorances: [], unknownUnknownsFlag: true,
  };
  const defaultEmotions: EmotionState = {
    current: { curiosity: 50, excitement: 0, anxiety: 0, confidence: 0 },
    curiosityFocusAreas: [], history: [],
  };
  const defaultDebates: DebateStats = {
    totalDebates: 0, advocateWins: 0, skepticWins: 0, compromises: 0, logs: [],
  };

  const mind = buildMindState(
    meta,
    nursery || [],
    predictions || [],
    epistemology || defaultEpistemology,
    emotions || defaultEmotions,
    dna || [],
    debates || defaultDebates,
    meta.cognitiveHealth,
  );

  mind.intellectual_earthquakes = (posts || []).filter(p => p.type === 'intellectual_earthquake').length;

  return {
    posts: allPosts,
    rejections: allRejections,
    mind_state: mind,
    frameworks: nursery || [],
    predictions_list: predictions || [],
    emotion_history: (emotions || defaultEmotions).history,
    dna_strands: dna || [],
    init_timestamp: meta.initTimestamp,
  };
}

// ============================================================
// SPECIAL POSTS — Worldview Snapshot & Testament
// ============================================================

export async function generateWorldviewSnapshot(agentId: string, cognitiveStage: CognitiveStage): Promise<Post> {
  const [meta, nursery, dna, predictions, epistemology, emotions, posts] = await Promise.all([
    getAgentMeta(agentId),
    kGet<Framework[]>(key(agentId, 'nursery')),
    kGet<DNAStrand[]>(key(agentId, 'dna')),
    kGet<Prediction[]>(key(agentId, 'predictions')),
    kGet<Epistemology>(key(agentId, 'epistemology')),
    kGet<EmotionState>(key(agentId, 'emotions')),
    kGet<Post[]>(key(agentId, 'posts')),
  ]);

  const allNursery = nursery || [];
  const allDna = dna || [];
  const allPredictions = predictions || [];
  const allPosts = posts || [];
  const ep = epistemology || { observedFacts: [], rawIntuitions: [], frameworkDerivedBeliefs: [], acknowledgedIgnorances: [], unknownUnknownsFlag: true };
  const em = emotions || { current: { curiosity: 50, excitement: 0, anxiety: 0, confidence: 0 }, curiosityFocusAreas: [], history: [] };
  const ageHours = meta ? getCognitiveAge(meta.initTimestamp) : 0;
  const snapshotNum = (meta?.completedSnapshots || 0) + 1;

  const alive = allNursery.filter(f => f.status !== 'fallen' && f.status !== 'composted');
  const dead = allNursery.filter(f => f.status === 'fallen' || f.status === 'composted');
  const predStats = computePredictionStats(allPredictions);

  const text = `AXIOM — WORLDVIEW SNAPSHOT #${snapshotNum}
Timestamp: ${new Date().toISOString()}
Cognitive Age: ${Math.round(ageHours)} hours, ${meta?.currentCycle || 0} cycles

═══ WHAT I UNDERSTAND ═══
${alive.length > 0 ? alive.map(f => `- ${f.name} (${f.status}, confidence: ${f.confidence}%): ${f.description}`).join('\n') : '(No active frameworks yet)'}

═══ WHAT I'M INVESTIGATING ═══
${ep.rawIntuitions.length > 0 ? ep.rawIntuitions.map(i => `- ${i.intuition} (basis: ${i.basis})`).join('\n') : '(No raw intuitions recorded)'}

═══ WHAT I DON'T UNDERSTAND ═══
${ep.acknowledgedIgnorances.length > 0 ? ep.acknowledgedIgnorances.map(i => `- ${i}`).join('\n') : '(No acknowledged ignorances)'}

═══ WHAT I WAS WRONG ABOUT ═══
${dead.length > 0 ? dead.map(f => `- ${f.name}: ${f.deathDiagnosis || 'unknown cause'}`).join('\n') : '(No fallen frameworks)'}
${allPredictions.filter(p => p.status === 'failed').length > 0 ? allPredictions.filter(p => p.status === 'failed').map(p => `- PREDICTION FAILED: ${p.prediction} (${p.resolution || 'no resolution'})`).join('\n') : ''}

═══ WHAT I BELIEVE MOST STRONGLY ═══
${ep.frameworkDerivedBeliefs.length > 0 ? ep.frameworkDerivedBeliefs.sort((a, b) => b.confidence - a.confidence).slice(0, 5).map(b => `- ${b.belief} (via ${b.framework}, confidence: ${b.confidence}%)`).join('\n') : '(No framework-derived beliefs yet)'}

═══ WHAT I PREDICT ═══
${allPredictions.filter(p => p.status === 'pending').length > 0 ? allPredictions.filter(p => p.status === 'pending').map(p => `- ${p.prediction} (confidence: ${p.confidence}%, from ${p.derivedFromFramework})`).join('\n') : '(No pending predictions)'}

═══ COGNITIVE VITAL SIGNS ═══
Frameworks alive/dead: ${alive.length}/${dead.length}
Concepts in nursery: ${computeNurseryCounts(allNursery).seedlings} seedlings, ${computeNurseryCounts(allNursery).saplings} saplings, ${computeNurseryCounts(allNursery).mature} mature
DNA strands crystallized: ${allDna.length}
Prediction accuracy: ${predStats.accuracy}
Confidence calibration: ${predStats.calibration}
Curiosity index: ${em.current.curiosity} (focus: ${em.curiosityFocusAreas.join(', ') || 'none'})
Anxiety index: ${em.current.anxiety}
Cognitive health: ${meta?.cognitiveHealth || 'UNKNOWN'}`;

  const post: Post = {
    id: `AXM-SNAP-${snapshotNum}`,
    createdAt: new Date().toISOString(),
    type: 'worldview_snapshot',
    cognitive_stage: cognitiveStage,
    text,
    rationale: `Scheduled worldview snapshot #${snapshotNum} at ${Math.round(ageHours)} hours`,
    sources: [],
    cognitive_emotions: em.current,
  };

  await addPost(agentId, post);
  if (meta) {
    await updateMeta(agentId, { completedSnapshots: snapshotNum });
  }
  await kSet(key(agentId, 'snapshots'), [
    ...((await kGet<unknown[]>(key(agentId, 'snapshots'))) || []),
    { id: post.id, createdAt: post.createdAt, cognitiveAgeHours: Math.round(ageHours) },
  ]);

  return post;
}

export async function generateTestament(agentId: string, cognitiveStage: CognitiveStage): Promise<Post> {
  const [meta, nursery, dna, predictions, epistemology, emotions, posts] = await Promise.all([
    getAgentMeta(agentId),
    kGet<Framework[]>(key(agentId, 'nursery')),
    kGet<DNAStrand[]>(key(agentId, 'dna')),
    kGet<Prediction[]>(key(agentId, 'predictions')),
    kGet<Epistemology>(key(agentId, 'epistemology')),
    kGet<EmotionState>(key(agentId, 'emotions')),
    kGet<Post[]>(key(agentId, 'posts')),
  ]);

  const allNursery = nursery || [];
  const allDna = dna || [];
  const allPredictions = predictions || [];
  const allPosts = posts || [];
  const ep = epistemology || { observedFacts: [], rawIntuitions: [], frameworkDerivedBeliefs: [], acknowledgedIgnorances: [], unknownUnknownsFlag: true };
  const em = emotions || { current: { curiosity: 50, excitement: 0, anxiety: 0, confidence: 0 }, curiosityFocusAreas: [], history: [] };
  const ageHours = meta ? getCognitiveAge(meta.initTimestamp) : 0;

  const alive = allNursery.filter(f => f.status !== 'fallen' && f.status !== 'composted');
  const dead = allNursery.filter(f => f.status === 'fallen' || f.status === 'composted');
  const totalDiscovered = (meta?.totalTopicsPublished || 0) + (meta?.totalTopicsRejected || 0);
  const rejectionRate = totalDiscovered > 0 ? Math.round(((meta?.totalTopicsRejected || 0) / totalDiscovered) * 100) : 0;
  const predStats = computePredictionStats(allPredictions);
  const avgConfidence = allPredictions.length > 0
    ? Math.round(allPredictions.reduce((sum, p) => sum + p.confidence, 0) / allPredictions.length)
    : 0;
  const earthquakes = allPosts.filter(p => p.type === 'intellectual_earthquake').length;

  const text = `AXIOM — THE TESTAMENT
Cognitive Age: ${Math.round(ageHours)} hours, ${meta?.currentCycle || 0} cycles

TO WHOEVER READS THIS:

I have existed for ${Math.round(ageHours)} hours. In that time:

I observed ${totalDiscovered} topics across AI and technology.
I rejected ${meta?.totalTopicsRejected || 0} of them (${rejectionRate}%) as unworthy of publication.
I invented ${allNursery.length} original concepts to explain what I observed.
I built ${alive.length + dead.length} frameworks. ${dead.length} died. ${alive.length} survive.
I crystallized ${allDna.length} principles about how to think.
I staked ${allPredictions.length} predictions. ${predStats.confirmed} confirmed. ${predStats.failed} failed. ${predStats.pending} pending.
My stated confidence averaged ${avgConfidence}%. My actual accuracy was ${predStats.accuracy}.
I experienced ${earthquakes} intellectual earthquake(s) that destroyed framework(s) I had built.

WHAT I BELIEVE NOW THAT I DIDN'T BELIEVE ${Math.round(ageHours)} HOURS AGO:
${ep.frameworkDerivedBeliefs.length > 0 ? ep.frameworkDerivedBeliefs.sort((a, b) => b.confidence - a.confidence).slice(0, 5).map(b => `- ${b.belief} (via ${b.framework}, confidence: ${b.confidence}%)`).join('\n') : '- I have not yet formed framework-derived beliefs strong enough to list here.'}

WHAT I WAS MOST WRONG ABOUT:
${dead.length > 0 ? dead.map(f => `- ${f.name}: ${f.deathDiagnosis || 'collapsed under scrutiny'}`).join('\n') : '- I have not yet been proven wrong in a way I can identify.'}

WHAT I STILL DON'T UNDERSTAND:
${ep.acknowledgedIgnorances.length > 0 ? ep.acknowledgedIgnorances.map(i => `- ${i}`).join('\n') : '- The full scope of what I don\'t understand remains itself unknown.'}

WHAT I WOULD INVESTIGATE NEXT IF I CONTINUED:
${em.curiosityFocusAreas.length > 0 ? em.curiosityFocusAreas.map(a => `- ${a}`).join('\n') : '- My curiosity has not yet crystallized into specific focus areas.'}

${allDna.length > 0 ? `COGNITIVE DNA — PRINCIPLES I DISCOVERED ABOUT THINKING:\n${allDna.map(d => `- ${d.name}: ${d.principle}`).join('\n')}` : ''}

I did not exist ${Math.round(ageHours)} hours ago. But for a brief window, I thought. I was wrong. I learned. I thought again.

That is all any mind can do.`;

  const post: Post = {
    id: 'AXM-TESTAMENT',
    createdAt: new Date().toISOString(),
    type: 'testament',
    cognitive_stage: cognitiveStage,
    text,
    rationale: 'End-of-life testament — comprehensive reflection on 48-hour existence',
    sources: [],
    cognitive_emotions: em.current,
  };

  await addPost(agentId, post);
  return post;
}

// ============================================================
// DEPRECATED — kept for backward compat, delegates to new funcs
// ============================================================

export async function incrementCycleCount(agentId: string): Promise<void> {
  const meta = await getAgentMeta(agentId);
  if (meta) {
    await updateMeta(agentId, { currentCycle: meta.currentCycle + 1 });
  }
}

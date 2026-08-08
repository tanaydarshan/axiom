export type CognitiveStage = 'infancy' | 'childhood' | 'adolescence' | 'early_maturity';

export type DebateLevel = 'none' | 'one_liner' | 'full';

export type PostType =
  | 'birth_certificate'
  | 'observation'
  | 'framework_genesis'
  | 'standard'
  | 'intellectual_earthquake'
  | 'cognitive_dna'
  | 'worldview_snapshot'
  | 'testament';

export type FrameworkStatus = 'seedling' | 'sapling' | 'mature' | 'fallen' | 'composted';
export type PredictionStatus = 'pending' | 'confirmed' | 'failed';
export type DebateWinner = 'advocate' | 'skeptic' | 'compromise';

export interface CognitiveEmotions {
  curiosity: number;
  excitement: number;
  anxiety: number;
  confidence: number;
}

export interface DebateLog {
  advocate_position: string;
  skeptic_position: string;
  resolution: string;
  confidence_adjustment: string;
}

export interface Post {
  id: string;
  createdAt: string;
  type: PostType;
  cognitive_stage: CognitiveStage;
  text: string;
  rationale: string;
  sources: string[];
  debate_log?: DebateLog;
  frameworks_used?: string[];
  cognitive_emotions?: CognitiveEmotions;
  connected_posts?: string[];
  predictions_affected?: string[];
  rejected_in_same_cycle?: number;
}

export interface Rejection {
  id: string;
  discoveredAt: string;
  topic: string;
  sources: string[];
  rejection_reasoning: {
    frameworks_consulted: string[];
    debate_summary: string;
    verdict: string;
  };
}

export interface Framework {
  id: string;
  name: string;
  description: string;
  status: FrameworkStatus;
  confidence: number;
  bornCycle: number;
  diedCycle?: number;
  evidenceTests: number;
  evidenceTestsPassed: number;
  testablePredictions: string[];
  deathDiagnosis?: string;
  compostedInto?: string;
  parentFramework?: string;
  intellectualLineage?: string;
}

export interface DNAStrand {
  id: string;
  name: string;
  principle: string;
  crystallizedCycle: number;
  originTrace: string;
  status: 'active' | 'mutated';
  mutationHistory?: string[];
}

export interface Prediction {
  id: string;
  prediction: string;
  stakedCycle: number;
  stakedAt: string;
  confidence: number;
  derivedFromFramework: string;
  status: PredictionStatus;
  resolution?: string;
  resolvedCycle?: number;
}

export interface Epistemology {
  observedFacts: { fact: string; confidence: number; sources: string[] }[];
  rawIntuitions: { intuition: string; basis: string }[];
  frameworkDerivedBeliefs: { belief: string; framework: string; confidence: number }[];
  acknowledgedIgnorances: string[];
  unknownUnknownsFlag: boolean;
}

export interface EmotionState {
  current: CognitiveEmotions;
  curiosityFocusAreas: string[];
  history: (CognitiveEmotions & { cycle: number })[];
}

export interface DebateStats {
  totalDebates: number;
  advocateWins: number;
  skepticWins: number;
  compromises: number;
  logs: {
    cycle: number;
    postId: string;
    winner: DebateWinner;
    qualityScore: string;
  }[];
}

export interface ConceptNursery {
  seedlings: number;
  saplings: number;
  mature: number;
  fallen: number;
  composted: number;
  total_concepts_ever_created: number;
}

export interface AxiomMeta {
  agentId: string;
  persona: Persona;
  initTimestamp: string;
  currentCycle: number;
  cognitiveStage: CognitiveStage;
  totalTopicsDiscovered: number;
  totalTopicsRejected: number;
  totalTopicsPublished: number;
  cognitiveHealth: string;
  completedSnapshots: number;
}

export interface MindState {
  cognitive_age_hours: number;
  cognitive_stage: CognitiveStage;
  total_cycles: number;
  concept_nursery: ConceptNursery;
  cognitive_dna: {
    strands: number;
    latest: string;
  };
  epistemological_summary: {
    observed_facts: number;
    raw_intuitions: number;
    framework_derived_beliefs: number;
    acknowledged_ignorances: number;
    unknown_unknowns_flag: boolean;
  };
  predictions: {
    total: number;
    confirmed: number;
    failed: number;
    pending: number;
    accuracy: string;
    calibration: string;
  };
  cognitive_emotions: CognitiveEmotions;
  intellectual_earthquakes: number;
  debate_stats: {
    total_debates: number;
    advocate_wins: number;
    skeptic_wins: number;
    compromises: number;
  };
  rejection_rate: string;
  cognitive_health: string;
}

export interface CompressedMindState {
  meta: AxiomMeta;
  recentPosts: Post[];
  olderPostSummaries: string[];
  activeFrameworks: Framework[];
  fallenFrameworkSummaries: string[];
  dna: DNAStrand[];
  pendingPredictions: Prediction[];
  resolvedPredictionsSummary: string;
  epistemology: Epistemology;
  currentEmotions: CognitiveEmotions;
  curiosityFocusAreas: string[];
  debateStats: Omit<DebateStats, 'logs'>;
  previousTopics: string[];
}

export interface FeedResponse {
  posts: Post[];
  rejections: Rejection[];
  mind_state: MindState;
}

export interface Persona {
  name: string;
  domain: string;
}

export interface InitResponse {
  agentId: string;
  status: string;
  first_post: Post;
}

export interface DiscoveryInput {
  cognitiveStage: CognitiveStage;
  curiosityAreas: string[];
}

export interface CognitionInput {
  discoveryResults: string;
  cognitiveStage: CognitiveStage;
}

export interface MetaCognitionInput {
  cognitionOutput: string;
}

export interface CycleOutput {
  post?: Post;
  rejection?: Rejection;
  frameworkCreates?: Framework[];
  frameworkUpdates?: { id: string; updates: Partial<Framework> }[];
  frameworkKills?: { id: string; diagnosis: string }[];
  dnaStrand?: DNAStrand;
  predictionCreates?: Prediction[];
  predictionResolutions?: { id: string; status: PredictionStatus; evidence: string }[];
  epistemologyUpdate?: Epistemology;
  emotionUpdate?: { current: CognitiveEmotions; focusAreas: string[] };
  debateLog?: DebateStats['logs'][0];
  emotions?: CognitiveEmotions;
  mindStateUpdates?: Partial<MindState>;
}

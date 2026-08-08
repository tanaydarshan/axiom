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

export interface ConceptNursery {
  seedlings: number;
  saplings: number;
  mature: number;
  fallen: number;
  composted: number;
  total_concepts_ever_created: number;
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
  nurseryUpdates?: Record<string, unknown>;
  dnaUpdates?: Record<string, unknown>;
  predictionUpdates?: Record<string, unknown>;
  epistemologyUpdates?: Record<string, unknown>;
  emotions?: CognitiveEmotions;
}

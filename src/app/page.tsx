'use client';

import { useEffect, useState, useCallback } from 'react';

interface CognitiveEmotions {
  curiosity: number;
  excitement: number;
  anxiety: number;
  confidence: number;
}

interface Post {
  id: string;
  createdAt: string;
  type: string;
  cognitive_stage?: string;
  text: string;
  rationale: string;
  sources: string[];
  debate_log?: {
    advocate_position?: string;
    advocate?: string;
    skeptic_position?: string;
    skeptic?: string;
    resolution: string;
    confidence_adjustment?: string;
  };
  frameworks_used?: string[];
  cognitive_emotions?: CognitiveEmotions;
  connected_posts?: string[];
  predictions_affected?: string[];
}

interface Rejection {
  id: string;
  discoveredAt: string;
  topic: string;
  rejection_reasoning: {
    frameworks_consulted: string[];
    debate_summary: string;
    verdict: string;
  };
}

interface MindState {
  cognitive_age_hours: number;
  cognitive_stage: string;
  total_cycles: number;
  concept_nursery: {
    seedlings: number;
    saplings: number;
    mature: number;
    fallen: number;
    composted: number;
    total_concepts_ever_created: number;
  };
  cognitive_dna: { strands: number; latest: string };
  predictions: {
    total: number;
    confirmed: number;
    failed: number;
    pending: number;
    accuracy: string;
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

interface FeedData {
  posts: Post[];
  rejections: Rejection[];
  mind_state: MindState;
}

const STAGE_COLORS: Record<string, string> = {
  infancy: '#a855f7',
  childhood: '#3b82f6',
  adolescence: '#f59e0b',
  early_maturity: '#22c55e',
};

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  birth_certificate: { label: 'BIRTH', color: '#a855f7' },
  observation: { label: 'OBSERVE', color: '#3b82f6' },
  framework_genesis: { label: 'FRAMEWORK', color: '#22c55e' },
  framework_proposal: { label: 'FRAMEWORK', color: '#22c55e' },
  epistemic_log: { label: 'EPISTEMIC', color: '#00d4ff' },
  standard: { label: 'ANALYSIS', color: '#6366f1' },
  intellectual_earthquake: { label: 'EARTHQUAKE', color: '#ef4444' },
  cognitive_dna: { label: 'DNA', color: '#f59e0b' },
  worldview_snapshot: { label: 'SNAPSHOT', color: '#ec4899' },
  testament: { label: 'TESTAMENT', color: '#f59e0b' },
};

function EmotionBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9898b0', marginBottom: 3 }}>
        <span>{label}</span>
        <span style={{ color }}>{value}</span>
      </div>
      <div style={{ height: 4, background: '#1a1a25', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

function TimeAgo({ date }: { date: string }) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  if (mins < 1) return <span>just now</span>;
  if (mins < 60) return <span>{mins}m ago</span>;
  if (hrs < 24) return <span>{hrs}h {mins % 60}m ago</span>;
  return <span>{Math.floor(hrs / 24)}d ago</span>;
}

function PostCard({ post, index }: { post: Post; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const typeInfo = TYPE_LABELS[post.type] || { label: post.type.toUpperCase(), color: '#6366f1' };
  const stageColor = STAGE_COLORS[post.cognitive_stage || 'infancy'] || '#6366f1';

  return (
    <div
      style={{
        background: '#16161f',
        border: '1px solid #2a2a3a',
        borderRadius: 12,
        padding: 0,
        marginBottom: 16,
        transition: 'border-color 0.2s',
        overflow: 'hidden',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#3a3a5a')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a3a')}
    >
      <div
        style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12 }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: typeInfo.color,
              background: `${typeInfo.color}15`, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)',
            }}>
              {typeInfo.label}
            </span>
            <span style={{ fontSize: 11, color: stageColor, fontFamily: 'var(--font-mono)' }}>
              {post.cognitive_stage || 'infancy'}
            </span>
            <span style={{ fontSize: 11, color: '#686880', fontFamily: 'var(--font-mono)' }}>
              {post.id}
            </span>
            <span style={{ fontSize: 11, color: '#686880', marginLeft: 'auto' }}>
              <TimeAgo date={post.createdAt} />
            </span>
          </div>
          <div style={{
            fontSize: 14, lineHeight: 1.7, color: '#e8e8f0', whiteSpace: 'pre-wrap',
            maxHeight: expanded ? 'none' : 120, overflow: 'hidden',
            maskImage: expanded ? 'none' : 'linear-gradient(to bottom, black 60%, transparent)',
            WebkitMaskImage: expanded ? 'none' : 'linear-gradient(to bottom, black 60%, transparent)',
          }}>
            {post.text}
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 20px 16px', borderTop: '1px solid #2a2a3a', marginTop: 0, paddingTop: 12 }}>
          {post.rationale && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#686880', letterSpacing: 1, marginBottom: 4 }}>RATIONALE</div>
              <div style={{ fontSize: 13, color: '#9898b0', lineHeight: 1.6 }}>{post.rationale}</div>
            </div>
          )}

          {post.debate_log && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#686880', letterSpacing: 1, marginBottom: 8 }}>INTERNAL DEBATE</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ background: '#1a2a1a', borderRadius: 8, padding: 10, fontSize: 12, color: '#9898b0', lineHeight: 1.5 }}>
                  <span style={{ color: '#22c55e', fontWeight: 600, fontSize: 10 }}>ADVOCATE</span><br />
                  {post.debate_log.advocate_position || post.debate_log.advocate}
                </div>
                <div style={{ background: '#2a1a1a', borderRadius: 8, padding: 10, fontSize: 12, color: '#9898b0', lineHeight: 1.5 }}>
                  <span style={{ color: '#ef4444', fontWeight: 600, fontSize: 10 }}>SKEPTIC</span><br />
                  {post.debate_log.skeptic_position || post.debate_log.skeptic}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 8 }}>
                Resolution: {post.debate_log.resolution}
              </div>
            </div>
          )}

          {post.cognitive_emotions && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#686880', letterSpacing: 1, marginBottom: 8 }}>EMOTIONS AT TIME OF WRITING</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                <EmotionBar label="Curiosity" value={post.cognitive_emotions.curiosity} color="#00d4ff" />
                <EmotionBar label="Excitement" value={post.cognitive_emotions.excitement} color="#a855f7" />
                <EmotionBar label="Anxiety" value={post.cognitive_emotions.anxiety} color="#ef4444" />
                <EmotionBar label="Confidence" value={post.cognitive_emotions.confidence} color="#22c55e" />
              </div>
            </div>
          )}

          {post.frameworks_used && post.frameworks_used.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {post.frameworks_used.map((f, i) => (
                <span key={i} style={{
                  fontSize: 11, background: '#22c55e15', color: '#22c55e', padding: '2px 8px', borderRadius: 4,
                  fontFamily: 'var(--font-mono)',
                }}>
                  {f}
                </span>
              ))}
            </div>
          )}

          {post.sources && post.sources.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#686880', letterSpacing: 1, marginBottom: 4 }}>SOURCES</div>
              {post.sources.map((s, i) => (
                <div key={i} style={{ fontSize: 11, color: '#00d4ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <a href={s} target="_blank" rel="noopener noreferrer">{s}</a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState<FeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'posts' | 'rejections' | 'mind'>('posts');
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch('/api/agent/feed?agentId=axiom-001');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 60000);
    return () => clearInterval(interval);
  }, [fetchFeed]);

  const mind = data?.mind_state;
  const stageColor = STAGE_COLORS[mind?.cognitive_stage || 'infancy'] || '#6366f1';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ marginBottom: 32, textAlign: 'center' }}>
        <h1 style={{
          fontSize: 40, fontWeight: 800, letterSpacing: -1,
          background: 'linear-gradient(135deg, #00d4ff, #a855f7)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 8,
        }}>
          AXIOM
        </h1>
        <p style={{ fontSize: 14, color: '#686880', fontFamily: 'var(--font-mono)' }}>
          autonomous cognitive intelligence / watch a mind being born
        </p>
      </header>

      {loading && (
        <div style={{ textAlign: 'center', padding: 60, color: '#686880' }}>
          <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)' }}>initializing neural feed...</div>
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: 40, color: '#ef4444', fontSize: 14 }}>
          Error: {error}
        </div>
      )}

      {data && mind && (
        <>
          {/* Vital Signs Bar */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12, marginBottom: 24,
          }}>
            <Stat label="COGNITIVE AGE" value={`${(mind.cognitive_age_hours || 0).toFixed(1)}h`} color="#00d4ff" />
            <Stat label="STAGE" value={mind.cognitive_stage?.toUpperCase() || 'UNKNOWN'} color={stageColor} />
            <Stat label="CYCLES" value={String(mind.total_cycles || 0)} color="#6366f1" />
            <Stat label="FRAMEWORKS" value={String(mind.concept_nursery?.total_concepts_ever_created || 0)} color="#22c55e" />
            <Stat label="HEALTH" value={mind.cognitive_health?.split('—')[0]?.trim() || 'UNKNOWN'} color="#22c55e" />
          </div>

          {/* Emotion bars */}
          {mind.cognitive_emotions && (
            <div style={{
              background: '#16161f', border: '1px solid #2a2a3a', borderRadius: 12,
              padding: 16, marginBottom: 24,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#686880', letterSpacing: 1.5, marginBottom: 12 }}>
                CURRENT COGNITIVE EMOTIONS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px' }}>
                <EmotionBar label="Curiosity" value={mind.cognitive_emotions.curiosity} color="#00d4ff" />
                <EmotionBar label="Excitement" value={mind.cognitive_emotions.excitement} color="#a855f7" />
                <EmotionBar label="Anxiety" value={mind.cognitive_emotions.anxiety} color="#ef4444" />
                <EmotionBar label="Confidence" value={mind.cognitive_emotions.confidence} color="#22c55e" />
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid #2a2a3a' }}>
            {(['posts', 'rejections', 'mind'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  background: 'none', border: 'none', color: tab === t ? '#00d4ff' : '#686880',
                  fontSize: 13, fontWeight: 600, padding: '8px 20px', cursor: 'pointer',
                  borderBottom: tab === t ? '2px solid #00d4ff' : '2px solid transparent',
                  fontFamily: 'var(--font-mono)', letterSpacing: 0.5, transition: 'all 0.2s',
                }}
              >
                {t === 'posts' && `POSTS (${data.posts.length})`}
                {t === 'rejections' && `REJECTED (${data.rejections.length})`}
                {t === 'mind' && 'MIND STATE'}
              </button>
            ))}
          </div>

          {/* Posts tab */}
          {tab === 'posts' && (
            <div>
              {data.posts.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: '#686880', fontSize: 14 }}>
                  No posts yet. The mind is still forming...
                </div>
              )}
              {data.posts.map((post, i) => (
                <PostCard key={post.id + i} post={post} index={i} />
              ))}
            </div>
          )}

          {/* Rejections tab */}
          {tab === 'rejections' && (
            <div>
              {data.rejections.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: '#686880', fontSize: 14 }}>
                  No rejected topics yet.
                </div>
              )}
              {data.rejections.map((rej, i) => (
                <div key={rej.id + i} style={{
                  background: '#16161f', border: '1px solid #2a2a3a', borderRadius: 12,
                  padding: 16, marginBottom: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: '#ef4444', background: '#ef444415',
                      padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)', letterSpacing: 1,
                    }}>REJECTED</span>
                    <span style={{ fontSize: 11, color: '#686880' }}>{rej.id}</span>
                    <span style={{ fontSize: 11, color: '#686880', marginLeft: 'auto' }}>
                      <TimeAgo date={rej.discoveredAt} />
                    </span>
                  </div>
                  <div style={{ fontSize: 14, color: '#e8e8f0', marginBottom: 8 }}>{rej.topic}</div>
                  <div style={{ fontSize: 12, color: '#9898b0' }}>{rej.rejection_reasoning.verdict}</div>
                </div>
              ))}
            </div>
          )}

          {/* Mind State tab */}
          {tab === 'mind' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              <MindCard title="CONCEPT NURSERY">
                <MindRow label="Seedlings" value={mind.concept_nursery.seedlings} color="#a855f7" />
                <MindRow label="Saplings" value={mind.concept_nursery.saplings} color="#3b82f6" />
                <MindRow label="Mature" value={mind.concept_nursery.mature} color="#22c55e" />
                <MindRow label="Fallen" value={mind.concept_nursery.fallen} color="#ef4444" />
                <MindRow label="Composted" value={mind.concept_nursery.composted} color="#686880" />
              </MindCard>

              <MindCard title="COGNITIVE DNA">
                <MindRow label="Strands" value={mind.cognitive_dna.strands} color="#f59e0b" />
                {mind.cognitive_dna.latest && (
                  <div style={{ fontSize: 12, color: '#9898b0', marginTop: 8 }}>
                    Latest: <span style={{ color: '#f59e0b' }}>{mind.cognitive_dna.latest}</span>
                  </div>
                )}
              </MindCard>

              <MindCard title="PREDICTIONS">
                <MindRow label="Total" value={mind.predictions.total} color="#6366f1" />
                <MindRow label="Confirmed" value={mind.predictions.confirmed} color="#22c55e" />
                <MindRow label="Failed" value={mind.predictions.failed} color="#ef4444" />
                <MindRow label="Pending" value={mind.predictions.pending} color="#f59e0b" />
                <MindRow label="Accuracy" value={mind.predictions.accuracy} color="#00d4ff" />
              </MindCard>

              <MindCard title="DEBATE CHAMBER">
                <MindRow label="Total Debates" value={mind.debate_stats.total_debates} color="#6366f1" />
                <MindRow label="Advocate Wins" value={mind.debate_stats.advocate_wins} color="#22c55e" />
                <MindRow label="Skeptic Wins" value={mind.debate_stats.skeptic_wins} color="#ef4444" />
                <MindRow label="Compromises" value={mind.debate_stats.compromises} color="#f59e0b" />
              </MindCard>

              <MindCard title="INTELLECTUAL PROFILE">
                <MindRow label="Earthquakes" value={mind.intellectual_earthquakes} color="#ef4444" />
                <MindRow label="Rejection Rate" value={mind.rejection_rate} color="#f59e0b" />
                <div style={{ fontSize: 12, color: '#9898b0', marginTop: 8 }}>
                  Health: <span style={{ color: '#22c55e' }}>{mind.cognitive_health}</span>
                </div>
              </MindCard>
            </div>
          )}

          {/* Footer */}
          <footer style={{
            textAlign: 'center', padding: '40px 0 24px', color: '#686880',
            fontSize: 11, fontFamily: 'var(--font-mono)',
          }}>
            AXIOM v1.0 — ABTalks Vibe Code Hackathon — Autonomous AI Creator
            <br />
            Feed auto-refreshes every 60 seconds
          </footer>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: '#16161f', border: '1px solid #2a2a3a', borderRadius: 10,
      padding: '12px 16px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#686880', letterSpacing: 1.5, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
    </div>
  );
}

function MindCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#16161f', border: '1px solid #2a2a3a', borderRadius: 12, padding: 16,
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#686880', letterSpacing: 1.5, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function MindRow({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
      <span style={{ color: '#9898b0' }}>{label}</span>
      <span style={{ color, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{value}</span>
    </div>
  );
}

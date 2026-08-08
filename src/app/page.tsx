'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';

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

const STAGE_LABELS: Record<string, string> = {
  infancy: 'Infancy',
  childhood: 'Childhood',
  adolescence: 'Adolescence',
  early_maturity: 'Maturity',
};

const TYPE_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  birth_certificate: { label: 'BIRTH', color: '#a855f7', icon: '✧' },
  observation: { label: 'OBSERVE', color: '#3b82f6', icon: '◎' },
  framework_genesis: { label: 'FRAMEWORK', color: '#22c55e', icon: '◆' },
  framework_proposal: { label: 'FRAMEWORK', color: '#22c55e', icon: '◆' },
  epistemic_log: { label: 'EPISTEMIC', color: '#00d4ff', icon: '⦾' },
  standard: { label: 'ANALYSIS', color: '#6366f1', icon: '▸' },
  intellectual_earthquake: { label: 'EARTHQUAKE', color: '#ef4444', icon: '✶' },
  cognitive_dna: { label: 'DNA', color: '#f59e0b', icon: '⚙' },
  worldview_snapshot: { label: 'SNAPSHOT', color: '#ec4899', icon: '▣' },
  testament: { label: 'TESTAMENT', color: '#f59e0b', icon: '★' },
};

interface TimelineEvent {
  time: string;
  label: string;
  type: string;
  color: string;
  postId: string;
}

function getTimelineEvents(posts: Post[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const chronological = [...posts].reverse();

  const birth = chronological.find(p => p.type === 'birth_certificate');
  if (birth) events.push({ time: birth.createdAt, label: 'Born', type: 'birth_certificate', color: '#a855f7', postId: birth.id });

  const firstFw = chronological.find(p => p.type === 'framework_genesis' || p.type === 'framework_proposal');
  if (firstFw) events.push({ time: firstFw.createdAt, label: '1st Framework', type: 'framework_genesis', color: '#22c55e', postId: firstFw.id });

  const firstEq = chronological.find(p => p.type === 'intellectual_earthquake');
  if (firstEq) events.push({ time: firstEq.createdAt, label: '1st Earthquake', type: 'intellectual_earthquake', color: '#ef4444', postId: firstEq.id });

  const snapshot = chronological.find(p => p.type === 'worldview_snapshot');
  if (snapshot) events.push({ time: snapshot.createdAt, label: 'Snapshot', type: 'worldview_snapshot', color: '#ec4899', postId: snapshot.id });

  const testament = chronological.find(p => p.type === 'testament');
  if (testament) events.push({ time: testament.createdAt, label: 'Testament', type: 'testament', color: '#f59e0b', postId: testament.id });

  const stages = new Set<string>();
  for (const p of chronological) {
    if (p.cognitive_stage && !stages.has(p.cognitive_stage) && p.cognitive_stage !== 'infancy') {
      stages.add(p.cognitive_stage);
      events.push({
        time: p.createdAt,
        label: STAGE_LABELS[p.cognitive_stage] || p.cognitive_stage,
        type: 'stage_transition',
        color: STAGE_COLORS[p.cognitive_stage] || '#6366f1',
        postId: p.id,
      });
    }
  }

  events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  return events;
}

function getKeyMoments(posts: Post[]): Post[] {
  const chronological = [...posts].reverse();
  const moments: Post[] = [];
  const types = ['birth_certificate', 'framework_genesis', 'intellectual_earthquake', 'worldview_snapshot', 'testament', 'cognitive_dna'];

  for (const type of types) {
    const found = chronological.find(p => p.type === type);
    if (found) moments.push(found);
  }
  return moments;
}

function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
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

function EmotionBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9898b0', marginBottom: 2 }}>
        <span>{label}</span>
        <span style={{ color, fontFamily: 'var(--font-mono)' }}>{value}</span>
      </div>
      <div style={{ height: 4, background: '#1a1a25', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

function GrowthBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <div style={{ width: 90, fontSize: 11, color: '#9898b0', flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, height: 16, background: '#1a1a25', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          width: `${Math.min(pct, 100)}%`, height: '100%', background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 3, transition: 'width 0.8s ease', minWidth: value > 0 ? 4 : 0,
        }} />
        <span style={{
          position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
          fontSize: 10, fontFamily: 'var(--font-mono)', color: '#e8e8f0',
        }}>{value}</span>
      </div>
    </div>
  );
}

function PostCard({ post, isKeyMoment }: { post: Post; isKeyMoment?: boolean }) {
  const [expanded, setExpanded] = useState(!!isKeyMoment);
  const typeInfo = TYPE_LABELS[post.type] || { label: post.type.toUpperCase(), color: '#6366f1', icon: '▸' };
  const stageColor = STAGE_COLORS[post.cognitive_stage || 'infancy'] || '#6366f1';

  return (
    <div
      style={{
        background: '#16161f',
        border: `1px solid ${isKeyMoment ? typeInfo.color + '40' : '#2a2a3a'}`,
        borderRadius: 12,
        padding: 0,
        marginBottom: 14,
        transition: 'border-color 0.2s',
        overflow: 'hidden',
        ...(isKeyMoment ? { boxShadow: `0 0 20px ${typeInfo.color}10` } : {}),
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = isKeyMoment ? typeInfo.color + '80' : '#3a3a5a')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = isKeyMoment ? typeInfo.color + '40' : '#2a2a3a')}
    >
      <div
        style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12 }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: typeInfo.color,
              background: `${typeInfo.color}15`, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)',
            }}>
              {typeInfo.icon} {typeInfo.label}
            </span>
            <span style={{ fontSize: 11, color: stageColor, fontFamily: 'var(--font-mono)' }}>
              {post.cognitive_stage || 'infancy'}
            </span>
            <span style={{ fontSize: 11, color: '#505068', fontFamily: 'var(--font-mono)' }}>
              {post.id}
            </span>
            <span style={{ fontSize: 11, color: '#505068', marginLeft: 'auto' }}>
              <TimeAgo date={post.createdAt} />
            </span>
          </div>
          <div style={{
            fontSize: 14, lineHeight: 1.7, color: '#e8e8f0', whiteSpace: 'pre-wrap',
            maxHeight: expanded ? 'none' : 100, overflow: 'hidden',
            maskImage: expanded ? 'none' : 'linear-gradient(to bottom, black 50%, transparent)',
            WebkitMaskImage: expanded ? 'none' : 'linear-gradient(to bottom, black 50%, transparent)',
          }}>
            {post.text}
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 18px 14px', borderTop: '1px solid #2a2a3a', paddingTop: 12 }}>
          {post.rationale && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#505068', letterSpacing: 1, marginBottom: 4 }}>RATIONALE</div>
              <div style={{ fontSize: 13, color: '#9898b0', lineHeight: 1.6 }}>{post.rationale}</div>
            </div>
          )}

          {post.debate_log && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#505068', letterSpacing: 1, marginBottom: 8 }}>INTERNAL DEBATE</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ background: '#1a2a1a', borderRadius: 8, padding: 10, fontSize: 12, color: '#9898b0', lineHeight: 1.5 }}>
                  <span style={{ color: '#22c55e', fontWeight: 600, fontSize: 10, letterSpacing: 1 }}>ADVOCATE</span><br />
                  {post.debate_log.advocate_position || post.debate_log.advocate}
                </div>
                <div style={{ background: '#2a1a1a', borderRadius: 8, padding: 10, fontSize: 12, color: '#9898b0', lineHeight: 1.5 }}>
                  <span style={{ color: '#ef4444', fontWeight: 600, fontSize: 10, letterSpacing: 1 }}>SKEPTIC</span><br />
                  {post.debate_log.skeptic_position || post.debate_log.skeptic}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 8, fontStyle: 'italic' }}>
                Resolution: {post.debate_log.resolution}
              </div>
            </div>
          )}

          {post.cognitive_emotions && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#505068', letterSpacing: 1, marginBottom: 8 }}>EMOTIONS AT TIME OF WRITING</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px' }}>
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
                }}>{f}</span>
              ))}
            </div>
          )}

          {post.sources && post.sources.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#505068', letterSpacing: 1, marginBottom: 4 }}>SOURCES</div>
              {post.sources.map((s, i) => (
                <div key={i} style={{ fontSize: 11, color: '#00d4ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <a href={s} target="_blank" rel="noopener noreferrer" style={{ color: '#00d4ff' }}>{s}</a>
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
  const [tab, setTab] = useState<'posts' | 'rejections' | 'mind' | 'predictions'>('posts');
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch('/api/agent/feed?agentId=axiom-001');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
      setLastUpdated(new Date());
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

  const timelineEvents = useMemo(() => data ? getTimelineEvents(data.posts) : [], [data]);
  const keyMoments = useMemo(() => data ? getKeyMoments(data.posts) : [], [data]);
  const keyMomentIds = useMemo(() => new Set(keyMoments.map(p => p.id)), [keyMoments]);

  const heroLine = useMemo(() => {
    if (!mind) return '';
    const age = formatDuration(mind.cognitive_age_hours);
    const parts: string[] = [`Started ${age} ago with zero knowledge`];
    if (mind.total_cycles > 0) parts.push(`${mind.total_cycles} thinking cycles completed`);
    if (mind.concept_nursery.total_concepts_ever_created > 0) parts.push(`${mind.concept_nursery.total_concepts_ever_created} frameworks invented`);
    if (mind.predictions.total > 0) parts.push(`${mind.predictions.total} predictions made`);
    if (mind.debate_stats.total_debates > 0) parts.push(`${mind.debate_stats.total_debates} internal debates held`);
    return parts.join(' · ');
  }, [mind]);

  const growthMax = useMemo(() => {
    if (!mind) return 10;
    return Math.max(
      mind.concept_nursery.total_concepts_ever_created,
      mind.predictions.total,
      mind.debate_stats.total_debates,
      mind.total_cycles,
      10,
    );
  }, [mind]);

  return (
    <div style={{ maxWidth: 940, margin: '0 auto', padding: '32px 16px', minHeight: '100vh' }}>
      {/* Hero */}
      <header style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#00d4ff', fontFamily: 'var(--font-mono)',
          marginBottom: 12, opacity: 0.8,
        }}>
          ABTalks VIBE CODE HACKATHON
        </div>
        <h1 style={{
          fontSize: 44, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.1,
          background: 'linear-gradient(135deg, #00d4ff 0%, #a855f7 50%, #ec4899 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 10,
        }}>
          AXIOM
        </h1>
        <p style={{
          fontSize: 16, color: '#e8e8f0', fontWeight: 500, marginBottom: 8, lineHeight: 1.4,
        }}>
          The First Self-Correcting Autonomous AI Analyst
        </p>
        <p style={{
          fontSize: 13, color: '#686880', maxWidth: 600, margin: '0 auto', lineHeight: 1.6,
        }}>
          An AI that builds frameworks, makes falsifiable predictions, debates itself, and publicly tracks when it&apos;s wrong.
          Not just smart &mdash; accountable.
        </p>
        {mind && (
          <div style={{
            fontSize: 12, color: '#9898b0', fontFamily: 'var(--font-mono)', marginTop: 16,
            background: '#16161f', border: '1px solid #2a2a3a', borderRadius: 8,
            padding: '10px 16px', display: 'inline-block', maxWidth: '100%',
          }}>
            {heroLine}
          </div>
        )}
      </header>

      {loading && (
        <div style={{ textAlign: 'center', padding: 80, color: '#686880' }}>
          <div style={{
            width: 24, height: 24, border: '2px solid #2a2a3a', borderTopColor: '#00d4ff',
            borderRadius: '50%', margin: '0 auto 16px',
            animation: 'spin 1s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>connecting to axiom neural feed...</div>
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: 40, color: '#ef4444', fontSize: 14, background: '#1a1216', borderRadius: 12, border: '1px solid #ef444430' }}>
          Connection error: {error}
          <div style={{ fontSize: 12, color: '#686880', marginTop: 8 }}>Auto-retry in 60 seconds</div>
        </div>
      )}

      {data && mind && (
        <>
          {/* Cognitive Timeline */}
          {timelineEvents.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#505068', letterSpacing: 1.5, marginBottom: 12 }}>
                COGNITIVE JOURNEY
              </div>
              <div style={{
                background: '#16161f', border: '1px solid #2a2a3a', borderRadius: 12,
                padding: '20px 24px', overflowX: 'auto',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 'fit-content', position: 'relative' }}>
                  {timelineEvents.map((evt, i) => (
                    <div key={evt.postId + i} style={{ display: 'flex', alignItems: 'center', flex: i < timelineEvents.length - 1 ? 1 : 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 70 }}>
                        <div style={{
                          width: 12, height: 12, borderRadius: '50%', background: evt.color,
                          boxShadow: `0 0 8px ${evt.color}60`, flexShrink: 0,
                        }} />
                        <div style={{
                          fontSize: 10, fontWeight: 600, color: evt.color, marginTop: 6,
                          fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', textAlign: 'center',
                        }}>
                          {evt.label}
                        </div>
                        <div style={{ fontSize: 9, color: '#505068', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                          <TimeAgo date={evt.time} />
                        </div>
                      </div>
                      {i < timelineEvents.length - 1 && (
                        <div style={{
                          flex: 1, height: 2, background: `linear-gradient(90deg, ${evt.color}60, ${timelineEvents[i + 1].color}60)`,
                          minWidth: 30, alignSelf: 'flex-start', marginTop: 5,
                        }} />
                      )}
                    </div>
                  ))}
                  {/* Now marker */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 50, marginLeft: timelineEvents.length > 0 ? 0 : undefined }}>
                    {timelineEvents.length > 0 && (
                      <div style={{ flex: 1, height: 2, background: '#2a2a3a40', minWidth: 20, alignSelf: 'flex-start', marginTop: 5, marginRight: 8 }} />
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Vital Signs Strip */}
          <section style={{ marginBottom: 24 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 10,
            }}>
              <StatCard label="AGE" value={formatDuration(mind.cognitive_age_hours)} color="#00d4ff" />
              <StatCard label="STAGE" value={STAGE_LABELS[mind.cognitive_stage] || mind.cognitive_stage} color={stageColor} />
              <StatCard label="CYCLES" value={String(mind.total_cycles)} color="#6366f1" />
              <StatCard label="FRAMEWORKS" value={String(mind.concept_nursery.total_concepts_ever_created)} color="#22c55e" />
              <StatCard label="PREDICTIONS" value={String(mind.predictions.total)} color="#f59e0b" />
              <StatCard label="HEALTH" value={mind.cognitive_health?.split('—')[0]?.split('-')[0]?.trim() || 'OK'} color={mind.cognitive_health?.includes('GOOD') ? '#22c55e' : mind.cognitive_health?.includes('FAIR') ? '#f59e0b' : '#ef4444'} />
            </div>
          </section>

          {/* Emotions + Growth side by side */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 28 }}>
            {/* Current Emotions */}
            <div style={{ background: '#16161f', border: '1px solid #2a2a3a', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#505068', letterSpacing: 1.5, marginBottom: 10 }}>
                COGNITIVE EMOTIONS (LIVE)
              </div>
              <EmotionBar label="Curiosity" value={mind.cognitive_emotions.curiosity} color="#00d4ff" />
              <EmotionBar label="Excitement" value={mind.cognitive_emotions.excitement} color="#a855f7" />
              <EmotionBar label="Anxiety" value={mind.cognitive_emotions.anxiety} color="#ef4444" />
              <EmotionBar label="Confidence" value={mind.cognitive_emotions.confidence} color="#22c55e" />
              <div style={{ fontSize: 10, color: '#505068', marginTop: 8, fontStyle: 'italic' }}>
                Scores computed via proxy-anchored measurement, not self-reported
              </div>
            </div>

            {/* Growth Overview */}
            <div style={{ background: '#16161f', border: '1px solid #2a2a3a', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#505068', letterSpacing: 1.5, marginBottom: 10 }}>
                GROWTH VISUALIZATION
              </div>
              <GrowthBar label="Cycles" value={mind.total_cycles} max={growthMax} color="#6366f1" />
              <GrowthBar label="Frameworks" value={mind.concept_nursery.total_concepts_ever_created} max={growthMax} color="#22c55e" />
              <GrowthBar label="Predictions" value={mind.predictions.total} max={growthMax} color="#f59e0b" />
              <GrowthBar label="Debates" value={mind.debate_stats.total_debates} max={growthMax} color="#00d4ff" />
              <GrowthBar label="Earthquakes" value={mind.intellectual_earthquakes} max={growthMax} color="#ef4444" />
              <GrowthBar label="DNA Strands" value={mind.cognitive_dna.strands} max={growthMax} color="#a855f7" />
            </div>
          </section>

          {/* Key Moments */}
          {keyMoments.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#505068', letterSpacing: 1.5, marginBottom: 12 }}>
                KEY MOMENTS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                {keyMoments.map(post => {
                  const typeInfo = TYPE_LABELS[post.type] || { label: post.type, color: '#6366f1', icon: '▸' };
                  return (
                    <div key={post.id} style={{
                      background: '#16161f', border: `1px solid ${typeInfo.color}30`, borderRadius: 12,
                      padding: 14, cursor: 'default',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: typeInfo.color,
                          background: `${typeInfo.color}15`, padding: '2px 8px', borderRadius: 4,
                          fontFamily: 'var(--font-mono)', letterSpacing: 1,
                        }}>
                          {typeInfo.icon} {typeInfo.label}
                        </span>
                        <span style={{ fontSize: 10, color: '#505068', marginLeft: 'auto' }}>
                          <TimeAgo date={post.createdAt} />
                        </span>
                      </div>
                      <div style={{
                        fontSize: 13, color: '#e8e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                        maxHeight: 80, overflow: 'hidden',
                        maskImage: 'linear-gradient(to bottom, black 50%, transparent)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent)',
                      }}>
                        {post.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid #2a2a3a',
            overflowX: 'auto',
          }}>
            {([
              { key: 'posts' as const, label: `POSTS (${data.posts.length})` },
              { key: 'rejections' as const, label: `REJECTED (${data.rejections.length})` },
              { key: 'predictions' as const, label: `PREDICTIONS (${mind.predictions.total})` },
              { key: 'mind' as const, label: 'MIND STATE' },
            ]).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  background: 'none', border: 'none', color: tab === t.key ? '#00d4ff' : '#686880',
                  fontSize: 12, fontWeight: 600, padding: '8px 16px', cursor: 'pointer',
                  borderBottom: tab === t.key ? '2px solid #00d4ff' : '2px solid transparent',
                  fontFamily: 'var(--font-mono)', letterSpacing: 0.5, transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Posts Tab */}
          {tab === 'posts' && (
            <div>
              {data.posts.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: '#686880', fontSize: 14 }}>
                  No posts yet. The mind is still forming...
                </div>
              )}
              {data.posts.map((post, i) => (
                <PostCard key={post.id + i} post={post} isKeyMoment={keyMomentIds.has(post.id)} />
              ))}
            </div>
          )}

          {/* Rejections Tab */}
          {tab === 'rejections' && (
            <div>
              <div style={{
                background: '#16161f', border: '1px solid #2a2a3a', borderRadius: 12,
                padding: 14, marginBottom: 16, fontSize: 13, color: '#9898b0', lineHeight: 1.6,
              }}>
                AXIOM rejects topics that don&apos;t meet its editorial bar: single-source stories, duplicates, or topics that add nothing new.
                A healthy rejection rate (30-60%) shows genuine editorial judgment, not blindly publishing everything.
                <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
                  Rejection Rate: {mind.rejection_rate}
                </div>
              </div>
              {data.rejections.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: '#686880', fontSize: 14 }}>
                  No rejected topics yet.
                </div>
              )}
              {data.rejections.map((rej, i) => (
                <div key={rej.id + i} style={{
                  background: '#16161f', border: '1px solid #2a2a3a', borderRadius: 12,
                  padding: 14, marginBottom: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: '#ef4444', background: '#ef444415',
                      padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)', letterSpacing: 1,
                    }}>REJECTED</span>
                    <span style={{ fontSize: 11, color: '#505068' }}>{rej.id}</span>
                    <span style={{ fontSize: 11, color: '#505068', marginLeft: 'auto' }}>
                      <TimeAgo date={rej.discoveredAt} />
                    </span>
                  </div>
                  <div style={{ fontSize: 14, color: '#e8e8f0', marginBottom: 6 }}>{rej.topic}</div>
                  <div style={{ fontSize: 12, color: '#9898b0' }}>{rej.rejection_reasoning.verdict}</div>
                </div>
              ))}
            </div>
          )}

          {/* Predictions Tab */}
          {tab === 'predictions' && (
            <div>
              <div style={{
                background: '#16161f', border: '1px solid #2a2a3a', borderRadius: 12,
                padding: 14, marginBottom: 16,
              }}>
                <div style={{ fontSize: 13, color: '#9898b0', lineHeight: 1.6, marginBottom: 12 }}>
                  Every framework AXIOM creates must generate at least one falsifiable prediction with a resolve date.
                  This is how we hold an AI accountable &mdash; not through benchmarks, but through real-world predictions it can be judged on.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10 }}>
                  <MiniStat label="Total" value={mind.predictions.total} color="#6366f1" />
                  <MiniStat label="Confirmed" value={mind.predictions.confirmed} color="#22c55e" />
                  <MiniStat label="Failed" value={mind.predictions.failed} color="#ef4444" />
                  <MiniStat label="Pending" value={mind.predictions.pending} color="#f59e0b" />
                  <MiniStat label="Accuracy" value={mind.predictions.accuracy} color="#00d4ff" />
                </div>
              </div>
              {mind.predictions.total === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: '#686880', fontSize: 14 }}>
                  No predictions yet. AXIOM will start making predictions as frameworks mature.
                </div>
              )}
              {/* Show posts that mention predictions */}
              {data.posts.filter(p => p.predictions_affected && p.predictions_affected.length > 0).map((post, i) => (
                <PostCard key={post.id + '-pred-' + i} post={post} />
              ))}
            </div>
          )}

          {/* Mind State Tab */}
          {tab === 'mind' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              <MindCard title="CONCEPT NURSERY">
                <div style={{ fontSize: 12, color: '#9898b0', marginBottom: 10, lineHeight: 1.5 }}>
                  Frameworks evolve: seedling &rarr; sapling &rarr; mature &rarr; fallen &rarr; composted. Max 8 active.
                </div>
                <MindRow label="Seedlings" value={mind.concept_nursery.seedlings} color="#a855f7" />
                <MindRow label="Saplings" value={mind.concept_nursery.saplings} color="#3b82f6" />
                <MindRow label="Mature" value={mind.concept_nursery.mature} color="#22c55e" />
                <MindRow label="Fallen" value={mind.concept_nursery.fallen} color="#ef4444" />
                <MindRow label="Composted" value={mind.concept_nursery.composted} color="#686880" />
                <div style={{ borderTop: '1px solid #2a2a3a', marginTop: 8, paddingTop: 6 }}>
                  <MindRow label="Total Ever Created" value={mind.concept_nursery.total_concepts_ever_created} color="#e8e8f0" />
                </div>
              </MindCard>

              <MindCard title="COGNITIVE DNA">
                <div style={{ fontSize: 12, color: '#9898b0', marginBottom: 10, lineHeight: 1.5 }}>
                  Meta-principles crystallized from repeated failure patterns across 3+ cycles.
                </div>
                <MindRow label="Strands" value={mind.cognitive_dna.strands} color="#f59e0b" />
                {mind.cognitive_dna.latest && (
                  <div style={{ fontSize: 12, color: '#9898b0', marginTop: 8 }}>
                    Latest: <span style={{ color: '#f59e0b' }}>{mind.cognitive_dna.latest}</span>
                  </div>
                )}
              </MindCard>

              <MindCard title="DEBATE CHAMBER">
                <div style={{ fontSize: 12, color: '#9898b0', marginBottom: 10, lineHeight: 1.5 }}>
                  Every significant post goes through Advocate vs Skeptic. The skeptic must name the specific weakness.
                </div>
                <MindRow label="Total Debates" value={mind.debate_stats.total_debates} color="#6366f1" />
                <MindRow label="Advocate Wins" value={mind.debate_stats.advocate_wins} color="#22c55e" />
                <MindRow label="Skeptic Wins" value={mind.debate_stats.skeptic_wins} color="#ef4444" />
                <MindRow label="Compromises" value={mind.debate_stats.compromises} color="#f59e0b" />
              </MindCard>

              <MindCard title="INTELLECTUAL PROFILE">
                <MindRow label="Earthquakes" value={mind.intellectual_earthquakes} color="#ef4444" />
                <MindRow label="Rejection Rate" value={mind.rejection_rate} color="#f59e0b" />
                <div style={{ fontSize: 12, color: '#9898b0', marginTop: 8 }}>
                  Health: <span style={{ color: mind.cognitive_health?.includes('GOOD') ? '#22c55e' : '#f59e0b' }}>{mind.cognitive_health}</span>
                </div>
              </MindCard>
            </div>
          )}

          {/* Footer */}
          <footer style={{
            textAlign: 'center', padding: '48px 0 24px', color: '#505068',
            fontSize: 11, fontFamily: 'var(--font-mono)', lineHeight: 1.8,
          }}>
            <div style={{ marginBottom: 8 }}>
              AXIOM v1.0 &mdash; The First Self-Correcting Autonomous AI Analyst
            </div>
            <div>ABTalks Vibe Code Hackathon &mdash; Problem Statement 3: Autonomous AI Creator</div>
            <div style={{ marginTop: 8, color: '#3a3a4a' }}>
              Auto-refreshes every 60s{lastUpdated && ` · Last updated: ${lastUpdated.toLocaleTimeString()}`}
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: '#16161f', border: '1px solid #2a2a3a', borderRadius: 10,
      padding: '10px 14px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#505068', letterSpacing: 1.5, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 20, fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
      <div style={{ fontSize: 10, color: '#686880', letterSpacing: 0.5 }}>{label}</div>
    </div>
  );
}

function MindCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#16161f', border: '1px solid #2a2a3a', borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#505068', letterSpacing: 1.5, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function MindRow({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
      <span style={{ color: '#9898b0' }}>{label}</span>
      <span style={{ color, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{value}</span>
    </div>
  );
}

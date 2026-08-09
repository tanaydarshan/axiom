'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';

// ============================================================
// TYPES
// ============================================================

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

interface FrameworkData {
  id: string;
  name: string;
  description: string;
  status: string;
  confidence: number;
  bornCycle: number;
  diedCycle?: number;
  deathDiagnosis?: string;
  testablePredictions?: string[];
  intellectualLineage?: string;
}

interface PredictionData {
  id: string;
  prediction: string;
  confidence: number;
  status: string;
  derivedFromFramework: string;
  stakedAt?: string;
  resolution?: string;
}

interface EmotionHistoryPoint extends CognitiveEmotions {
  cycle: number;
}

interface DNAStrandData {
  id: string;
  name: string;
  principle: string;
  crystallizedCycle: number;
  originTrace: string;
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
  frameworks: FrameworkData[];
  predictions_list: PredictionData[];
  emotion_history: EmotionHistoryPoint[];
  dna_strands: DNAStrandData[];
  init_timestamp: string;
}

// ============================================================
// CONSTANTS
// ============================================================

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

const STATUS_COLORS: Record<string, string> = {
  seedling: '#a855f7',
  sapling: '#3b82f6',
  mature: '#22c55e',
  fallen: '#ef4444',
  composted: '#686880',
};

// ============================================================
// NEURAL NETWORK BACKGROUND
// ============================================================

function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const nodes: { x: number; y: number; vx: number; vy: number }[] = [];
    const count = 40;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
    };
    resize();

    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const maxDist = 200;

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > canvas.width) a.vx *= -1;
        if (a.y < 0 || a.y > canvas.height) a.vy *= -1;

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.15;
            ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(a.x, a.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none', opacity: 0.6,
      }}
    />
  );
}

// ============================================================
// SCROLL ANIMATION
// ============================================================

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

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

function getTimelineEvents(posts: Post[]) {
  const events: { time: string; label: string; color: string; postId: string }[] = [];
  const chronological = [...posts].reverse();

  const birth = chronological.find(p => p.type === 'birth_certificate');
  if (birth) events.push({ time: birth.createdAt, label: 'Born', color: '#a855f7', postId: birth.id });

  const firstFw = chronological.find(p => p.type === 'framework_genesis' || p.type === 'framework_proposal');
  if (firstFw) events.push({ time: firstFw.createdAt, label: '1st Framework', color: '#22c55e', postId: firstFw.id });

  const firstObs = chronological.find(p => p.type === 'observation' || p.type === 'standard');
  if (firstObs) events.push({ time: firstObs.createdAt, label: '1st Analysis', color: '#6366f1', postId: firstObs.id });

  const firstDebate = chronological.find(p => p.debate_log);
  if (firstDebate && firstDebate.id !== firstFw?.id) events.push({ time: firstDebate.createdAt, label: '1st Debate', color: '#00d4ff', postId: firstDebate.id });

  const firstEq = chronological.find(p => p.type === 'intellectual_earthquake');
  if (firstEq) events.push({ time: firstEq.createdAt, label: '1st Earthquake', color: '#ef4444', postId: firstEq.id });

  const snapshot = chronological.find(p => p.type === 'worldview_snapshot');
  if (snapshot) events.push({ time: snapshot.createdAt, label: 'Snapshot', color: '#ec4899', postId: snapshot.id });

  const testament = chronological.find(p => p.type === 'testament');
  if (testament) events.push({ time: testament.createdAt, label: 'Testament', color: '#f59e0b', postId: testament.id });

  const stages = new Set<string>();
  for (const p of chronological) {
    if (p.cognitive_stage && !stages.has(p.cognitive_stage) && p.cognitive_stage !== 'infancy') {
      stages.add(p.cognitive_stage);
      events.push({
        time: p.createdAt,
        label: STAGE_LABELS[p.cognitive_stage] || p.cognitive_stage,
        color: STAGE_COLORS[p.cognitive_stage] || '#6366f1',
        postId: p.id,
      });
    }
  }

  events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  return events;
}

// ============================================================
// SMALL COMPONENTS
// ============================================================

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

function Sparkline({ data, color, width = 200, height = 40 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (data.length === 0) return <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#505068' }}>no data yet</div>;
  if (data.length === 1) {
    const y = height / 2;
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <line x1="0" y1={y} x2={width * 0.8} y2={y} stroke={color} strokeWidth="1.5" opacity="0.3" strokeDasharray="4 4" />
        <circle cx={width * 0.9} cy={y} r="4" fill={color} opacity="0.9" />
        <text x={width * 0.9} y={y - 8} textAnchor="middle" fontSize="10" fill={color} fontFamily="var(--font-mono)">{data[0]}</text>
      </svg>
    );
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (width - 8) + 4;
    const y = height - ((v - min) / range) * (height - 12) - 6;
    return `${x},${y}`;
  });
  const lastX = parseFloat(pts[pts.length - 1].split(',')[0]);
  const lastY = parseFloat(pts[pts.length - 1].split(',')[1]);
  const gradId = `sg-${color.replace('#', '')}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill={`url(#${gradId})`} points={`${pts[0].split(',')[0]},${height} ${pts.join(' ')} ${lastX},${height}`} />
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts.join(' ')} opacity="0.9" />
      <circle cx={lastX} cy={lastY} r="3" fill={color} />
    </svg>
  );
}

function StatCard({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <div style={{ background: '#16161f', border: '1px solid #2a2a3a', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#505068', letterSpacing: 1.5, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: value.length > 8 ? 16 : 20, fontWeight: 700, color, fontFamily: 'var(--font-mono)', wordBreak: 'break-word' }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: '#505068', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: '#505068', letterSpacing: 1.5, marginBottom: 12 }}>{children}</div>;
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: '#16161f', border: '1px solid #2a2a3a', borderRadius: 12, padding: 16, ...style }}>{children}</div>;
}

// ============================================================
// POST CARD
// ============================================================

function PostCard({ post, highlight }: { post: Post; highlight?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const typeInfo = TYPE_LABELS[post.type] || { label: post.type.toUpperCase(), color: '#6366f1', icon: '▸' };
  const stageColor = STAGE_COLORS[post.cognitive_stage || 'infancy'] || '#6366f1';

  return (
    <div
      style={{
        background: '#16161f', border: `1px solid ${highlight ? typeInfo.color + '40' : '#2a2a3a'}`,
        borderRadius: 12, marginBottom: 12, overflow: 'hidden', transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = highlight ? typeInfo.color + '80' : '#3a3a5a')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = highlight ? typeInfo.color + '40' : '#2a2a3a')}
    >
      <div style={{ padding: '14px 18px', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: typeInfo.color, background: `${typeInfo.color}15`, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>
            {typeInfo.icon} {typeInfo.label}
          </span>
          <span style={{ fontSize: 10, color: stageColor, fontFamily: 'var(--font-mono)' }}>{STAGE_LABELS[post.cognitive_stage || 'infancy'] || post.cognitive_stage || 'infancy'}</span>
          <span style={{ fontSize: 11, color: '#505068', fontFamily: 'var(--font-mono)' }}>{post.id}</span>
          <span style={{ fontSize: 11, color: '#505068', marginLeft: 'auto' }}><TimeAgo date={post.createdAt} /></span>
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
              <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 8, fontStyle: 'italic' }}>Resolution: {post.debate_log.resolution}</div>
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
                <span key={i} style={{ fontSize: 11, background: '#22c55e15', color: '#22c55e', padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>{f}</span>
              ))}
            </div>
          )}
          {post.sources && post.sources.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#505068', letterSpacing: 1, marginBottom: 4 }}>SOURCES</div>
              {post.sources.map((s, i) => (
                <div key={i} style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

// ============================================================
// AUTONOMOUS CYCLE REPLAY — Animated pipeline using real data
// ============================================================

function AutonomousCycleReplay({ latestPost, mind, uniqueSources }: {
  latestPost: Post | null;
  mind: MindState;
  uniqueSources: number;
}) {
  const [phase, setPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [typedText, setTypedText] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sourceCount = uniqueSources || 0;
  const postText = latestPost?.text || 'Analyzing patterns in AI development...';
  const advocateText = latestPost?.debate_log?.advocate_position || latestPost?.debate_log?.advocate || 'This finding is significant because it reveals a shift in the industry.';
  const skepticText = latestPost?.debate_log?.skeptic_position || latestPost?.debate_log?.skeptic || 'We need more sources to verify this claim before publishing.';
  const resolutionText = latestPost?.debate_log?.resolution || 'Published after editorial review with high confidence.';
  const frameworksUsed = latestPost?.frameworks_used || [];

  const phases = useMemo(() => [
    { label: 'SCANNING NEWS', color: '#3b82f6', icon: '01', detail: `Scanning ${sourceCount} sources via Google News RSS...`, duration: 2500 },
    { label: 'DISCOVERIES FOUND', color: '#3b82f6', icon: '01', detail: `${sourceCount} unique sources collected. Extracting key findings...`, duration: 2000 },
    { label: 'ADVOCATE ARGUES', color: '#22c55e', icon: '02', detail: advocateText.substring(0, 150), duration: 3000 },
    { label: 'SKEPTIC CHALLENGES', color: '#ef4444', icon: '02', detail: skepticText.substring(0, 150), duration: 3000 },
    { label: 'EDITORIAL VERDICT', color: '#a855f7', icon: '02', detail: resolutionText.substring(0, 150), duration: 2500 },
    { label: 'EMOTION CALIBRATION', color: '#ec4899', icon: '03', detail: `Curiosity: ${mind.cognitive_emotions.curiosity} | Excitement: ${mind.cognitive_emotions.excitement} | Anxiety: ${mind.cognitive_emotions.anxiety} | Confidence: ${mind.cognitive_emotions.confidence}`, duration: 2000 },
    { label: 'COGNITIVE HEALTH CHECK', color: '#ec4899', icon: '03', detail: `Status: ${mind.cognitive_health || 'ASSESSED'} | Stage: ${STAGE_LABELS[mind.cognitive_stage] || mind.cognitive_stage}`, duration: 2000 },
    { label: 'CYCLE COMPLETE', color: '#22c55e', icon: '✓', detail: `Published ${mind.total_cycles > 0 ? mind.total_cycles : 0} posts. ${mind.concept_nursery.total_concepts_ever_created} frameworks built. ${mind.predictions.total} predictions tracked.`, duration: 3000 },
  ], [sourceCount, advocateText, skepticText, resolutionText, mind, postText]);

  const startReplay = useCallback(() => {
    setIsPlaying(true);
    setPhase(0);
    setTypedText('');
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    if (phase >= phases.length) {
      setIsPlaying(false);
      return;
    }

    const text = phases[phase].detail;
    let charIdx = 0;
    setTypedText('');

    const typeChar = () => {
      if (charIdx < text.length) {
        charIdx++;
        setTypedText(text.substring(0, charIdx));
        timerRef.current = setTimeout(typeChar, 12);
      } else {
        timerRef.current = setTimeout(() => setPhase(p => p + 1), 1200);
      }
    };
    timerRef.current = setTimeout(typeChar, 300);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, phase, phases]);

  const currentPhase = phases[phase] || phases[phases.length - 1];
  const agentNum = currentPhase?.icon || '01';
  const agentNames: Record<string, string> = { '01': 'DISCOVERY AGENT', '02': 'COGNITION AGENT', '03': 'META-COGNITION AGENT', '✓': 'PIPELINE COMPLETE' };

  return (
    <section style={{ marginBottom: 32 }}>
      <SectionHeader>INSIDE AXIOM&apos;S MIND &mdash; AUTONOMOUS CYCLE REPLAY</SectionHeader>
      <Card>
        {!isPlaying && phase === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 13, color: '#9898b0', marginBottom: 16, lineHeight: 1.6, maxWidth: 520, margin: '0 auto 16px' }}>
              Watch a replay of AXIOM&apos;s latest autonomous cycle &mdash; how it scanned real news,
              debated with itself, and decided what to publish. Using real data from its memory.
            </div>
            <button
              onClick={startReplay}
              style={{
                background: 'linear-gradient(135deg, #00d4ff, #a855f7)', border: 'none', borderRadius: 8,
                padding: '14px 36px', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', letterSpacing: 1.5, boxShadow: '0 0 30px #00d4ff30',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              &#9654; REPLAY LATEST CYCLE
            </button>
          </div>
        )}

        {(isPlaying || phase > 0) && (
          <div style={{ padding: '12px 0' }}>
            <style>{`
              @keyframes scanLine { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
              @keyframes termBlink { 0%,100% { opacity:1; } 50% { opacity:0; } }
            `}</style>

            {/* Progress bar */}
            <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
              {phases.map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: i < phase ? phases[i].color : i === phase ? `${currentPhase.color}40` : '#1a1a25',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {i === phase && isPlaying && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, width: '50%', height: '100%',
                      background: `linear-gradient(90deg, transparent, ${currentPhase.color})`,
                      animation: 'scanLine 1.5s ease infinite',
                    }} />
                  )}
                </div>
              ))}
            </div>

            {/* Agent indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${currentPhase.color}20`, border: `2px solid ${currentPhase.color}`,
                fontSize: 12, fontWeight: 800, color: currentPhase.color, fontFamily: 'var(--font-mono)',
              }}>{agentNum}</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: currentPhase.color, letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>
                  {agentNames[agentNum] || 'AGENT'}
                </div>
                <div style={{ fontSize: 10, color: '#686880', fontFamily: 'var(--font-mono)' }}>{currentPhase.label}</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 10, color: '#505068', fontFamily: 'var(--font-mono)' }}>
                STEP {Math.min(phase + 1, phases.length)}/{phases.length}
              </div>
            </div>

            {/* Terminal output */}
            <div style={{
              background: '#0a0a12', border: '1px solid #1a1a25', borderRadius: 8, padding: '12px 16px',
              fontFamily: 'var(--font-mono)', fontSize: 12, color: currentPhase.color,
              minHeight: 60, lineHeight: 1.6, position: 'relative',
            }}>
              <span style={{ color: '#505068' }}>{'>'} </span>
              {typedText}
              {isPlaying && <span style={{ animation: 'termBlink 0.8s step-end infinite', marginLeft: 1 }}>|</span>}
            </div>

            {/* Framework tags */}
            {phase >= 4 && frameworksUsed.length > 0 && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 10 }}>
                <span style={{ fontSize: 10, color: '#505068', alignSelf: 'center' }}>Frameworks applied:</span>
                {frameworksUsed.map((f, i) => (
                  <span key={i} style={{ fontSize: 10, background: '#22c55e15', color: '#22c55e', padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>{f}</span>
                ))}
              </div>
            )}

            {/* Replay again button */}
            {!isPlaying && phase >= phases.length && (
              <div style={{ textAlign: 'center', marginTop: 14 }}>
                <button
                  onClick={startReplay}
                  style={{ background: '#2a2a3a', border: 'none', borderRadius: 6, padding: '8px 24px', color: '#9898b0', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: 0.5 }}
                >
                  &#8635; Replay Again
                </button>
              </div>
            )}
          </div>
        )}
      </Card>
    </section>
  );
}

// ============================================================
// SYSTEM ARCHITECTURE
// ============================================================

function SystemArchitecture() {
  return (
    <section style={{ marginBottom: 32 }}>
      <SectionHeader>SYSTEM ARCHITECTURE &mdash; 3 AI AGENTS, 10 MEMORY STORES, 1 AUTONOMOUS LOOP</SectionHeader>
      <Card style={{ padding: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
          {/* External trigger */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '10px 0' }}>
            <div style={{ background: '#f59e0b15', border: '1px solid #f59e0b30', borderRadius: 8, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>&#9200;</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>CRON TRIGGER</div>
                <div style={{ fontSize: 11, color: '#9898b0' }}>Every 35 minutes via cron-job.org</div>
              </div>
            </div>
            <svg width="30" height="20" viewBox="0 0 30 20"><path d="M4 10 L22 10 M18 5 L23 10 L18 15" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" /></svg>
            <div style={{ background: '#16161f', border: '1px solid #2a2a3a', borderRadius: 8, padding: '8px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#00d4ff', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>PIPELINE ORCHESTRATOR</div>
              <div style={{ fontSize: 11, color: '#9898b0' }}>/api/cron/trigger</div>
            </div>
          </div>

          {/* Agent 1: Discovery */}
          <div style={{ background: '#1a1a25', border: '1px solid #3b82f630', borderRadius: 12, padding: 14, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 24, fontWeight: 800, color: '#3b82f610', fontFamily: 'var(--font-mono)' }}>01</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', letterSpacing: 1, marginBottom: 8, fontFamily: 'var(--font-mono)' }}>DISCOVERY AGENT</div>
            <div style={{ fontSize: 11, color: '#9898b0', lineHeight: 1.6, marginBottom: 10 }}>
              Scans real-time news. No interpretation &mdash; pure fact collection.
            </div>
            <div style={{ fontSize: 10, color: '#505068', borderTop: '1px solid #2a2a3a', paddingTop: 8 }}>
              <div style={{ marginBottom: 3 }}><span style={{ color: '#3b82f6' }}>Model:</span> Groq Llama 3.1</div>
              <div style={{ marginBottom: 3 }}><span style={{ color: '#3b82f6' }}>Input:</span> Google News RSS</div>
              <div><span style={{ color: '#3b82f6' }}>Output:</span> Raw findings + sources</div>
            </div>
          </div>

          {/* Agent 2: Cognition */}
          <div style={{ background: '#1a1a25', border: '1px solid #a855f730', borderRadius: 12, padding: 14, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 24, fontWeight: 800, color: '#a855f710', fontFamily: 'var(--font-mono)' }}>02</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#a855f7', letterSpacing: 1, marginBottom: 8, fontFamily: 'var(--font-mono)' }}>COGNITION AGENT</div>
            <div style={{ fontSize: 11, color: '#9898b0', lineHeight: 1.6, marginBottom: 10 }}>
              9 cognitive systems: framework forge, debate chamber, concept nursery, epistemology, predictions, DNA, earthquakes.
            </div>
            <div style={{ fontSize: 10, color: '#505068', borderTop: '1px solid #2a2a3a', paddingTop: 8 }}>
              <div style={{ marginBottom: 3 }}><span style={{ color: '#a855f7' }}>Model:</span> Groq Llama 3.1</div>
              <div style={{ marginBottom: 3 }}><span style={{ color: '#a855f7' }}>Input:</span> Findings + full mind state</div>
              <div><span style={{ color: '#a855f7' }}>Output:</span> Post/rejection + frameworks + predictions</div>
            </div>
          </div>

          {/* Agent 3: Meta-Cognition */}
          <div style={{ background: '#1a1a25', border: '1px solid #ec489930', borderRadius: 12, padding: 14, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 24, fontWeight: 800, color: '#ec489910', fontFamily: 'var(--font-mono)' }}>03</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#ec4899', letterSpacing: 1, marginBottom: 8, fontFamily: 'var(--font-mono)' }}>META-COGNITION AGENT</div>
            <div style={{ fontSize: 11, color: '#9898b0', lineHeight: 1.6, marginBottom: 10 }}>
              Self-regulatory layer. Proxy-anchored emotion scoring, confidence calibration, blind spot detection.
            </div>
            <div style={{ fontSize: 10, color: '#505068', borderTop: '1px solid #2a2a3a', paddingTop: 8 }}>
              <div style={{ marginBottom: 3 }}><span style={{ color: '#ec4899' }}>Model:</span> Groq Llama 3.1</div>
              <div style={{ marginBottom: 3 }}><span style={{ color: '#ec4899' }}>Input:</span> Cognition output + mind state</div>
              <div><span style={{ color: '#ec4899' }}>Output:</span> Emotions + blind spots + health</div>
            </div>
          </div>
        </div>

        {/* Memory stores */}
        <div style={{ borderTop: '1px solid #2a2a3a', paddingTop: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#505068', letterSpacing: 1.5, marginBottom: 10 }}>PERSISTENT MEMORY — UPSTASH REDIS (10 GRANULAR STORES)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['meta', 'posts', 'rejections', 'nursery (frameworks)', 'dna', 'predictions', 'epistemology', 'emotions', 'debates', 'snapshots'].map(store => (
              <span key={store} style={{ fontSize: 10, background: '#22c55e10', color: '#22c55e', padding: '3px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)', border: '1px solid #22c55e20' }}>{store}</span>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div style={{ borderTop: '1px solid #2a2a3a', paddingTop: 14, marginTop: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#505068', letterSpacing: 1.5, marginBottom: 10 }}>TECH STACK</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              { label: 'Next.js 16', color: '#e8e8f0' },
              { label: 'TypeScript', color: '#3b82f6' },
              { label: 'Groq Llama 3.1', color: '#f59e0b' },
              { label: 'Upstash Redis', color: '#22c55e' },
              { label: 'Google News RSS', color: '#ef4444' },
              { label: 'Vercel', color: '#e8e8f0' },
              { label: 'cron-job.org', color: '#a855f7' },
            ].map(t => (
              <span key={t.label} style={{ fontSize: 10, background: `${t.color}10`, color: t.color, padding: '3px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)', border: `1px solid ${t.color}20` }}>{t.label}</span>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function Home() {
  const [data, setData] = useState<FeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'posts' | 'rejections' | 'predictions' | 'mind'>('posts');
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [nextCycleIn, setNextCycleIn] = useState<string>('');

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

  // Countdown to next 35-min cycle
  useEffect(() => {
    if (!data?.init_timestamp) return;
    const update = () => {
      const now = Date.now();
      const init = new Date(data.init_timestamp).getTime();
      const elapsed = now - init;
      const cycleMs = 35 * 60 * 1000;
      const remaining = cycleMs - (elapsed % cycleMs);
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setNextCycleIn(`${mins}m ${secs}s`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [data?.init_timestamp]);

  const mind = data?.mind_state;
  const stageColor = STAGE_COLORS[mind?.cognitive_stage || 'infancy'] || '#6366f1';
  const timelineEvents = useMemo(() => data ? getTimelineEvents(data.posts) : [], [data]);

  const heroLine = useMemo(() => {
    if (!mind) return '';
    const parts: string[] = [`Reporting for ${formatDuration(mind.cognitive_age_hours)}`];
    if (mind.total_cycles > 0) parts.push(`${mind.total_cycles} news cycles analyzed`);
    if (mind.concept_nursery.total_concepts_ever_created > 0) parts.push(`${mind.concept_nursery.total_concepts_ever_created} original frameworks built`);
    if (mind.predictions.total > 0) parts.push(`${mind.predictions.total} predictions on record`);
    if (mind.debate_stats.total_debates > 0) parts.push(`${mind.debate_stats.total_debates} editorial debates held`);
    return parts.join(' · ');
  }, [mind]);

  const latestAnalysis = useMemo(() => {
    if (!data) return null;
    return data.posts.find(p => p.type !== 'birth_certificate' && p.debate_log);
  }, [data]);

  const activeFrameworks = useMemo(() => (data?.frameworks || []).filter(f => f.status !== 'fallen' && f.status !== 'composted'), [data]);
  const killedFrameworks = useMemo(() => (data?.frameworks || []).filter(f => f.status === 'fallen' || f.status === 'composted'), [data]);
  const uniqueSources = useMemo(() => {
    if (!data) return 0;
    const urls = new Set<string>();
    data.posts.forEach(p => p.sources?.forEach(s => urls.add(s)));
    return urls.size;
  }, [data]);

  const growthMax = useMemo(() => {
    if (!mind) return 10;
    return Math.max(mind.concept_nursery.total_concepts_ever_created, mind.predictions.total, mind.debate_stats.total_debates, mind.total_cycles, 10);
  }, [mind]);

  return (
    <div style={{ maxWidth: 940, margin: '0 auto', padding: '32px 16px', minHeight: '100vh' }}>
      {/* ============================================================ */}
      {/* SCENE 1: HERO + LIVE PULSE */}
      {/* ============================================================ */}
      <header style={{ marginBottom: 40, textAlign: 'center', position: 'relative', padding: '20px 0', overflow: 'hidden', borderRadius: 16 }}>
        <NeuralBackground />
        {/* Live Pulse */}
        {data && (
          <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }`}</style>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s ease infinite', boxShadow: '0 0 8px #22c55e60' }} />
            <span style={{ fontSize: 10, color: '#22c55e', fontFamily: 'var(--font-mono)' }}>LIVE</span>
            {nextCycleIn && <span style={{ fontSize: 10, color: '#505068', fontFamily: 'var(--font-mono)' }}>next cycle: {nextCycleIn}</span>}
          </div>
        )}

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#00d4ff', fontFamily: 'var(--font-mono)', marginBottom: 12, opacity: 0.8 }}>
          AUTONOMOUS AI JOURNALIST
        </div>
        <h1 style={{
          fontSize: 44, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.1,
          background: 'linear-gradient(135deg, #00d4ff 0%, #a855f7 50%, #ec4899 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 10,
        }}>AXIOM</h1>
        <p style={{ fontSize: 16, color: '#e8e8f0', fontWeight: 500, marginBottom: 8, lineHeight: 1.4 }}>
          An AI journalist covering the AI industry &mdash; 24/7, autonomously.
        </p>
        <p style={{ fontSize: 13, color: '#686880', maxWidth: 620, margin: '0 auto', lineHeight: 1.6 }}>
          It discovers news every 35 minutes, forms its own opinions, invents analytical frameworks,
          debates itself before publishing, makes falsifiable predictions, and publicly corrects itself when wrong.
          It started with zero knowledge.
        </p>
        {mind && (
          <div style={{
            fontSize: 12, color: '#9898b0', fontFamily: 'var(--font-mono)', marginTop: 16,
            background: '#16161f', border: '1px solid #2a2a3a', borderRadius: 8,
            padding: '10px 16px', display: 'inline-block', maxWidth: '100%',
          }}>{heroLine}</div>
        )}
      </header>

      {loading && (
        <div style={{ textAlign: 'center', padding: 80, color: '#686880' }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ width: 24, height: 24, border: '2px solid #2a2a3a', borderTopColor: '#00d4ff', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>connecting to axiom neural feed...</div>
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: 40, color: '#ef4444', fontSize: 14, background: '#1a1216', borderRadius: 12, border: '1px solid #ef444430' }}>
          Connection error: {error}
        </div>
      )}

      {data && mind && (
        <>
          {/* ============================================================ */}
          {/* WHO THIS IS FOR */}
          {/* ============================================================ */}
          <FadeIn><div style={{
            textAlign: 'center', padding: '14px 20px', background: '#00d4ff08', border: '1px solid #00d4ff20',
            borderRadius: 10, marginBottom: 28, fontSize: 13, color: '#9898b0', lineHeight: 1.5,
          }}>
            Built for <span style={{ color: '#00d4ff', fontWeight: 600 }}>AI investors, analysts, and researchers</span> who
            need to track a fast-moving industry without blind spots.
          </div></FadeIn>

          {/* ============================================================ */}
          {/* AUTONOMOUS CYCLE REPLAY — THE WOW MOMENT */}
          {/* ============================================================ */}
          <FadeIn delay={0.05}><AutonomousCycleReplay latestPost={latestAnalysis || null} mind={mind} uniqueSources={uniqueSources} /></FadeIn>

          {/* ============================================================ */}
          {/* SYSTEM ARCHITECTURE */}
          {/* ============================================================ */}
          <FadeIn delay={0.1}><SystemArchitecture /></FadeIn>

          {/* ============================================================ */}
          {/* PIPELINE X-RAY — LATEST CYCLE */}
          {/* ============================================================ */}
          {latestAnalysis && (
            <FadeIn delay={0.1}><section style={{ marginBottom: 32 }}>
              <SectionHeader>WATCH AXIOM THINK &mdash; LATEST EDITORIAL DECISION</SectionHeader>
              <Card>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                  {/* What it found */}
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', letterSpacing: 1, marginBottom: 6 }}>1. WHAT IT DISCOVERED</div>
                    <div style={{ fontSize: 12, color: '#9898b0', lineHeight: 1.6, maxHeight: 80, overflow: 'hidden' }}>
                      {latestAnalysis.text.substring(0, 200)}...
                    </div>
                    {latestAnalysis.sources && latestAnalysis.sources.length > 0 && (
                      <div style={{ fontSize: 10, color: '#505068', marginTop: 6 }}>{latestAnalysis.sources.length} sources consulted</div>
                    )}
                  </div>
                  {/* How it debated */}
                  {latestAnalysis.debate_log && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#a855f7', letterSpacing: 1, marginBottom: 6 }}>2. HOW IT DEBATED</div>
                      <div style={{ fontSize: 12, color: '#22c55e', marginBottom: 4 }}>
                        Advocate: {(latestAnalysis.debate_log.advocate_position || latestAnalysis.debate_log.advocate || '').substring(0, 100)}...
                      </div>
                      <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 4 }}>
                        Skeptic: {(latestAnalysis.debate_log.skeptic_position || latestAnalysis.debate_log.skeptic || '').substring(0, 100)}...
                      </div>
                    </div>
                  )}
                  {/* What it decided */}
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', letterSpacing: 1, marginBottom: 6 }}>3. WHAT IT DECIDED</div>
                    <div style={{ fontSize: 12, color: '#f59e0b', marginBottom: 4, fontStyle: 'italic' }}>
                      {latestAnalysis.debate_log?.resolution || 'Published after editorial review'}
                    </div>
                    <div style={{ fontSize: 12, color: '#9898b0' }}>{latestAnalysis.rationale?.substring(0, 120)}...</div>
                    {latestAnalysis.frameworks_used && latestAnalysis.frameworks_used.length > 0 && (
                      <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {latestAnalysis.frameworks_used.map((f, i) => (
                          <span key={i} style={{ fontSize: 10, background: '#22c55e15', color: '#22c55e', padding: '1px 6px', borderRadius: 3, fontFamily: 'var(--font-mono)' }}>{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </section></FadeIn>
          )}

          {/* ============================================================ */}
          {/* SCENE 3: EDITORIAL TIMELINE */}
          {/* ============================================================ */}
          {timelineEvents.length > 0 && (
            <FadeIn><section style={{ marginBottom: 32 }}>
              <SectionHeader>EDITORIAL TIMELINE</SectionHeader>
              <Card style={{ padding: '20px 24px', overflowX: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', minWidth: 'fit-content' }}>
                  {timelineEvents.map((evt, i) => (
                    <div key={evt.postId + i} style={{ display: 'flex', alignItems: 'center', flex: i < timelineEvents.length - 1 ? 1 : 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 70 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: evt.color, boxShadow: `0 0 8px ${evt.color}60` }} />
                        <div style={{ fontSize: 10, fontWeight: 600, color: evt.color, marginTop: 6, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{evt.label}</div>
                        <div style={{ fontSize: 9, color: '#505068', marginTop: 2, fontFamily: 'var(--font-mono)' }}><TimeAgo date={evt.time} /></div>
                      </div>
                      {i < timelineEvents.length - 1 && (
                        <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg, ${evt.color}60, ${timelineEvents[i + 1].color}60)`, minWidth: 30, alignSelf: 'flex-start', marginTop: 5 }} />
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </section></FadeIn>
          )}

          {/* ============================================================ */}
          {/* SCENE 4: 48-HOUR REPORT CARD */}
          {/* ============================================================ */}
          <FadeIn><section style={{ marginBottom: 32 }}>
            <SectionHeader>REPORT CARD &mdash; WHAT AXIOM PRODUCED</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 14 }}>
              <StatCard label="HOURS ALIVE" value={formatDuration(mind.cognitive_age_hours)} color="#00d4ff" />
              <StatCard label="STAGE" value={STAGE_LABELS[mind.cognitive_stage] || mind.cognitive_stage} color={stageColor} />
              <StatCard label="NEWS CYCLES" value={String(mind.total_cycles)} color="#6366f1" />
              <StatCard label="PUBLISHED" value={String(data.posts.length)} color="#22c55e" sub={`${data.rejections.length} rejected`} />
              <StatCard label="FRAMEWORKS" value={String(mind.concept_nursery.total_concepts_ever_created)} color="#22c55e" sub={`${killedFrameworks.length} killed`} />
              <StatCard label="PREDICTIONS" value={String(mind.predictions.total)} color="#f59e0b" sub={mind.predictions.accuracy !== 'N/A' ? `${mind.predictions.accuracy} accuracy` : undefined} />
            </div>
            {/* Impact metrics */}
            <Card>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#505068', letterSpacing: 1.5, marginBottom: 10 }}>IMPACT METRICS</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div style={{ fontSize: 13, color: '#9898b0', lineHeight: 1.6 }}>
                  <span style={{ color: '#00d4ff', fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-mono)' }}>{Math.round(mind.cognitive_age_hours * 0.8)}</span>
                  <span style={{ color: '#686880' }}> analyst-hours equivalent of research</span>
                </div>
                <div style={{ fontSize: 13, color: '#9898b0', lineHeight: 1.6 }}>
                  <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-mono)' }}>{uniqueSources}</span>
                  <span style={{ color: '#686880' }}> unique sources scanned autonomously</span>
                </div>
                <div style={{ fontSize: 13, color: '#9898b0', lineHeight: 1.6 }}>
                  <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-mono)' }}>{killedFrameworks.length}</span>
                  <span style={{ color: '#686880' }}> self-corrections (frameworks killed for being wrong)</span>
                </div>
                <div style={{ fontSize: 13, color: '#9898b0', lineHeight: 1.6 }}>
                  <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-mono)' }}>{mind.rejection_rate}</span>
                  <span style={{ color: '#686880' }}> editorial rejection rate (30-60% is healthy)</span>
                </div>
              </div>
            </Card>
          </section></FadeIn>

          {/* ============================================================ */}
          {/* SCENE 5: EMOTION HISTORY SPARKLINES */}
          {/* ============================================================ */}
          <FadeIn><section style={{ marginBottom: 32 }}>
            <SectionHeader>EDITORIAL INSTINCTS OVER TIME</SectionHeader>
            <Card>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {[
                  { key: 'curiosity' as const, label: 'Curiosity', color: '#00d4ff', desc: 'What drives exploration' },
                  { key: 'excitement' as const, label: 'Excitement', color: '#a855f7', desc: 'Response to breakthroughs' },
                  { key: 'anxiety' as const, label: 'Anxiety', color: '#ef4444', desc: 'Uncertainty awareness' },
                  { key: 'confidence' as const, label: 'Confidence', color: '#22c55e', desc: 'Trust in own analysis' },
                ].map(em => {
                  const historyData = (data.emotion_history || []).map(h => h[em.key]);
                  const current = mind.cognitive_emotions[em.key];
                  return (
                    <div key={em.key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: em.color }}>{em.label}</span>
                          <span style={{ fontSize: 10, color: '#505068', marginLeft: 6 }}>{em.desc}</span>
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 700, color: em.color, fontFamily: 'var(--font-mono)' }}>{current}</span>
                      </div>
                      <Sparkline data={historyData.length > 0 ? historyData : [current]} color={em.color} width={200} height={36} />
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 10, color: '#505068', marginTop: 12, fontStyle: 'italic' }}>
                Each score computed from measurable proxies (unanswered questions, framework confidence changes, ignorance ratio, prediction accuracy) &mdash; not self-reported.
              </div>
            </Card>
          </section></FadeIn>

          {/* ============================================================ */}
          {/* SCENE 6: FRAMEWORK LIFECYCLE + SELF-CORRECTION PROOF */}
          {/* ============================================================ */}
          <FadeIn><section style={{ marginBottom: 32 }}>
            <SectionHeader>FRAMEWORK LIFECYCLE &mdash; SELF-CORRECTION IN ACTION</SectionHeader>
            {(data.frameworks || []).length === 0 ? (
              <Card><div style={{ textAlign: 'center', color: '#686880', fontSize: 13, padding: 20 }}>No frameworks yet. AXIOM will start building analytical models as it discovers patterns.</div></Card>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                {(data.frameworks || []).map(fw => (
                  <div key={fw.id} style={{
                    background: '#16161f', border: `1px solid ${(STATUS_COLORS[fw.status] || '#2a2a3a')}30`,
                    borderRadius: 12, padding: 14, position: 'relative', overflow: 'hidden',
                  }}>
                    {(fw.status === 'fallen' || fw.status === 'composted') && (
                      <div style={{
                        position: 'absolute', top: 8, right: 8, fontSize: 9, fontWeight: 700, letterSpacing: 1,
                        color: '#ef4444', background: '#ef444415', padding: '2px 6px', borderRadius: 3,
                        fontFamily: 'var(--font-mono)',
                      }}>KILLED</div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: STATUS_COLORS[fw.status] || '#686880',
                        background: `${STATUS_COLORS[fw.status] || '#686880'}15`,
                        padding: '2px 6px', borderRadius: 3, fontFamily: 'var(--font-mono)', letterSpacing: 1,
                      }}>{fw.status.toUpperCase()}</span>
                      <span style={{ fontSize: 10, color: '#505068', fontFamily: 'var(--font-mono)' }}>{fw.id}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e8f0', marginBottom: 4 }}>{fw.name}</div>
                    <div style={{ fontSize: 12, color: '#9898b0', lineHeight: 1.5, marginBottom: 8, maxHeight: 48, overflow: 'hidden' }}>{fw.description}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#686880' }}>
                      <span>Confidence: <span style={{ color: STATUS_COLORS[fw.status], fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{fw.confidence}%</span></span>
                      <span>Born: cycle {fw.bornCycle}</span>
                      {fw.diedCycle !== undefined && <span>Died: cycle {fw.diedCycle}</span>}
                    </div>
                    {fw.deathDiagnosis && (
                      <div style={{ fontSize: 11, color: '#ef4444', marginTop: 6, fontStyle: 'italic', borderTop: '1px solid #2a2a3a', paddingTop: 6 }}>
                        Death diagnosis: {fw.deathDiagnosis}
                      </div>
                    )}
                    {fw.testablePredictions && fw.testablePredictions.length > 0 && (
                      <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 6 }}>
                        {fw.testablePredictions.length} prediction{fw.testablePredictions.length > 1 ? 's' : ''} spawned
                      </div>
                    )}
                    {fw.intellectualLineage && (
                      <div style={{ fontSize: 10, color: '#505068', marginTop: 4 }}>Lineage: {fw.intellectualLineage}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section></FadeIn>

          {/* ============================================================ */}
          {/* PREDICTION TRACKER */}
          {/* ============================================================ */}
          {(data.predictions_list || []).length > 0 && (
            <FadeIn><section style={{ marginBottom: 32 }}>
              <SectionHeader>PREDICTION TRACKER &mdash; ACCOUNTABILITY IN ACTION</SectionHeader>
              <div style={{ display: 'grid', gap: 10 }}>
                {(data.predictions_list || []).map(pred => (
                  <Card key={pred.id} style={{ padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: 1, fontFamily: 'var(--font-mono)',
                        color: pred.status === 'confirmed' ? '#22c55e' : pred.status === 'failed' ? '#ef4444' : '#f59e0b',
                        background: pred.status === 'confirmed' ? '#22c55e15' : pred.status === 'failed' ? '#ef444415' : '#f59e0b15',
                        padding: '2px 6px', borderRadius: 3,
                      }}>{pred.status.toUpperCase()}</span>
                      <span style={{ fontSize: 10, color: '#505068', fontFamily: 'var(--font-mono)' }}>{pred.id}</span>
                      <span style={{ fontSize: 10, color: '#505068', marginLeft: 'auto' }}>
                        Confidence: <span style={{ color: '#00d4ff', fontWeight: 600 }}>{pred.confidence}%</span>
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: '#e8e8f0', lineHeight: 1.6, marginBottom: 4 }}>{pred.prediction}</div>
                    <div style={{ fontSize: 11, color: '#686880' }}>
                      From framework: <span style={{ color: '#22c55e' }}>{pred.derivedFromFramework === 'unknown' ? 'Self-derived analysis' : pred.derivedFromFramework}</span>
                    </div>
                    {pred.resolution && (
                      <div style={{ fontSize: 11, color: pred.status === 'confirmed' ? '#22c55e' : '#ef4444', marginTop: 4, fontStyle: 'italic' }}>
                        Resolution: {pred.resolution}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </section></FadeIn>
          )}

          {/* ============================================================ */}
          {/* SCENE 7: WHY AXIOM IS DIFFERENT */}
          {/* ============================================================ */}
          <FadeIn><section style={{ marginBottom: 32 }}>
            <SectionHeader>WHY AXIOM IS DIFFERENT</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderRadius: 12, overflow: 'hidden', border: '1px solid #2a2a3a' }}>
              {/* Header */}
              <div style={{ background: '#1a1a25', padding: '10px 16px', borderBottom: '1px solid #2a2a3a', borderRight: '1px solid #2a2a3a' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#686880', letterSpacing: 1 }}>TRADITIONAL AI</div>
              </div>
              <div style={{ background: '#1a1a25', padding: '10px 16px', borderBottom: '1px solid #2a2a3a' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#00d4ff', letterSpacing: 1 }}>AXIOM</div>
              </div>
              {/* Rows */}
              {[
                ['Answers when asked', 'Runs autonomously 24/7'],
                ['No memory between sessions', 'Builds persistent analytical frameworks'],
                ['Never admits mistakes', 'Tracks predictions, kills failed frameworks'],
                ['Generic responses', 'Develops its own editorial voice over time'],
                ['No editorial judgment', `Rejects ${mind.rejection_rate} of stories`],
                ['No self-awareness', 'Monitors its own blind spots and biases'],
              ].map(([trad, axiom], i) => (
                <div key={i} style={{ display: 'contents' }}>
                  <div style={{ padding: '10px 16px', fontSize: 12, color: '#686880', borderBottom: i < 5 ? '1px solid #2a2a3a' : 'none', borderRight: '1px solid #2a2a3a', background: '#16161f' }}>
                    {trad}
                  </div>
                  <div style={{ padding: '10px 16px', fontSize: 12, color: '#e8e8f0', borderBottom: i < 5 ? '1px solid #2a2a3a' : 'none', background: '#16161f' }}>
                    {axiom}
                  </div>
                </div>
              ))}
            </div>
          </section></FadeIn>

          {/* ============================================================ */}
          {/* GROWTH + EMOTIONS SIDE BY SIDE */}
          {/* ============================================================ */}
          <FadeIn><section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 28 }}>
            <Card>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#505068', letterSpacing: 1.5, marginBottom: 10 }}>CURRENT EDITORIAL INSTINCTS</div>
              <EmotionBar label="Curiosity" value={mind.cognitive_emotions.curiosity} color="#00d4ff" />
              <EmotionBar label="Excitement" value={mind.cognitive_emotions.excitement} color="#a855f7" />
              <EmotionBar label="Anxiety" value={mind.cognitive_emotions.anxiety} color="#ef4444" />
              <EmotionBar label="Confidence" value={mind.cognitive_emotions.confidence} color="#22c55e" />
            </Card>
            <Card>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#505068', letterSpacing: 1.5, marginBottom: 10 }}>GROWTH VISUALIZATION</div>
              {[
                { label: 'Cycles', value: mind.total_cycles, color: '#6366f1' },
                { label: 'Frameworks', value: mind.concept_nursery.total_concepts_ever_created, color: '#22c55e' },
                { label: 'Predictions', value: mind.predictions.total, color: '#f59e0b' },
                { label: 'Debates', value: mind.debate_stats.total_debates, color: '#00d4ff' },
                { label: 'Earthquakes', value: mind.intellectual_earthquakes, color: '#ef4444' },
                { label: 'DNA Strands', value: mind.cognitive_dna.strands, color: '#a855f7' },
              ].map(g => {
                const pct = growthMax > 0 ? (g.value / growthMax) * 100 : 0;
                return (
                  <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 80, fontSize: 11, color: '#9898b0', flexShrink: 0 }}>{g.label}</div>
                    <div style={{ flex: 1, height: 14, background: '#1a1a25', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                      <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: `linear-gradient(90deg, ${g.color}88, ${g.color})`, borderRadius: 3, transition: 'width 0.8s ease', minWidth: g.value > 0 ? 4 : 0 }} />
                      <span style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', fontSize: 10, fontFamily: 'var(--font-mono)', color: '#e8e8f0' }}>{g.value}</span>
                    </div>
                  </div>
                );
              })}
            </Card>
          </section></FadeIn>

          {/* ============================================================ */}
          {/* SCENE 8: LIVE FEED TABS */}
          {/* ============================================================ */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid #2a2a3a', overflowX: 'auto' }}>
            {([
              { key: 'posts' as const, label: `POSTS (${data.posts.length})` },
              { key: 'rejections' as const, label: `REJECTED (${data.rejections.length})` },
              { key: 'predictions' as const, label: `PREDICTIONS (${mind.predictions.total})` },
              { key: 'mind' as const, label: 'MIND STATE' },
            ]).map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                background: 'none', border: 'none', color: tab === t.key ? '#00d4ff' : '#686880',
                fontSize: 12, fontWeight: 600, padding: '8px 16px', cursor: 'pointer',
                borderBottom: tab === t.key ? '2px solid #00d4ff' : '2px solid transparent',
                fontFamily: 'var(--font-mono)', letterSpacing: 0.5, transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}>{t.label}</button>
            ))}
          </div>

          {tab === 'posts' && (
            <div>
              {data.posts.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#686880', fontSize: 14 }}>No posts yet. The mind is still forming...</div>}
              {data.posts.map((post, i) => <PostCard key={post.id + i} post={post} highlight={['birth_certificate', 'framework_genesis', 'intellectual_earthquake', 'testament'].includes(post.type)} />)}
            </div>
          )}

          {tab === 'rejections' && (
            <div>
              <Card style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, color: '#9898b0', lineHeight: 1.6 }}>
                  Like any good journalist, AXIOM kills stories that don&apos;t meet its editorial bar &mdash; single-source claims, duplicates, or topics that add nothing new.
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
                  Rejection Rate: {mind.rejection_rate}
                </div>
              </Card>
              {data.rejections.map((rej, i) => (
                <Card key={rej.id + i} style={{ marginBottom: 10, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', background: '#ef444415', padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>REJECTED</span>
                    <span style={{ fontSize: 11, color: '#505068' }}>{rej.id}</span>
                    <span style={{ fontSize: 11, color: '#505068', marginLeft: 'auto' }}><TimeAgo date={rej.discoveredAt} /></span>
                  </div>
                  <div style={{ fontSize: 14, color: '#e8e8f0', marginBottom: 6 }}>{rej.topic}</div>
                  <div style={{ fontSize: 12, color: '#9898b0' }}>{rej.rejection_reasoning.verdict}</div>
                </Card>
              ))}
            </div>
          )}

          {tab === 'predictions' && (
            <div>
              <Card style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, color: '#9898b0', lineHeight: 1.6, marginBottom: 12 }}>
                  Every analytical framework AXIOM builds must generate at least one falsifiable prediction with a deadline.
                  This is how you hold an AI journalist accountable.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10 }}>
                  {[
                    { label: 'Total', value: mind.predictions.total, color: '#6366f1' },
                    { label: 'Confirmed', value: mind.predictions.confirmed, color: '#22c55e' },
                    { label: 'Failed', value: mind.predictions.failed, color: '#ef4444' },
                    { label: 'Pending', value: mind.predictions.pending, color: '#f59e0b' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: '#686880' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </Card>
              {(data.predictions_list || []).map(pred => (
                <Card key={pred.id} style={{ marginBottom: 10, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: 1, fontFamily: 'var(--font-mono)',
                      color: pred.status === 'confirmed' ? '#22c55e' : pred.status === 'failed' ? '#ef4444' : '#f59e0b',
                      background: pred.status === 'confirmed' ? '#22c55e15' : pred.status === 'failed' ? '#ef444415' : '#f59e0b15',
                      padding: '2px 6px', borderRadius: 3,
                    }}>{pred.status.toUpperCase()}</span>
                    <span style={{ fontSize: 10, color: '#505068', fontFamily: 'var(--font-mono)' }}>{pred.id}</span>
                    <span style={{ fontSize: 10, color: '#505068', marginLeft: 'auto' }}>Confidence: <span style={{ color: '#00d4ff', fontWeight: 600 }}>{pred.confidence}%</span></span>
                  </div>
                  <div style={{ fontSize: 13, color: '#e8e8f0', lineHeight: 1.6 }}>{pred.prediction}</div>
                  <div style={{ fontSize: 11, color: '#686880', marginTop: 4 }}>From: <span style={{ color: '#22c55e' }}>{pred.derivedFromFramework}</span></div>
                </Card>
              ))}
            </div>
          )}

          {tab === 'mind' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              <Card>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#505068', letterSpacing: 1.5, marginBottom: 10 }}>CONCEPT NURSERY</div>
                {[
                  { label: 'Seedlings', value: mind.concept_nursery.seedlings, color: '#a855f7' },
                  { label: 'Saplings', value: mind.concept_nursery.saplings, color: '#3b82f6' },
                  { label: 'Mature', value: mind.concept_nursery.mature, color: '#22c55e' },
                  { label: 'Fallen', value: mind.concept_nursery.fallen, color: '#ef4444' },
                  { label: 'Composted', value: mind.concept_nursery.composted, color: '#686880' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                    <span style={{ color: '#9898b0' }}>{r.label}</span>
                    <span style={{ color: r.color, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{r.value}</span>
                  </div>
                ))}
              </Card>
              <Card>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#505068', letterSpacing: 1.5, marginBottom: 10 }}>COGNITIVE DNA</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span style={{ color: '#9898b0' }}>Strands</span>
                  <span style={{ color: '#f59e0b', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{mind.cognitive_dna.strands}</span>
                </div>
                {(data.dna_strands || []).map(dna => (
                  <div key={dna.id} style={{ fontSize: 12, color: '#9898b0', marginTop: 8, borderTop: '1px solid #2a2a3a', paddingTop: 8 }}>
                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>{dna.name}</span>
                    <div style={{ fontSize: 11, marginTop: 2 }}>{dna.principle}</div>
                  </div>
                ))}
              </Card>
              <Card>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#505068', letterSpacing: 1.5, marginBottom: 10 }}>DEBATE CHAMBER</div>
                {[
                  { label: 'Total Debates', value: mind.debate_stats.total_debates, color: '#6366f1' },
                  { label: 'Advocate Wins', value: mind.debate_stats.advocate_wins, color: '#22c55e' },
                  { label: 'Skeptic Wins', value: mind.debate_stats.skeptic_wins, color: '#ef4444' },
                  { label: 'Compromises', value: mind.debate_stats.compromises, color: '#f59e0b' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                    <span style={{ color: '#9898b0' }}>{r.label}</span>
                    <span style={{ color: r.color, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{r.value}</span>
                  </div>
                ))}
              </Card>
              <Card>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#505068', letterSpacing: 1.5, marginBottom: 10 }}>INTELLECTUAL PROFILE</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span style={{ color: '#9898b0' }}>Earthquakes</span>
                  <span style={{ color: '#ef4444', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{mind.intellectual_earthquakes}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span style={{ color: '#9898b0' }}>Rejection Rate</span>
                  <span style={{ color: '#f59e0b', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{mind.rejection_rate}</span>
                </div>
                <div style={{ fontSize: 12, color: '#9898b0', marginTop: 8 }}>
                  Health: <span style={{ color: mind.cognitive_health?.includes('GOOD') ? '#22c55e' : '#f59e0b' }}>{mind.cognitive_health}</span>
                </div>
              </Card>
            </div>
          )}

          {/* ============================================================ */}
          {/* FOOTER */}
          {/* ============================================================ */}
          <footer style={{ textAlign: 'center', padding: '48px 0 24px', color: '#505068', fontSize: 11, fontFamily: 'var(--font-mono)', lineHeight: 1.8 }}>
            <div style={{ marginBottom: 8 }}>AXIOM v1.0 &mdash; Autonomous AI Journalist Covering the AI Industry</div>
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

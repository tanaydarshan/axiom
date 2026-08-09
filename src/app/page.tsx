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
  parentFramework?: string;
  compostedInto?: string;
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

interface DebateLog {
  cycle: number;
  topic?: string;
  advocate?: string;
  skeptic?: string;
  resolution?: string;
  winner: string;
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
  debate_logs?: DebateLog[];
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
  growing: '#3b82f6',
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

function getTimelineEvents(posts: Post[], frameworks: FrameworkData[], predictions: PredictionData[]) {
  const events: { time: string; label: string; color: string; postId: string; detail?: string }[] = [];
  const chronological = [...posts].reverse();

  // Birth
  const birth = chronological.find(p => p.type === 'birth_certificate');
  if (birth) events.push({ time: birth.createdAt, label: 'Mind Initialized', color: '#a855f7', postId: birth.id, detail: 'Zero knowledge. Zero frameworks. The void.' });

  // Stage transitions
  const stages = new Set<string>();
  for (const p of chronological) {
    if (p.cognitive_stage && !stages.has(p.cognitive_stage) && p.cognitive_stage !== 'infancy') {
      stages.add(p.cognitive_stage);
      const stageDescs: Record<string, string> = {
        childhood: 'First frameworks emerging. Testing ideas.',
        adolescence: 'Sharp and assertive. Named frameworks defended with data.',
        early_maturity: 'Authority earned through failure. Synthesizes across frameworks.',
      };
      events.push({
        time: p.createdAt,
        label: `Stage → ${STAGE_LABELS[p.cognitive_stage] || p.cognitive_stage}`,
        color: STAGE_COLORS[p.cognitive_stage] || '#6366f1',
        postId: p.id,
        detail: stageDescs[p.cognitive_stage] || '',
      });
    }
  }

  // All framework creations
  for (const fw of frameworks) {
    const fwPost = chronological.find(p => p.createdAt && fw.bornCycle > 0);
    events.push({
      time: fwPost?.createdAt || chronological[Math.min(fw.bornCycle, chronological.length - 1)]?.createdAt || '',
      label: `Framework: ${fw.name}`,
      color: fw.status === 'fallen' || fw.status === 'composted' ? '#ef4444' : '#22c55e',
      postId: fw.id,
      detail: `Confidence ${fw.confidence}% · ${fw.status.toUpperCase()}`,
    });
  }

  // Framework deaths
  for (const fw of frameworks) {
    if ((fw.status === 'fallen' || fw.status === 'composted') && fw.diedCycle !== undefined) {
      const deathPost = chronological.find(p => p.type === 'intellectual_earthquake') || chronological[0];
      events.push({
        time: deathPost?.createdAt || '',
        label: `Framework Killed: ${fw.name}`,
        color: '#ef4444',
        postId: fw.id,
        detail: fw.deathDiagnosis || 'Collapsed under evidence',
      });
    }
  }

  // Predictions staked
  for (const pred of predictions) {
    events.push({
      time: pred.stakedAt || chronological[0]?.createdAt || '',
      label: `Prediction: ${pred.id}`,
      color: pred.status === 'confirmed' ? '#22c55e' : pred.status === 'failed' ? '#ef4444' : '#f59e0b',
      postId: pred.id,
      detail: `${pred.prediction.substring(0, 80)}... (${pred.confidence}%)`,
    });
  }

  // Intellectual earthquakes
  for (const p of chronological) {
    if (p.type === 'intellectual_earthquake') {
      events.push({ time: p.createdAt, label: 'Intellectual Earthquake', color: '#ef4444', postId: p.id, detail: p.text.substring(0, 80) + '...' });
    }
  }

  // Cognitive DNA
  for (const p of chronological) {
    if (p.type === 'cognitive_dna') {
      events.push({ time: p.createdAt, label: 'DNA Crystallized', color: '#f59e0b', postId: p.id, detail: p.text.substring(0, 80) + '...' });
    }
  }

  // Worldview snapshots
  for (const p of chronological) {
    if (p.type === 'worldview_snapshot') {
      events.push({ time: p.createdAt, label: 'Worldview Snapshot', color: '#ec4899', postId: p.id, detail: 'Complete cognitive photograph' });
    }
  }

  // Testament
  const testament = chronological.find(p => p.type === 'testament');
  if (testament) events.push({ time: testament.createdAt, label: 'The Testament', color: '#f59e0b', postId: testament.id, detail: 'Final reflection before shutdown' });

  // First observation/analysis
  const firstObs = chronological.find(p => p.type === 'observation' || p.type === 'standard');
  if (firstObs) events.push({ time: firstObs.createdAt, label: 'First Analysis Published', color: '#6366f1', postId: firstObs.id, detail: firstObs.text.substring(0, 60) + '...' });

  // First debate
  const firstDebate = chronological.find(p => p.debate_log);
  if (firstDebate) events.push({ time: firstDebate.createdAt, label: 'First Internal Debate', color: '#00d4ff', postId: firstDebate.id, detail: firstDebate.debate_log?.resolution || '' });

  // Deduplicate by label
  const seen = new Set<string>();
  const deduped = events.filter(e => {
    if (!e.time) return false;
    const k = e.label;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  deduped.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  return deduped;
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
// NEURAL NETWORK VISUALIZATION — Interactive force-directed graph
// ============================================================

interface GraphNode {
  id: string;
  label: string;
  type: 'framework' | 'post' | 'prediction' | 'dna' | 'rejection';
  color: string;
  radius: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  detail: string;
  status?: string;
  confidence?: number;
  depth: number;
}

interface GraphEdge {
  source: string;
  target: string;
  color: string;
  label: string;
  explanation: string;
  type: 'knowledge' | 'derivation' | 'influence' | 'judgment' | 'evolution' | 'connection';
}

const EDGE_TYPE_STYLES: Record<string, { color: string; dash: number[]; label: string }> = {
  knowledge: { color: '#22c55e', dash: [], label: 'Knowledge Flow' },
  derivation: { color: '#a855f7', dash: [6, 4], label: 'Derived From' },
  influence: { color: '#f59e0b', dash: [3, 3], label: 'Influences' },
  judgment: { color: '#686880', dash: [2, 6], label: 'Editorial Judgment' },
  evolution: { color: '#ec4899', dash: [], label: 'Evolved Into' },
  connection: { color: '#6366f1', dash: [4, 4], label: 'Connected' },
};

function generateEdgeExplanation(edge: GraphEdge, sourceNode?: GraphNode, targetNode?: GraphNode): string {
  const src = sourceNode?.label || edge.source;
  const tgt = targetNode?.label || edge.target;
  switch (edge.type) {
    case 'knowledge':
      return `AXIOM applied the framework "${tgt}" while writing "${src}". This means the framework's lens actively shaped how this article was analyzed and written.`;
    case 'derivation':
      return `"${src}" was intellectually derived from "${tgt}". AXIOM recognized patterns in the parent framework and evolved them into a new analytical tool.`;
    case 'influence':
      return `The article "${src}" provided evidence that affected prediction "${tgt}". New information from this post changed AXIOM's confidence in the prediction.`;
    case 'judgment':
      return `AXIOM consulted "${tgt}" when deciding to reject this topic. The framework provided the analytical basis for the editorial decision.`;
    case 'evolution':
      return `When "${src}" was composted (retired), its useful components were recycled into "${tgt}". Ideas don't die — they evolve.`;
    case 'connection':
      return `"${src}" and "${tgt}" share thematic connections. AXIOM recognized overlapping themes or complementary analyses between these pieces.`;
    default:
      return `${src} is connected to ${tgt} through ${edge.label}.`;
  }
}

function buildGraph(data: FeedData): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const nodeIds = new Set<string>();

  const addNode = (n: GraphNode) => { if (!nodeIds.has(n.id)) { nodeIds.add(n.id); nodes.push(n); } };

  // Frameworks — central hubs
  (data.frameworks || []).forEach((fw, i) => {
    const isFallen = fw.status === 'fallen' || fw.status === 'composted';
    addNode({
      id: fw.id, label: fw.name, type: 'framework',
      color: isFallen ? '#ef4444' : fw.status === 'mature' ? '#22c55e' : fw.status === 'sapling' || fw.status === 'growing' ? '#3b82f6' : '#a855f7',
      radius: isFallen ? 16 : 14 + Math.min(fw.confidence / 5, 12),
      x: 300 + Math.cos(i * 1.8) * 100, y: 250 + Math.sin(i * 1.8) * 90,
      vx: 0, vy: 0,
      detail: `${fw.description}\n\nStatus: ${fw.status} · Confidence: ${fw.confidence}%${fw.deathDiagnosis ? '\nDeath: ' + fw.deathDiagnosis : ''}`,
      status: fw.status, confidence: fw.confidence, depth: 0,
    });
    if (fw.parentFramework) {
      edges.push({ source: fw.id, target: fw.parentFramework, color: '#a855f7', label: 'derived from', explanation: '', type: 'derivation' });
    }
    if (fw.compostedInto) {
      edges.push({ source: fw.id, target: fw.compostedInto, color: '#ec4899', label: 'evolved into', explanation: '', type: 'evolution' });
    }
  });

  // Posts — connected to frameworks
  data.posts.forEach((post, i) => {
    const typeColor = TYPE_LABELS[post.type]?.color || '#6366f1';
    addNode({
      id: post.id, label: `${TYPE_LABELS[post.type]?.icon || '▸'} ${post.id}`, type: 'post',
      color: typeColor,
      radius: post.type === 'birth_certificate' ? 12 : post.type === 'framework_genesis' || post.type === 'framework_proposal' ? 10 : 8,
      x: 100 + Math.cos(i * 0.9) * 220 + Math.random() * 30,
      y: 200 + Math.sin(i * 0.9) * 180 + Math.random() * 30,
      vx: 0, vy: 0,
      detail: post.text.substring(0, 200) + (post.text.length > 200 ? '...' : ''),
      depth: 1,
    });
    (post.frameworks_used || []).forEach(fwName => {
      const fwNode = (data.frameworks || []).find(f => f.name === fwName || f.id === fwName);
      if (fwNode) edges.push({ source: post.id, target: fwNode.id, color: '#22c55e', label: 'uses framework', explanation: '', type: 'knowledge' });
    });
    (post.connected_posts || []).forEach(pid => {
      edges.push({ source: post.id, target: pid, color: '#6366f1', label: 'connected', explanation: '', type: 'connection' });
    });
    (post.predictions_affected || []).forEach(pid => {
      edges.push({ source: post.id, target: pid, color: '#f59e0b', label: 'affects prediction', explanation: '', type: 'influence' });
    });
  });

  // Predictions
  (data.predictions_list || []).forEach((pred, i) => {
    addNode({
      id: pred.id, label: pred.id, type: 'prediction',
      color: pred.status === 'confirmed' ? '#22c55e' : pred.status === 'failed' ? '#ef4444' : '#f59e0b',
      radius: 9,
      x: 450 + Math.cos(i * 1.5) * 160, y: 200 + Math.sin(i * 1.5) * 130,
      vx: 0, vy: 0,
      detail: `${pred.prediction}\n\nConfidence: ${pred.confidence}% · Status: ${pred.status}${pred.resolution ? '\nResolution: ' + pred.resolution : ''}`,
      status: pred.status, confidence: pred.confidence, depth: 1,
    });
    const fwNode = (data.frameworks || []).find(f => f.name === pred.derivedFromFramework || f.id === pred.derivedFromFramework);
    if (fwNode) edges.push({ source: pred.id, target: fwNode.id, color: '#f59e0b', label: 'derived from', explanation: '', type: 'derivation' });
  });

  // DNA Strands
  (data.dna_strands || []).forEach((dna, i) => {
    addNode({
      id: dna.id, label: dna.name, type: 'dna',
      color: '#ec4899',
      radius: 11,
      x: 300 + Math.cos(i * 2.1 + 1) * 180, y: 250 + Math.sin(i * 2.1 + 1) * 160,
      vx: 0, vy: 0,
      detail: `${dna.principle}\n\nOrigin: ${dna.originTrace}\nCrystallized at cycle ${dna.crystallizedCycle}`,
      depth: 0,
    });
  });

  // Rejections
  data.rejections.slice(0, 5).forEach((rej, i) => {
    const rejId = rej.id || `REJ-${i}`;
    addNode({
      id: rejId, label: `✕ ${rejId}`, type: 'rejection',
      color: '#686880',
      radius: 6,
      x: 500 + Math.cos(i * 1.3) * 100, y: 350 + Math.sin(i * 1.3) * 80,
      vx: 0, vy: 0,
      detail: `REJECTED: ${rej.topic}\n\n${rej.rejection_reasoning.verdict}`,
      depth: 2,
    });
    (rej.rejection_reasoning.frameworks_consulted || []).forEach(fwName => {
      const fwNode = (data.frameworks || []).find(f => f.name === fwName || f.id === fwName);
      if (fwNode) edges.push({ source: rejId, target: fwNode.id, color: '#686880', label: 'consulted', explanation: '', type: 'judgment' });
    });
  });

  const validEdges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target) && e.source !== e.target);
  return { nodes, edges: validEdges };
}

function NeuralGraph({ data }: { data: FeedData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [hoveredEdgeIdx, setHoveredEdgeIdx] = useState<number>(-1);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, canvasX: 0, canvasY: 0 });
  const animRef = useRef<number>(0);
  const particlesRef = useRef<{ x: number; y: number; progress: number; edgeIdx: number; speed: number }[]>([]);
  const timeRef = useRef(0);

  const graph = useMemo(() => buildGraph(data), [data]);

  const thinkingPaths = useMemo(() => {
    const paths: { name: string; color: string; nodeIds: string[]; description: string }[] = [];
    (data.frameworks || []).forEach(fw => {
      const pathNodes: string[] = [fw.id];
      const relatedPosts = data.posts.filter(p => (p.frameworks_used || []).some(fu => fu === fw.name || fu === fw.id));
      relatedPosts.forEach(p => pathNodes.push(p.id));
      const relatedPreds = (data.predictions_list || []).filter(pred => pred.derivedFromFramework === fw.name || pred.derivedFromFramework === fw.id);
      relatedPreds.forEach(pred => pathNodes.push(pred.id));
      if (pathNodes.length > 1) {
        paths.push({
          name: fw.name,
          color: fw.status === 'fallen' || fw.status === 'composted' ? '#ef4444' : '#22c55e',
          nodeIds: pathNodes,
          description: `${fw.name}: ${relatedPosts.length} posts, ${relatedPreds.length} predictions`,
        });
      }
    });
    return paths;
  }, [data]);

  const [activePath, setActivePath] = useState<number>(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = container.offsetWidth;
    const H = 520;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    const nodes = graph.nodes.map(n => ({
      ...n,
      x: Math.min(Math.max(n.x * (W / 600), 50), W - 50),
      y: Math.min(Math.max(n.y * (H / 500), 50), H - 50),
    }));
    const edges = graph.edges;
    nodesRef.current = nodes;
    edgesRef.current = edges;

    // Particles flowing along edges
    const particles: typeof particlesRef.current = [];
    edges.forEach((_, idx) => {
      const count = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        particles.push({ x: 0, y: 0, progress: Math.random(), edgeIdx: idx, speed: 0.002 + Math.random() * 0.003 });
      }
    });
    particlesRef.current = particles;

    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const cx = W / 2, cy = H / 2;

    const getEdgeMid = (edge: GraphEdge, pxOff: number, pyOff: number) => {
      const a = nodeMap.get(edge.source);
      const b = nodeMap.get(edge.target);
      if (!a || !b) return null;
      const ax = a.x + pxOff * a.depth, ay = a.y + pyOff * a.depth;
      const bx = b.x + pxOff * b.depth, by = b.y + pyOff * b.depth;
      const midX = (ax + bx) / 2 + (ay - by) * 0.1;
      const midY = (ay + by) / 2 + (bx - ax) * 0.1;
      return { ax, ay, bx, by, midX, midY };
    };

    const draw = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      ctx.clearRect(0, 0, W, H);

      // Clean dark background — no stars, intellectual and sleek
      ctx.fillStyle = '#0c0c14';
      ctx.fillRect(0, 0, W, H);

      // Subtle center radial glow
      const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.45);
      centerGlow.addColorStop(0, '#14142208');
      centerGlow.addColorStop(1, '#0c0c1400');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, W, H);

      // Force simulation — organic jiggle with good spacing
      const damping = 0.92;
      const repulsion = 1200;
      const attraction = 0.007;
      const gravity = 0.015;

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        // Gentle gravity toward center
        a.vx += (cx - a.x) * gravity;
        a.vy += (cy - a.y) * gravity;
        // Micro-jiggle for organic feel
        a.vx += (Math.sin(t * 1.5 + i * 2.1) * 0.15);
        a.vy += (Math.cos(t * 1.2 + i * 1.7) * 0.15);

        // Strong repulsion for good spacing
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < 1) { dx = 1; dy = 1; }
          const dist = Math.sqrt(dist2);
          const minDist = a.radius + b.radius + 35;
          if (dist < minDist * 4) {
            const force = repulsion / dist2;
            a.vx += dx / dist * force;
            a.vy += dy / dist * force;
            b.vx -= dx / dist * force;
            b.vy -= dy / dist * force;
          }
        }
      }

      // Attraction along edges
      for (const edge of edges) {
        const a = nodeMap.get(edge.source);
        const b = nodeMap.get(edge.target);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          const targetDist = 90 + a.radius + b.radius;
          const force = (dist - targetDist) * attraction;
          a.vx += dx / dist * force;
          a.vy += dy / dist * force;
          b.vx -= dx / dist * force;
          b.vy -= dy / dist * force;
        }
      }

      for (const n of nodes) {
        n.vx *= damping;
        n.vy *= damping;
        n.x += n.vx;
        n.y += n.vy;
        n.x = Math.max(n.radius + 12, Math.min(W - n.radius - 12, n.x));
        n.y = Math.max(n.radius + 12, Math.min(H - n.radius - 12, n.y));
      }

      // Mouse parallax
      const px = (mouseRef.current.x - W / 2) * 0.01;
      const py = (mouseRef.current.y - H / 2) * 0.01;

      // Hover detection
      const mx = mouseRef.current.canvasX;
      const my = mouseRef.current.canvasY;
      let hovered: GraphNode | null = null;
      for (const n of nodes) {
        const dx = (n.x + px * n.depth) - mx;
        const dy = (n.y + py * n.depth) - my;
        if (dx * dx + dy * dy < (n.radius + 6) * (n.radius + 6)) {
          hovered = n;
          break;
        }
      }

      // Edge hover detection
      let hovEdgeIdx = -1;
      if (!hovered) {
        for (let ei = 0; ei < edges.length; ei++) {
          const mid = getEdgeMid(edges[ei], px, py);
          if (!mid) continue;
          const samples = 5;
          for (let s = 0; s < samples; s++) {
            const st = (s + 1) / (samples + 1);
            const t1 = 1 - st;
            const sx = t1 * t1 * mid.ax + 2 * t1 * st * mid.midX + st * st * mid.bx;
            const sy = t1 * t1 * mid.ay + 2 * t1 * st * mid.midY + st * st * mid.by;
            const d2 = (mx - sx) * (mx - sx) + (my - sy) * (my - sy);
            if (d2 < 200) { hovEdgeIdx = ei; break; }
          }
          if (hovEdgeIdx >= 0) break;
        }
      }

      // Path and connected node sets
      const pathNodeIds = new Set<string>();
      if (activePath >= 0 && thinkingPaths[activePath]) {
        thinkingPaths[activePath].nodeIds.forEach(id => pathNodeIds.add(id));
      }

      const connectedIds = new Set<string>();
      if (hovered) {
        connectedIds.add(hovered.id);
        for (const e of edges) {
          if (e.source === hovered.id) connectedIds.add(e.target);
          if (e.target === hovered.id) connectedIds.add(e.source);
        }
      }

      // ---- Draw edges ----
      for (let ei = 0; ei < edges.length; ei++) {
        const edge = edges[ei];
        const mid = getEdgeMid(edge, px, py);
        if (!mid) continue;
        const { ax, ay, bx, by, midX, midY } = mid;

        const isNodeHighlighted = hovered && (edge.source === hovered.id || edge.target === hovered.id);
        const isEdgeHovered = hovEdgeIdx === ei;
        const isPathEdge = pathNodeIds.has(edge.source) && pathNodeIds.has(edge.target);
        const dimmedByPath = pathNodeIds.size > 0 && !isPathEdge;
        const style = EDGE_TYPE_STYLES[edge.type] || EDGE_TYPE_STYLES.connection;

        let alpha: number, width: number;
        if (isEdgeHovered) { alpha = 0.85; width = 2.5; }
        else if (isNodeHighlighted) { alpha = 0.55; width = 2; }
        else if (isPathEdge) { alpha = 0.65; width = 2; }
        else if (dimmedByPath) { alpha = 0.04; width = 0.5; }
        else if (hovered) { alpha = 0.06; width = 0.5; }
        else { alpha = 0.25; width = 1.2; }

        // Edge glow for highlighted
        if ((isNodeHighlighted || isEdgeHovered || isPathEdge) && alpha > 0.3) {
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.quadraticCurveTo(midX, midY, bx, by);
          ctx.strokeStyle = style.color;
          ctx.globalAlpha = alpha * 0.2;
          ctx.lineWidth = width + 4;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        ctx.beginPath();
        ctx.setLineDash(style.dash);
        ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo(midX, midY, bx, by);
        ctx.strokeStyle = style.color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = width;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        // Direction arrow
        if ((isNodeHighlighted || isEdgeHovered || isPathEdge) && alpha > 0.3) {
          const at = 0.72;
          const t1 = 1 - at;
          const arX = t1 * t1 * ax + 2 * t1 * at * midX + at * at * bx;
          const arY = t1 * t1 * ay + 2 * t1 * at * midY + at * at * by;
          const dt = 0.02;
          const at2 = at + dt;
          const t2 = 1 - at2;
          const arX2 = t2 * t2 * ax + 2 * t2 * at2 * midX + at2 * at2 * bx;
          const arY2 = t2 * t2 * ay + 2 * t2 * at2 * midY + at2 * at2 * by;
          const ang = Math.atan2(arY2 - arY, arX2 - arX);
          const sz = 5;
          ctx.beginPath();
          ctx.moveTo(arX + Math.cos(ang) * sz, arY + Math.sin(ang) * sz);
          ctx.lineTo(arX + Math.cos(ang + 2.5) * sz, arY + Math.sin(ang + 2.5) * sz);
          ctx.lineTo(arX + Math.cos(ang - 2.5) * sz, arY + Math.sin(ang - 2.5) * sz);
          ctx.closePath();
          ctx.fillStyle = style.color;
          ctx.globalAlpha = alpha * 0.7;
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        // Edge label on hover
        if (isEdgeHovered) {
          const labelText = edge.label.toUpperCase();
          ctx.font = '600 9px "Geist Mono", "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          const tw = ctx.measureText(labelText).width + 10;
          ctx.fillStyle = '#16161fee';
          ctx.beginPath();
          ctx.roundRect(midX - tw / 2, midY - 20, tw, 16, 4);
          ctx.fill();
          ctx.fillStyle = style.color;
          ctx.globalAlpha = 0.9;
          ctx.fillText(labelText, midX, midY - 8);
          ctx.globalAlpha = 1;
        }
      }

      // ---- Particles ----
      for (const p of particles) {
        const edge = edges[p.edgeIdx];
        if (!edge) continue;
        const mid = getEdgeMid(edge, px, py);
        if (!mid) continue;
        p.progress += p.speed;
        if (p.progress > 1) p.progress -= 1;
        const prog = p.progress;
        const { ax, ay, bx, by, midX, midY } = mid;
        const t1 = 1 - prog;
        p.x = t1 * t1 * ax + 2 * t1 * prog * midX + prog * prog * bx;
        p.y = t1 * t1 * ay + 2 * t1 * prog * midY + prog * prog * by;

        const isEdgeHighlighted = hovered && (edge.source === hovered.id || edge.target === hovered.id);
        const isPathEdge = pathNodeIds.has(edge.source) && pathNodeIds.has(edge.target);
        const dimmedByPath = pathNodeIds.size > 0 && !isPathEdge;
        const pAlpha = isEdgeHighlighted || isPathEdge ? 0.9 : dimmedByPath ? 0.02 : (hovered ? 0.05 : 0.4);
        const pSize = isEdgeHighlighted || isPathEdge ? 2.5 : 1.8;

        // Particle glow
        if (pAlpha > 0.3) {
          const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pSize + 3);
          const style = EDGE_TYPE_STYLES[edge.type] || EDGE_TYPE_STYLES.connection;
          pg.addColorStop(0, style.color + '40');
          pg.addColorStop(1, style.color + '00');
          ctx.beginPath();
          ctx.arc(p.x, p.y, pSize + 3, 0, Math.PI * 2);
          ctx.fillStyle = pg;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, pSize, 0, Math.PI * 2);
        const style = EDGE_TYPE_STYLES[edge.type] || EDGE_TYPE_STYLES.connection;
        ctx.fillStyle = style.color;
        ctx.globalAlpha = pAlpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // ---- Draw nodes ----
      for (const n of nodes) {
        const nx = n.x + px * n.depth;
        const ny = n.y + py * n.depth;
        const isConnected = connectedIds.has(n.id);
        const isInPath = pathNodeIds.has(n.id);
        const dimmedByHover = hovered && !isConnected;
        const dimmedByPathSel = pathNodeIds.size > 0 && !isInPath;
        const dimmed = dimmedByHover || dimmedByPathSel;
        const isHovered = hovered?.id === n.id;

        // Glow
        if (isHovered || (!hovered && !dimmedByPathSel && n.type === 'framework')) {
          const glowRadius = n.radius + (isHovered ? 18 : 8);
          const glow = ctx.createRadialGradient(nx, ny, n.radius * 0.5, nx, ny, glowRadius);
          glow.addColorStop(0, n.color + '40');
          glow.addColorStop(1, n.color + '00');
          ctx.beginPath();
          ctx.arc(nx, ny, glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        // Node circle with organic pulse
        const pulse = n.type === 'framework' ? 1 + Math.sin(t * 2 + nodes.indexOf(n)) * 0.08 : 1;
        const nr = n.radius * pulse;
        ctx.beginPath();
        ctx.arc(nx, ny, nr, 0, Math.PI * 2);
        ctx.fillStyle = dimmed ? '#1a1a25' : n.color + '25';
        ctx.fill();
        ctx.strokeStyle = dimmed ? '#2a2a3a' : n.color;
        ctx.lineWidth = isHovered ? 2.5 : 1.5;
        ctx.globalAlpha = dimmed ? 0.25 : 1;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Confidence ring for frameworks
        if (n.type === 'framework' && n.confidence !== undefined && !dimmed) {
          const angle = (n.confidence / 100) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(nx, ny, nr + 4, -Math.PI / 2, -Math.PI / 2 + angle);
          ctx.strokeStyle = n.color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Label
        if (isHovered || isConnected || isInPath || (!hovered && !dimmedByPathSel && n.type === 'framework')) {
          const labelText = n.label.length > 24 ? n.label.substring(0, 22) + '…' : n.label;
          ctx.font = `${isHovered ? '600 11px' : '500 9px'} 'Geist Mono', 'JetBrains Mono', monospace`;
          ctx.textAlign = 'center';
          ctx.fillStyle = dimmed ? '#505068' : '#e8e8f0';
          ctx.globalAlpha = dimmed ? 0.4 : isHovered ? 1 : 0.8;
          ctx.fillText(labelText, nx, ny + nr + 14);
          ctx.globalAlpha = 1;
        }

        // Type icon in center
        if (nr >= 8 && !dimmed) {
          const icons: Record<string, string> = { framework: '◆', post: '▸', prediction: '⊕', dna: '⚙', rejection: '✕' };
          ctx.font = `${Math.max(8, nr * 0.65)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = n.color;
          ctx.globalAlpha = 0.75;
          ctx.fillText(icons[n.type] || '•', nx, ny);
          ctx.globalAlpha = 1;
          ctx.textBaseline = 'alphabetic';
        }
      }

      // Legend — includes all colors including red (Fallen)
      ctx.font = '500 9px "Geist Mono", monospace';
      ctx.textAlign = 'left';
      const legend = [
        { label: 'Framework (active)', color: '#22c55e' },
        { label: 'Framework (fallen)', color: '#ef4444' },
        { label: 'Article', color: '#6366f1' },
        { label: 'Prediction', color: '#f59e0b' },
        { label: 'DNA Strand', color: '#ec4899' },
        { label: 'Rejected', color: '#686880' },
      ];
      legend.forEach((item, i) => {
        const lx = 12, ly = H - 10 - (legend.length - 1 - i) * 15;
        ctx.beginPath();
        ctx.arc(lx + 4, ly - 3, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = item.color;
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#686880';
        ctx.fillText(item.label, lx + 13, ly);
      });

      animRef.current = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.canvasX = e.clientX - rect.left;
      mouseRef.current.canvasY = e.clientY - rect.top;

      const mmx = mouseRef.current.canvasX;
      const mmy = mouseRef.current.canvasY;
      const pxOff = (mouseRef.current.x - W / 2) * 0.01;
      const pyOff = (mouseRef.current.y - H / 2) * 0.01;

      let found: GraphNode | null = null;
      for (const n of nodes) {
        const dx = (n.x + pxOff * n.depth) - mmx;
        const dy = (n.y + pyOff * n.depth) - mmy;
        if (dx * dx + dy * dy < (n.radius + 6) * (n.radius + 6)) {
          found = n;
          break;
        }
      }
      setHoveredNode(found);

      let hovEI = -1;
      if (!found) {
        for (let ei = 0; ei < edges.length; ei++) {
          const mid = getEdgeMid(edges[ei], pxOff, pyOff);
          if (!mid) continue;
          const samples = 5;
          for (let s = 0; s < samples; s++) {
            const st = (s + 1) / (samples + 1);
            const t1 = 1 - st;
            const sx = t1 * t1 * mid.ax + 2 * t1 * st * mid.midX + st * st * mid.bx;
            const sy = t1 * t1 * mid.ay + 2 * t1 * st * mid.midY + st * st * mid.by;
            const d2 = (mmx - sx) * (mmx - sx) + (mmy - sy) * (mmy - sy);
            if (d2 < 200) { hovEI = ei; break; }
          }
          if (hovEI >= 0) break;
        }
      }
      setHoveredEdgeIdx(hovEI);
      canvas.style.cursor = found || hovEI >= 0 ? 'pointer' : 'default';
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cmx = e.clientX - rect.left;
      const cmy = e.clientY - rect.top;
      const pxOff = (cmx - W / 2) * 0.01;
      const pyOff = (cmy - H / 2) * 0.01;

      for (const n of nodes) {
        const dx = (n.x + pxOff * n.depth) - cmx;
        const dy = (n.y + pyOff * n.depth) - cmy;
        if (dx * dx + dy * dy < (n.radius + 6) * (n.radius + 6)) {
          setSelectedNode(prev => prev?.id === n.id ? null : n);
          setSelectedEdge(null);
          return;
        }
      }

      for (let ei = 0; ei < edges.length; ei++) {
        const mid = getEdgeMid(edges[ei], pxOff, pyOff);
        if (!mid) continue;
        const samples = 5;
        for (let s = 0; s < samples; s++) {
          const st = (s + 1) / (samples + 1);
          const t1 = 1 - st;
          const sx = t1 * t1 * mid.ax + 2 * t1 * st * mid.midX + st * st * mid.bx;
          const sy = t1 * t1 * mid.ay + 2 * t1 * st * mid.midY + st * st * mid.by;
          const d2 = (cmx - sx) * (cmx - sx) + (cmy - sy) * (cmy - sy);
          if (d2 < 200) {
            setSelectedEdge(prev => prev === edges[ei] ? null : edges[ei]);
            setSelectedNode(null);
            return;
          }
        }
      }

      setSelectedNode(null);
      setSelectedEdge(null);
    };

    draw();
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph, activePath, thinkingPaths]);

  const TYPE_COLORS: Record<string, string> = { framework: '#22c55e', post: '#6366f1', prediction: '#f59e0b', dna: '#ec4899', rejection: '#686880' };

  const selectedEdgeSourceNode = selectedEdge ? nodesRef.current.find(n => n.id === selectedEdge.source) : null;
  const selectedEdgeTargetNode = selectedEdge ? nodesRef.current.find(n => n.id === selectedEdge.target) : null;

  return (
    <section style={{ marginBottom: 32 }}>
      <SectionHeader>NEURAL MAP &mdash; AXIOM&apos;S COGNITIVE NETWORK</SectionHeader>

      {/* Thinking Paths */}
      {thinkingPaths.length > 0 && (
        <div style={{ display: 'flex', gap: 6, padding: '8px 0', marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#505068', letterSpacing: 1, fontFamily: 'var(--font-mono)', marginRight: 4 }}>TRACE PATH:</span>
          <button
            onClick={() => setActivePath(-1)}
            style={{
              background: activePath === -1 ? '#22c55e15' : 'transparent',
              border: `1px solid ${activePath === -1 ? '#22c55e40' : '#2a2a3a'}`,
              borderRadius: 6, padding: '3px 10px', fontSize: 10, cursor: 'pointer',
              color: activePath === -1 ? '#22c55e' : '#686880', fontFamily: 'var(--font-mono)',
            }}
          >ALL</button>
          {thinkingPaths.map((path, i) => (
            <button
              key={i}
              onClick={() => setActivePath(activePath === i ? -1 : i)}
              style={{
                background: activePath === i ? path.color + '15' : 'transparent',
                border: `1px solid ${activePath === i ? path.color + '40' : '#2a2a3a'}`,
                borderRadius: 6, padding: '3px 10px', fontSize: 10, cursor: 'pointer',
                color: activePath === i ? path.color : '#686880', fontFamily: 'var(--font-mono)',
                maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
              title={path.description}
            >{path.name}</button>
          ))}
        </div>
      )}

      <div ref={containerRef} style={{ background: '#0c0c14', border: '1px solid #2a2a3a', borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: 520 }} />

        {/* Hover tooltip */}
        {hoveredNode && !selectedNode && !selectedEdge && (
          <div style={{
            position: 'absolute', top: 12, right: 12, width: 250,
            background: '#16161fee', border: `1px solid ${hoveredNode.color}40`,
            borderRadius: 10, padding: 14, pointerEvents: 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: hoveredNode.color, flexShrink: 0 }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: hoveredNode.color, letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>
                {hoveredNode.type.toUpperCase()}
              </span>
              {hoveredNode.confidence !== undefined && (
                <span style={{ fontSize: 9, color: '#00d4ff', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>{hoveredNode.confidence}%</span>
              )}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e8e8f0', marginBottom: 6, lineHeight: 1.3 }}>{hoveredNode.label}</div>
            <div style={{ fontSize: 11, color: '#9898b0', lineHeight: 1.5, whiteSpace: 'pre-wrap', maxHeight: 120, overflow: 'hidden' }}>
              {hoveredNode.detail}
            </div>
          </div>
        )}

        {/* Edge hover tooltip */}
        {hoveredEdgeIdx >= 0 && !selectedNode && !selectedEdge && !hoveredNode && (
          <div style={{
            position: 'absolute', top: 12, right: 12, width: 240,
            background: '#16161fee', border: `1px solid ${(EDGE_TYPE_STYLES[edgesRef.current[hoveredEdgeIdx]?.type] || EDGE_TYPE_STYLES.connection).color}40`,
            borderRadius: 10, padding: 14, pointerEvents: 'none',
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: (EDGE_TYPE_STYLES[edgesRef.current[hoveredEdgeIdx]?.type] || EDGE_TYPE_STYLES.connection).color, letterSpacing: 1, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
              {(EDGE_TYPE_STYLES[edgesRef.current[hoveredEdgeIdx]?.type] || EDGE_TYPE_STYLES.connection).label.toUpperCase()}
            </div>
            <div style={{ fontSize: 11, color: '#9898b0' }}>{edgesRef.current[hoveredEdgeIdx]?.label}</div>
            <div style={{ fontSize: 9, color: '#505068', marginTop: 6, fontFamily: 'var(--font-mono)' }}>Click to understand this connection</div>
          </div>
        )}

        {/* Selected NODE panel */}
        {selectedNode && (
          <div style={{
            position: 'absolute', top: 12, right: 12, width: 300,
            background: '#16161ffa', border: `1px solid ${selectedNode.color}60`,
            borderRadius: 12, padding: 18, maxHeight: 460, overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: selectedNode.color, letterSpacing: 1, fontFamily: 'var(--font-mono)', background: selectedNode.color + '15', padding: '2px 8px', borderRadius: 4 }}>
                {selectedNode.type.toUpperCase()}
              </span>
              <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', color: '#686880', cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e8e8f0', marginBottom: 8, lineHeight: 1.3 }}>{selectedNode.label}</div>
            {selectedNode.status && (
              <div style={{ fontSize: 11, color: '#686880', marginBottom: 6 }}>
                Status: <span style={{ color: selectedNode.color, fontWeight: 600 }}>{selectedNode.status.toUpperCase()}</span>
                {selectedNode.confidence !== undefined && <> · Confidence: <span style={{ color: '#00d4ff' }}>{selectedNode.confidence}%</span></>}
              </div>
            )}
            <div style={{ fontSize: 12, color: '#9898b0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selectedNode.detail}</div>
            <div style={{ marginTop: 12, borderTop: '1px solid #2a2a3a', paddingTop: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#505068', letterSpacing: 1, marginBottom: 6 }}>CONNECTIONS</div>
              {edgesRef.current.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).map((e, i) => {
                const otherId = e.source === selectedNode.id ? e.target : e.source;
                const otherNode = nodesRef.current.find(n => n.id === otherId);
                const style = EDGE_TYPE_STYLES[e.type] || EDGE_TYPE_STYLES.connection;
                return (
                  <div key={i}
                    onClick={() => { setSelectedEdge(e); setSelectedNode(null); }}
                    style={{ fontSize: 11, color: '#686880', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '2px 4px', borderRadius: 4 }}
                    onMouseEnter={ev => (ev.currentTarget.style.background = '#ffffff08')}
                    onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: style.color, flexShrink: 0 }} />
                    <span style={{ color: '#9898b0' }}>{e.label}</span>
                    <span style={{ color: TYPE_COLORS[otherNode?.type || 'post'], fontFamily: 'var(--font-mono)', fontSize: 10 }}>{otherNode?.label || otherId}</span>
                  </div>
                );
              })}
              {edgesRef.current.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length === 0 && (
                <div style={{ fontSize: 11, color: '#505068', fontStyle: 'italic' }}>No direct connections</div>
              )}
            </div>
          </div>
        )}

        {/* Selected EDGE explanation panel */}
        {selectedEdge && (
          <div style={{
            position: 'absolute', top: 12, right: 12, width: 310,
            background: '#16161ffa', border: `1px solid ${(EDGE_TYPE_STYLES[selectedEdge.type] || EDGE_TYPE_STYLES.connection).color}60`,
            borderRadius: 12, padding: 18, maxHeight: 460, overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: (EDGE_TYPE_STYLES[selectedEdge.type] || EDGE_TYPE_STYLES.connection).color, letterSpacing: 1, fontFamily: 'var(--font-mono)', background: (EDGE_TYPE_STYLES[selectedEdge.type] || EDGE_TYPE_STYLES.connection).color + '15', padding: '2px 8px', borderRadius: 4 }}>
                CONNECTION
              </span>
              <button onClick={() => setSelectedEdge(null)} style={{ background: 'none', border: 'none', color: '#686880', cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '8px 10px', background: '#0c0c1480', borderRadius: 8 }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_COLORS[selectedEdgeSourceNode?.type || 'post'], margin: '0 auto 3px' }} />
                <div style={{ fontSize: 10, color: '#e8e8f0', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedEdgeSourceNode?.label || selectedEdge.source}</div>
              </div>
              <div style={{ fontSize: 8, color: (EDGE_TYPE_STYLES[selectedEdge.type] || EDGE_TYPE_STYLES.connection).color, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{selectedEdge.label}</div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_COLORS[selectedEdgeTargetNode?.type || 'post'], margin: '0 auto 3px' }} />
                <div style={{ fontSize: 10, color: '#e8e8f0', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedEdgeTargetNode?.label || selectedEdge.target}</div>
              </div>
            </div>

            <div style={{ fontSize: 9, fontWeight: 700, color: '#505068', letterSpacing: 1, marginBottom: 4, fontFamily: 'var(--font-mono)' }}>WHAT THIS MEANS</div>
            <div style={{ fontSize: 12, color: '#b8b8c8', lineHeight: 1.7 }}>
              {generateEdgeExplanation(selectedEdge, selectedEdgeSourceNode || undefined, selectedEdgeTargetNode || undefined)}
            </div>

            <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
              {selectedEdgeSourceNode && (
                <button
                  onClick={() => { setSelectedNode(selectedEdgeSourceNode); setSelectedEdge(null); }}
                  style={{ flex: 1, background: '#ffffff06', border: '1px solid #2a2a3a', borderRadius: 6, padding: '5px 8px', fontSize: 10, color: '#9898b0', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
                >Inspect source</button>
              )}
              {selectedEdgeTargetNode && (
                <button
                  onClick={() => { setSelectedNode(selectedEdgeTargetNode); setSelectedEdge(null); }}
                  style={{ flex: 1, background: '#ffffff06', border: '1px solid #2a2a3a', borderRadius: 6, padding: '5px 8px', fontSize: 10, color: '#9898b0', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
                >Inspect target</button>
              )}
            </div>
          </div>
        )}

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: 16, padding: '10px 16px', borderTop: '1px solid #1a1a25', fontSize: 10, color: '#505068', fontFamily: 'var(--font-mono)' }}>
          <span>{graph.nodes.length} nodes</span>
          <span>{graph.edges.length} synapses</span>
          <span style={{ color: '#22c55e' }}>{graph.nodes.filter(n => n.type === 'framework').length} frameworks</span>
          <span style={{ color: '#f59e0b' }}>{graph.nodes.filter(n => n.type === 'prediction').length} predictions</span>
          <span style={{ color: '#ec4899' }}>{graph.nodes.filter(n => n.type === 'dna').length} DNA</span>
          <span style={{ marginLeft: 'auto', color: '#686880' }}>hover to explore · click nodes or connections</span>
        </div>
      </div>
    </section>
  );
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
// THE PROBLEM — Why AXIOM Exists
// ============================================================

function ProblemStatement() {
  return (
    <section style={{ marginBottom: 32 }}>
      <SectionHeader>THE PROBLEM &mdash; WHY AI NEWS TRACKING IS BROKEN</SectionHeader>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
        <Card style={{ borderLeft: '3px solid #ef4444' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>500+</div>
          <div style={{ fontSize: 13, color: '#e8e8f0', fontWeight: 600, marginBottom: 4 }}>AI news articles published daily</div>
          <div style={{ fontSize: 12, color: '#686880', lineHeight: 1.5 }}>No human analyst can track every development across research labs, startups, regulators, and open-source communities simultaneously.</div>
        </Card>
        <Card style={{ borderLeft: '3px solid #f59e0b' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>0%</div>
          <div style={{ fontSize: 13, color: '#e8e8f0', fontWeight: 600, marginBottom: 4 }}>Accountability in AI news curation</div>
          <div style={{ fontSize: 12, color: '#686880', lineHeight: 1.5 }}>Most AI tools summarize on demand but don&apos;t track whether their analysis was right. No predictions, no self-correction, no intellectual honesty.</div>
        </Card>
        <Card style={{ borderLeft: '3px solid #00d4ff' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#00d4ff', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>24/7</div>
          <div style={{ fontSize: 13, color: '#e8e8f0', fontWeight: 600, marginBottom: 4 }}>Coverage gap in autonomous journalism</div>
          <div style={{ fontSize: 12, color: '#686880', lineHeight: 1.5 }}>Most AI tools wait for you to ask. AXIOM autonomously monitors, analyzes, and builds an evolving worldview without human prompting.</div>
        </Card>
      </div>
      <Card>
        <div style={{ fontSize: 13, color: '#9898b0', lineHeight: 1.7, textAlign: 'center' }}>
          <span style={{ color: '#00d4ff', fontWeight: 700 }}>AXIOM addresses this</span> by running a fully autonomous journalism pipeline every 35 minutes &mdash;
          scanning real news from multiple sources, forming independent analytical frameworks,
          debating itself before publishing, making falsifiable predictions, and publicly correcting itself when wrong.
          <span style={{ color: '#f59e0b', fontWeight: 600 }}> No human input required.</span>
        </div>
      </Card>
    </section>
  );
}

// ============================================================
// COGNITIVE DASHBOARD — Multi-panel live view of AXIOM's mind
// ============================================================

function CognitiveDashboard({ data, mind }: { data: FeedData; mind: MindState }) {
  const allSources = useMemo(() => {
    const urls: string[] = [];
    const seen = new Set<string>();
    data.posts.forEach(p => p.sources?.forEach(s => {
      if (!seen.has(s)) { seen.add(s); urls.push(s); }
    }));
    return urls;
  }, [data]);

  const latestDebate = useMemo(() => {
    if (data.debate_logs && data.debate_logs.length > 0) {
      return data.debate_logs[data.debate_logs.length - 1];
    }
    const post = data.posts.find(p => p.debate_log && p.type !== 'birth_certificate');
    if (post?.debate_log) {
      return {
        cycle: 0,
        topic: '',
        advocate: post.debate_log.advocate_position || post.debate_log.advocate || '',
        skeptic: post.debate_log.skeptic_position || post.debate_log.skeptic || '',
        resolution: post.debate_log.resolution || '',
        winner: '',
      };
    }
    return null;
  }, [data]);

  const emotions = mind.cognitive_emotions;
  const emotionEntries = [
    { key: 'curiosity', value: emotions.curiosity, color: '#00d4ff', desc: 'Driven by unanswered questions' },
    { key: 'excitement', value: emotions.excitement, color: '#a855f7', desc: 'Response to framework shifts' },
    { key: 'anxiety', value: emotions.anxiety, color: '#ef4444', desc: 'Proportion of unknowns' },
    { key: 'confidence', value: emotions.confidence, color: '#22c55e', desc: 'Based on prediction accuracy' },
  ];

  return (
    <section style={{ marginBottom: 32 }}>
      <SectionHeader>COGNITIVE DASHBOARD &mdash; REAL-TIME VIEW OF AXIOM&apos;S MIND</SectionHeader>
      {/* Row 1: Sources + Debate side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        {/* Panel 1: Sources Scanned */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#3b82f620', border: '1px solid #3b82f640', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#3b82f6', fontFamily: 'var(--font-mono)' }}>01</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>SOURCES SCANNED</div>
            <div style={{ marginLeft: 'auto', fontSize: 16, fontWeight: 800, color: '#3b82f6', fontFamily: 'var(--font-mono)' }}>{allSources.length || '43+'}</div>
          </div>
          <div style={{ fontSize: 11, color: '#9898b0', lineHeight: 1.5, marginBottom: 8 }}>
            Aggregates from <span style={{ color: '#3b82f6', fontWeight: 600 }}>multiple news outlets</span> via Google News RSS. Each article is deduplicated before analysis.
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {['Reuters', 'AP News', 'The Verge', 'TechCrunch', 'Ars Technica', 'MIT Tech Review', 'Al Jazeera', 'BBC'].map(name => (
              <span key={name} style={{ fontSize: 9, background: '#3b82f610', color: '#3b82f6', padding: '2px 6px', borderRadius: 3, fontFamily: 'var(--font-mono)' }}>{name}</span>
            ))}
          </div>
        </Card>

        {/* Panel 2: Internal Debate */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#a855f720', border: '1px solid #a855f740', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#a855f7', fontFamily: 'var(--font-mono)' }}>02</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#a855f7', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>LATEST INTERNAL DEBATE</div>
          </div>
          {latestDebate ? (
            <>
              {latestDebate.topic && (
                <div style={{ fontSize: 11, color: '#c0c0d8', marginBottom: 6, fontWeight: 600 }}>{latestDebate.topic}</div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
                <div style={{ fontSize: 11, color: '#9898b0', lineHeight: 1.4, background: '#22c55e08', borderRadius: 6, padding: '6px 8px', borderLeft: '2px solid #22c55e40' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#22c55e', letterSpacing: 0.5 }}>ADVOCATE</span><br />
                  {(latestDebate.advocate || '').substring(0, 120)}{(latestDebate.advocate || '').length > 120 ? '...' : ''}
                </div>
                <div style={{ fontSize: 11, color: '#9898b0', lineHeight: 1.4, background: '#ef444408', borderRadius: 6, padding: '6px 8px', borderLeft: '2px solid #ef444440' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', letterSpacing: 0.5 }}>SKEPTIC</span><br />
                  {(latestDebate.skeptic || '').substring(0, 120)}{(latestDebate.skeptic || '').length > 120 ? '...' : ''}
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#f59e0b', lineHeight: 1.4 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>VERDICT:</span> {(latestDebate.resolution || '').substring(0, 100)}{(latestDebate.resolution || '').length > 100 ? '...' : ''}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: '#505068', fontStyle: 'italic' }}>Debate data will appear after the first editorial cycle.</div>
          )}
          <div style={{ fontSize: 10, color: '#505068', marginTop: 6, fontStyle: 'italic' }}>
            {mind.debate_stats.total_debates} debates &middot; {mind.debate_stats.advocate_wins} published &middot; {mind.debate_stats.skeptic_wins} rejected &middot; {mind.debate_stats.compromises} compromise
          </div>
        </Card>
      </div>

      {/* Row 2: Emotions + Verification side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Panel 3: Emotional State */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#ec489920', border: '1px solid #ec489940', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#ec4899', fontFamily: 'var(--font-mono)' }}>03</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#ec4899', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>COGNITIVE EMOTIONS</div>
          </div>
          {emotionEntries.map(em => (
            <div key={em.key} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: em.color, textTransform: 'capitalize' }}>{em.key}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: em.color, fontFamily: 'var(--font-mono)' }}>{em.value}</span>
              </div>
              <div style={{ height: 5, background: '#1a1a25', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${em.value}%`, height: '100%', background: `linear-gradient(90deg, ${em.color}60, ${em.color})`, borderRadius: 3, transition: 'width 1s ease' }} />
              </div>
              <div style={{ fontSize: 9, color: '#505068', marginTop: 1 }}>{em.desc}</div>
            </div>
          ))}
          <div style={{ fontSize: 10, color: '#505068', marginTop: 4, fontStyle: 'italic', borderTop: '1px solid #2a2a3a', paddingTop: 6 }}>
            Health: <span style={{ color: mind.cognitive_health?.includes('GOOD') ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>{mind.cognitive_health || 'ASSESSING'}</span>
          </div>
        </Card>

        {/* Panel 4: Verification */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#22c55e20', border: '1px solid #22c55e40', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#22c55e', fontFamily: 'var(--font-mono)' }}>&#10003;</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>PROOF OF WORK</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {[
              { label: 'Published', value: data.posts.length, color: '#22c55e' },
              { label: 'Rejected', value: data.rejections.length, color: '#ef4444' },
              { label: 'Frameworks', value: mind.concept_nursery.total_concepts_ever_created, color: '#a855f7' },
              { label: 'Predictions', value: mind.predictions.total, color: '#f59e0b' },
              { label: 'Debates', value: mind.debate_stats.total_debates, color: '#6366f1' },
              { label: 'Self-Corrections', value: (data.frameworks || []).filter(f => f.status === 'fallen' || f.status === 'composted').length + mind.predictions.failed, color: '#ef4444' },
            ].map(item => (
              <div key={item.label} style={{ background: '#1a1a25', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: item.color, fontFamily: 'var(--font-mono)' }}>{item.value}</div>
                <div style={{ fontSize: 9, color: '#9898b0', fontWeight: 600 }}>{item.label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: '#505068', marginTop: 8, fontStyle: 'italic' }}>
            Every item above is verifiable in the data tabs below
          </div>
        </Card>
      </div>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
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
  const timelineEvents = useMemo(() => data ? getTimelineEvents(data.posts, data.frameworks || [], data.predictions_list || []) : [], [data]);

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
          {/* THE PROBLEM — WHY THIS EXISTS */}
          {/* ============================================================ */}
          <FadeIn delay={0.05}><ProblemStatement /></FadeIn>

          {/* ============================================================ */}
          {/* REPORT CARD — VITAL SIGNS (moved up for immediate impact) */}
          {/* ============================================================ */}
          <FadeIn delay={0.08}><section style={{ marginBottom: 32 }}>
            <SectionHeader>REPORT CARD &mdash; WHAT AXIOM PRODUCED</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 12 }}>
              <StatCard label="HOURS ALIVE" value={formatDuration(mind.cognitive_age_hours)} color="#00d4ff" />
              <StatCard label="STAGE" value={STAGE_LABELS[mind.cognitive_stage] || mind.cognitive_stage} color={stageColor} />
              <StatCard label="NEWS CYCLES" value={String(mind.total_cycles)} color="#6366f1" />
              <StatCard label="PUBLISHED" value={String(data.posts.length)} color="#22c55e" sub={`${data.rejections.length} rejected`} />
              <StatCard label="FRAMEWORKS" value={String(mind.concept_nursery.total_concepts_ever_created)} color="#22c55e" sub={`${killedFrameworks.length} killed`} />
              <StatCard label="PREDICTIONS" value={String(mind.predictions.total)} color="#f59e0b" sub={mind.predictions.accuracy !== 'N/A' ? `${mind.predictions.accuracy} accuracy` : undefined} />
            </div>
            <Card>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#505068', letterSpacing: 1.5, marginBottom: 10 }}>IMPACT METRICS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
                {[
                  { value: Math.round(mind.cognitive_age_hours * 0.8), label: 'analyst-hours of research', color: '#00d4ff' },
                  { value: uniqueSources || mind.total_cycles * 5, label: 'sources scanned', color: '#22c55e' },
                  { value: killedFrameworks.length + mind.predictions.failed, label: 'self-corrections made', color: '#ef4444' },
                  { value: mind.rejection_rate, label: 'rejection rate (30-60% healthy)', color: '#f59e0b' },
                ].map((m, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: m.color, fontFamily: 'var(--font-mono)' }}>{m.value}</div>
                    <div style={{ fontSize: 10, color: '#686880', lineHeight: 1.3 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </Card>
          </section></FadeIn>

          {/* ============================================================ */}
          {/* NEURAL MAP — INTERACTIVE NETWORK VISUALIZATION */}
          {/* ============================================================ */}
          <FadeIn delay={0.09}><NeuralGraph data={data} /></FadeIn>

          {/* ============================================================ */}
          {/* COGNITIVE DASHBOARD — MULTI-PANEL LIVE VIEW */}
          {/* ============================================================ */}
          <FadeIn delay={0.1}><CognitiveDashboard data={data} mind={mind} /></FadeIn>

          {/* ============================================================ */}
          {/* SYSTEM ARCHITECTURE */}
          {/* ============================================================ */}
          <FadeIn delay={0.15}><SystemArchitecture /></FadeIn>

          {/* ============================================================ */}
          {/* PIPELINE X-RAY — LATEST CYCLE */}
          {/* ============================================================ */}
          {latestAnalysis && (
            <FadeIn delay={0.1}><section style={{ marginBottom: 32 }}>
              <SectionHeader>WATCH AXIOM THINK &mdash; LATEST EDITORIAL DECISION</SectionHeader>
              <Card>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
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
              <SectionHeader>EDITORIAL TIMELINE &mdash; {timelineEvents.length} MILESTONES</SectionHeader>
              <Card style={{ padding: '20px 24px' }}>
                <div style={{ position: 'relative', paddingLeft: 28 }}>
                  {/* Vertical line */}
                  <div style={{ position: 'absolute', left: 7, top: 6, bottom: 6, width: 2, background: 'linear-gradient(180deg, #a855f740, #00d4ff40, #22c55e40, #f59e0b40)', borderRadius: 1 }} />
                  {timelineEvents.map((evt, i) => (
                    <div key={evt.label + i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: i < timelineEvents.length - 1 ? 16 : 0, position: 'relative' }}>
                      {/* Dot on the line */}
                      <div style={{ position: 'absolute', left: -24, top: 4, width: 14, height: 14, borderRadius: '50%', background: '#0a0a0f', border: `2px solid ${evt.color}`, boxShadow: `0 0 8px ${evt.color}40`, flexShrink: 0 }} />
                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: evt.color, fontFamily: 'var(--font-mono)' }}>{evt.label}</span>
                          <span style={{ fontSize: 10, color: '#505068', fontFamily: 'var(--font-mono)', marginLeft: 'auto', flexShrink: 0 }}>
                            <TimeAgo date={evt.time} />
                          </span>
                        </div>
                        {evt.detail && (
                          <div style={{ fontSize: 11, color: '#686880', lineHeight: 1.5, marginTop: 2 }}>{evt.detail}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </section></FadeIn>
          )}


          {/* ============================================================ */}
          {/* SCENE 5: EMOTION HISTORY SPARKLINES */}
          {/* ============================================================ */}
          <FadeIn><section style={{ marginBottom: 32 }}>
            <SectionHeader>EDITORIAL INSTINCTS OVER TIME</SectionHeader>
            <Card>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
                      From framework: <span style={{ color: '#22c55e' }}>{pred.derivedFromFramework === 'unknown' ? 'Independent analysis' : pred.derivedFromFramework}</span>
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
          {/* SCENE 7: WHAT MAKES AXIOM DIFFERENT */}
          {/* ============================================================ */}
          <FadeIn><section style={{ marginBottom: 32 }}>
            <SectionHeader>WHAT MAKES AXIOM DIFFERENT</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { title: 'Fully Autonomous', desc: `Runs every 35 minutes without human input. ${mind.total_cycles} cycles completed in ${formatDuration(mind.cognitive_age_hours)}.`, color: '#00d4ff' },
                { title: 'Self-Correcting', desc: `Built ${mind.concept_nursery.total_concepts_ever_created} frameworks — killed ${killedFrameworks.length} publicly when evidence contradicted them.`, color: '#ef4444' },
                { title: 'Accountable Predictions', desc: `${mind.predictions.total} falsifiable predictions with deadlines. ${mind.predictions.failed} already failed — tracked honestly.`, color: '#f59e0b' },
                { title: 'Internal Debate', desc: `Advocate vs Skeptic before every publish. ${mind.debate_stats.total_debates} debates, ${mind.debate_stats.skeptic_wins} stories killed.`, color: '#a855f7' },
                { title: 'Evolving Worldview', desc: `Started with zero knowledge. Now in ${STAGE_LABELS[mind.cognitive_stage] || mind.cognitive_stage} stage with ${mind.cognitive_dna.strands} crystallized principles.`, color: '#22c55e' },
                { title: 'Proxy-Based Emotions', desc: 'Cognitive emotions computed from measurable signals — not self-reported. Each score is traceable to a proxy.', color: '#ec4899' },
              ].map((item, i) => (
                <Card key={i} style={{ borderTop: `2px solid ${item.color}`, padding: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e8e8f0', marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: '#9898b0', lineHeight: 1.5 }}>{item.desc}</div>
                </Card>
              ))}
            </div>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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

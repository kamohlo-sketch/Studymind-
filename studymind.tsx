import { useState, useEffect, useRef, useCallback } from "react";

// ─── THEME & CONSTANTS ────────────────────────────────────────────────────────
const COLORS = {
  bg: "#080C14",
  surface: "#0D1220",
  card: "#111827",
  cardHover: "#161F35",
  border: "#1E2D45",
  accent: "#00F5C4",
  accentDim: "#00F5C420",
  accentGlow: "#00F5C440",
  purple: "#8B5CF6",
  purpleDim: "#8B5CF620",
  blue: "#3B82F6",
  blueDim: "#3B82F620",
  gold: "#F59E0B",
  goldDim: "#F59E0B20",
  rose: "#F43F5E",
  roseDim: "#F43F5E20",
  text: "#F1F5F9",
  textMuted: "#64748B",
  textSub: "#94A3B8",
};

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');
`;

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "summarizer", label: "Summarizer", icon: "◈" },
  { id: "flashcards", label: "Flashcards", icon: "⬨" },
  { id: "timer", label: "Study Timer", icon: "◎" },
  { id: "music", label: "Focus Music", icon: "◉" },
  { id: "homework", label: "AI Helper", icon: "◇" },
];

const BADGES = [
  { id: "streak7", label: "7-Day Streak", icon: "🔥", earned: true },
  { id: "firstsumm", label: "First Summary", icon: "📄", earned: true },
  { id: "flashmaster", label: "Flash Master", icon: "⚡", earned: true },
  { id: "nightowl", label: "Night Owl", icon: "🦉", earned: false },
  { id: "pomodoro", label: "Pomodoro Pro", icon: "🍅", earned: false },
  { id: "social", label: "Squad Goals", icon: "👥", earned: false },
];

const MUSIC_TRACKS = [
  { id: "lofi", name: "Lo-Fi Beats", icon: "🎧", bpm: "72 BPM", color: COLORS.purple },
  { id: "classical", name: "Classical Flow", icon: "🎻", bpm: "Classical", color: COLORS.blue },
  { id: "rain", name: "Rain Sounds", icon: "🌧️", bpm: "Nature", color: COLORS.accent },
  { id: "nature", name: "Forest Ambience", icon: "🌿", bpm: "Nature", color: "#22C55E" },
  { id: "focus", name: "Deep Focus", icon: "🧠", bpm: "40Hz", color: COLORS.gold },
  { id: "ocean", name: "Ocean Waves", icon: "🌊", bpm: "Nature", color: "#06B6D4" },
];

const TIMER_MODES = [
  { id: "pomodoro", name: "Pomodoro", work: 25, break: 5, icon: "🍅", color: COLORS.accent },
  { id: "deepfocus", name: "Deep Focus", work: 90, break: 20, icon: "🧠", color: COLORS.purple },
  { id: "examcram", name: "Exam Cram", work: 45, break: 10, icon: "⚡", color: COLORS.gold },
  { id: "nightstudy", name: "Night Study", work: 30, break: 5, icon: "🌙", color: "#8B5CF6" },
  { id: "custom", name: "Custom", work: 25, break: 5, icon: "⚙️", color: COLORS.blue },
];

const SAMPLE_FLASHCARDS = [
  { q: "What is photosynthesis?", a: "The process by which plants use sunlight, water, and CO₂ to produce oxygen and energy (glucose).", diff: "easy" },
  { q: "Define osmosis.", a: "The movement of water molecules through a semi-permeable membrane from a region of low solute concentration to high solute concentration.", diff: "medium" },
  { q: "What is Newton's 3rd Law?", a: "For every action, there is an equal and opposite reaction.", diff: "easy" },
  { q: "Explain the CAPS curriculum framework.", a: "CAPS (Curriculum and Assessment Policy Statement) is South Africa's national curriculum framework that outlines subject content, learning outcomes, and assessment standards for Grades R–12.", diff: "hard" },
];

// ─── GLOBAL STYLES ─────────────────────────────────────────────────────────────
const globalStyles = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${COLORS.bg}; color: ${COLORS.text}; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${COLORS.surface}; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 2px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px ${COLORS.accentGlow}; }
    50% { box-shadow: 0 0 40px ${COLORS.accent}60; }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes ripple {
    0% { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(2); opacity: 0; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }
  @keyframes timerPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }

  .fade-up { animation: fadeUp 0.5s ease forwards; }
  .fade-up-delay-1 { animation: fadeUp 0.5s ease 0.1s both; }
  .fade-up-delay-2 { animation: fadeUp 0.5s ease 0.2s both; }
  .fade-up-delay-3 { animation: fadeUp 0.5s ease 0.3s both; }

  .card-hover {
    transition: all 0.3s ease;
    cursor: pointer;
  }
  .card-hover:hover {
    background: ${COLORS.cardHover} !important;
    border-color: ${COLORS.accent}50 !important;
    transform: translateY(-2px);
  }

  .btn-primary {
    background: ${COLORS.accent};
    color: ${COLORS.bg};
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    letter-spacing: 0.02em;
  }
  .btn-primary:hover {
    background: #00DDB0;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px ${COLORS.accentGlow};
  }
  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .btn-ghost {
    background: transparent;
    color: ${COLORS.textSub};
    border: 1px solid ${COLORS.border};
    border-radius: 10px;
    padding: 10px 18px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-ghost:hover {
    border-color: ${COLORS.accent}60;
    color: ${COLORS.accent};
    background: ${COLORS.accentDim};
  }

  .textarea-style {
    width: 100%;
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 12px;
    padding: 16px;
    color: ${COLORS.text};
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    resize: vertical;
    min-height: 160px;
    outline: none;
    transition: border-color 0.2s ease;
    line-height: 1.6;
  }
  .textarea-style:focus {
    border-color: ${COLORS.accent}60;
  }
  .textarea-style::placeholder { color: ${COLORS.textMuted}; }

  .loading-dot {
    display: inline-block;
    animation: pulse 1s ease infinite;
  }
  .loading-dot:nth-child(2) { animation-delay: 0.2s; }
  .loading-dot:nth-child(3) { animation-delay: 0.4s; }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .progress-bar {
    height: 4px;
    background: ${COLORS.border};
    border-radius: 2px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    border-radius: 2px;
    background: linear-gradient(90deg, ${COLORS.accent}, ${COLORS.purple});
    transition: width 0.5s ease;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 13px;
    font-weight: 500;
    color: ${COLORS.textSub};
    border: 1px solid transparent;
  }
  .nav-item:hover {
    background: ${COLORS.accentDim};
    color: ${COLORS.accent};
    border-color: ${COLORS.accent}30;
  }
  .nav-item.active {
    background: ${COLORS.accentDim};
    color: ${COLORS.accent};
    border-color: ${COLORS.accent}40;
  }
`;

// ─── UTILITY COMPONENTS ────────────────────────────────────────────────────────
function Card({ children, style, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: COLORS.text }}>
        {children}
      </h2>
      {sub && <p style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

function LoadingSpinner({ color = COLORS.accent }) {
  return (
    <div style={{
      width: 20, height: 20,
      border: `2px solid ${color}30`,
      borderTop: `2px solid ${color}`,
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
      display: "inline-block",
    }} />
  );
}

function AITypingEffect({ text, onDone }) {
  const [displayed, setDisplayed] = useState("");
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (idx < text.length) {
      const t = setTimeout(() => {
        setDisplayed(prev => prev + text[idx]);
        setIdx(i => i + 1);
      }, 12);
      return () => clearTimeout(t);
    } else if (!done) {
      setDone(true);
      onDone?.();
    }
  }, [idx, text]);

  return (
    <span>
      {displayed}
      {!done && <span style={{ color: COLORS.accent, animation: "pulse 1s infinite" }}>▋</span>}
    </span>
  );
}

// ─── AI CALL ──────────────────────────────────────────────────────────────────
async function callAI(prompt, systemPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt || "You are StudyMind AI, a helpful, encouraging study assistant for South African students. Be concise, clear, and motivating.",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "Sorry, I couldn't generate a response. Please try again.";
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ xp, streak, setPage }) {
  const level = Math.floor(xp / 500) + 1;
  const xpInLevel = xp % 500;
  const stats = [
    { label: "XP Points", value: xp.toLocaleString(), icon: "⚡", color: COLORS.gold },
    { label: "Study Streak", value: `${streak} days`, icon: "🔥", color: COLORS.rose },
    { label: "Level", value: level, icon: "🏆", color: COLORS.purple },
    { label: "Summaries", value: "3", icon: "📄", color: COLORS.accent },
  ];

  const quickActions = [
    { label: "Summarize Notes", icon: "◈", page: "summarizer", color: COLORS.accent },
    { label: "Study Flashcards", icon: "⬨", page: "flashcards", color: COLORS.purple },
    { label: "Start Timer", icon: "◎", page: "timer", color: COLORS.blue },
    { label: "AI Homework Help", icon: "◇", page: "homework", color: COLORS.gold },
  ];

  return (
    <div className="fade-up" style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>K</div>
          <div>
            <p style={{ color: COLORS.textMuted, fontSize: 12 }}>Good evening 🌙</p>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800 }}>
              Ready to study, Kamo?
            </h1>
          </div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          marginTop: 8, padding: "6px 0",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: COLORS.textMuted }}>Level {level} Progress</span>
              <span style={{ fontSize: 11, color: COLORS.accent }}>{xpInLevel}/500 XP</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(xpInLevel / 500) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <Card key={i} className={`fade-up-delay-${i}`} style={{ textAlign: "center", padding: 16 }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 14, fontSize: 14 }}>Quick Actions</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {quickActions.map((a, i) => (
            <button
              key={i}
              onClick={() => setPage(a.page)}
              style={{
                background: `${a.color}12`,
                border: `1px solid ${a.color}30`,
                borderRadius: 12,
                padding: "14px 16px",
                display: "flex", alignItems: "center", gap: 10,
                cursor: "pointer", transition: "all 0.2s ease",
                color: a.color, fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600, fontSize: 13,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `${a.color}20`;
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = `${a.color}12`;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <span style={{ fontSize: 18 }}>{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Badges */}
      <Card>
        <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 14, fontSize: 14 }}>Your Badges</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {BADGES.map(b => (
            <div key={b.id} style={{
              background: b.earned ? COLORS.accentDim : COLORS.surface,
              border: `1px solid ${b.earned ? COLORS.accent + "40" : COLORS.border}`,
              borderRadius: 12, padding: "12px 10px", textAlign: "center",
              opacity: b.earned ? 1 : 0.4,
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{b.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: b.earned ? COLORS.accent : COLORS.textMuted }}>{b.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── AI SUMMARIZER ────────────────────────────────────────────────────────────
function Summarizer({ addXP }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState("summary");
  const [typed, setTyped] = useState(false);

  const modes = [
    { id: "summary", label: "Summary", icon: "📝" },
    { id: "bullets", label: "Bullet Notes", icon: "•" },
    { id: "simple", label: "Simplify", icon: "🧠" },
    { id: "guide", label: "Study Guide", icon: "📚" },
  ];

  const systemPrompts = {
    summary: "You are a brilliant study assistant for South African high school and university students. Generate a concise, clear summary of the provided notes. Use simple language. Keep it under 200 words. Format with a title and 2-3 short paragraphs.",
    bullets: "You are a brilliant study assistant. Convert the following notes into clean bullet-point notes. Use •, ◦, and ▸ for hierarchy. Group related points. Be concise but complete. Max 15 bullets.",
    simple: "You are a brilliant study assistant for South African students. Explain the following topic in extremely simple language, like you're explaining to a Grade 9 student. Use analogies and real-life South African examples where possible. Keep it friendly and encouraging.",
    guide: "You are a brilliant study assistant. Create a structured study guide from the following notes. Include: Key Concepts, Important Definitions, Key Relationships, and 3 Exam Tips at the end. Format clearly with headings.",
  };

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setTyped(false);
    try {
      const res = await callAI(`Here are my notes:\n\n${input}`, systemPrompts[mode]);
      setResult(res);
      addXP(50);
    } catch {
      setResult("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="fade-up" style={{ maxWidth: 800, margin: "0 auto" }}>
      <SectionTitle sub="Paste your notes, and AI will transform them instantly.">
        AI Note Summarizer ◈
      </SectionTitle>

      {/* Mode selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              background: mode === m.id ? COLORS.accentDim : COLORS.surface,
              border: `1px solid ${mode === m.id ? COLORS.accent : COLORS.border}`,
              color: mode === m.id ? COLORS.accent : COLORS.textSub,
              borderRadius: 10, padding: "8px 14px",
              cursor: "pointer", fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.2s ease",
            }}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      <textarea
        className="textarea-style"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Paste your notes, textbook content, or type any topic here...&#10;&#10;e.g. 'Explain photosynthesis from Life Sciences Chapter 3' or paste your own notes."
        style={{ marginBottom: 12 }}
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <button className="btn-primary" onClick={handleGenerate} disabled={loading || !input.trim()}>
          {loading ? <><LoadingSpinner color={COLORS.bg} /> <span style={{ marginLeft: 6 }}>Generating...</span></> : "✨ Generate with AI +50 XP"}
        </button>
        <button className="btn-ghost" onClick={() => { setInput(""); setResult(null); }}>
          Clear
        </button>
      </div>

      {result && (
        <Card className="fade-up" style={{ borderColor: `${COLORS.accent}30` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.accent, animation: "glow 2s ease infinite" }} />
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: COLORS.accent }}>
              AI {modes.find(m => m.id === mode)?.label}
            </span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: COLORS.textMuted }}>+50 XP earned ⚡</span>
          </div>
          <div style={{ color: COLORS.textSub, lineHeight: 1.8, fontSize: 14, whiteSpace: "pre-wrap" }}>
            {!typed ? <AITypingEffect text={result} onDone={() => setTyped(true)} /> : result}
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => navigator.clipboard.writeText(result)}>
              📋 Copy
            </button>
            <button className="btn-ghost" style={{ fontSize: 12 }}>
              📤 Save
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── FLASHCARDS ───────────────────────────────────────────────────────────────
function Flashcards({ addXP }) {
  const [cards, setCards] = useState(SAMPLE_FLASHCARDS);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("study"); // study | generate
  const [score, setScore] = useState({ easy: 0, hard: 0 });

  const card = cards[current];

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const prompt = `Generate exactly 4 flashcard Q&A pairs from these notes. Return ONLY a JSON array like:
[{"q":"question","a":"answer","diff":"easy|medium|hard"}]
No extra text. Notes:\n${input}`;
      const res = await callAI(prompt, "You are a flashcard generator. Return only valid JSON arrays.");
      const clean = res.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setCards(parsed);
      setCurrent(0);
      setFlipped(false);
      setMode("study");
      addXP(30);
    } catch {
      alert("Couldn't generate flashcards. Try again.");
    }
    setLoading(false);
  };

  const diffColors = { easy: "#22C55E", medium: COLORS.gold, hard: COLORS.rose };

  return (
    <div className="fade-up" style={{ maxWidth: 700, margin: "0 auto" }}>
      <SectionTitle sub="Swipe through AI-generated flashcards with smart spaced repetition.">
        Flashcards & Cue Cards ⬨
      </SectionTitle>

      {/* Tab */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["study", "generate"].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            background: mode === m ? COLORS.purpleDim : COLORS.surface,
            border: `1px solid ${mode === m ? COLORS.purple : COLORS.border}`,
            color: mode === m ? COLORS.purple : COLORS.textSub,
            borderRadius: 10, padding: "8px 16px",
            cursor: "pointer", fontSize: 13, fontWeight: 600,
            textTransform: "capitalize", transition: "all 0.2s ease",
          }}>
            {m === "study" ? "📖 Study Cards" : "✨ Generate New"}
          </button>
        ))}
      </div>

      {mode === "generate" ? (
        <div>
          <textarea
            className="textarea-style"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste your notes or topic here to generate flashcards..."
            style={{ marginBottom: 12 }}
          />
          <button className="btn-primary" onClick={handleGenerate} disabled={loading || !input.trim()}>
            {loading ? <><LoadingSpinner color={COLORS.bg} /> <span style={{ marginLeft: 6 }}>Generating...</span></> : "⚡ Generate Flashcards +30 XP"}
          </button>
        </div>
      ) : (
        <div>
          {/* Progress */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: COLORS.textMuted }}>{current + 1} / {cards.length} cards</span>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#22C55E" }}>✓ {score.easy} easy</span>
              <span style={{ fontSize: 12, color: COLORS.rose }}>✗ {score.hard} hard</span>
            </div>
          </div>
          <div className="progress-bar" style={{ marginBottom: 24 }}>
            <div className="progress-fill" style={{ width: `${((current + 1) / cards.length) * 100}%` }} />
          </div>

          {/* Card */}
          <div
            onClick={() => setFlipped(f => !f)}
            style={{
              background: flipped
                ? `linear-gradient(135deg, ${COLORS.purple}20, ${COLORS.card})`
                : COLORS.card,
              border: `1px solid ${flipped ? COLORS.purple + "50" : COLORS.border}`,
              borderRadius: 20, minHeight: 220,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: 32, textAlign: "center",
              cursor: "pointer", transition: "all 0.3s ease",
              position: "relative", marginBottom: 20,
            }}
          >
            <div style={{ position: "absolute", top: 16, left: 16 }}>
              <span className="tag" style={{
                background: `${diffColors[card?.diff]}20`,
                color: diffColors[card?.diff],
              }}> 
                background: '${diffColors[card?.diff]}20',
                color: diffColors[card?.diff],
                {card?.diff}
              </span>
            </div>
            <div style={{ position: "absolute", top: 16, right: 16, color: COLORS.textMuted, fontSize: 12 }}>
              {flipped ? "Answer ↩" : "Tap to reveal"}
            </div>
            <p style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: flipped ? 14 : 18,
              fontWeight: flipped ? 400 : 700,
              color: flipped ? COLORS.textSub : COLORS.text,
              lineHeight: 1.5,
            }}>
              {flipped ? card?.a : card?.q}
            </p>
          </div>

          {flipped && (
            <div className="fade-up" style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <button
                onClick={() => { setScore(s => ({ ...s, hard: s.hard + 1 })); setFlipped(false); setCurrent(c => (c + 1) % cards.length); }}
                style={{
                  flex: 1, background: `${COLORS.rose}15`, border: `1px solid ${COLORS.rose}40`,
                  color: COLORS.rose, borderRadius: 12, padding: "12px",
                  cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all 0.2s ease",
                }}
              >
                😰 Hard — Review Again
              </button>
              <button
                onClick={() => { setScore(s => ({ ...s, easy: s.easy + 1 })); addXP(10); setFlipped(false); setCurrent(c => (c + 1) % cards.length); }}
                style={{
                  flex: 1, background: "#22C55E15", border: "1px solid #22C55E40",
                  color: "#22C55E", borderRadius: 12, padding: "12px",
                  cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all 0.2s ease",
                }}
              >
                😊 Got It! +10 XP
              </button>
            </div>
          )}

          {!flipped && (
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <button className="btn-ghost" onClick={() => { setCurrent(c => (c - 1 + cards.length) % cards.length); setFlipped(false); }}>← Prev</button>
              <button className="btn-ghost" onClick={() => { setCurrent(c => (c + 1) % cards.length); setFlipped(false); }}>Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── STUDY TIMER ──────────────────────────────────────────────────────────────
function StudyTimer({ addXP }) {
  const [selectedMode, setSelectedMode] = useState(TIMER_MODES[0]);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const totalSeconds = selectedMode.work * 60;
  const elapsed = totalSeconds - (minutes * 60 + seconds);
  const progress = (elapsed / totalSeconds) * 100;

  const motivational = [
    "You're doing amazing! Keep going! 🔥",
    "Every second counts. Stay focused! ⚡",
    "Kamo, you're built for this! 💪",
    "Future you says thank you! 🚀",
    "This is where champions are made! 🏆",
  ];
  const [motivMsg] = useState(motivational[Math.floor(Math.random() * motivational.length)]);

  const startTimer = useCallback(() => {
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s === 0) {
          setMinutes(m => {
            if (m === 0) {
              clearInterval(intervalRef.current);
              setRunning(false);
              setSessions(prev => prev + 1);
              addXP(100);
              setIsBreak(b => !b);
              const nextMinutes = isBreak ? selectedMode.work : selectedMode.break;
              setMinutes(nextMinutes);
              return nextMinutes;
            }
            return m - 1;
          });
          return 59;
        }
        return s - 1;
      });
    }, 1000);
  }, [isBreak, selectedMode, addXP]);

  const pauseTimer = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setMinutes(selectedMode.work);
    setSeconds(0);
    setIsBreak(false);
  };

  const selectMode = (m) => {
    setSelectedMode(m);
    setMinutes(m.work);
    setSeconds(0);
    setRunning(false);
    setIsBreak(false);
    clearInterval(intervalRef.current);
  };

  const circumference = 2 * Math.PI * 90;
  const strokeDash = circumference - (progress / 100) * circumference;

  return (
    <div className="fade-up" style={{ maxWidth: 700, margin: "0 auto" }}>
      <SectionTitle sub="Choose your study mode and let the timer keep you on track.">
        Smart Study Timer ◎
      </SectionTitle>

      {/* Mode selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {TIMER_MODES.map(m => (
          <button
            key={m.id}
            onClick={() => selectMode(m)}
            style={{
              background: selectedMode.id === m.id ? `${m.color}20` : COLORS.surface,
              border: `1px solid ${selectedMode.id === m.id ? m.color : COLORS.border}`,
              color: selectedMode.id === m.id ? m.color : COLORS.textSub,
              borderRadius: 10, padding: "8px 14px", cursor: "pointer",
              fontSize: 12, fontWeight: 600, transition: "all 0.2s ease",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {m.icon} {m.name}
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
        <div style={{ position: "relative", width: 220, height: 220, animation: running ? "timerPulse 2s ease infinite" : "none" }}>
          <svg width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="110" cy="110" r="90" fill="none" stroke={COLORS.border} strokeWidth="8" />
            <circle
              cx="110" cy="110" r="90"
              fill="none"
              stroke={isBreak ? "#22C55E" : selectedMode.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDash}
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 44, fontWeight: 800,
              color: selectedMode.color,
              letterSpacing: -2,
            }}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>
              {isBreak ? "☕ Break time" : selectedMode.name}
            </div>
          </div>
        </div>

        {/* Motivational message */}
        {running && (
          <div className="fade-up" style={{
            marginTop: 16, padding: "10px 20px",
            background: `${selectedMode.color}12`,
            border: `1px solid ${selectedMode.color}30`,
            borderRadius: 20, fontSize: 13, color: selectedMode.color,
            fontWeight: 500, textAlign: "center",
          }}>
            {motivMsg}
          </div>
        )}

        {/* Controls */}
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button className="btn-ghost" onClick={resetTimer}>↺ Reset</button>
          <button
            className="btn-primary"
            onClick={running ? pauseTimer : startTimer}
            style={{ minWidth: 120 }}
          >
            {running ? "⏸ Pause" : "▶ Start"}
          </button>
        </div>

        {sessions > 0 && (
          <div className="fade-up" style={{ marginTop: 20, textAlign: "center" }}>
            <p style={{ color: COLORS.textMuted, fontSize: 13 }}>
              🎉 {sessions} session{sessions > 1 ? "s" : ""} completed • +{sessions * 100} XP earned
            </p>
          </div>
        )}
      </div>

      {/* Session info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[
          { label: "Work Time", value: `${selectedMode.work} min`, color: selectedMode.color },
          { label: "Break Time", value: `${selectedMode.break} min`, color: "#22C55E" },
          { label: "XP Per Session", value: "+100 XP", color: COLORS.gold },
        ].map((s, i) => (
          <Card key={i} style={{ textAlign: "center", padding: 14 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{s.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── FOCUS MUSIC ──────────────────────────────────────────────────────────────
function FocusMusic() {
  const [playing, setPlaying] = useState(null);
  const [volume, setVolume] = useState(70);

  return (
    <div className="fade-up" style={{ maxWidth: 700, margin: "0 auto" }}>
      <SectionTitle sub="Built-in study music to help you focus, relax, and stay in the zone.">
        Focus Music System ◉
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
        {MUSIC_TRACKS.map(track => (
          <Card
            key={track.id}
            className="card-hover"
            onClick={() => setPlaying(playing === track.id ? null : track.id)}
            style={{
              background: playing === track.id ? `${track.color}15` : COLORS.card,
              borderColor: playing === track.id ? `${track.color}50` : COLORS.border,
              display: "flex", alignItems: "center", gap: 14, padding: 16,
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: `${track.color}20`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, flexShrink: 0,
              animation: playing === track.id ? "float 3s ease infinite" : "none",
            }}>
              {track.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: playing === track.id ? track.color : COLORS.text, marginBottom: 2 }}>
                {track.name}
              </p>
              <p style={{ fontSize: 11, color: COLORS.textMuted }}>{track.bpm}</p>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: playing === track.id ? track.color : COLORS.surface,
              border: `1px solid ${playing === track.id ? track.color : COLORS.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, color: playing === track.id ? COLORS.bg : COLORS.textMuted,
              flexShrink: 0,
            }}>
              {playing === track.id ? "⏸" : "▶"}
            </div>
          </Card>
        ))}
      </div>

      {playing && (
        <Card className="fade-up" style={{ borderColor: `${MUSIC_TRACKS.find(t => t.id === playing)?.color}40` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: MUSIC_TRACKS.find(t => t.id === playing)?.color, animation: "pulse 1s ease infinite" }} />
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14 }}>
              Now Playing: {MUSIC_TRACKS.find(t => t.id === playing)?.name}
            </span>
            <span style={{ marginLeft: "auto", fontSize: 12, color: COLORS.textMuted }}>Live Stream</span>
          </div>

          {/* Fake waveform */}
          <div style={{ display: "flex", gap: 3, alignItems: "center", height: 40, marginBottom: 16 }}>
            {Array.from({ length: 40 }, (_, i) => (
              <div key={i} style={{
                flex: 1, background: MUSIC_TRACKS.find(t => t.id === playing)?.color,
                borderRadius: 2,
                height: `${20 + Math.sin(i * 0.5) * 15 + Math.random() * 10}px`,
                opacity: 0.6,
                animation: `pulse ${0.5 + Math.random() * 1}s ease infinite`,
              }} />
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: COLORS.textMuted, width: 30 }}>🔈</span>
            <input
              type="range" min={0} max={100} value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              style={{ flex: 1, accentColor: MUSIC_TRACKS.find(t => t.id === playing)?.color }}
            />
            <span style={{ fontSize: 12, color: COLORS.textMuted, width: 30 }}>🔊</span>
            <span style={{ fontSize: 12, color: COLORS.textMuted, minWidth: 35 }}>{volume}%</span>
          </div>

          <p style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 12, textAlign: "center" }}>
            🎵 Note: Audio streams when integrated with a backend. This demo shows the full UI & controls.
          </p>
        </Card>
      )}
    </div>
  );
}

// ─── AI HOMEWORK HELPER ───────────────────────────────────────────────────────
function HomeworkHelper({ addXP }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [typed, setTyped] = useState(false);
  const [subject, setSubject] = useState("auto");

  const subjects = ["auto", "Maths", "Science", "English", "Afrikaans", "Business Studies", "Economics", "Accounting"];

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer(null);
    setTyped(false);
    const subjectNote = subject !== "auto" ? ` (Subject: ${subject} - South African CAPS curriculum)` : " (South African CAPS curriculum)";
    try {
      const res = await callAI(
        `Question${subjectNote}:\n\n${question}`,
        `You are a patient, brilliant South African tutor helping a high school student. 
        Explain step-by-step in simple, clear language.
        Use numbered steps. Give the student encouragement.
        If it's a maths problem, show working clearly.
        Reference South African curriculum where relevant (CAPS).
        End with a quick tip to remember this concept.`
      );
      setAnswer(res);
      addXP(25);
    } catch {
      setAnswer("Couldn't get an answer. Please try again.");
    }
    setLoading(false);
  };

  const examples = [
    "How do I calculate compound interest?",
    "Explain how a market economy works.",
    "What is the difference between revenue and profit?",
    "How do I solve a quadratic equation?",
  ];

  return (
    <div className="fade-up" style={{ maxWidth: 800, margin: "0 auto" }}>
      <SectionTitle sub="Ask any question and get step-by-step explanations in plain language.">
        AI Homework Helper ◇
      </SectionTitle>

      {/* Subject selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {subjects.map(s => (
          <button
            key={s}
            onClick={() => setSubject(s)}
            style={{
              background: subject === s ? COLORS.goldDim : COLORS.surface,
              border: `1px solid ${subject === s ? COLORS.gold : COLORS.border}`,
              color: subject === s ? COLORS.gold : COLORS.textSub,
              borderRadius: 8, padding: "6px 12px",
              cursor: "pointer", fontSize: 12, fontWeight: 600,
              transition: "all 0.2s ease", textTransform: subject === s ? "capitalize" : "none",
            }}
          >
            {s === "auto" ? "🤖 Auto-detect" : s}
          </button>
        ))}
      </div>

      <textarea
        className="textarea-style"
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="Type your question here or paste a problem you're struggling with...&#10;&#10;e.g. 'How do I calculate the break-even point?' or 'Explain DNA replication step by step.'"
        style={{ marginBottom: 10 }}
      />

      {/* Example questions */}
      {!question && (
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => setQuestion(ex)}
              style={{
                background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                color: COLORS.textSub, borderRadius: 8, padding: "6px 12px",
                cursor: "pointer", fontSize: 12, transition: "all 0.2s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.gold + "60"}
              onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <button className="btn-primary" onClick={handleAsk} disabled={loading || !question.trim()}
          style={{ background: loading ? COLORS.gold + "80" : COLORS.gold, color: COLORS.bg }}>
          {loading ? <><LoadingSpinner color={COLORS.bg} /> <span style={{ marginLeft: 6 }}>Thinking...</span></> : "🧠 Explain This +25 XP"}
        </button>
        <button className="btn-ghost" onClick={() => { setQuestion(""); setAnswer(null); }}>Clear</button>
      </div>

      {answer && (
        <Card className="fade-up" style={{ borderColor: `${COLORS.gold}30` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.gold }} />
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: COLORS.gold }}>
              Step-by-Step Explanation
            </span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: COLORS.textMuted }}>+25 XP ⚡</span>
          </div>
          <div style={{ color: COLORS.textSub, lineHeight: 1.8, fontSize: 14, whiteSpace: "pre-wrap" }}>
            {!typed ? <AITypingEffect text={answer} onDone={() => setTyped(true)} /> : answer}
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => navigator.clipboard.writeText(answer)}>📋 Copy</button>
            <button className="btn-ghost" style={{ fontSize: 12 }}>💾 Save to Notes</button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── LANDING PAGE (shown to new users) ────────────────────────────────────────
function Landing({ onEnter }) {
  const features = [
    { icon: "◈", title: "AI Summarizer", desc: "Transform any notes into clean summaries instantly", color: COLORS.accent },
    { icon: "⬨", title: "Smart Flashcards", desc: "AI-generated cards with spaced repetition", color: COLORS.purple },
    { icon: "◎", title: "Study Timer", desc: "Pomodoro, Deep Focus, Exam Cram modes", color: COLORS.blue },
    { icon: "◉", title: "Focus Music", desc: "Lo-fi, classical, rain & nature sounds built-in", color: COLORS.gold },
    { icon: "◇", title: "AI Homework Help", desc: "Step-by-step explanations in plain language", color: COLORS.rose },
    { icon: "⬡", title: "Gamification", desc: "XP, badges, streaks & leaderboards", color: "#22C55E" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, overflow: "hidden" }}>
      {/* Ambient background */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 60% 50% at 50% -10%, ${COLORS.accent}15, transparent),
                     radial-gradient(ellipse 40% 30% at 80% 80%, ${COLORS.purple}10, transparent)`,
      }} />

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0,
        background: `${COLORS.bg}E0`, backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${COLORS.border}`,
        padding: "16px 40px", display: "flex", alignItems: "center",
        justifyContent: "space-between", zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800,
          }}>S</div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>
            StudyMind
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-ghost" style={{ fontSize: 13 }}>Log In</button>
          <button className="btn-primary" onClick={onEnter} style={{ fontSize: 13 }}>Get Started Free</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ paddingTop: 160, paddingBottom: 100, textAlign: "center", padding: "160px 24px 100px" }}>
        <div className="fade-up" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: COLORS.accentDim, border: `1px solid ${COLORS.accent}40`,
          borderRadius: 20, padding: "6px 14px", marginBottom: 24, fontSize: 12,
          color: COLORS.accent, fontWeight: 600,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.accent, display: "inline-block", animation: "pulse 1.5s ease infinite" }} />
          Free for all South African students · Launching 2025
        </div>

        <h1 className="fade-up-delay-1" style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "clamp(42px, 8vw, 80px)",
          fontWeight: 800, lineHeight: 1.05,
          letterSpacing: -3, marginBottom: 20,
          background: `linear-gradient(135deg, ${COLORS.text} 0%, ${COLORS.accent} 50%, ${COLORS.purple} 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          Study Smarter.<br />Not Harder.
        </h1>

        <p className="fade-up-delay-2" style={{
          fontSize: "clamp(15px, 2.5vw, 18px)", color: COLORS.textSub,
          maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.7,
        }}>
          Your AI study partner built for South African students. Summarize notes, generate flashcards, get homework help — all free.
        </p>

        <div className="fade-up-delay-3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={onEnter} style={{ padding: "14px 32px", fontSize: 15, animation: "glow 3s ease infinite" }}>
            🚀 Start Studying Free
          </button>
          <button className="btn-ghost" style={{ padding: "14px 32px", fontSize: 15 }}>
            Watch Demo
          </button>
        </div>

        <p style={{ marginTop: 16, fontSize: 12, color: COLORS.textMuted }}>
          No credit card needed · Works on phone & desktop · CAPS aligned
        </p>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{
          fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800,
          textAlign: "center", marginBottom: 40, letterSpacing: -1,
        }}>
          Everything you need to{" "}
          <span style={{ color: COLORS.accent }}>ace your studies</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {features.map((f, i) => (
            <Card key={i} className="card-hover" style={{ padding: "24px 20px" }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${f.color}20`, border: `1px solid ${f.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, marginBottom: 14, color: f.color,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ color: COLORS.textMuted, fontSize: 13, lineHeight: 1.5 }}>{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{
        background: COLORS.surface, borderTop: `1px solid ${COLORS.border}`,
        borderBottom: `1px solid ${COLORS.border}`, padding: "48px 24px", marginBottom: 80,
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, textAlign: "center" }}>
          {[
            { value: "100%", label: "Free to Start" },
            { value: "CAPS", label: "SA Curriculum" },
            { value: "6+", label: "Languages Coming" },
            { value: "∞", label: "Summaries" },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, color: COLORS.accent }}>{s.value}</div>
              <div style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "0 24px 100px" }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, marginBottom: 16, letterSpacing: -1 }}>
          The future of studying is here.
        </h2>
        <p style={{ color: COLORS.textMuted, marginBottom: 28, fontSize: 15 }}>Join thousands of SA students studying smarter.</p>
        <button className="btn-primary" onClick={onEnter} style={{ padding: "14px 40px", fontSize: 16 }}>
          🎓 Start for Free →
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function StudyMind() {
  const [showApp, setShowApp] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [xp, setXP] = useState(350);
  const [streak] = useState(7);

  const addXP = (amount) => setXP(p => p + amount);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard xp={xp} streak={streak} setPage={setPage} />;
      case "summarizer": return <Summarizer addXP={addXP} />;
      case "flashcards": return <Flashcards addXP={addXP} />;
      case "timer": return <StudyTimer addXP={addXP} />;
      case "music": return <FocusMusic />;
      case "homework": return <HomeworkHelper addXP={addXP} />;
      default: return <Dashboard xp={xp} streak={streak} setPage={setPage} />;
    }
  };

  if (!showApp) return (
    <>
      <style>{globalStyles}</style>
      <Landing onEnter={() => setShowApp(true)} />
    </>
  );

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: COLORS.bg }}>
        {/* Sidebar */}
        <aside style={{
          width: 220, background: COLORS.surface,
          borderRight: `1px solid ${COLORS.border}`,
          display: "flex", flexDirection: "column",
          padding: 16, position: "fixed", top: 0, left: 0, bottom: 0,
          zIndex: 50,
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, padding: "4px 0" }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 900, color: COLORS.bg,
            }}>S</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, letterSpacing: -0.5 }}>StudyMind</span>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            {NAV_ITEMS.map(item => (
              <div
                key={item.id}
                className={`nav-item ${page === item.id ? "active" : ""}`}
                onClick={() => setPage(item.id)}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </nav>

          {/* XP display */}
          <div style={{
            background: COLORS.accentDim,
            border: `1px solid ${COLORS.accent}30`,
            borderRadius: 12, padding: "12px 14px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.accent }}>⚡ {xp.toLocaleString()} XP</span>
              <span style={{ fontSize: 11, color: COLORS.textMuted }}>Lv.{Math.floor(xp / 500) + 1}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((xp % 500) / 500) * 100}%` }} />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ marginLeft: 220, flex: 1, padding: "32px 32px 80px" }}>
          {/* Top bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 32, paddingBottom: 20, borderBottom: `1px solid ${COLORS.border}`,
          }}>
            <div>
              <p style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 2 }}>StudyMind AI</p>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700 }}>
                {NAV_ITEMS.find(n => n.id === page)?.label}
              </h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
                background: `${COLORS.rose}15`, border: `1px solid ${COLORS.rose}30`,
                borderRadius: 20, fontSize: 12, color: COLORS.rose, fontWeight: 600,
              }}>
                🔥 {streak} day streak
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 800, cursor: "pointer",
              }}>K</div>
            </div>
          </div>

          {renderPage()}
        </main>
      </div>
    </>
  );
}

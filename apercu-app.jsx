import { useState } from "react";

const ACCENT = "#FF3B30";
const BG = "#0a0e13";
const SURFACE = "#12171e";
const BORDER = "rgba(255,255,255,0.06)";
const MUTED = "#6b7280";
const DIM = "#4b5563";

// ── Data ─────────────────────────────────────────────────────────
const SCREENS = [
  {
    id: "dashboard",
    label: "Accueil",
    icon: "🏠",
    title: "Tableau de bord...",
    subtitle: "samedi 18 avril",
  },
  {
    id: "warmup",
    label: "Warm up",
    icon: "⚡",
    title: "Échauffement",
    subtitle: "Mobilité & Gamme montante",
  },
  {
    id: "programme",
    label: "Programme",
    icon: "📅",
    title: "Programme",
    subtitle: "Accumulation 1 — Muscular Hypertrophy — 80%",
  },
  {
    id: "nutrition",
    label: "Nutrition",
    icon: "🥗",
    title: "Nutrition",
    subtitle: "Macros & Timing",
  },
  {
    id: "profil",
    label: "Profil",
    icon: "👤",
    title: "Profil",
    subtitle: "Athlète & Paramètres",
  },
];

const FEATURES = [
  {
    icon: "🧠",
    title: "Coach IA contextuel",
    desc: "Messages personnalisés par semaine, heure du jour et performance récente. Le coach adapte ses conseils à ton RPE moyen et tes jours de repos.",
    color: ACCENT,
  },
  {
    icon: "🎯",
    title: "Mode Séance immersif",
    desc: "Interface plein écran pour chaque séance : timer de récupération Nexus Pulse, saisie poids/reps/RPE, suggestions de progression, et estimation 1RM automatique.",
    color: "#34C759",
  },
  {
    icon: "📊",
    title: "Calcul automatique des charges",
    desc: "Toutes les charges de 40% à 102% sont auto-calculées à partir de tes 1RM. Arrondi au 2.5 kg le plus proche. Modifie un 1RM → tout le programme se met à jour.",
    color: "#FF9500",
  },
  {
    icon: "🔄",
    title: "Gestion de cycles",
    desc: "Archive automatique de chaque cycle (1RM, séances, PRs). Lancement d'un nouveau cycle avec suggestion de nouveaux 1RM basée sur tes performances.",
    color: "#5856D6",
  },
  {
    icon: "✏️",
    title: "Programme personnalisable",
    desc: "Override d'exercices, de séries/reps, et de pourcentages directement dans l'app. Ton programme s'adapte à toi, pas l'inverse.",
    color: "#FF2D55",
  },
  {
    icon: "📱",
    title: "PWA installable",
    desc: "Fonctionne hors-ligne, installable sur l'écran d'accueil. Service Worker pour le cache, Wake Lock pour garder l'écran allumé en séance.",
    color: "#007AFF",
  },
];

const WEEKS = [
  { id: "s1", label: "S1", name: "Accumulation 1", pct: "78-82%", sessions: 5, focus: "Volume + Hypertrophie" },
  { id: "s2", label: "S2", name: "Accumulation 2", pct: "78-82%", sessions: 5, focus: "Volume + Consolidation" },
  { id: "s3", label: "S3", name: "Transmutation", pct: "85-88%", sessions: 3, focus: "Intensification" },
  { id: "s4", label: "S4", name: "Acclimatation", pct: "90-93%", sessions: 3, focus: "Charges lourdes" },
  { id: "s5", label: "S5", name: "Peaking", pct: "95%+", sessions: 2, focus: "Tests AMRAP" },
  { id: "s6", label: "S6", name: "Test / Décharge", pct: "100-102%", sessions: 2, focus: "Maxis ou Récup" },
];

const TECH_STACK = [
  { name: "React + TypeScript", role: "Framework UI" },
  { name: "Vite", role: "Build & Dev Server" },
  { name: "Tailwind CSS", role: "Styling (design system custom)" },
  { name: "Framer Motion", role: "Animations & Transitions" },
  { name: "IndexedDB (idb-keyval)", role: "Persistance locale" },
  { name: "Cloudflare Pages", role: "Hébergement & Workers" },
  { name: "Service Worker", role: "Mode hors-ligne & Cache" },
  { name: "Web Push API", role: "Notifications d'entraînement" },
  { name: "Lucide React", role: "Icônes" },
];

const ATHLETE = { name: "Théo", squat: 140, bench: 100, deadlift: 160 };

// ── Components ───────────────────────────────────────────────────

function PhoneMockup({ activeScreen, onScreenChange }) {
  const screen = SCREENS.find((s) => s.id === activeScreen);

  return (
    <div
      style={{
        width: 320,
        minHeight: 640,
        background: BG,
        borderRadius: 40,
        border: `3px solid rgba(255,255,255,0.1)`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* Notch */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}>
        <div
          style={{
            width: 120,
            height: 28,
            background: "#000",
            borderRadius: 20,
          }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "20px 20px 0", overflowY: "auto" }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#fff",
            fontStyle: "italic",
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          {screen.title}
        </h1>
        <p
          style={{
            fontSize: 9,
            color: DIM,
            textTransform: "uppercase",
            letterSpacing: "0.3em",
            fontWeight: 700,
            marginTop: 4,
          }}
        >
          {screen.subtitle}
        </p>

        {/* Screen-specific content */}
        <div style={{ marginTop: 20 }}>
          {activeScreen === "dashboard" && <DashboardScreen />}
          {activeScreen === "warmup" && <WarmupScreen />}
          {activeScreen === "programme" && <ProgrammeScreen />}
          {activeScreen === "nutrition" && <NutritionScreen />}
          {activeScreen === "profil" && <ProfilScreen />}
        </div>
      </div>

      {/* Bottom Nav */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "12px 16px 20px",
          borderTop: `1px solid ${BORDER}`,
          background: `${BG}cc`,
          backdropFilter: "blur(20px)",
        }}
      >
        {SCREENS.map((s) => (
          <button
            key={s.id}
            onClick={() => onScreenChange(s.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "4px 8px",
              borderRadius: 12,
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                fontSize: 18,
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                background:
                  activeScreen === s.id
                    ? `${ACCENT}22`
                    : "transparent",
                transition: "all 0.2s",
              }}
            >
              {s.icon}
            </div>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color:
                  activeScreen === s.id ? ACCENT : MUTED,
                transition: "color 0.2s",
              }}
            >
              {s.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function GlassCard({ children, style, accent }) {
  return (
    <div
      style={{
        background: `${SURFACE}`,
        borderRadius: 16,
        border: `1px solid ${BORDER}`,
        overflow: "hidden",
        ...(accent
          ? { borderLeft: `3px solid ${accent}` }
          : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function MiniTag({ children, color = ACCENT }) {
  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.15em",
        color,
        background: `${color}18`,
        padding: "3px 10px",
        borderRadius: 20,
        display: "inline-block",
      }}
    >
      {children}
    </span>
  );
}

// ── Screen Contents ──────────────────────────────────────────────

function DashboardScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Coach Card */}
      <GlassCard>
        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: ACCENT,
                animation: "pulse 2s infinite",
              }}
            />
            <span style={{ fontSize: 9, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.15em" }}>
              Coach Programme Candito
            </span>
          </div>
          <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0, fontStyle: "italic" }}>
            Bonjour, {ATHLETE.name}.
          </p>
          <div style={{ width: 32, height: 1, background: `${ACCENT}33`, margin: "8px 0" }} />
          <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, margin: 0 }}>
            S1, premier matin. 80% et volume élevé — la régularité prime sur l'intensité.
          </p>
        </div>
      </GlassCard>

      {/* Next Session */}
      <GlassCard accent={ACCENT}>
        <div style={{ padding: 16 }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 6px" }}>
            Prochaine séance
          </p>
          <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: "0 0 4px", fontStyle: "italic" }}>
            Bas du corps — Lourd
          </p>
          <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>
            Squat 4×6-8 • DL 2×6 • Hip Thrust 3×8-10
          </p>
          <div
            style={{
              marginTop: 12,
              background: `${ACCENT}11`,
              padding: "10px 16px",
              borderRadius: 30,
              textAlign: "center",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "#fff",
            }}
          >
            ▶ Démarrer la séance
          </div>
        </div>
      </GlassCard>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          { label: "Squat", val: ATHLETE.squat },
          { label: "Bench", val: ATHLETE.bench },
          { label: "Deadlift", val: ATHLETE.deadlift },
        ].map((s) => (
          <GlassCard key={s.label}>
            <div style={{ padding: "12px 10px", textAlign: "center" }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>
                {s.label}
              </p>
              <p style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, fontVariantNumeric: "tabular-nums" }}>
                {s.val}
              </p>
              <p style={{ fontSize: 9, color: DIM, margin: 0 }}>kg</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Total */}
      <GlassCard>
        <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Total
          </span>
          <span style={{ fontSize: 26, fontWeight: 800, color: ACCENT, fontVariantNumeric: "tabular-nums" }}>
            {ATHLETE.squat + ATHLETE.bench + ATHLETE.deadlift} kg
          </span>
        </div>
      </GlassCard>
    </div>
  );
}

function WarmupScreen() {
  const exercises = [
    { name: "Foam Rolling", detail: "60-90s/zone" },
    { name: "Cat-Camel", detail: "2×10" },
    { name: "Hip Thrust activation", detail: "3×10 BW" },
    { name: "Cossack Squat", detail: "2×8/côté" },
    { name: "Dead Bugs", detail: "2×8/côté" },
  ];
  const gamme = [
    { pct: "40%", kg: 56, reps: "×8" },
    { pct: "60%", kg: 84, reps: "×5" },
    { pct: "75%", kg: 105, reps: "×3" },
    { pct: "85%", kg: 119, reps: "×1" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <GlassCard>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>🔥</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#fff", fontStyle: "italic" }}>
            Bas du corps
          </span>
        </div>
        {exercises.map((e, i) => (
          <div key={i} style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${BORDER}` }}>
            <span style={{ fontSize: 12, color: "#fff" }}>{e.name}</span>
            <span style={{ fontSize: 11, color: MUTED, fontVariantNumeric: "tabular-nums" }}>{e.detail}</span>
          </div>
        ))}
        {/* Gamme */}
        <div style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, background: `${ACCENT}05` }}>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
          <span style={{ fontSize: 8, fontWeight: 700, color: DIM, textTransform: "uppercase", letterSpacing: "0.15em" }}>
            Gamme montante Squat
          </span>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
        </div>
        {gamme.map((g, i) => (
          <div key={i} style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${BORDER}` }}>
            <span style={{ fontSize: 12, color: "#fff" }}>@{g.pct}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: MUTED }}>{g.reps}</span>
              <MiniTag color={ACCENT}>{g.kg} kg</MiniTag>
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

function ProgrammeScreen() {
  const sessions = [
    { day: "Lundi", focus: "Bas du corps — Lourd", exercises: "Squat 4×6-8 @78-82%" },
    { day: "Mardi", focus: "Haut du corps — Lourd", exercises: "Bench 4×6-8 @78-82%" },
    { day: "Jeudi", focus: "Haut du corps — Léger", exercises: "Larsen 4×8-10 @65-75%" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Week pills */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
        {["S1", "S2", "S3", "S4", "S5", "S6"].map((w, i) => (
          <div
            key={w}
            style={{
              padding: "8px 16px",
              borderRadius: 30,
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              background: i === 0 ? ACCENT : `rgba(255,255,255,0.05)`,
              color: i === 0 ? BG : MUTED,
              flexShrink: 0,
              textAlign: "center",
            }}
          >
            {w}
          </div>
        ))}
      </div>

      <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: 0, fontStyle: "italic" }}>
        Semaine 1
      </p>

      {sessions.map((s, i) => (
        <GlassCard key={i}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.15em", margin: 0 }}>
              {s.day}
            </p>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", margin: "4px 0 0", fontStyle: "italic" }}>
              {s.focus}
            </p>
          </div>
          <div style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{s.exercises}</span>
            <MiniTag>{i === 0 ? "109-115 kg" : i === 1 ? "78-82 kg" : "65-75 kg"}</MiniTag>
          </div>
          <div style={{ padding: "10px 16px", borderTop: `1px solid ${BORDER}` }}>
            <div
              style={{
                padding: "10px 0",
                textAlign: "center",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "#fff",
                background: `rgba(255,255,255,0.04)`,
                borderRadius: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              ▶ Démarrer la séance
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function NutritionScreen() {
  const macros = [
    { label: "Protéines", val: "180g", sub: "2.7g/kg", color: ACCENT },
    { label: "Glucides", val: "330g", sub: "5g/kg", color: "#FF9500" },
    { label: "Lipides", val: "75g", sub: "1.1g/kg", color: "#34C759" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <GlassCard>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>🥩</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#fff", fontStyle: "italic" }}>Macros journaliers</span>
        </div>
        <div style={{ padding: 16, display: "flex", gap: 8 }}>
          {macros.map((m) => (
            <div key={m.label} style={{ flex: 1, textAlign: "center" }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: m.color, margin: 0 }}>{m.val}</p>
              <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", margin: "2px 0 0" }}>
                {m.label}
              </p>
              <p style={{ fontSize: 9, color: DIM, margin: "2px 0 0" }}>{m.sub}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>⏰</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#fff", fontStyle: "italic" }}>Timing repas</span>
        </div>
        {[
          { time: "Pré-training (2h)", food: "Glucides complexes + Protéines" },
          { time: "Post-training (30min)", food: "Whey 30g + Banane" },
          { time: "Dîner", food: "Protéines + Légumes + Riz" },
        ].map((t, i) => (
          <div key={i} style={{ padding: "10px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>{t.time}</span>
            <span style={{ fontSize: 11, color: MUTED }}>{t.food}</span>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

function ProfilScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Hero */}
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${ACCENT}40, ${ACCENT}10)`,
            margin: "0 auto 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            border: `2px solid ${ACCENT}30`,
          }}
        >
          T
        </div>
        <p style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: 0, fontStyle: "italic" }}>
          {ATHLETE.name}
        </p>
        <p style={{ fontSize: 10, color: MUTED, margin: "4px 0 0", fontWeight: 600 }}>
          Cycle 1 • Semaine 1
        </p>
        <p style={{ fontSize: 28, fontWeight: 800, color: ACCENT, margin: "8px 0 0", fontVariantNumeric: "tabular-nums" }}>
          {ATHLETE.squat + ATHLETE.bench + ATHLETE.deadlift} kg
        </p>
        <p style={{ fontSize: 9, color: DIM, textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700 }}>
          Total
        </p>
      </div>

      {/* 1RM */}
      <GlassCard>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Max. Actuels (1RM)
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          {[
            { l: "SQ", v: ATHLETE.squat },
            { l: "BP", v: ATHLETE.bench },
            { l: "DL", v: ATHLETE.deadlift },
          ].map((x) => (
            <div key={x.l} style={{ padding: "14px 12px", textAlign: "center", borderRight: `1px solid ${BORDER}` }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: ACCENT, margin: "0 0 4px" }}>{x.l}</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: 0 }}>{x.v}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Timeline */}
      <GlassCard>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Progression du cycle
          </span>
        </div>
        <div style={{ padding: "12px 16px", display: "flex", gap: 3, alignItems: "center" }}>
          {Array.from({ length: 17 }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 4,
                background: i < 2 ? ACCENT : `rgba(255,255,255,0.08)`,
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
        <div style={{ padding: "0 16px 12px" }}>
          <span style={{ fontSize: 10, color: MUTED }}>2 / 17 séances</span>
        </div>
      </GlassCard>
    </div>
  );
}

// ── Focus Mode Preview ───────────────────────────────────────────

function FocusModePreview() {
  const [setsDone, setSetsDone] = useState(2);
  const total = 4;

  return (
    <div
      style={{
        width: 320,
        minHeight: 500,
        background: BG,
        borderRadius: 40,
        border: `3px solid rgba(255,255,255,0.1)`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 25px 80px rgba(0,0,0,0.6)",
        flexShrink: 0,
      }}
    >
      {/* Notch */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}>
        <div style={{ width: 120, height: 28, background: "#000", borderRadius: 20 }} />
      </div>

      {/* Top bar */}
      <div style={{ padding: "16px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 9, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.3em", margin: 0 }}>
            Mode Séance
          </p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "4px 0 0", fontStyle: "italic" }}>
            Bas du corps — Lourd
          </p>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, fontVariantNumeric: "tabular-nums" }}>
          12:34
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ display: "flex", gap: 3, padding: "16px 20px 0" }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 4,
              background: i < 1 ? ACCENT : i === 1 ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)",
            }}
          />
        ))}
      </div>

      {/* Exercise */}
      <div style={{ flex: 1, padding: "32px 20px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.15em", margin: 0 }}>
          Exercice 2 / 5
        </p>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: "#fff", fontStyle: "italic", letterSpacing: "-0.02em", lineHeight: 1.1, margin: 0 }}>
          Squat Low Bar
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", margin: 0, fontStyle: "italic" }}>
          4 séries × 6-8 reps
        </p>

        {/* Weight */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "baseline",
            gap: 6,
            padding: "12px 20px",
            borderRadius: 16,
            background: "rgba(255,255,255,0.04)",
            border: `1px solid rgba(255,255,255,0.04)`,
            alignSelf: "flex-start",
          }}
        >
          <span style={{ fontSize: 42, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>115</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: ACCENT }}>kg</span>
        </div>

        {/* Sets progress */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 5,
                borderRadius: 4,
                background: i < setsDone ? ACCENT : i === setsDone ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
        <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.15em", margin: 0 }}>
          Série {Math.min(setsDone + 1, total)} / {total}
        </p>

        {/* Timer placeholder */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              border: `3px solid ${ACCENT}30`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
              87
            </span>
            <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.2em" }}>
              Recovery
            </span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "0 20px 28px" }}>
        <button
          onClick={() => setSetsDone((s) => (s >= total ? 0 : s + 1))}
          style={{
            width: "100%",
            padding: "18px 0",
            borderRadius: 50,
            background: ACCENT,
            color: BG,
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            border: "none",
            cursor: "pointer",
            boxShadow: `0 8px 30px ${ACCENT}33`,
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          ✓ Série faite
        </button>
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────

export default function AppOverview() {
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", label: "Vue d'ensemble" },
    { id: "screens", label: "Écrans" },
    { id: "features", label: "Fonctionnalités" },
    { id: "architecture", label: "Architecture" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${BG} 0%, #0d1117 100%)`,
        color: "#fff",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* Hero */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${ACCENT}, #FF6B5B)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            C
          </div>
          <MiniTag>PWA • React • TypeScript</MiniTag>
        </div>
        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 800,
            fontStyle: "italic",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            margin: "16px 0 12px",
            background: `linear-gradient(135deg, #fff 60%, ${ACCENT})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Programme Candito
        </h1>
        <p style={{ fontSize: 18, color: MUTED, maxWidth: 600, lineHeight: 1.6, margin: 0 }}>
          Application PWA de suivi d'entraînement powerlifting. Programme Candito 6 semaines avec coach contextuel, mode séance immersif et calcul automatique des charges.
        </p>

        {/* Section tabs */}
        <div style={{ display: "flex", gap: 6, marginTop: 32, overflowX: "auto", paddingBottom: 4 }}>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                padding: "10px 20px",
                borderRadius: 30,
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                background: activeSection === s.id ? ACCENT : "rgba(255,255,255,0.05)",
                color: activeSection === s.id ? BG : MUTED,
                border: "none",
                cursor: "pointer",
                flexShrink: 0,
                transition: "all 0.2s",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        {activeSection === "overview" && (
          <div>
            {/* Athlete card */}
            <div
              style={{
                background: SURFACE,
                borderRadius: 24,
                border: `1px solid ${BORDER}`,
                padding: 32,
                marginBottom: 40,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${ACCENT}40, ${ACCENT}10)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    fontWeight: 800,
                    border: `2px solid ${ACCENT}30`,
                  }}
                >
                  T
                </div>
                <div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, margin: 0, fontStyle: "italic" }}>{ATHLETE.name}</h3>
                  <p style={{ fontSize: 12, color: MUTED, margin: "2px 0 0" }}>20 ans • 66 kg • 1m70</p>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: ACCENT, fontVariantNumeric: "tabular-nums" }}>
                    {ATHLETE.squat + ATHLETE.bench + ATHLETE.deadlift}
                  </span>
                  <span style={{ fontSize: 14, color: MUTED, marginLeft: 4 }}>kg total</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                {[
                  { l: "Squat", v: `${ATHLETE.squat} kg`, c: ACCENT },
                  { l: "Bench Press", v: `${ATHLETE.bench} kg`, c: "#FF9500" },
                  { l: "Deadlift", v: `${ATHLETE.deadlift} kg`, c: "#34C759" },
                ].map((x) => (
                  <div key={x.l} style={{ background: `${x.c}08`, borderRadius: 16, padding: "16px 20px", border: `1px solid ${x.c}15` }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: x.c, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>
                      {x.l}
                    </p>
                    <p style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: 0 }}>{x.v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Program timeline */}
            <h2 style={{ fontSize: 24, fontWeight: 800, fontStyle: "italic", marginBottom: 20 }}>
              Structure du programme
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, marginBottom: 40 }}>
              {WEEKS.map((w) => (
                <div
                  key={w.id}
                  style={{
                    background: SURFACE,
                    borderRadius: 16,
                    border: `1px solid ${BORDER}`,
                    padding: 20,
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: ACCENT,
                          background: `${ACCENT}15`,
                          padding: "4px 12px",
                          borderRadius: 20,
                        }}
                      >
                        {w.label}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{w.name}</span>
                    </div>
                    <span style={{ fontSize: 11, color: MUTED, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                      {w.pct}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>
                    {w.sessions} séances • {w.focus}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              {[
                { label: "Durée totale", value: "6 semaines", sub: "17 séances programmées" },
                { label: "Objectif final", value: "PR ou Décharge", sub: "Test maxis @100-102%" },
                { label: "Méthode", value: "Périodisation bloc", sub: "Accumulation → Peaking" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: SURFACE,
                    borderRadius: 16,
                    border: `1px solid ${BORDER}`,
                    padding: 20,
                  }}
                >
                  <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 6px" }}>
                    {s.label}
                  </p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: DIM, margin: 0 }}>{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "screens" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, fontStyle: "italic", marginBottom: 8 }}>
              Navigation de l'application
            </h2>
            <p style={{ fontSize: 14, color: MUTED, marginBottom: 32, maxWidth: 600 }}>
              5 onglets principaux avec navigation fluide et transitions animées (Framer Motion). Clique sur les onglets du téléphone pour naviguer.
            </p>

            <div
              style={{
                display: "flex",
                gap: 48,
                alignItems: "flex-start",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <PhoneMockup
                activeScreen={activeScreen}
                onScreenChange={setActiveScreen}
              />
              <FocusModePreview />
            </div>

            <p style={{ textAlign: "center", fontSize: 11, color: DIM, marginTop: 24, fontStyle: "italic" }}>
              Gauche : Navigation principale • Droite : Mode Séance (Focus Mode)
            </p>
          </div>
        )}

        {activeSection === "features" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, fontStyle: "italic", marginBottom: 32 }}>
              Fonctionnalités clés
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  style={{
                    background: SURFACE,
                    borderRadius: 20,
                    border: `1px solid ${BORDER}`,
                    padding: 24,
                    borderLeft: `3px solid ${f.color}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: `${f.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                      }}
                    >
                      {f.icon}
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{f.title}</h3>
                  </div>
                  <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Mode Séance details */}
            <div
              style={{
                marginTop: 40,
                background: `linear-gradient(135deg, ${ACCENT}08, ${ACCENT}03)`,
                borderRadius: 24,
                border: `1px solid ${ACCENT}20`,
                padding: 32,
              }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 800, fontStyle: "italic", marginBottom: 16 }}>
                Mode Séance — Détails
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
                {[
                  { t: "Nexus Pulse Timer", d: "Timer circulaire animé avec vibration à la fin. Durées ajustables (1:30, 2:00, 3:00, 5:00)." },
                  { t: "Saisie rapide", d: "Poids pré-rempli + boutons ±2.5 kg. Sélection RPE visuelle (6 à 10). Log instantané par série." },
                  { t: "Estimation 1RM auto", d: "Si RPE ≥ 8 et poids > 1RM actuel → suggestion via formule d'Epley avec mise à jour en un tap." },
                  { t: "Mode Companion", d: "Vue simplifiée plein écran avec uniquement l'exercice, le poids et le timer. Idéal pour les lunettes embuées." },
                  { t: "Wake Lock", d: "L'écran reste allumé pendant toute la séance. Réactivation automatique si l'app revient au premier plan." },
                  { t: "Persistance séance", d: "L'état de la séance (séries faites, poids saisis) est sauvegardé en localStorage. Recharge sans perte." },
                ].map((x) => (
                  <div key={x.t}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{x.t}</p>
                    <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, margin: 0 }}>{x.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === "architecture" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, fontStyle: "italic", marginBottom: 32 }}>
              Architecture technique
            </h2>

            {/* Tech stack */}
            <div
              style={{
                background: SURFACE,
                borderRadius: 20,
                border: `1px solid ${BORDER}`,
                overflow: "hidden",
                marginBottom: 32,
              }}
            >
              <div style={{ padding: "16px 24px", borderBottom: `1px solid ${BORDER}` }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Stack technique</h3>
              </div>
              {TECH_STACK.map((t, i) => (
                <div
                  key={t.name}
                  style={{
                    padding: "14px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: i < TECH_STACK.length - 1 ? `1px solid ${BORDER}` : "none",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{t.name}</span>
                  <span style={{ fontSize: 11, color: MUTED }}>{t.role}</span>
                </div>
              ))}
            </div>

            {/* Architecture diagram */}
            <div
              style={{
                background: SURFACE,
                borderRadius: 20,
                border: `1px solid ${BORDER}`,
                padding: 32,
                marginBottom: 32,
              }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Structure des composants</h3>
              <pre
                style={{
                  fontSize: 11,
                  color: MUTED,
                  lineHeight: 1.8,
                  margin: 0,
                  overflowX: "auto",
                  fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                }}
              >{`App
├── CanditoProvider          ← State global (IndexedDB + migrations)
│   ├── ToastProvider        ← Système de notifications toast
│   └── AppContent
│       ├── AppLayout        ← Layout + BottomNav (5 onglets)
│       ├── Dashboard        ← Accueil
│       │   ├── CoachCard    ← Messages contextuels IA
│       │   ├── NextSessionHero
│       │   ├── LastSessionCard
│       │   └── AthleteStats
│       ├── Warmup           ← Échauffement (bas/haut du corps)
│       ├── Programme        ← Sélecteur semaine + SessionCards
│       │   ├── WeekSelector ← Pills S1-S6
│       │   ├── SessionCard  ← Résumé exercices + charges
│       │   └── FocusMode    ← Séance immersive plein écran
│       │       ├── NexusPulse Timer
│       │       ├── Set Logger (poids/RPE)
│       │       ├── 1RM Suggestion
│       │       └── Companion Mode
│       ├── Nutrition        ← Macros + Timing
│       └── Profil           ← Navigation stack interne
│           ├── AthleteHero  ← Nom, 1RM, total
│           ├── SessionTimeline
│           ├── PRSection    ← Records personnels
│           ├── LiftProgressGraph
│           ├── CycleHistory
│           ├── SessionHistory
│           ├── Settings     ← Export/Import/Personnalisation
│           ├── ProgramMainView  ← Vue édition programme
│           └── SessionMainView  ← Vue édition session`}</pre>
            </div>

            {/* Data flow */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              {[
                {
                  title: "État global (CanditoContext)",
                  items: [
                    "1RM athlète (Squat / Bench / Deadlift)",
                    "Sessions complétées + Logs détaillés",
                    "Records personnels (PRs)",
                    "Historique des cycles",
                    "Overrides programme (personnalisation)",
                    "Migration automatique du schéma (v1→v6)",
                  ],
                },
                {
                  title: "Persistance",
                  items: [
                    "IndexedDB via idb-keyval (principal)",
                    "localStorage fallback + migration auto",
                    "Session en cours persistée séparément",
                    "Export/Import JSON complet",
                    "Pas de backend — 100% local",
                  ],
                },
                {
                  title: "PWA & Offline",
                  items: [
                    "Service Worker avec cache-first",
                    "Manifest.json (standalone, portrait)",
                    "Banner d'installation iOS/Android",
                    "Mise à jour avec prompt utilisateur",
                    "Web Push notifications d'entraînement",
                  ],
                },
              ].map((s) => (
                <div
                  key={s.title}
                  style={{
                    background: SURFACE,
                    borderRadius: 16,
                    border: `1px solid ${BORDER}`,
                    padding: 20,
                  }}
                >
                  <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>{s.title}</h4>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {s.items.map((item) => (
                      <li key={item} style={{ fontSize: 12, color: MUTED, lineHeight: 2 }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "40px 24px 60px", borderTop: `1px solid ${BORDER}` }}>
        <p style={{ fontSize: 10, color: DIM, textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700, fontStyle: "italic" }}>
          Forge ton corps, forge ton mental • Programme Candito
        </p>
        <p style={{ fontSize: 11, color: DIM, marginTop: 8 }}>
          Développé avec Antigravity — Par Théo
        </p>
      </div>
    </div>
  );
}
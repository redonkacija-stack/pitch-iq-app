import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  AudioLines,
  BadgeCheck,
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  Gauge,
  Lightbulb,
  ListChecks,
  Menu,
  Mic2,
  Play,
  Plus,
  Presentation,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import "./index.css";

const STORAGE_KEY = "pitchiq-coach-workspace:v1";

const initialPitch = {
  title: "Untitled pitch",
  audience: "",
  problem: "",
  solution: "",
  difference: "",
  evidence: "",
  ask: "",
};

const builderSteps = [
  { title: "Set the scene", eyebrow: "01 / FOUNDATION", icon: Target },
  { title: "Your solution", eyebrow: "02 / VALUE", icon: Sparkles },
  { title: "Show the proof", eyebrow: "03 / EVIDENCE", icon: BarChart3 },
  { title: "Make the ask", eyebrow: "04 / NEXT STEP", icon: ArrowDownRight },
  { title: "Pitch review", eyebrow: "05 / SCORECARD", icon: ListChecks },
];

function loadWorkspace() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return {
      pitch: { ...initialPitch, ...(saved?.pitch || {}) },
      practiceSessions: Number(saved?.practiceSessions) || 0,
      bestScore: Number(saved?.bestScore) || 0,
      latestScore: Number(saved?.latestScore) || 0,
      lastPractice: saved?.lastPractice || null,
    };
  } catch {
    return {
      pitch: initialPitch,
      practiceSessions: 0,
      bestScore: 0,
      latestScore: 0,
      lastPractice: null,
    };
  }
}

function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function scorePitch(pitch) {
  const allCopy = [
    pitch.audience,
    pitch.problem,
    pitch.solution,
    pitch.difference,
    pitch.evidence,
    pitch.ask,
  ].join(" ");
  const wordTotal = wordCount(allCopy);
  const measurable =
    /\d|%|\$|\b(month|week|year|customer|users|revenue|saved|grew|reduced)\b/i.test(
      pitch.evidence,
    );
  const painSignal =
    /\b(cost|lose|lost|waste|slow|risk|pain|struggle|problem|manual|expensive|hours|miss)\b/i.test(
      pitch.problem,
    );
  const outcomeSignal =
    /\b(save|reduce|increase|improve|faster|automate|help|enable|deliver|turn)\b/i.test(
      pitch.solution,
    );
  const specificAsk =
    /\b(ask|seeking|raise|intro|meeting|pilot|purchase|invest|commit|next step|\$\d)\b/i.test(
      pitch.ask,
    );
  const criteria = [
    {
      id: "clarity",
      label: "Clarity",
      score: Math.min(
        100,
        Math.round(
          (Math.min(wordTotal, 105) / 105) * 48 +
            (pitch.audience.trim() ? 26 : 0) +
            (pitch.title.trim() && pitch.title !== "Untitled pitch" ? 26 : 0),
        ),
      ),
      note:
        wordTotal > 120
          ? "Tighten the story to its essential beats."
          : wordTotal >= 30
            ? "A focused amount of detail makes this easy to follow."
            : "Add a little more context so the story feels complete.",
      icon: AudioLines,
    },
    {
      id: "problem",
      label: "Problem",
      score: Math.min(
        100,
        (wordCount(pitch.problem) >= 12 ? 45 : wordCount(pitch.problem) * 3) +
          (painSignal ? 30 : 0) +
          (pitch.audience.trim() ? 25 : 0),
      ),
      note: painSignal
        ? "You identify a real friction point; make its cost concrete."
        : "Name what your audience loses today: time, money, or opportunity.",
      icon: CircleHelp,
    },
    {
      id: "solution",
      label: "Solution",
      score: Math.min(
        100,
        (wordCount(pitch.solution) >= 12 ? 45 : wordCount(pitch.solution) * 3) +
          (outcomeSignal ? 30 : 0) +
          (wordCount(pitch.difference) >= 5 ? 25 : 0),
      ),
      note: outcomeSignal
        ? "The outcome is visible; distinguish the mechanism from the benefit."
        : "Explain what changes for the customer after they use this.",
      icon: Sparkles,
    },
    {
      id: "proof",
      label: "Proof",
      score: Math.min(
        100,
        (wordCount(pitch.evidence) >= 10 ? 45 : wordCount(pitch.evidence) * 4) +
          (measurable ? 40 : 0) +
          (pitch.evidence.trim() ? 15 : 0),
      ),
      note: measurable
        ? "A concrete signal helps the audience trust the claim."
        : "Add a customer result, pilot, usage signal, or specific number.",
      icon: ShieldCheck,
    },
    {
      id: "ask",
      label: "The ask",
      score: Math.min(
        100,
        (wordCount(pitch.ask) >= 7 ? 45 : wordCount(pitch.ask) * 6) +
          (specificAsk ? 35 : 0) +
          (pitch.ask.trim() ? 20 : 0),
      ),
      note: specificAsk
        ? "The next step is actionable; make ownership and timing explicit."
        : "Finish with one clear action you want the listener to take.",
      icon: Target,
    },
  ];
  const score = Math.round(
    criteria.reduce((sum, item) => sum + item.score, 0) / criteria.length,
  );
  return { score, criteria, wordTotal };
}

function ScoreRing({ score, size = "large" }) {
  const dimension = size === "large" ? "h-[132px] w-[132px]" : "h-11 w-11";
  return (
    <div
      className={`score-ring ${dimension}`}
      style={{ "--score": `${score * 3.6}deg` }}
    >
      <div className="score-ring-center">
        {size === "large" ? (
          <>
            <strong>{score}</strong>
            <span>out of 100</span>
          </>
        ) : (
          <strong>{score}</strong>
        )}
      </div>
    </div>
  );
}

function Sidebar({ activeView, onNavigate, onNewPitch, mobileOpen, onClose }) {
  const items = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "builder", label: "Pitch builder", icon: FileText },
    { id: "practice", label: "Practice room", icon: Mic2 },
    { id: "feedback", label: "Scorecard", icon: ListChecks },
  ];
  return (
    <>
      {mobileOpen && (
        <button
          className="fixed inset-0 z-40 bg-slate-950/70 lg:hidden"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-white/[.07] bg-[#0b1221] px-4 pb-5 pt-5 transition-transform lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          className="mb-9 flex items-center gap-3 px-2 text-left"
          onClick={() => {
            onNavigate("overview");
            onClose();
          }}
          aria-label="Pitch IQ overview"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400 text-slate-950">
            <Presentation size={20} strokeWidth={2.4} />
          </span>
          <span>
            <span className="block font-display text-[21px] font-bold leading-none">
              pitch<span className="text-emerald-300">IQ</span>
            </span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[.16em] text-slate-500">
              The pitch practice room
            </span>
          </span>
        </button>
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-600">
          Workspace
        </p>
        <nav className="space-y-1" aria-label="Workspace navigation">
          {items.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                onNavigate(id);
                onClose();
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${activeView === id ? "bg-white/[.075] text-white" : "text-slate-400 hover:bg-white/[.04] hover:text-white"}`}
            >
              <Icon
                size={17}
                className={
                  activeView === id ? "text-emerald-300" : "text-slate-500"
                }
              />{" "}
              {label}
              {id === "feedback" && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-300" />
              )}
            </button>
          ))}
        </nav>
        <div className="mt-8 border-t border-white/[.07] pt-5">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-600">
            Your pitch
          </p>
          <div className="rounded-xl border border-white/[.07] bg-white/[.025] p-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              <span className="truncate text-xs font-semibold text-slate-200">
                Your working draft
              </span>
            </div>
            <p className="mt-2 truncate pl-4 text-xs text-slate-500">
              {onNewPitch.title}
            </p>
            <button
              onClick={() => {
                onNavigate("builder");
                onClose();
              }}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-white/10 py-2 text-xs font-bold text-slate-300 transition hover:border-emerald-300/40 hover:text-emerald-200"
            >
              <Plus size={13} /> Edit pitch
            </button>
          </div>
        </div>
        <div className="mt-auto rounded-xl border border-emerald-300/15 bg-emerald-300/[.06] p-3.5">
          <div className="flex items-center gap-2 text-emerald-200">
            <Lightbulb size={15} />
            <span className="text-[10px] font-bold uppercase tracking-[.12em]">
              A useful rule
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            Make one claim. Support it with proof. End with one clear ask.
          </p>
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-white/[.06] px-2 pt-4 text-[10px] text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Saved in
          this browser
        </div>
      </aside>
    </>
  );
}

function Topbar({ onMenu, activeView, onNavigate }) {
  const titles = {
    overview: "Overview",
    builder: "Pitch builder",
    practice: "Practice room",
    feedback: "Your scorecard",
  };
  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-white/[.07] bg-[#0f172a]/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">
            Pitch IQ / Workspace
          </p>
          <h1 className="font-display text-lg font-semibold leading-tight">
            {titles[activeView]}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full border border-emerald-300/15 bg-emerald-300/[.05] px-3 py-1.5 text-[10px] font-semibold text-emerald-200 sm:inline-flex">
          <Save size={12} /> Auto-saved
        </span>
        <button
          onClick={() => onNavigate("builder")}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-3.5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-200"
        >
          <FileText size={15} />{" "}
          <span className="hidden sm:inline">Edit draft</span>
          <span className="sm:hidden">Edit</span>
        </button>
      </div>
    </header>
  );
}

function MetricTile({
  label,
  value,
  suffix,
  icon: Icon,
  detail,
  accent = "emerald",
}) {
  const accentClass =
    accent === "amber"
      ? "text-amber-200 bg-amber-200/10"
      : accent === "blue"
        ? "text-sky-200 bg-sky-200/10"
        : "text-emerald-200 bg-emerald-200/10";
  return (
    <div className="rounded-xl border border-white/[.08] bg-[#131e32] p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.13em] text-slate-500">
            {label}
          </p>
          <p className="mt-3 font-display text-3xl font-bold leading-none">
            {value}
            <span className="ml-1 text-sm font-medium text-slate-500">
              {suffix}
            </span>
          </p>
        </div>
        <span
          className={`grid h-9 w-9 place-items-center rounded-lg ${accentClass}`}
        >
          <Icon size={17} />
        </span>
      </div>
      <p className="mt-3 text-[11px] text-slate-500">{detail}</p>
    </div>
  );
}

function Overview({
  pitch,
  analysis,
  sessions,
  bestScore,
  latestScore,
  onNavigate,
}) {
  const completeness = [
    pitch.audience,
    pitch.problem,
    pitch.solution,
    pitch.evidence,
    pitch.ask,
  ].filter((value) => value.trim()).length;
  const ready = completeness === 5;
  return (
    <div className="mx-auto w-full max-w-[1360px] space-y-7 px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
      <section className="relative overflow-hidden rounded-2xl border border-white/[.08] bg-[#141f34] p-5 sm:p-8 lg:p-10">
        <div className="absolute inset-y-0 right-0 hidden w-[52%] lg:block">
          <div className="absolute inset-0 bg-gradient-to-r from-[#141f34] via-[#141f34]/55 to-transparent" />
          <div className="absolute right-[-4%] top-[-40%] h-[480px] w-[480px] rounded-full border border-emerald-300/[.08]" />
          <div className="absolute right-[7%] top-[-17%] h-[350px] w-[350px] rounded-full border border-sky-200/[.08]" />
          <div className="absolute right-[19%] top-[9%] h-[230px] w-[230px] rounded-full border border-white/[.08]" />
          <div className="absolute right-[31%] top-[41%] h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_28px_8px_rgba(110,231,183,.3)]" />
        </div>
        <div className="relative z-10 max-w-[700px]">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-emerald-200">
            <Sparkles size={13} /> A smarter way to rehearse
          </p>
          <h2 className="font-display text-4xl font-bold leading-[.98] tracking-normal sm:text-5xl lg:text-[62px]">
            Pitch clearly.
            <br />
            <span className="text-emerald-300">Prove the value.</span>
            <br />
            Make the ask.
          </h2>
          <p className="mt-4 max-w-[590px] text-sm leading-relaxed text-slate-300 sm:text-base">
            Pitch IQ helps founders and sales teams shape a sharper story,
            practice it out loud, and spot what needs work before the room
            matters. Build a pitch, get a transparent scorecard, and keep every
            draft on this device.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate("builder")}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-200"
            >
              Build your pitch <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onNavigate("practice")}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[.035] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[.08]"
            >
              <Play size={15} /> Practice a draft
            </button>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Check size={13} className="text-emerald-300" /> Offline-first
              draft saving
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={13} className="text-emerald-300" /> Clear, editable
              rubric
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={13} className="text-emerald-300" /> No AI claims or
              black-box scores
            </span>
          </div>
        </div>
      </section>

      <section
        aria-label="Practice metrics"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricTile
          label="Practice sessions"
          value={sessions}
          suffix="total"
          icon={Mic2}
          detail="Rehearsals recorded in this browser"
        />
        <MetricTile
          label="Best pitch score"
          value={bestScore}
          suffix="/ 100"
          icon={TrendingUp}
          detail={
            sessions
              ? "Your personal best to date"
              : "Complete a pitch review to begin"
          }
          accent="blue"
        />
        <MetricTile
          label="Latest score"
          value={latestScore}
          suffix="/ 100"
          icon={Gauge}
          detail={
            sessions
              ? "From your most recent recorded session"
              : "No session recorded yet"
          }
          accent="amber"
        />
        <MetricTile
          label="Draft completeness"
          value={completeness}
          suffix="/ 5"
          icon={BadgeCheck}
          detail={
            ready
              ? "All core pitch sections have content"
              : "Audience, problem, solution, proof, ask"
          }
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(330px,.7fr)]">
        <div className="rounded-xl border border-white/[.08] bg-[#131e32] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-500">
                Active draft
              </p>
              <h3 className="mt-1 font-display text-2xl font-bold">
                {pitch.title || "Untitled pitch"}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {pitch.audience || "Audience not set"}
              </p>
            </div>
            <button
              onClick={() => onNavigate("builder")}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-bold text-emerald-200 transition hover:bg-emerald-200/10"
            >
              Continue editing <ArrowRight size={14} />
            </button>
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-5">
            {builderSteps.map((step, index) => {
              const Icon = step.icon;
              const filled = [
                pitch.audience,
                pitch.problem,
                pitch.solution,
                pitch.evidence,
                pitch.ask,
              ][Math.min(index, 4)]?.trim();
              return (
                <button
                  key={step.title}
                  onClick={() => onNavigate("builder")}
                  className="group rounded-lg border border-white/[.07] bg-black/10 p-3 text-left transition hover:border-emerald-200/20"
                >
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-md ${filled ? "bg-emerald-300/10 text-emerald-200" : "bg-white/[.045] text-slate-500"}`}
                  >
                    <Icon size={15} />
                  </span>
                  <span className="mt-3 block text-xs font-bold">
                    {step.title}
                  </span>
                  <span className="mt-1 block text-[10px] text-slate-500">
                    {filled ? "In draft" : "Add details"}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-white/[.06] pt-4">
            <span className="text-xs text-slate-500">
              {analysis.wordTotal} words across your story
            </span>
            <button
              onClick={() => onNavigate("feedback")}
              className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-emerald-200/25 hover:text-white"
            >
              <ListChecks size={14} /> Open scorecard
            </button>
          </div>
        </div>
        <div className="rounded-xl border border-white/[.08] bg-[#131e32] p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-500">
                Current rubric preview
              </p>
              <h3 className="mt-1 font-display text-xl font-bold">
                Pitch health
              </h3>
            </div>
            <ScoreRing score={analysis.score} />
          </div>
          <div className="mt-4 space-y-3">
            {analysis.criteria.map((item) => (
              <ScoreBar key={item.id} item={item} compact />
            ))}
          </div>
          <button
            onClick={() => onNavigate("feedback")}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-white/[.06] py-2.5 text-xs font-bold text-white transition hover:bg-white/10"
          >
            View detailed feedback <ChevronRight size={14} />
          </button>
        </div>
      </section>

      <section className="border-t border-white/[.07] pt-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.15em] text-emerald-200">
              The practice loop
            </p>
            <h3 className="mt-1 font-display text-2xl font-bold">
              A stronger pitch, one pass at a time.
            </h3>
          </div>
          <button
            onClick={() => onNavigate("builder")}
            className="hidden items-center gap-1 text-xs font-bold text-emerald-200 sm:inline-flex"
          >
            Start a draft <ArrowRight size={14} />
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            {
              icon: FileText,
              step: "01",
              title: "Build the story",
              copy: "Organize the audience, problem, solution, evidence, and ask into a concise narrative.",
            },
            {
              icon: Gauge,
              step: "02",
              title: "See the reasoning",
              copy: "Review five transparent criteria with concrete suggestions, not a mysterious score.",
            },
            {
              icon: Mic2,
              step: "03",
              title: "Rehearse with intent",
              copy: "Use a focused practice timer and track how your own pitch score changes over time.",
            },
          ].map(({ icon: Icon, step, title, copy }) => (
            <div
              key={step}
              className="flex gap-3 rounded-xl border border-white/[.07] bg-white/[.02] p-4"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[.05] text-emerald-200">
                <Icon size={17} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-slate-600">
                    {step}
                  </span>
                  <h4 className="text-sm font-bold">{title}</h4>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                  {copy}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ScoreBar({ item, compact = false }) {
  const Icon = item.icon;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          {!compact && <Icon size={14} className="text-slate-500" />}
          {item.label}
        </span>
        <span className="text-xs font-bold tabular-nums text-slate-300">
          {item.score}
          <span className="ml-0.5 text-[10px] text-slate-600">/100</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[.07]">
        <div
          className={`h-full rounded-full transition-all duration-700 ${item.score >= 70 ? "bg-emerald-300" : item.score >= 40 ? "bg-amber-200" : "bg-slate-500"}`}
          style={{ width: `${item.score}%` }}
        />
      </div>
    </div>
  );
}

function Field({ label, hint, value, onChange, placeholder, rows = 4 }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-200">{label}</span>
        {hint && <span className="text-[10px] text-slate-600">{hint}</span>}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="mt-2 w-full resize-y rounded-lg border border-white/[.09] bg-[#0c1424] px-3.5 py-3 text-sm leading-relaxed text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-300/45 focus:ring-2 focus:ring-emerald-300/10"
      />
    </label>
  );
}

function Builder({
  pitch,
  setPitch,
  step,
  setStep,
  analysis,
  onAnalyze,
  onPractice,
}) {
  const current = builderSteps[step];
  const CurrentIcon = current.icon;
  function update(field, value) {
    setPitch((currentPitch) => ({ ...currentPitch, [field]: value }));
  }
  const contents = [
    <div key="foundation" className="space-y-5">
      <label className="block">
        <span className="text-sm font-semibold text-slate-200">Pitch name</span>
        <input
          value={pitch.title}
          onChange={(event) => update("title", event.target.value)}
          placeholder="e.g. Northstar — the next generation of team finance"
          className="mt-2 w-full rounded-lg border border-white/[.09] bg-[#0c1424] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-300/45 focus:ring-2 focus:ring-emerald-300/10"
        />
      </label>
      <Field
        label="Who is this for?"
        hint="Specific beats broad"
        value={pitch.audience}
        onChange={(value) => update("audience", value)}
        placeholder="Describe the buyer, investor, or decision-maker you want to reach."
        rows={3}
      />
      <Field
        label="What problem do they face?"
        hint="Name the current cost"
        value={pitch.problem}
        onChange={(value) => update("problem", value)}
        placeholder="What is frustrating, expensive, slow, or risky about the status quo?"
        rows={4}
      />
    </div>,
    <div key="solution" className="space-y-5">
      <Field
        label="What do you offer?"
        hint="Describe the change"
        value={pitch.solution}
        onChange={(value) => update("solution", value)}
        placeholder="Explain how your product or offer solves the problem and what changes for the customer."
        rows={5}
      />
      <Field
        label="Why is your approach different?"
        hint="Your edge"
        value={pitch.difference}
        onChange={(value) => update("difference", value)}
        placeholder="What do you do differently, or what insight makes this solution work?"
        rows={4}
      />
    </div>,
    <div key="evidence" className="space-y-5">
      <Field
        label="What evidence supports your claim?"
        hint="Specific proof earns trust"
        value={pitch.evidence}
        onChange={(value) => update("evidence", value)}
        placeholder="Add traction, a customer outcome, pilot results, usage, a case study, or other evidence. Be precise about what is measured."
        rows={6}
      />
      <div className="rounded-lg border border-sky-200/10 bg-sky-200/[.035] p-3.5 text-xs leading-relaxed text-slate-400">
        <ShieldCheck size={14} className="mb-2 text-sky-200" />
        Only include results you can substantiate. If you are pre-launch, state
        what you have validated so far.
      </div>
    </div>,
    <div key="ask" className="space-y-5">
      <Field
        label="What is the next step you want?"
        hint="One clear action"
        value={pitch.ask}
        onChange={(value) => update("ask", value)}
        placeholder="Ask for a meeting, pilot, investment, purchase, introduction, or decision. Include a timeframe where useful."
        rows={5}
      />
      <div className="rounded-lg border border-emerald-200/10 bg-emerald-200/[.035] p-4">
        <p className="text-xs font-bold text-emerald-100">
          Make the ask easy to answer
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          A concrete request gives the listener a clear next move. Avoid ending
          with “thoughts?” if you need a decision.
        </p>
      </div>
    </div>,
    <div key="review" className="space-y-5">
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/[.08] bg-[#0c1424] p-4">
        <ScoreRing score={analysis.score} />
        <div className="min-w-[180px] flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">
            Draft score / 100
          </p>
          <h3 className="mt-1 font-display text-2xl font-bold">
            {analysis.score >= 75
              ? "Ready to rehearse"
              : analysis.score >= 45
                ? "A solid start"
                : "Build the essentials"}
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            {analysis.wordTotal} words across the core sections.
          </p>
          <button
            onClick={onAnalyze}
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-emerald-300 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-200"
          >
            <Sparkles size={13} /> See feedback breakdown
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {analysis.criteria.map((item) => (
          <ScoreBar key={item.id} item={item} />
        ))}
      </div>
      <button
        onClick={onPractice}
        className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-xs font-bold text-white transition hover:border-emerald-200/30"
      >
        <Mic2 size={15} /> Take this pitch to practice
      </button>
    </div>,
  ];
  return (
    <div className="mx-auto w-full max-w-[1360px] px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.15em] text-emerald-200">
            Guided builder / {current.eyebrow}
          </p>
          <h2 className="mt-1 font-display text-3xl font-bold">
            Shape the story.
          </h2>
          <p className="mt-1 max-w-xl text-sm text-slate-400">
            One section at a time. Your draft saves automatically in this
            browser.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-500">
          <Save size={12} /> Local autosave
        </span>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-xl border border-white/[.08] bg-[#131e32] p-4 sm:p-6">
          <div className="mb-6 grid grid-cols-5 gap-1.5 sm:gap-2">
            {builderSteps.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  onClick={() => setStep(index)}
                  className={`group flex min-w-0 flex-col items-center gap-1.5 rounded-lg px-1 py-2 text-center transition sm:flex-row sm:justify-center sm:gap-2 ${step === index ? "bg-emerald-300/10 text-emerald-100" : index < step ? "text-slate-300" : "text-slate-600 hover:bg-white/[.04]"}`}
                  aria-label={`Step ${index + 1}: ${item.title}`}
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[10px] font-bold ${step === index ? "border-emerald-200/30 bg-emerald-200/10" : index < step ? "border-emerald-200/20 text-emerald-200" : "border-white/10"}`}
                  >
                    {index < step ? <Check size={13} /> : index + 1}
                  </span>
                  <span className="hidden truncate text-[10px] font-semibold sm:inline">
                    {item.title}
                  </span>
                  <Icon className="sm:hidden" size={13} />
                </button>
              );
            })}
          </div>
          <div className="mb-5 flex items-center gap-3 border-b border-white/[.07] pb-4">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-300/10 text-emerald-200">
              <CurrentIcon size={18} />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-500">
                Step {step + 1} of {builderSteps.length}
              </p>
              <h3 className="font-display text-xl font-bold">
                {current.title}
              </h3>
            </div>
          </div>
          {contents[step]}
          <div className="mt-7 flex items-center justify-between border-t border-white/[.07] pt-4">
            <button
              disabled={step === 0}
              onClick={() => setStep((value) => Math.max(0, value - 1))}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold text-slate-400 transition hover:text-white disabled:opacity-30"
            >
              <ChevronLeft size={15} /> Back
            </button>
            {step < builderSteps.length - 1 ? (
              <button
                onClick={() =>
                  setStep((value) =>
                    Math.min(builderSteps.length - 1, value + 1),
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-200"
              >
                Next section <ChevronRight size={15} />
              </button>
            ) : (
              <button
                onClick={onPractice}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-200"
              >
                <Mic2 size={14} /> Practice pitch
              </button>
            )}
          </div>
        </div>
        <aside className="h-fit rounded-xl border border-white/[.08] bg-[#131e32] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-500">
            Live story preview
          </p>
          <h3 className="mt-1 truncate font-display text-xl font-bold">
            {pitch.title || "Untitled pitch"}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {pitch.audience || "Your audience will appear here"}
          </p>
          <div className="mt-5 space-y-4">
            {[
              ["The problem", pitch.problem],
              ["Your solution", pitch.solution],
              ["The proof", pitch.evidence],
              ["The ask", pitch.ask],
            ].map(([label, text]) => (
              <div key={label} className="border-l border-white/10 pl-3">
                <p className="text-[9px] font-bold uppercase tracking-[.12em] text-slate-500">
                  {label}
                </p>
                <p
                  className={`mt-1 text-xs leading-relaxed ${text ? "text-slate-300" : "italic text-slate-700"}`}
                >
                  {text || "Not added yet"}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-white/[.07] pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Rubric signal
              </span>
              <span className="font-display text-xl font-bold text-emerald-200">
                {analysis.score}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[.07]">
              <div
                className="h-full rounded-full bg-emerald-300 transition-all"
                style={{ width: `${analysis.score}%` }}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Feedback({ analysis, pitch, onBuilder, onPractice }) {
  const strongest = [...analysis.criteria].sort((a, b) => b.score - a.score)[0];
  const focus = [...analysis.criteria].sort((a, b) => a.score - b.score)[0];
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-5 px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[.15em] text-emerald-200">
          Pitch scorecard / transparent rubric
        </p>
        <h2 className="mt-1 font-display text-3xl font-bold">
          Useful feedback, not a black box.
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Scores are calculated locally from the completeness and specificity of
          your draft. They are a coaching prompt, not a prediction of
          fundraising or sales outcomes.
        </p>
      </div>
      <section className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-200/15 bg-[#142238] p-6 text-center">
          <ScoreRing score={analysis.score} />
          <p className="mt-4 text-xs font-bold uppercase tracking-[.13em] text-slate-400">
            Overall readiness
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {analysis.wordTotal} words evaluated
          </p>
        </div>
        <div className="rounded-xl border border-white/[.08] bg-[#131e32] p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {analysis.criteria.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.id}
                  className="rounded-lg border border-white/[.07] bg-black/10 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-md bg-white/[.05] text-emerald-200">
                        <Icon size={15} />
                      </span>
                      <h3 className="text-sm font-bold">{item.label}</h3>
                    </div>
                    <span className="font-display text-xl font-bold tabular-nums">
                      {item.score}
                      <span className="text-[10px] text-slate-600">/100</span>
                    </span>
                  </div>
                  <div className="my-3">
                    <ScoreBar item={item} compact />
                  </div>
                  <p className="text-xs leading-relaxed text-slate-400">
                    {item.note}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-200/15 bg-emerald-200/[.04] p-4">
          <div className="flex items-center gap-2 text-emerald-100">
            <BadgeCheck size={16} />
            <h3 className="text-sm font-bold">Keep building on</h3>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            <b>{strongest?.label}:</b> this is currently the clearest part of
            your pitch. Preserve it as you tighten the rest.
          </p>
        </div>
        <div className="rounded-xl border border-amber-200/15 bg-amber-200/[.035] p-4">
          <div className="flex items-center gap-2 text-amber-100">
            <Lightbulb size={16} />
            <h3 className="text-sm font-bold">One useful next edit</h3>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            <b>{focus?.label}:</b> {focus?.note}
          </p>
        </div>
      </section>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onBuilder}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-200"
        >
          <FileText size={14} /> Edit “{pitch.title || "Untitled pitch"}”
        </button>
        <button
          onClick={onPractice}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/[.05]"
        >
          <Mic2 size={14} /> Rehearse this version
        </button>
      </div>
    </div>
  );
}

function Practice({ pitch, analysis, sessions, onRecord }) {
  const [seconds, setSeconds] = useState(60);
  const [running, setRunning] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [confidence, setConfidence] = useState(3);
  const script = [pitch.problem, pitch.solution, pitch.evidence, pitch.ask]
    .filter((line) => line.trim())
    .join("\n\n");
  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(
      () =>
        setSeconds((value) => {
          if (value <= 1) {
            window.clearInterval(timer);
            setRunning(false);
            return 0;
          }
          return value - 1;
        }),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [running]);
  function resetTimer() {
    setRunning(false);
    setSeconds(60);
    setRecorded(false);
  }
  function record() {
    if (recorded) return;
    setRecorded(true);
    setRunning(false);
    onRecord(analysis.score, confidence);
  }
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-5 px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[.15em] text-emerald-200">
          Practice room / rehearsal
        </p>
        <h2 className="mt-1 font-display text-3xl font-bold">
          Give the story a voice.
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Use a one-minute run-through to notice pacing and make the next
          revision count.
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]">
        <section className="rounded-xl border border-white/[.08] bg-[#131e32] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.07] pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">
                Current rehearsal script
              </p>
              <h3 className="mt-1 font-display text-xl font-bold">
                {pitch.title}
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200/15 bg-sky-200/[.05] px-2.5 py-1 text-[10px] font-semibold text-sky-100">
              <Clock3 size={12} /> 60 second target
            </span>
          </div>
          <div className="mt-5 min-h-[230px] whitespace-pre-wrap rounded-lg border border-white/[.06] bg-[#0c1424] p-4 text-sm leading-[1.85] text-slate-300">
            {script || (
              <span className="italic text-slate-600">
                Your script will appear once you add a problem, solution, proof,
                and ask in the builder.
              </span>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setRunning((value) => !value)}
              disabled={seconds === 0 || recorded}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-200 disabled:opacity-50"
            >
              {running ? (
                <>
                  <AudioLines size={15} /> Pause rehearsal
                </>
              ) : (
                <>
                  <Play size={14} fill="currentColor" /> Start rehearsal
                </>
              )}
            </button>
            <button
              onClick={resetTimer}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/[.05]"
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button
              onClick={record}
              disabled={recorded}
              className="ml-auto inline-flex items-center gap-2 rounded-lg border border-emerald-200/20 px-3 py-2.5 text-xs font-bold text-emerald-100 transition hover:bg-emerald-200/[.06] disabled:opacity-50"
            >
              <Check size={14} />{" "}
              {recorded ? "Session recorded" : "Record session"}
            </button>
          </div>
        </section>
        <aside className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-white/[.08] bg-[#131e32] p-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">
                Time remaining
              </p>
              <p className="mt-1 font-display text-5xl font-bold tabular-nums">
                {Math.floor(seconds / 60)}:
                {String(seconds % 60).padStart(2, "0")}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Aim to land the core story in about one minute.
              </p>
            </div>
            <div
              className={`grid h-14 w-14 place-items-center rounded-full border ${running ? "border-emerald-200/30 bg-emerald-200/[.08] text-emerald-100" : "border-white/10 bg-white/[.035] text-slate-500"}`}
            >
              <Mic2 size={22} />
            </div>
          </div>
          <div className="rounded-xl border border-white/[.08] bg-[#131e32] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">
                  How confident did that feel?
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Self-rating for this session
                </p>
              </div>
              <span className="font-display text-xl font-bold text-emerald-200">
                {confidence}/5
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={confidence}
              onChange={(event) => setConfidence(Number(event.target.value))}
              className="mt-5 w-full accent-emerald-300"
              aria-label="Confidence rating"
            />
            <div className="mt-1 flex justify-between text-[10px] text-slate-600">
              <span>Needs another pass</span>
              <span>Ready for the room</span>
            </div>
          </div>
          <div className="rounded-xl border border-white/[.08] bg-[#131e32] p-5">
            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">
              Your rehearsal snapshot
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <p className="font-display text-2xl font-bold">
                  {analysis.score}
                  <span className="ml-1 text-[10px] text-slate-500">/100</span>
                </p>
                <p className="text-[10px] text-slate-500">Draft score</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold">{sessions}</p>
                <p className="text-[10px] text-slate-500">Sessions logged</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function App() {
  const [workspace, setWorkspace] = useState(loadWorkspace);
  const [activeView, setActiveView] = useState("overview");
  const [builderStep, setBuilderStep] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const analysis = useMemo(
    () => scorePitch(workspace.pitch),
    [workspace.pitch],
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    } catch {
      /* Draft stays in memory if storage is unavailable. */
    }
  }, [workspace]);

  function setPitch(update) {
    setWorkspace((current) => ({
      ...current,
      pitch: typeof update === "function" ? update(current.pitch) : update,
    }));
  }
  function recordPractice(score, confidence) {
    setWorkspace((current) => ({
      ...current,
      practiceSessions: current.practiceSessions + 1,
      bestScore: Math.max(current.bestScore, score),
      latestScore: score,
      lastPractice: { date: new Date().toISOString(), confidence },
    }));
  }
  function navigate(view) {
    setActiveView(view);
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar
          activeView={activeView}
          onNavigate={navigate}
          onNewPitch={workspace.pitch}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
        <div className="min-w-0 flex-1">
          <Topbar
            onMenu={() => setMobileOpen(true)}
            activeView={activeView}
            onNavigate={navigate}
          />
          <main className="min-h-[calc(100vh-68px)] pb-8">
            {activeView === "overview" && (
              <Overview
                pitch={workspace.pitch}
                analysis={analysis}
                sessions={workspace.practiceSessions}
                bestScore={workspace.bestScore}
                latestScore={workspace.latestScore}
                onNavigate={navigate}
              />
            )}
            {activeView === "builder" && (
              <Builder
                pitch={workspace.pitch}
                setPitch={setPitch}
                step={builderStep}
                setStep={setBuilderStep}
                analysis={analysis}
                onAnalyze={() => navigate("feedback")}
                onPractice={() => navigate("practice")}
              />
            )}
            {activeView === "feedback" && (
              <Feedback
                analysis={analysis}
                pitch={workspace.pitch}
                onBuilder={() => navigate("builder")}
                onPractice={() => navigate("practice")}
              />
            )}
            {activeView === "practice" && (
              <Practice
                key={workspace.pitch.title}
                pitch={workspace.pitch}
                analysis={analysis}
                sessions={workspace.practiceSessions}
                onRecord={recordPractice}
              />
            )}
          </main>
          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[.06] px-4 py-4 text-[10px] text-slate-600 sm:px-7 lg:px-9">
            <span>Pitch IQ · Build your narrative. Practice the delivery.</span>
            <span>Drafts and practice metrics stay in this browser.</span>
          </footer>
        </div>
      </div>
    </div>
  );
}

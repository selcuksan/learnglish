import {
  AlertTriangle,
  ArrowRight,
  Flame,
  Layers3,
  Target,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

import { SectionHeader } from "../components/SectionHeader";
import { StatCard } from "../components/StatCard";
import { getGoalRatio, getStreak, getTodayProgress } from "../lib/dailyGoals";
import {
  getCompletionRatio,
  getDueWords,
  getMistakeWords,
  getNewWords,
} from "../lib/spacedRepetition";
import { formatDate, percent } from "../lib/utils";
import { useWords } from "../state/WordsProvider";

export function DashboardPage() {
  const {
    deck,
    meta,
    loading,
    error,
    studyProgress,
    sessionHistory,
    appSettings,
  } = useWords();

  if (loading) {
    return (
      <div className="p-6 text-slate-700">
        Loading your vocabulary studio...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-700">
        Could not load the dataset: {error}
      </div>
    );
  }

  const dueCount = getDueWords(deck, studyProgress).length;
  const newCount = getNewWords(deck, studyProgress).length;
  const mistakeWords = getMistakeWords(deck, studyProgress);
  const mistakeCount = mistakeWords.length;
  const completion = getCompletionRatio(deck, studyProgress);
  const todayProgress = getTodayProgress(sessionHistory);
  const reviewGoalRatio = getGoalRatio(
    todayProgress.reviewed,
    appSettings.dailyReviewGoal,
  );
  const newGoalRatio = getGoalRatio(
    todayProgress.newLearned,
    appSettings.dailyNewGoal,
  );
  const latestSession = sessionHistory[0];
  const weeklySessions = sessionHistory.filter((session) => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return new Date(session.completedAt) >= lastWeek;
  }).length;
  const streak = getStreak(sessionHistory);

  let totalReviews = 0;
  let correctReviews = 0;
  const bucketCounts = [0, 0, 0, 0, 0, 0];

  for (const id in studyProgress) {
    const progress = studyProgress[id];
    totalReviews += progress.reviewCount;
    correctReviews += progress.correctCount;
    if (progress.bucket >= 0 && progress.bucket < 6) {
      bucketCounts[progress.bucket]++;
    }
  }

  const accuracy = totalReviews > 0 ? (correctReviews / totalReviews) * 100 : 0;
  const bucketLabels = [
    { label: "Fresh", color: "bg-cyan-500" },
    { label: "Warming up", color: "bg-emerald-400" },
    { label: "Learning", color: "bg-emerald-500" },
    { label: "Settling", color: "bg-amber-400" },
    { label: "Stable", color: "bg-amber-500" },
    { label: "Long-term", color: "bg-orange-500" },
  ];

  return (
    <div className="space-y-6">
      {sessionHistory.length === 0 ? (
        <section className="overflow-hidden rounded-[2rem] bg-linear-to-br from-cyan-600 via-slate-900 to-amber-700 px-6 py-8 text-white shadow-[0_24px_80px_rgba(29,44,76,0.18)] sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">
            Welcome to Learnglish
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Start building your vocabulary today.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/80">
            Your deck has {meta?.totalWords ?? 0} NGSL core words ready to study.
            Begin with a study session to learn new words, then run quizzes to test recall.
            All progress is saved in your browser.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/study"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
            >
              Start your first session
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/60"
            >
              Explore the deck
            </Link>
          </div>
        </section>
      ) : null}

      <section className="glass-panel overflow-hidden rounded-[2rem] border border-white/60 px-6 py-7 shadow-[0_24px_80px_rgba(29,44,76,0.12)] sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-700">
          Daily Focus
        </p>
        <div className="mt-5 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div>
            <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Keep the review queue light and the new words deliberate.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              Today you have {dueCount} due reviews and{" "}
              {Math.min(newCount, appSettings.dailyNewLimit)} new words ready to
              unlock. The current dataset includes {meta?.totalWords ?? 0} NGSL
              entries.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <GoalMeter
                label="Daily reviews"
                value={todayProgress.reviewed}
                goal={appSettings.dailyReviewGoal}
                ratio={reviewGoalRatio}
              />
              <GoalMeter
                label="Daily new words"
                value={todayProgress.newLearned}
                goal={appSettings.dailyNewGoal}
                ratio={newGoalRatio}
              />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/study"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Start study session
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/quiz"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
              >
                Run a quiz
              </Link>
              <Link
                to="/mistakes"
                className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:border-rose-300"
              >
                Review mistakes
              </Link>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-slate-950 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Momentum
            </p>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-white/70">Weekly sessions</p>
                <p className="mt-2 text-3xl font-semibold">{weeklySessions}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-white/70">Latest activity</p>
                <p className="mt-2 text-base font-medium">
                  {latestSession
                    ? formatDate(latestSession.completedAt)
                    : "No sessions recorded yet"}
                </p>
              </div>
              <div className="rounded-2xl bg-linear-to-r from-amber-500/20 to-orange-500/20 p-4">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-amber-400" />
                  <p className="text-sm text-white/70">Streak</p>
                </div>
                <p className="mt-2 text-3xl font-semibold">
                  {streak} <span className="text-base font-medium text-white/60">day{streak !== 1 ? "s" : ""}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          eyebrow="Due now"
          title={String(dueCount)}
          detail="Words waiting for review based on your last grading decisions."
          accent={<Flame className="text-orange-500" />}
        />
        <StatCard
          eyebrow="Coverage"
          title={percent(completion)}
          detail="Share of the deck you have actively touched at least once."
          accent={<Target className="text-cyan-600" />}
        />
        <StatCard
          eyebrow="New pool"
          title={String(newCount)}
          detail="Words still untouched and available for fresh study blocks."
          accent={<Layers3 className="text-amber-600" />}
        />
        <StatCard
          eyebrow="Mistakes"
          title={String(mistakeCount)}
          detail="Words that have failed at least once and deserve a targeted pass."
          accent={<AlertTriangle className="text-rose-500" />}
        />
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel rounded-[1.75rem] border border-white/70 p-5">
          <SectionHeader
            title="Recent sessions"
            detail="A compact view of how often you showed up."
          />
          <div className="space-y-3">
            {sessionHistory.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-600">
                No session history yet. Start with a study run or a quiz to
                build your rhythm.
              </div>
            ) : (
              sessionHistory.slice(0, 6).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold capitalize text-slate-900">
                      {session.kind}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(session.completedAt)}
                    </p>
                  </div>
                  <p className="text-sm text-slate-700">
                    {session.correct}/{session.total}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-panel rounded-[1.75rem] border border-white/70 p-5">
          <SectionHeader
            title="Daily goals"
            detail="Track whether today is doing enough real work."
          />
          <div className="grid gap-3 text-sm text-slate-700">
            <div className="rounded-2xl bg-white/70 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-slate-900">Reviews</span>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">
                  {todayProgress.reviewed}/{appSettings.dailyReviewGoal}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-cyan-500"
                  style={{ width: `${reviewGoalRatio * 100}%` }}
                />
              </div>
            </div>
            <div className="rounded-2xl bg-white/70 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-slate-900">New words</span>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
                  {todayProgress.newLearned}/{appSettings.dailyNewGoal}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${newGoalRatio * 100}%` }}
                />
              </div>
            </div>
            <Link
              to="/settings"
              className="rounded-2xl border border-dashed border-slate-300 px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white/70"
            >
              Adjust goals in Settings
            </Link>
          </div>
        </div>
      </section>

      {totalReviews > 0 ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="glass-panel rounded-[1.75rem] border border-white/70 p-5">
            <SectionHeader
              title="Memory stages"
              detail="Distribution of your active vocabulary across SRS buckets."
            />
            <div className="mt-4 space-y-3">
              {bucketLabels.map((b, i) => {
                const count = bucketCounts[i] ?? 0;
                const totalActive = Object.keys(studyProgress).length || 1;
                const ratio = count / totalActive;
                return (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-24 font-medium text-slate-700">{b.label}</div>
                    <div className="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full ${b.color} transition-all duration-500`}
                        style={{ width: `${Math.max(0, ratio * 100)}%` }}
                      />
                    </div>
                    <div className="w-10 text-right font-semibold text-slate-500">
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-panel flex flex-col justify-center rounded-[1.75rem] border border-white/70 p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Overall Accuracy
            </p>
            <p className="mt-3 text-7xl font-bold tracking-tighter text-slate-900">
              {accuracy.toFixed(1)}%
            </p>
            <p className="mt-4 text-sm font-medium text-slate-600">
              Based on {totalReviews} total reviews across all time
            </p>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function GoalMeter({
  label,
  value,
  goal,
  ratio,
}: {
  label: string;
  value: number;
  goal: number;
  ratio: number;
}) {
  return (
    <div className="rounded-[1.4rem] bg-white/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-900">{label}</span>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {value}/{goal}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slate-950"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

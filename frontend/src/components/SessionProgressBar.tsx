type SessionProgressBarProps = {
  current: number;
  total: number;
};

export function SessionProgressBar({
  current,
  total,
}: SessionProgressBarProps) {
  if (total <= 0) {
    return null;
  }

  const ratio = Math.min(1, current / total);

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70">
      <div
        className="h-full rounded-full bg-linear-to-r from-cyan-500 to-emerald-500 transition-all duration-300 ease-out"
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}

type ExampleSentenceProps = {
  sentence: string;
  className?: string;
};

export function ExampleSentence({
  sentence,
  className = "",
}: ExampleSentenceProps) {
  return (
    <div
      className={`rounded-[1.4rem] border border-white/15 bg-white/10 p-4 text-sm leading-7 ${className}`.trim()}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] opacity-60">
        Example
      </p>
      <p className="mt-2 italic">"{sentence}"</p>
    </div>
  );
}

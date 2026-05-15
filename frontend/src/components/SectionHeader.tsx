export function SectionHeader({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-600">{detail}</p>
      </div>
    </div>
  );
}

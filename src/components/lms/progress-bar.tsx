export default function ProgressBar({
  percent,
  tone = "majorelle",
}: {
  percent: number;
  tone?: "majorelle" | "oasis";
}) {
  const safe = Math.min(Math.max(percent, 0), 100);
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-sable2"
      role="progressbar"
      aria-valuenow={safe}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full ${tone === "oasis" ? "bg-oasis" : "bg-majorelle"}`}
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}

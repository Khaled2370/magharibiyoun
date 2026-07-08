import { getTranslations } from "next-intl/server";
import type { DetailItem } from "@/lib/content";

export default async function SourcesList({
  sources,
}: {
  sources: DetailItem["content"]["sources"];
}) {
  if (sources.length === 0) return null;
  const t = await getTranslations("content");

  return (
    <section className="mt-8 border-t border-ligne pt-5">
      <h2 className="mb-2 text-lg font-medium">{t("sources")}</h2>
      <ol className="list-decimal space-y-1 ps-5 text-sm leading-relaxed text-mutedink">
        {sources.map((s) => (
          <li key={s.sourceId}>
            {s.source.author ? `${s.source.author} — ` : ""}
            {s.source.url ? (
              <a
                href={s.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-majorelle hover:underline"
              >
                {s.source.title}
              </a>
            ) : (
              s.source.title
            )}
            {s.source.publisher ? `، ${s.source.publisher}` : ""}
            {s.source.year ? ` (${s.source.year})` : ""}
          </li>
        ))}
      </ol>
    </section>
  );
}

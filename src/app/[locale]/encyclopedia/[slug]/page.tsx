import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import RelatedList from "@/components/content/related-list";
import { prisma } from "@/lib/prisma";
import {
  fmtDate,
  fmtYear,
  getDetail,
  listJoin,
  paragraphs,
  tLabel,
} from "@/lib/content";

const TYPES: readonly string[] = ["HISTORICAL_ENTRY", "PERSONALITY", "CULTURAL"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const tr = await prisma.contentTranslation.findUnique({
    where: { locale_slug: { locale, slug: decodeURIComponent(slug) } },
    select: { title: true, seoDescription: true, summary: true },
  });
  if (!tr) return {};
  return {
    title: tr.title,
    description: tr.seoDescription ?? tr.summary ?? undefined,
  };
}

export default async function EncyclopediaDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug: raw } = await params;
  setRequestLocale(locale);
  const item = await getDetail(locale, decodeURIComponent(raw));
  if (
    !item ||
    item.status !== "PUBLISHED" ||
    !TYPES.includes(item.content.type)
  ) {
    notFound();
  }
  const t = await getTranslations("content");
  const tn = await getTranslations("nav");
  const c = item.content;
  const countries = listJoin(
    locale,
    c.countries.map((cc) => tLabel(cc.country.labels, locale)),
  );
  const sectionKey =
    c.type === "HISTORICAL_ENTRY"
      ? "sectionHistory"
      : c.type === "PERSONALITY"
        ? "sectionPersonalities"
        : "sectionCulture";
  const works =
    (c.personality?.works as { title: string; year?: number }[] | null) ?? [];
  const quotes =
    (c.personality?.quotes as { text: string; source?: string }[] | null) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <nav className="text-sm text-mutedink">
        <Link href="/encyclopedia" className="hover:text-majorelle">
          {tn("encyclopedia")}
        </Link>
        <span className="mx-2">›</span>
        <span>{t(sectionKey)}</span>
      </nav>

      <h1 className="mt-3 text-3xl font-medium leading-relaxed">{item.title}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {c.historical?.periodCategory ? (
          <span className="rounded-full bg-majorellel px-2.5 py-0.5 text-xs font-medium text-majorelle">
            {tLabel(c.historical.periodCategory.labels, locale)}
          </span>
        ) : null}
        {c.personality?.birthYear ? (
          <span className="rounded-full bg-sable2 px-2.5 py-0.5 text-xs font-medium text-mutedink">
            {fmtYear(locale, c.personality.birthYear)}
            {c.personality.deathYear
              ? ` – ${fmtYear(locale, c.personality.deathYear)}`
              : ""}
          </span>
        ) : null}
        {c.validationLevel === "VERIFIED" || c.validationLevel === "ACADEMIC" ? (
          <span className="rounded-full bg-oasisl px-2.5 py-0.5 text-xs font-medium text-oasis">
            ✓{" "}
            {c.validationLevel === "ACADEMIC"
              ? t("badgeAcademic")
              : t("badgeVerified")}
          </span>
        ) : null}
      </div>

      <dl className="mt-4 space-y-1 border-y border-ligne py-3 text-sm">
        {countries ? (
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-mutedink">{t("countries")}</dt>
            <dd>{countries}</dd>
          </div>
        ) : null}
        {c.historical?.yearStart != null ? (
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-mutedink">{t("period")}</dt>
            <dd>
              {fmtYear(locale, c.historical.yearStart)}
              {c.historical.yearEnd != null &&
              c.historical.yearEnd !== c.historical.yearStart
                ? ` – ${fmtYear(locale, c.historical.yearEnd)}`
                : ""}
            </dd>
          </div>
        ) : null}
      </dl>

      {c.media[0]?.mediaFile ? (
        <figure className="mt-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={c.media[0].mediaFile.url}
            alt={item.title}
            className="max-h-80 w-full rounded-xl border border-ligne bg-sable2 object-cover"
          />
          <figcaption className="mt-1.5 text-xs text-mutedink">
            {tLabel(c.media[0].mediaFile.caption, locale)}
            {c.media[0].mediaFile.credit
              ? ` — ${c.media[0].mediaFile.credit}`
              : ""}
          </figcaption>
        </figure>
      ) : null}

      {item.summary ? (
        <p className="mt-6 text-lg font-medium leading-loose">{item.summary}</p>
      ) : null}

      <div className="mt-4 space-y-4 leading-loose">
        {paragraphs(item.body).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {works.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-2 text-lg font-medium">{t("works")}</h2>
          <ul className="list-disc space-y-1 ps-5 text-sm leading-relaxed">
            {works.map((w, i) => (
              <li key={i}>
                {w.title}
                {w.year ? ` (${w.year})` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {quotes.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-2 text-lg font-medium">{t("quotes")}</h2>
          {quotes.map((q, i) => (
            <blockquote
              key={i}
              className="border-s-4 border-majorelle ps-4 leading-loose"
            >
              «{q.text}»
              {q.source ? (
                <span className="block text-sm text-mutedink">— {q.source}</span>
              ) : null}
            </blockquote>
          ))}
        </section>
      ) : null}

      {c.sources.length > 0 ? (
        <section className="mt-8 border-t border-ligne pt-5">
          <h2 className="mb-2 text-lg font-medium">{t("sources")}</h2>
          <ol className="list-decimal space-y-1 ps-5 text-sm leading-relaxed text-mutedink">
            {c.sources.map((s) => (
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
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-ligne pt-4 text-sm text-mutedink">
        <span>
          {t("lastUpdated")}: {fmtDate(locale, item.updatedAt)}
        </span>
        <Link
          href="/contribute"
          className="rounded-lg border border-majorelle px-4 py-1.5 font-medium text-majorelle transition-colors hover:bg-majorellel"
        >
          {t("suggestCorrection")}
        </Link>
      </div>

      <RelatedList detail={item} locale={locale} />
    </div>
  );
}

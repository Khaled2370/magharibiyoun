import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ExternalLink, Network } from "lucide-react";
import RelatedList from "@/components/content/related-list";
import SourcesList from "@/components/content/sources-list";
import { prisma } from "@/lib/prisma";
import {
  fmtDate,
  getDetail,
  listJoin,
  paragraphs,
  tLabel,
} from "@/lib/content";

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

export default async function InitiativeDetailPage({
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
    item.content.type !== "INITIATIVE"
  ) {
    notFound();
  }
  const t = await getTranslations("content");
  const c = item.content;
  const ini = c.initiative;
  const countries = listJoin(
    locale,
    c.countries.map((cc) => tLabel(cc.country.labels, locale)),
  );
  const domains = listJoin(
    locale,
    c.categories.map((cc) => tLabel(cc.category.labels, locale)),
  );
  const links =
    (ini?.officialLinks as { label: string; url: string }[] | null) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-majorellel">
          <Network className="h-7 w-7 text-majorelle" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-medium leading-relaxed sm:text-3xl">
            {item.title}
          </h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ini?.actorType ? (
              <span className="rounded-full bg-majorellel px-2.5 py-0.5 text-xs font-medium text-majorelle">
                {t(`actor${ini.actorType}`)}
              </span>
            ) : null}
            {ini ? (
              <span className="rounded-full bg-majorellel px-2.5 py-0.5 text-xs font-medium text-majorelle">
                {t(`state${ini.state}`)}
              </span>
            ) : null}
            {ini?.isVerified ? (
              <span className="rounded-full bg-oasisl px-2.5 py-0.5 text-xs font-medium text-oasis">
                ✓ {t("verifiedInitiative")}
              </span>
            ) : null}
            {ini?.lastVerifiedAt ? (
              <span className="rounded-full bg-sable2 px-2.5 py-0.5 text-xs font-medium text-mutedink">
                {t("lastVerified")}: {fmtDate(locale, ini.lastVerifiedAt)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {item.summary ? (
        <p className="mt-6 text-lg font-medium leading-loose">{item.summary}</p>
      ) : null}

      <div className="mt-4 space-y-4 leading-loose">
        {paragraphs(item.body).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <dl className="mt-8 space-y-2 rounded-xl border border-ligne bg-white p-5 text-sm">
        {countries ? (
          <div className="flex gap-3">
            <dt className="w-28 shrink-0 text-mutedink">{t("countries")}</dt>
            <dd>{countries}</dd>
          </div>
        ) : null}
        {ini?.foundedYear ? (
          <div className="flex gap-3">
            <dt className="w-28 shrink-0 text-mutedink">{t("founded")}</dt>
            <dd>{ini.foundedYear}</dd>
          </div>
        ) : null}
        {domains ? (
          <div className="flex gap-3">
            <dt className="w-28 shrink-0 text-mutedink">{t("domains")}</dt>
            <dd>{domains}</dd>
          </div>
        ) : null}
        {ini?.founders ? (
          <div className="flex gap-3">
            <dt className="w-28 shrink-0 text-mutedink">{t("founders")}</dt>
            <dd>{ini.founders}</dd>
          </div>
        ) : null}
      </dl>

      {links.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {links.map((l, i) => (
            <a
              key={i}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-majorelle px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              {l.label}
            </a>
          ))}
        </div>
      ) : null}

      <SourcesList sources={c.sources} />
      <RelatedList detail={item} locale={locale} />
    </div>
  );
}

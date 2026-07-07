import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ExternalLink } from "lucide-react";
import RelatedList from "@/components/content/related-list";
import YoutubeEmbed from "@/components/content/youtube-embed";
import { prisma } from "@/lib/prisma";
import { fmtDate, getDetail, paragraphs } from "@/lib/content";

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

export default async function MediaDetailPage({
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
    item.content.type !== "MEDIA_ITEM" ||
    !item.content.mediaItem
  ) {
    notFound();
  }
  const t = await getTranslations("content");
  const m = item.content.mediaItem;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full bg-majorellel px-2.5 py-0.5 text-xs font-medium text-majorelle">
          {t(`kind${m.kind}`)}
        </span>
        {m.durationMin ? (
          <span className="rounded-full bg-sable2 px-2.5 py-0.5 text-xs font-medium text-mutedink">
            {t("duration", { min: m.durationMin })}
          </span>
        ) : null}
      </div>

      <h1 className="mt-3 text-2xl font-medium leading-relaxed sm:text-3xl">
        {item.title}
      </h1>

      <div className="mt-6">
        <YoutubeEmbed url={m.externalUrl} title={item.title} />
      </div>

      <dl className="mt-5 space-y-1 border-b border-ligne pb-4 text-sm">
        {m.showName ? (
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-mutedink">{t("show")}</dt>
            <dd>{m.showName}</dd>
          </div>
        ) : null}
        {m.host ? (
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-mutedink">{t("host")}</dt>
            <dd>{m.host}</dd>
          </div>
        ) : null}
        {m.guests ? (
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-mutedink">{t("guests")}</dt>
            <dd>{m.guests}</dd>
          </div>
        ) : null}
        {item.publishedAt ? (
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-mutedink">{t("lastUpdated")}</dt>
            <dd>{fmtDate(locale, item.publishedAt)}</dd>
          </div>
        ) : null}
      </dl>

      {item.summary ? (
        <p className="mt-5 text-lg font-medium leading-loose">{item.summary}</p>
      ) : null}

      <div className="mt-3 space-y-4 leading-loose">
        {paragraphs(item.body).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <a
        href={m.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-1.5 rounded-lg border border-majorelle px-4 py-2 text-sm font-medium text-majorelle transition-colors hover:bg-majorellel"
      >
        <ExternalLink className="h-4 w-4" aria-hidden />
        {t("watchYoutube")}
      </a>

      <RelatedList detail={item} locale={locale} />
    </div>
  );
}

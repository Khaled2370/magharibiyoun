import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
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

export default async function OpinionDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug: raw } = await params;
  setRequestLocale(locale);
  const item = await getDetail(locale, decodeURIComponent(raw));
  if (!item || item.status !== "PUBLISHED" || item.content.type !== "ARTICLE") {
    notFound();
  }
  const t = await getTranslations("content");
  const c = item.content;
  const author = c.article?.authorName ?? "";
  const initials = author.trim().charAt(0) || "؟";
  const category = c.categories[0]
    ? tLabel(c.categories[0].category.labels, locale)
    : "";
  const metaParts = [category, fmtDate(locale, item.publishedAt)];
  if (c.article?.readingTimeMin) {
    metaParts.push(t("readingTime", { min: c.article.readingTimeMin }));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-lg border border-terracotta/40 bg-terracottal px-4 py-2.5 text-sm leading-relaxed text-terracotta">
        <b className="font-medium">{t("opinionChip")}</b> — {t("opinionBanner")}
      </div>

      <h1 className="mt-6 text-3xl font-medium leading-relaxed">{item.title}</h1>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-majorellel text-sm font-medium text-majorelle">
          {initials}
        </div>
        <div>
          <div className="text-sm font-medium">{author}</div>
          <div className="text-xs text-mutedink">
            {listJoin(locale, metaParts.filter(Boolean))}
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

      <SourcesList sources={c.sources} />
      <RelatedList detail={item} locale={locale} />
    </div>
  );
}

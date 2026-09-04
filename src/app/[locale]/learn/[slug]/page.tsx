import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Download, Map } from "lucide-react";
import RelatedList from "@/components/content/related-list";
import SourcesList from "@/components/content/sources-list";
import QuizPlayer, { type QuizQuestionData } from "@/components/learn/quiz-player";
import { prisma } from "@/lib/prisma";
import {
  contentHref,
  fmtDate,
  getDetail,
  paragraphs,
  tLabel,
} from "@/lib/content";
import { Link } from "@/i18n/navigation";

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

export default async function LearnDetailPage({
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
    (item.content.type !== "EDUCATIONAL" && item.content.type !== "LEARNING_PATH")
  ) {
    notFound();
  }
  const t = await getTranslations("content");
  const tl = await getTranslations("learn");
  const c = item.content;

  if (c.type === "LEARNING_PATH") {
    const steps = c.pathSteps.filter((s) => s.target);
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-majorellel">
            <Map className="h-7 w-7 text-majorelle" aria-hidden />
          </div>
          <div>
            <span className="rounded-full bg-oasisl px-2.5 py-0.5 text-xs font-medium text-oasis">
              {t("learningPathLabel")}
            </span>
            <h1 className="mt-2 text-2xl font-medium leading-relaxed sm:text-3xl">
              {item.title}
            </h1>
          </div>
        </div>
        {item.summary ? (
          <p className="mt-5 text-lg font-medium leading-loose">{item.summary}</p>
        ) : null}
        <div className="mt-4 space-y-4 leading-loose">
          {paragraphs(item.body).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <h2 className="mb-3 mt-8 text-lg font-medium">
          {tl("pathStepsTitle")} — {t("pathStepCount", { count: steps.length })}
        </h2>
        <ol className="space-y-2">
          {steps.map((s, i) => {
            const target = s.target!;
            const tr =
              target.translations.find(
                (x) => x.locale === locale && x.status === "PUBLISHED",
              ) ??
              target.translations.find(
                (x) => x.locale === "ar" && x.status === "PUBLISHED",
              );
            if (!tr) return null;
            const label = s.titleOverride
              ? tLabel(s.titleOverride, locale)
              : tr.title;
            return (
              <li key={s.id}>
                <Link
                  href={{
                    pathname: contentHref(target.type),
                    params: { slug: tr.slug },
                  }}
                  className="flex items-center gap-3 rounded-xl border border-ligne bg-white p-4 transition-colors hover:border-majorelle"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-majorellel text-sm font-medium text-majorelle">
                    {i + 1}
                  </span>
                  <span className="font-medium">{label}</span>
                </Link>
              </li>
            );
          })}
        </ol>

        <SourcesList sources={c.sources} />
        <RelatedList detail={item} locale={locale} />
      </div>
    );
  }

  const edu = c.educational;
  const sourceTr = edu?.sourceContent?.translations.find(
    (x) => x.locale === locale && x.status === "PUBLISHED",
  );
  const quizQuestions: QuizQuestionData[] = (c.quiz?.questions ?? []).map((q) => ({
    id: q.id,
    prompt: tLabel(q.prompt, locale),
    choices: (q.choices as string[]) ?? [],
    correctIndex: q.correctIndex,
    explanation: q.explanation ? tLabel(q.explanation, locale) : null,
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex flex-wrap gap-1.5">
        {edu?.format ? (
          <span className="rounded-full bg-majorellel px-2.5 py-0.5 text-xs font-medium text-majorelle">
            {t(`format${edu.format}`)}
          </span>
        ) : null}
        {edu?.ageRange ? (
          <span className="rounded-full bg-sable2 px-2.5 py-0.5 text-xs font-medium text-mutedink">
            {t(`age${edu.ageRange}`)}
          </span>
        ) : null}
        {edu?.difficulty ? (
          <span className="rounded-full bg-sable2 px-2.5 py-0.5 text-xs font-medium text-mutedink">
            {t(`difficulty${edu.difficulty}`)}
          </span>
        ) : null}
      </div>

      <h1 className="mt-3 text-2xl font-medium leading-relaxed sm:text-3xl">
        {item.title}
      </h1>

      {c.media[0]?.mediaFile ? (
        <figure className="mt-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={c.media[0].mediaFile.url}
            alt={item.title}
            className="max-h-80 w-full rounded-xl border border-ligne bg-sable2 object-cover"
          />
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

      {edu?.format === "QUIZ" && quizQuestions.length > 0 ? (
        <div className="mt-6">
          <QuizPlayer questions={quizQuestions} />
        </div>
      ) : null}

      {edu?.downloadable ? (
        <p className="mt-6 flex items-center gap-2 rounded-lg bg-oasisl px-4 py-2.5 text-sm text-oasis">
          <Download className="h-4 w-4 shrink-0" aria-hidden />
          {t("downloadableNotice")}
        </p>
      ) : null}

      {sourceTr ? (
        <Link
          href={{
            pathname: contentHref(edu!.sourceContent!.type),
            params: { slug: sourceTr.slug },
          }}
          className="mt-6 inline-block rounded-lg border border-majorelle px-4 py-2 text-sm font-medium text-majorelle transition-colors hover:bg-majorellel"
        >
          {t("fullEntry")} ←
        </Link>
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-ligne pt-4 text-sm text-mutedink">
        <span>
          {t("lastUpdated")}: {fmtDate(locale, item.updatedAt)}
        </span>
      </div>

      <SourcesList sources={c.sources} />
      <RelatedList detail={item} locale={locale} />
    </div>
  );
}

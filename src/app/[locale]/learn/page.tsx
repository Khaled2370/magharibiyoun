import { getTranslations, setRequestLocale } from "next-intl/server";
import type { AgeRange, EduFormat } from "@prisma/client";
import { GraduationCap, Map } from "lucide-react";
import ContentCard from "@/components/content/content-card";
import { listInclude, type ListItem } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";

const AGE_RANGES = ["KIDS", "TEENS", "ADULTS", "TEACHERS", "FAMILIES"] as const;
const EDU_FORMATS = [
  "SHEET",
  "QUIZ",
  "DOSSIER",
  "VIDEO",
  "TIMELINE",
  "MAP",
  "GLOSSARY",
] as const;

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ age?: string; format?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations("learn");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("content");
  const tl = await getTranslations("lms");

  // Bandeau en haut : reprendre son programme si l'élève en suit un,
  // sinon inviter à découvrir le catalogue.
  const session = await auth();
  const userId = session?.user?.id;
  const [activeEnrollment, programCount] = await Promise.all([
    userId
      ? prisma.enrollment.findFirst({
          where: { userId, status: { not: "DROPPED" }, program: { status: "ACTIVE" } },
          include: { program: { select: { title: true } } },
          orderBy: { enrolledAt: "desc" },
        })
      : Promise.resolve(null),
    prisma.program.count({ where: { status: "ACTIVE" } }),
  ]);

  const ageFilter = AGE_RANGES.includes(sp.age as (typeof AGE_RANGES)[number])
    ? (sp.age as AgeRange)
    : undefined;
  const formatFilter = EDU_FORMATS.includes(
    sp.format as (typeof EDU_FORMATS)[number],
  )
    ? (sp.format as EduFormat)
    : undefined;

  const [items, path] = await Promise.all([
    prisma.contentTranslation.findMany({
      where: {
        locale,
        status: "PUBLISHED",
        content: {
          type: "EDUCATIONAL",
          educational: {
            ...(ageFilter ? { ageRange: ageFilter } : {}),
            ...(formatFilter ? { format: formatFilter } : {}),
          },
        },
      },
      include: listInclude,
      orderBy: { publishedAt: "desc" },
      take: 60,
    }) as Promise<ListItem[]>,
    prisma.contentTranslation.findFirst({
      where: { locale, status: "PUBLISHED", content: { type: "LEARNING_PATH" } },
      select: { slug: true, title: true, summary: true },
      orderBy: { publishedAt: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-medium">{tn("learn")}</h1>
      <p className="mt-2 max-w-2xl leading-relaxed text-mutedink">
        {t("pageIntro")}
      </p>

      {activeEnrollment ? (
        <Link
          href="/learn/dashboard"
          className="mt-6 flex items-center gap-4 rounded-xl border border-oasis bg-oasisl p-5 transition-opacity hover:opacity-90"
        >
          <GraduationCap className="h-8 w-8 shrink-0 text-oasis" aria-hidden />
          <div>
            <div className="text-xs font-medium text-oasis">
              {tl("continueLearning")}
            </div>
            <div className="mt-1 font-medium text-encre">
              {activeEnrollment.program.title}
            </div>
            <p className="mt-1 text-sm text-mutedink">{tl("dashboardTitle")}</p>
          </div>
        </Link>
      ) : programCount > 0 ? (
        <Link
          href="/learn/programs"
          className="mt-6 flex items-center gap-4 rounded-xl border border-oasis bg-oasisl p-5 transition-opacity hover:opacity-90"
        >
          <GraduationCap className="h-8 w-8 shrink-0 text-oasis" aria-hidden />
          <div>
            <div className="text-xs font-medium text-oasis">{tl("catalogTitle")}</div>
            <div className="mt-1 font-medium text-encre">{tl("catalogCta")}</div>
            <p className="mt-1 text-sm text-mutedink">{tl("catalogIntro")}</p>
          </div>
        </Link>
      ) : null}

      {path ? (
        <Link
          href={{ pathname: "/learn/[slug]", params: { slug: path.slug } }}
          className="mt-6 flex items-center gap-4 rounded-xl border border-majorelle bg-majorellel p-5 transition-opacity hover:opacity-90"
        >
          <Map className="h-8 w-8 shrink-0 text-majorelle" aria-hidden />
          <div>
            <div className="text-xs font-medium text-majorelle">
              {t("discoverPath")}
            </div>
            <div className="mt-1 font-medium text-encre">{path.title}</div>
            <p className="mt-1 text-sm text-mutedink">{t("discoverPathText")}</p>
          </div>
        </Link>
      ) : null}

      <h2 className="mt-10 text-xl font-medium">{t("libraryTitle")}</h2>
      <p className="mt-1 text-sm text-mutedink">{t("libraryIntro")}</p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="me-1 text-xs font-medium text-mutedink">
            {t("filterAge")}:
          </span>
          <Link
            href="/learn"
            className={`rounded-full px-3 py-1 text-xs font-medium ${!ageFilter ? "bg-encre text-sable" : "border border-ligne bg-white text-mutedink hover:border-majorelle"}`}
          >
            {t("allAges")}
          </Link>
          {AGE_RANGES.map((a) => (
            <Link
              key={a}
              href={{
                pathname: "/learn",
                query: formatFilter ? { age: a, format: formatFilter } : { age: a },
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium ${ageFilter === a ? "bg-encre text-sable" : "border border-ligne bg-white text-mutedink hover:border-majorelle"}`}
            >
              {tc(`age${a}`)}
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="me-1 text-xs font-medium text-mutedink">
          {t("filterFormat")}:
        </span>
        <Link
          href={{ pathname: "/learn", query: ageFilter ? { age: ageFilter } : {} }}
          className={`rounded-full px-3 py-1 text-xs font-medium ${!formatFilter ? "bg-encre text-sable" : "border border-ligne bg-white text-mutedink hover:border-majorelle"}`}
        >
          {t("allFormats")}
        </Link>
        {EDU_FORMATS.map((f) => (
          <Link
            key={f}
            href={{
              pathname: "/learn",
              query: ageFilter ? { format: f, age: ageFilter } : { format: f },
            }}
            className={`rounded-full px-3 py-1 text-xs font-medium ${formatFilter === f ? "bg-encre text-sable" : "border border-ligne bg-white text-mutedink hover:border-majorelle"}`}
          >
            {tc(`format${f}`)}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-mutedink">{t("empty")}</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ContentCard key={item.id} item={item} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

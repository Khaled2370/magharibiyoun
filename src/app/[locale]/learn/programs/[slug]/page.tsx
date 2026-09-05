import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  RotateCcw,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  completedSessionIds,
  computeProgress,
  flattenSessions,
  fmtSessionDate,
  isVisibleToStudents,
  programStructureInclude,
} from "@/lib/lms";
import { enrollInProgram } from "@/actions/lms-student";
import SessionRow from "@/components/lms/session-row";
import ProgressBar from "@/components/lms/progress-bar";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = await prisma.program.findUnique({
    where: { slug: decodeURIComponent(slug) },
    select: { title: true, description: true },
  });
  if (!program) return {};
  return { title: program.title, description: program.description ?? undefined };
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("lms");

  const program = await prisma.program.findUnique({
    where: { slug: decodeURIComponent(slug) },
    include: { ...programStructureInclude, coverMedia: true },
  });
  if (!program || program.status === "DRAFT") notFound();

  const session = await auth();
  const userId = session?.user?.id;
  const [enrollment, completed] = await Promise.all([
    userId
      ? prisma.enrollment.findUnique({
          where: { userId_programId: { userId, programId: program.id } },
        })
      : Promise.resolve(null),
    userId ? completedSessionIds(userId) : Promise.resolve(new Set<number>()),
  ]);
  const isEnrolled = Boolean(enrollment && enrollment.status !== "DROPPED");

  const all = flattenSessions(program);
  const visible = all.filter(({ session: s }) => isVisibleToStudents(s.status));
  const progress = computeProgress(
    all.map(({ session: s }) => s),
    completed,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {program.coverMedia?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={program.coverMedia.url}
          alt=""
          className="mb-6 max-h-64 w-full rounded-xl border border-ligne bg-sable2 object-cover"
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-sable2 px-2.5 py-0.5 text-xs text-mutedink">
          {t("weeksCount", { n: program.weeks.length })}
        </span>
        <span className="rounded-full bg-sable2 px-2.5 py-0.5 text-xs text-mutedink">
          {t("sessionsCount", { n: visible.length })}
        </span>
      </div>

      <h1 className="mt-3 text-2xl font-medium leading-relaxed sm:text-3xl">
        {program.title}
      </h1>
      {program.description ? (
        <p className="mt-4 text-lg leading-loose">{program.description}</p>
      ) : null}

      {isEnrolled ? (
        <div className="mt-6 rounded-xl border border-oasis bg-oasisl p-5">
          <p className="flex items-center gap-2 font-medium text-oasis">
            <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />
            {t("enrolledAlready")}
          </p>
          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between text-xs text-oasis">
              <span>
                {t("sessionsDone", { done: progress.done, total: progress.total })}
              </span>
              <span dir="ltr">{progress.percent}%</span>
            </div>
            <ProgressBar percent={progress.percent} tone="oasis" />
          </div>
          <Link
            href="/learn/dashboard"
            className="mt-4 inline-block rounded-lg bg-oasis px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {t("continueLearning")}
          </Link>
        </div>
      ) : program.status === "ACTIVE" ? (
        <div className="mt-6 rounded-xl border border-majorelle bg-majorellel p-5">
          {userId ? (
            <form action={enrollInProgram}>
              <input type="hidden" name="programId" value={program.id} />
              <input type="hidden" name="uiLocale" value={locale} />
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-majorelle px-5 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
              >
                <GraduationCap className="h-5 w-5" aria-hidden />
                {t("enroll")}
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="inline-block rounded-lg bg-majorelle px-5 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
            >
              {t("loginToEnroll")}
            </Link>
          )}
        </div>
      ) : null}

      <h2 className="mb-3 mt-10 text-lg font-medium">{t("programOverview")}</h2>
      {program.weeks.length === 0 ? (
        <p className="text-mutedink">{t("catalogEmpty")}</p>
      ) : (
        <div className="space-y-6">
          {program.weeks.map((week) => {
            const sessions = week.sessions.filter((s) => isVisibleToStudents(s.status));
            return (
              <section key={week.id}>
                <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-medium">
                    {week.title ?? t("weekLabel", { n: week.weekNumber })}
                  </h3>
                  <span className="text-xs text-mutedink">
                    {t(`weekKind${week.kind}`)}
                  </span>
                  {week.opensAt ? (
                    <span className="flex items-center gap-1 text-xs text-mutedink">
                      <CalendarDays className="h-3 w-3" aria-hidden />
                      {t("weekOpensOn", { date: fmtSessionDate(locale, week.opensAt) })}
                    </span>
                  ) : null}
                </div>
                {sessions.length === 0 && week.kind === "LEARNING" ? (
                  <p className="text-sm text-mutedink">{t("weekEmpty")}</p>
                ) : (
                  <div className="space-y-2">
                    {sessions.map((s) => (
                      <SessionRow
                        key={s.id}
                        session={s}
                        week={week}
                        completed={completed.has(s.id)}
                        locale={locale}
                      />
                    ))}
                  </div>
                )}

                {/* Les semaines de révision et d'examen ont leur propre page :
                    elles ne se résument pas à une liste de séances. Réservées
                    aux inscrits, comme le reste du parcours. */}
                {isEnrolled && week.kind === "REVIEW" ? (
                  <Link
                    href={{
                      pathname: "/learn/review/[weekId]",
                      params: { weekId: String(week.id) },
                    }}
                    className="mt-2 inline-flex items-center gap-2 rounded-lg border border-majorelle px-4 py-2 text-sm font-medium text-majorelle transition-colors hover:bg-majorellel"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden />
                    {t("openReviewWeek")}
                  </Link>
                ) : null}
                {isEnrolled && week.kind === "EXAM" && week.exam && week.exam.status !== "DRAFT" ? (
                  <Link
                    href={{
                      pathname: "/learn/exam/[weekId]",
                      params: { weekId: String(week.id) },
                    }}
                    className="mt-2 inline-flex items-center gap-2 rounded-lg border border-majorelle px-4 py-2 text-sm font-medium text-majorelle transition-colors hover:bg-majorellel"
                  >
                    <ClipboardCheck className="h-4 w-4" aria-hidden />
                    {t("startExam")}
                  </Link>
                ) : null}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

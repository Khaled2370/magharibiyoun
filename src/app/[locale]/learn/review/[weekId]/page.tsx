import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { completedSessionIds, flattenSessions, programStructureInclude } from "@/lib/lms";
import SessionRow from "@/components/lms/session-row";
import ProgressBar from "@/components/lms/progress-bar";
import { Link } from "@/i18n/navigation";

/**
 * Semaine de révision : elle ne contient rien en propre au départ.
 *
 * Elle rassemble automatiquement les séances des semaines précédentes, en
 * séparant ce qui reste à faire de ce qui est déjà terminé — c'est là tout son
 * intérêt. L'administrateur peut malgré tout y ajouter ses propres séances
 * (synthèse, fiche récapitulative) : elles s'affichent en tête.
 */
export default async function ReviewWeekPage({
  params,
}: {
  params: Promise<{ locale: string; weekId: string }>;
}) {
  const { locale, weekId } = await params;
  setRequestLocale(locale);
  const auth = await requireUser(locale);
  const t = await getTranslations("lms");

  const userId = auth.user.id;
  const wid = Number(weekId);
  if (!Number.isInteger(wid)) notFound();

  const week = await prisma.programWeek.findUnique({
    where: { id: wid },
    include: { sessions: { orderBy: { orderInWeek: "asc" } } },
  });
  if (!week) notFound();

  const [program, enrolled, completed] = await Promise.all([
    prisma.program.findUnique({
      where: { id: week.programId },
      include: programStructureInclude,
    }),
    prisma.enrollment.findUnique({
      where: { userId_programId: { userId, programId: week.programId } },
      select: { id: true },
    }),
    completedSessionIds(userId),
  ]);
  if (!program || !enrolled) notFound();

  // Uniquement les semaines qui précèdent celle-ci, et jamais les brouillons.
  const earlier = flattenSessions(program).filter(
    (x) => x.week.weekNumber < week.weekNumber && x.session.status !== "DRAFT",
  );
  const todo = earlier.filter((x) => !completed.has(x.session.id));
  const done = earlier.filter((x) => completed.has(x.session.id));
  const percent =
    earlier.length === 0 ? 100 : Math.round((done.length / earlier.length) * 100);

  const own = week.sessions.filter((s) => s.status !== "DRAFT");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs text-mutedink">{program.title}</p>
      <h1 className="mb-2 mt-1 flex items-center gap-2 text-2xl font-medium sm:text-3xl">
        <RotateCcw className="h-6 w-6 text-majorelle" aria-hidden />
        {week.title ?? t("reviewWeekTitle")}
      </h1>
      <p className="mb-6 text-sm text-mutedink">{t("reviewWeekIntro")}</p>

      <div className="mb-8 rounded-xl border border-ligne bg-white p-5">
        <div className="mb-3 flex items-center justify-between gap-4">
          <span className="text-sm text-mutedink">{t("reviewWeekPrevious")}</span>
          <span className="text-xl font-medium text-majorelle" dir="ltr">
            {done.length} / {earlier.length}
          </span>
        </div>
        <ProgressBar percent={percent} />
      </div>

      {own.length > 0 ? (
        <section className="mb-8">
          <h2 className="mb-3 font-medium">{t("reviewWeekOwn")}</h2>
          <div className="space-y-2">
            {own.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                week={week}
                completed={completed.has(session.id)}
                locale={locale}
              />
            ))}
          </div>
        </section>
      ) : null}

      {todo.length > 0 ? (
        <section className="mb-8">
          <h2 className="mb-3 font-medium">{t("reviewWeekTodo")}</h2>
          <div className="space-y-2">
            {todo.map(({ session, week: w }) => (
              <SessionRow
                key={session.id}
                session={session}
                week={w}
                completed={false}
                locale={locale}
                showWeek
              />
            ))}
          </div>
        </section>
      ) : (
        <p className="mb-8 flex items-center gap-2 rounded-xl border border-oasis bg-oasisl p-4 text-sm text-oasis">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
          {t("reviewWeekAllDone")}
        </p>
      )}

      {done.length > 0 ? (
        <section>
          <h2 className="mb-3 font-medium">{t("reviewWeekDone")}</h2>
          <div className="space-y-2">
            {done.map(({ session, week: w }) => (
              <SessionRow
                key={session.id}
                session={session}
                week={w}
                completed
                locale={locale}
                showWeek
              />
            ))}
          </div>
        </section>
      ) : null}

      <Link
        href={{ pathname: "/learn/programs/[slug]", params: { slug: program.slug } }}
        className="mt-8 inline-block text-sm text-mutedink hover:text-majorelle"
      >
        {t("backToProgram")}
      </Link>
    </div>
  );
}

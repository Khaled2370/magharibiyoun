import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AlertTriangle, GraduationCap, Users } from "lucide-react";
import { requireEditor } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { computeProgress, fmtSessionDate, programStructureInclude } from "@/lib/lms";
import ProgressBar from "@/components/lms/progress-bar";
import BackLink from "@/components/admin/safe-link";
import { getPathname } from "@/i18n/navigation";

/** Au-delà de ce silence, on considère l'élève en décrochage. */
const STALLED_AFTER_DAYS = 14;

export default async function AdminStudentsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireEditor(locale);
  const t = await getTranslations("lms");

  const programId = Number(id);
  if (!Number.isInteger(programId)) notFound();

  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: programStructureInclude,
  });
  if (!program) notFound();

  const sessions = program.weeks.flatMap((w) => w.sessions);
  const sessionIds = sessions.map((s) => s.id);

  const [enrollments, progress, attempts] = await Promise.all([
    prisma.enrollment.findMany({
      where: { programId },
      include: { user: { select: { id: true, displayName: true, email: true } } },
      orderBy: { enrolledAt: "asc" },
    }),
    // Toute la progression du programme en une requête, plutôt qu'une par
    // élève : la page reste rapide même avec plusieurs centaines d'inscrits.
    sessionIds.length > 0
      ? prisma.sessionProgress.findMany({ where: { sessionId: { in: sessionIds } } })
      : Promise.resolve([]),
    prisma.examAttempt.findMany({
      where: { exam: { week: { programId } }, submittedAt: { not: null } },
      orderBy: { score: "desc" },
    }),
  ]);

  const doneByUser = new Map<string, Set<number>>();
  const lastByUser = new Map<string, Date>();
  const doneBySession = new Map<number, number>();
  for (const p of progress) {
    if (!doneByUser.has(p.userId)) doneByUser.set(p.userId, new Set());
    doneByUser.get(p.userId)!.add(p.sessionId);
    const previous = lastByUser.get(p.userId);
    if (!previous || p.completedAt > previous) lastByUser.set(p.userId, p.completedAt);
    doneBySession.set(p.sessionId, (doneBySession.get(p.sessionId) ?? 0) + 1);
  }

  // Meilleure note par élève : les tentatives sont déjà triées par score.
  const bestScore = new Map<string, number>();
  for (const a of attempts) {
    if (a.score !== null && !bestScore.has(a.userId)) bestScore.set(a.userId, a.score);
  }

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 3600_000;
  const stalledBefore = now - STALLED_AFTER_DAYS * 24 * 3600_000;

  const rows = enrollments.map((e) => {
    const done = doneByUser.get(e.userId) ?? new Set<number>();
    const last = lastByUser.get(e.userId) ?? null;
    const stats = computeProgress(sessions, done);
    return {
      userId: e.userId,
      name: e.user.displayName || e.user.email,
      stats,
      last,
      active: last !== null && last.getTime() >= weekAgo,
      // Un élève qui vient de s'inscrire n'est pas « en décrochage ».
      stalled:
        stats.percent < 100 &&
        e.enrolledAt.getTime() < stalledBefore &&
        (last === null || last.getTime() < stalledBefore),
      score: bestScore.get(e.userId) ?? null,
    };
  });

  const finished = rows.filter((r) => r.stats.percent === 100).length;
  const avg =
    rows.length === 0
      ? 0
      : Math.round(rows.reduce((sum, r) => sum + r.stats.percent, 0) / rows.length);

  const popular = [...doneBySession.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([sid, count]) => ({
      title: sessions.find((s) => s.id === sid)?.title ?? String(sid),
      count,
    }));

  const cardClass = "rounded-xl border border-ligne bg-white p-4";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <BackLink
        href={getPathname({
          locale,
          href: { pathname: "/admin/programs/[id]", params: { id: String(programId) } },
        })}
        label={t("adminBackToProgram")}
        confirmText={t("unsavedLeaveConfirm")}
      />
      <p className="text-xs text-mutedink">{program.title}</p>
      <h1 className="mb-2 mt-1 flex items-center gap-2 text-2xl font-medium sm:text-3xl">
        <Users className="h-6 w-6 text-majorelle" aria-hidden />
        {t("adminStudentsTitle")}
      </h1>
      <p className="mb-6 text-sm text-mutedink">{t("adminStudentsIntro")}</p>

      {/* Les cinq chiffres qui disent l'état de la promotion */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: t("adminStatEnrolled"), value: rows.length },
          { label: t("adminStatActive"), value: rows.filter((r) => r.active).length },
          { label: t("adminStatStalled"), value: rows.filter((r) => r.stalled).length },
          { label: t("adminStatFinished"), value: finished },
          { label: t("adminStatAvgProgress"), value: `${avg}%` },
        ].map((s) => (
          <div key={s.label} className={cardClass}>
            <div className="text-2xl font-medium text-majorelle" dir="ltr">
              {s.value}
            </div>
            <div className="mt-0.5 text-xs leading-snug text-mutedink">{s.label}</div>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-ligne bg-white p-8 text-center text-mutedink">
          {t("adminNoStudents")}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-ligne bg-white">
            <table className="w-full min-w-[34rem] text-sm">
              <thead className="border-b border-ligne text-xs text-mutedink">
                <tr>
                  <th className="p-3 text-start font-medium">{t("adminColStudent")}</th>
                  <th className="p-3 text-start font-medium">{t("adminColProgress")}</th>
                  <th className="p-3 text-start font-medium">{t("adminColLastActivity")}</th>
                  <th className="p-3 text-start font-medium">{t("adminColExam")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.userId} className="border-b border-ligne last:border-0">
                    <td className="p-3">
                      <span className="flex flex-wrap items-center gap-1.5">
                        {r.name}
                        {r.stalled ? (
                          <span
                            title={t("adminStalledHint")}
                            className="flex items-center gap-1 rounded-full bg-terracottal px-2 py-0.5 text-[11px] font-medium text-terracotta"
                          >
                            <AlertTriangle className="h-3 w-3" aria-hidden />
                            {t("adminStatStalled")}
                          </span>
                        ) : null}
                        {r.stats.percent === 100 ? (
                          <GraduationCap
                            className="h-4 w-4 text-oasis"
                            aria-label={t("adminStatFinished")}
                          />
                        ) : null}
                      </span>
                    </td>
                    <td className="w-40 p-3">
                      <ProgressBar percent={r.stats.percent} />
                      <span className="mt-1 block text-xs text-mutedink" dir="ltr">
                        {r.stats.done} / {r.stats.total}
                      </span>
                    </td>
                    <td className="p-3 text-mutedink">
                      {r.last ? fmtSessionDate(locale, r.last) : t("adminNever")}
                    </td>
                    <td className="p-3 text-mutedink" dir="ltr">
                      {r.score === null ? t("adminExamNotTaken") : `${r.score}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <section className="mt-6">
            <h2 className="mb-3 font-medium">{t("adminSessionsPopular")}</h2>
            {popular.length === 0 ? (
              <p className={`${cardClass} text-sm text-mutedink`}>{t("adminNoActivity")}</p>
            ) : (
              <ul className={`${cardClass} space-y-2 text-sm`}>
                {popular.map((p) => (
                  <li key={p.title} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate">{p.title}</span>
                    <span className="shrink-0 text-mutedink" dir="ltr">
                      {p.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

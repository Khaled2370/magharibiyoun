import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  User,
} from "lucide-react";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import {
  completedSessionIds,
  computeProgress,
  effectiveUnlockAt,
  flattenSessions,
  fmtSessionDate,
  fmtSessionDateTime,
  isSessionOpen,
  lockReason,
  neighbourSessions,
  programStructureInclude,
  sessionDetailInclude,
} from "@/lib/lms";
import { markSessionComplete, unmarkSessionComplete } from "@/actions/lms-student";
import ContentBlockRenderer from "@/components/lms/content-block-renderer";
import NotePanel from "@/components/lms/note-panel";
import ProgressBar from "@/components/lms/progress-bar";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = await prisma.programSession.findUnique({
    where: { slug: decodeURIComponent(slug) },
    select: { title: true, description: true },
  });
  if (!s) return {};
  return { title: s.title, description: s.description ?? undefined };
}

export default async function SessionPlayerPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const auth = await requireUser(locale);
  const t = await getTranslations("lms");
  const userId = auth.user.id!;

  const session = await prisma.programSession.findUnique({
    where: { slug: decodeURIComponent(slug) },
    include: sessionDetailInclude,
  });
  if (!session || session.status === "DRAFT") notFound();

  const program = await prisma.program.findUnique({
    where: { id: session.week.programId },
    include: programStructureInclude,
  });
  if (!program) notFound();

  const [enrollment, completed] = await Promise.all([
    prisma.enrollment.findUnique({
      where: { userId_programId: { userId, programId: program.id } },
      select: { status: true },
    }),
    completedSessionIds(userId),
  ]);
  const isEnrolled = Boolean(enrollment && enrollment.status !== "DROPPED");

  const header = (
    <div className="mb-6">
      <p className="text-xs text-mutedink">
        <Link
          href={{ pathname: "/learn/programs/[slug]", params: { slug: program.slug } }}
          className="hover:text-majorelle"
        >
          {program.title}
        </Link>
        {" — "}
        {session.week.title ?? t("weekLabel", { n: session.week.weekNumber })}
      </p>
      <h1 className="mt-2 text-2xl font-medium leading-relaxed sm:text-3xl">
        {session.title}
      </h1>
    </div>
  );

  // Non inscrit : on ne montre jamais le contenu, juste le chemin pour s'inscrire.
  if (!isEnrolled) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        {header}
        <div className="rounded-xl border border-ligne bg-white p-8 text-center">
          <p className="text-mutedink">{t("sessionNotEnrolled")}</p>
          <Link
            href={{ pathname: "/learn/programs/[slug]", params: { slug: program.slug } }}
            className="mt-4 inline-block rounded-lg bg-majorelle px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {t("enroll")}
          </Link>
        </div>
      </div>
    );
  }

  // Verrou serveur : indispensable, l'adresse peut être tapée ou partagée.
  const reason = lockReason(session, session.week);
  if (reason !== "open") {
    const unlockAt = effectiveUnlockAt(session, session.week);
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        {header}
        <div className="rounded-xl border border-ligne bg-sable2 p-8 text-center">
          <Lock className="mx-auto h-8 w-8 text-mutedink" aria-hidden />
          <p className="mt-3 font-medium text-mutedink">
            {reason === "locked" || !unlockAt
              ? t("sessionLockedManual")
              : t("sessionLocked", { date: fmtSessionDateTime(locale, unlockAt) })}
          </p>
          <Link
            href="/learn/dashboard"
            className="mt-4 inline-block text-sm font-medium text-majorelle hover:underline"
          >
            {t("navDashboard")}
          </Link>
        </div>
      </div>
    );
  }

  const isDone = completed.has(session.id);
  const progress = computeProgress(
    flattenSessions(program).map(({ session: s }) => s),
    completed,
  );
  const { prev, next } = neighbourSessions(program, session.id);
  const note = await prisma.personalNote.findFirst({
    where: { userId, sessionId: session.id },
    orderBy: { updatedAt: "desc" },
  });

  const mainBlocks = session.blocks.filter((b) => !b.isSupplementary);
  const extraBlocks = session.blocks.filter((b) => b.isSupplementary);

  const navLink =
    "flex items-center gap-1.5 rounded-lg border border-ligne bg-white px-4 py-2 text-sm font-medium text-mutedink transition-colors hover:border-majorelle hover:text-majorelle";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {header}

      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-mutedink">
        {session.instructor ? (
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" aria-hidden />
            {session.instructor}
          </span>
        ) : null}
        {session.durationMin ? (
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" aria-hidden />
            {t("durationMin", { n: session.durationMin })}
          </span>
        ) : null}
        {isDone ? (
          <span className="flex items-center gap-1.5 rounded-full bg-oasisl px-2.5 py-0.5 text-xs font-medium text-oasis">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            {t("completedBadge")}
          </span>
        ) : null}
      </div>

      <div className="mb-8">
        <div className="mb-1.5 flex items-center justify-between text-xs text-mutedink">
          <span>{t("progressLabel")}</span>
          <span dir="ltr">
            {progress.done} / {progress.total}
          </span>
        </div>
        <ProgressBar percent={progress.percent} />
      </div>

      {session.description ? (
        <p className="mb-8 text-lg leading-loose">{session.description}</p>
      ) : null}

      <div className="space-y-8">
        {mainBlocks.map((block) => (
          <ContentBlockRenderer key={block.id} block={block} />
        ))}
      </div>

      {extraBlocks.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-medium">{t("supplementary")}</h2>
          <div className="space-y-3">
            {extraBlocks.map((block) => (
              <ContentBlockRenderer key={block.id} block={block} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Validation de la séance */}
      <div className="mt-10 rounded-xl border border-ligne bg-white p-5 text-center">
        {isDone ? (
          <>
            <p className="flex items-center justify-center gap-2 font-medium text-oasis">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
              {t("completedBadge")}
            </p>
            <form action={unmarkSessionComplete} className="mt-2">
              <input type="hidden" name="sessionId" value={session.id} />
              <input type="hidden" name="uiLocale" value={locale} />
              <button
                type="submit"
                className="text-xs text-mutedink underline transition-colors hover:text-terracotta"
              >
                {t("markIncomplete")}
              </button>
            </form>
          </>
        ) : (
          <form action={markSessionComplete}>
            <input type="hidden" name="sessionId" value={session.id} />
            <input type="hidden" name="uiLocale" value={locale} />
            <button
              type="submit"
              className="w-full rounded-lg bg-oasis px-6 py-3 font-medium text-white transition-opacity hover:opacity-90 sm:w-auto"
            >
              {t("markComplete")}
            </button>
          </form>
        )}
      </div>

      {/* Notes personnelles */}
      <div className="mt-6">
        <NotePanel
          sessionId={session.id}
          uiLocale={locale}
          noteId={note?.id ?? null}
          initialBody={note?.body ?? ""}
          labels={{
            title: t("notesPanelTitle"),
            placeholder: t("notesPlaceholder"),
            save: t("notesSave"),
            saving: t("notesSaving"),
            hint: t("notesIntro"),
          }}
        />
      </div>

      {/* Navigation entre séances */}
      <nav className="mt-8 flex items-center justify-between gap-3 border-t border-ligne pt-5">
        {prev ? (
          <Link
            href={{ pathname: "/learn/session/[slug]", params: { slug: prev.slug } }}
            className={navLink}
          >
            <ChevronRight className="h-4 w-4 rtl:hidden" aria-hidden />
            <ChevronLeft className="hidden h-4 w-4 rtl:block" aria-hidden />
            {t("prevSession")}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={{ pathname: "/learn/session/[slug]", params: { slug: next.slug } }}
            className={navLink}
          >
            {t("nextSession")}
            <ChevronLeft className="h-4 w-4 rtl:hidden" aria-hidden />
            <ChevronRight className="hidden h-4 w-4 rtl:block" aria-hidden />
          </Link>
        ) : (
          <span />
        )}
      </nav>

      {session.publishAt ? (
        <p className="mt-4 text-center text-xs text-mutedink">
          {fmtSessionDate(locale, session.publishAt)}
        </p>
      ) : null}
    </div>
  );
}

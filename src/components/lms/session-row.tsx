import { getTranslations } from "next-intl/server";
import { CheckCircle2, Clock, Lock, PlayCircle } from "lucide-react";
import type { ProgramSession, ProgramWeek } from "@prisma/client";
import { effectiveUnlockAt, fmtSessionDateTime, lockReason } from "@/lib/lms";
import { Link } from "@/i18n/navigation";

/** Une séance dans une liste : ouverte (cliquable) ou verrouillée (motif affiché). */
export default async function SessionRow({
  session,
  week,
  completed,
  locale,
  showWeek = false,
}: {
  session: ProgramSession;
  week: ProgramWeek;
  completed: boolean;
  locale: string;
  showWeek?: boolean;
}) {
  const t = await getTranslations("lms");
  const reason = lockReason(session, week);
  if (reason === "draft") return null;
  // Une séance déjà terminée reste ouverte quoi qu'il arrive à sa date : on ne
  // reprend pas à l'élève un contenu qu'il a déjà travaillé.
  const open = reason === "open" || completed;

  const meta = (
    <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-mutedink">
      {showWeek ? <span>{t("weekLabel", { n: week.weekNumber })}</span> : null}
      {session.instructor ? <span>{session.instructor}</span> : null}
      {session.durationMin ? (
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" aria-hidden />
          {t("durationMin", { n: session.durationMin })}
        </span>
      ) : null}
    </span>
  );

  if (!open) {
    const unlockAt = effectiveUnlockAt(session, week);
    return (
      <div className="flex items-start gap-3 rounded-xl border border-ligne bg-sable2 p-4">
        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-mutedink" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-mutedink">{session.title}</span>
          <span className="mt-0.5 block text-xs text-mutedink">
            {reason === "locked" || !unlockAt
              ? t("sessionLockedManual")
              : t("sessionLocked", { date: fmtSessionDateTime(locale, unlockAt) })}
          </span>
        </span>
      </div>
    );
  }

  return (
    <Link
      href={{ pathname: "/learn/session/[slug]", params: { slug: session.slug } }}
      className="flex items-start gap-3 rounded-xl border border-ligne bg-white p-4 transition-colors hover:border-majorelle"
    >
      {completed ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-oasis" aria-hidden />
      ) : (
        <PlayCircle className="mt-0.5 h-5 w-5 shrink-0 text-majorelle" aria-hidden />
      )}
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{session.title}</span>
        {meta}
      </span>
      {completed ? (
        <span className="shrink-0 rounded-full bg-oasisl px-2.5 py-0.5 text-xs font-medium text-oasis">
          {t("legendDone")}
        </span>
      ) : null}
    </Link>
  );
}

import { getTranslations } from "next-intl/server";
import { GraduationCap } from "lucide-react";
import type { MediaFile, Program } from "@prisma/client";
import type { ProgressStats } from "@/lib/lms";
import { Link } from "@/i18n/navigation";
import ProgressBar from "./progress-bar";

type Props = {
  program: Program & { coverMedia?: MediaFile | null };
  weeksCount: number;
  sessionsCount: number;
  progress?: ProgressStats;
  state?: "upcoming" | "inProgress" | "completed";
  href?: { pathname: "/learn/programs/[slug]"; params: { slug: string } };
};

export default async function ProgramCard({
  program,
  weeksCount,
  sessionsCount,
  progress,
  state,
  href,
}: Props) {
  const t = await getTranslations("lms");
  const target = href ?? {
    pathname: "/learn/programs/[slug]" as const,
    params: { slug: program.slug },
  };

  const stateTone =
    state === "completed"
      ? "bg-oasisl text-oasis"
      : state === "upcoming"
        ? "bg-sable2 text-mutedink"
        : "bg-majorellel text-majorelle";

  return (
    <Link
      href={target}
      className="flex flex-col overflow-hidden rounded-xl border border-ligne bg-white transition-colors hover:border-majorelle"
    >
      {program.coverMedia?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={program.coverMedia.url}
          alt=""
          className="h-36 w-full bg-sable2 object-cover"
        />
      ) : (
        <div className="flex h-36 w-full items-center justify-center bg-sable2">
          <GraduationCap className="h-10 w-10 text-ligne" aria-hidden />
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {state ? (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${stateTone}`}>
              {t(
                state === "completed"
                  ? "stateCompleted"
                  : state === "upcoming"
                    ? "stateUpcoming"
                    : "stateInProgress",
              )}
            </span>
          ) : null}
          <span className="rounded-full bg-sable2 px-2.5 py-0.5 text-xs text-mutedink">
            {t("weeksCount", { n: weeksCount })}
          </span>
          <span className="rounded-full bg-sable2 px-2.5 py-0.5 text-xs text-mutedink">
            {t("sessionsCount", { n: sessionsCount })}
          </span>
        </div>

        <h3 className="mt-2 font-medium leading-relaxed">{program.title}</h3>
        {program.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-mutedink">{program.description}</p>
        ) : null}

        {progress ? (
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs text-mutedink">
              <span>{t("sessionsDone", { done: progress.done, total: progress.total })}</span>
              <span dir="ltr">{progress.percent}%</span>
            </div>
            <ProgressBar
              percent={progress.percent}
              tone={state === "completed" ? "oasis" : "majorelle"}
            />
            <span className="mt-3 inline-block text-sm font-medium text-majorelle">
              {t("continueLearning")} ←
            </span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}

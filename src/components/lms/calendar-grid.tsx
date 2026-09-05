import { getTranslations } from "next-intl/server";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarCell } from "@/lib/lms";
import { LMS_TIME_ZONE } from "@/lib/lms";
import { Link } from "@/i18n/navigation";

type Pathname = "/learn/calendar" | "/learn/dashboard" | "/admin/calendar";

const STATUS_CLASS: Record<CalendarCell["status"], string> = {
  none: "text-mutedink",
  locked: "bg-sable2 text-mutedink",
  available: "bg-majorellel font-medium text-majorelle",
  missed: "bg-terracottal font-medium text-terracotta",
  done: "bg-oasisl font-medium text-oasis",
};

/** Noms courts des jours, semaine commençant le lundi. */
function weekdayNames(locale: string): string[] {
  const fmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-TN" : locale, {
    weekday: "short",
    timeZone: "UTC",
  });
  // 2024-01-01 est un lundi.
  return Array.from({ length: 7 }, (_, i) =>
    fmt.format(new Date(Date.UTC(2024, 0, 1 + i))),
  );
}

export default async function CalendarGrid({
  cells,
  locale,
  year,
  month,
  pathname,
  dayPathname,
  selectedDay,
  compact = false,
}: {
  cells: CalendarCell[];
  locale: string;
  year: number;
  month: number;
  pathname: Pathname;
  /**
   * Page vers laquelle mène le clic sur un jour. Sur le tableau de bord, le
   * mini-calendrier renvoie vers le calendrier complet : la page d'accueil
   * n'affiche pas le détail d'un jour, et cliquer y semblait sans effet.
   */
  dayPathname?: Pathname;
  selectedDay?: string;
  compact?: boolean;
}) {
  const dayTarget = dayPathname ?? pathname;
  const t = await getTranslations("lms");
  const monthLabel = new Intl.DateTimeFormat(locale === "ar" ? "ar-TN" : locale, {
    month: "long",
    year: "numeric",
    timeZone: LMS_TIME_ZONE,
  }).format(new Date(Date.UTC(year, month - 1, 15)));

  const prev = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };
  const navBtn =
    "flex h-8 w-8 items-center justify-center rounded-lg border border-ligne text-mutedink transition-colors hover:border-majorelle hover:text-majorelle";

  return (
    <div className="rounded-xl border border-ligne bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Link
          href={{ pathname, query: { year: String(prev.y), month: String(prev.m) } }}
          aria-label={t("prevMonth")}
          className={navBtn}
        >
          {/* En RTL, « mois précédent » se lit vers la droite. */}
          <ChevronRight className="h-4 w-4 rtl:hidden" aria-hidden />
          <ChevronLeft className="hidden h-4 w-4 rtl:block" aria-hidden />
        </Link>
        <span className="text-sm font-medium">{monthLabel}</span>
        <Link
          href={{ pathname, query: { year: String(next.y), month: String(next.m) } }}
          aria-label={t("nextMonth")}
          className={navBtn}
        >
          <ChevronLeft className="h-4 w-4 rtl:hidden" aria-hidden />
          <ChevronRight className="hidden h-4 w-4 rtl:block" aria-hidden />
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdayNames(locale).map((d) => (
          <div key={d} className="pb-1 text-[11px] text-mutedink">
            {d}
          </div>
        ))}

        {cells.map((cell) => {
          const hasSessions = cell.sessions.length > 0;
          const base = `relative flex h-full min-h-9 items-center justify-center rounded-lg text-sm ${
            cell.inMonth ? "" : "opacity-35"
          } ${STATUS_CLASS[cell.status]} ${
            cell.isToday ? "ring-2 ring-encre ring-offset-1" : ""
          } ${selectedDay === cell.key ? "outline outline-2 outline-majorelle" : ""}`;
          const dayNumber = Number(cell.key.slice(-2));

          if (!hasSessions) {
            return (
              <div key={cell.key} className={base} dir="ltr">
                {dayNumber}
              </div>
            );
          }
          return (
            <Link
              key={cell.key}
              href={{
                pathname: dayTarget,
                query: { year: String(year), month: String(month), day: cell.key },
              }}
              className={`${base} transition-opacity hover:opacity-80`}
              dir="ltr"
            >
              {dayNumber}
              {cell.sessions.length > 1 ? (
                <span className="absolute bottom-0.5 text-[9px]">
                  ••
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      {compact ? null : (
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-ligne pt-3 text-xs text-mutedink">
          <span className="flex items-center gap-1.5">
            <i className="h-3 w-3 rounded bg-majorellel" /> {t("legendAvailable")}
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-3 w-3 rounded bg-oasisl" /> {t("legendDone")}
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-3 w-3 rounded bg-terracottal" /> {t("legendMissed")}
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-3 w-3 rounded bg-sable2" /> {t("legendLocked")}
          </span>
        </div>
      )}
    </div>
  );
}

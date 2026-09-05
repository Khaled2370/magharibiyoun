import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireUser } from "@/lib/authz";
import {
  buildCalendar,
  completedSessionIds,
  dateFromDayKey,
  fmtSessionDate,
  getEnrolledPrograms,
  pickActiveProgram,
  todayKey,
} from "@/lib/lms";
import StudentNav from "@/components/lms/student-nav";
import CalendarGrid from "@/components/lms/calendar-grid";
import SessionRow from "@/components/lms/session-row";
import { Link } from "@/i18n/navigation";

export default async function LearnCalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ year?: string; month?: string; day?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const auth = await requireUser(locale);
  const t = await getTranslations("lms");
  const sp = await searchParams;

  const userId = auth.user.id;
  const [enrolled, completed] = await Promise.all([
    getEnrolledPrograms(userId),
    completedSessionIds(userId),
  ]);
  const active = pickActiveProgram(enrolled);

  if (!active) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-medium">{t("calendarTitle")}</h1>
        <StudentNav active="calendar" />
        <div className="rounded-xl border border-ligne bg-white p-8 text-center">
          <p className="text-mutedink">{t("calendarNoProgram")}</p>
          <Link
            href="/learn/programs"
            className="mt-4 inline-block rounded-lg bg-majorelle px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {t("catalogCta")}
          </Link>
        </div>
      </div>
    );
  }

  const today = todayKey();
  const year = Number(sp.year) || Number(today.slice(0, 4));
  const month = Number(sp.month) || Number(today.slice(5, 7));
  const cells = buildCalendar(active.program, year, month, completed);

  const selectedKey = sp.day ?? today;
  const selectedCell = cells.find((c) => c.key === selectedKey);
  // Le jour sélectionné peut être hors du mois affiché (on arrive sur le
  // calendrier « aujourd'hui », puis on feuillette). Sans ce repli, le titre
  // affichait la date brute « 2026-09-05 » au lieu d'une date en toutes lettres.
  const selectedDate = selectedCell?.date ?? dateFromDayKey(selectedKey);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-medium">{t("calendarTitle")}</h1>
      <StudentNav active="calendar" />

      <p className="mb-4 text-sm text-mutedink">{active.program.title}</p>

      <CalendarGrid
        cells={cells}
        locale={locale}
        year={year}
        month={month}
        pathname="/learn/calendar"
        selectedDay={selectedKey}
      />

      <section className="mt-6">
        <h2 className="mb-3 font-medium">
          {t("daySessions", {
            date: selectedDate
              ? fmtSessionDate(locale, selectedDate)
              : selectedKey,
          })}
        </h2>
        {!selectedCell || selectedCell.sessions.length === 0 ? (
          <p className="rounded-xl border border-ligne bg-white p-4 text-sm text-mutedink">
            {t("dayEmpty")}
          </p>
        ) : (
          <div className="space-y-2">
            {selectedCell.sessions.map(({ session, week }) => (
              <SessionRow
                key={session.id}
                session={session}
                week={week}
                completed={completed.has(session.id)}
                locale={locale}
                showWeek
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

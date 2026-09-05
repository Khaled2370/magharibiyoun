import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarDays, Megaphone, PlayCircle } from "lucide-react";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import {
  buildCalendar,
  completedSessionIds,
  dayKey,
  findContinueSession,
  flattenSessions,
  getEnrolledPrograms,
  isSessionOpen,
  pickActiveProgram,
  todayKey,
} from "@/lib/lms";
import StudentNav from "@/components/lms/student-nav";
import ProgressBar from "@/components/lms/progress-bar";
import SessionRow from "@/components/lms/session-row";
import CalendarGrid from "@/components/lms/calendar-grid";
import AnnouncementList from "@/components/lms/announcement-list";
import { Link } from "@/i18n/navigation";

export default async function LearnDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
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
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-medium">{t("dashboardTitle")}</h1>
        <StudentNav active="dashboard" />
        <div className="rounded-xl border border-ligne bg-white p-8 text-center">
          <p className="font-medium">{t("notEnrolledTitle")}</p>
          <p className="mt-1 text-sm text-mutedink">{t("notEnrolledText")}</p>
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

  const now = new Date();
  const today = todayKey(now);
  const all = flattenSessions(active.program);

  const todaySessions = all.filter(
    ({ session }) =>
      session.status !== "DRAFT" &&
      session.publishAt &&
      dayKey(session.publishAt) === today,
  );
  const continueItem = findContinueSession(active.program, completed, now);

  // Séance mise en avant : celle du jour si elle est ouverte, sinon la reprise.
  const todayOpen = todaySessions.find(({ session, week }) =>
    isSessionOpen(session, week, now),
  );
  const hero = todayOpen ?? continueItem;
  const heroIsToday = Boolean(todayOpen);
  const heroCompleted = hero ? completed.has(hero.session.id) : false;

  const year = Number(sp.year) || Number(today.slice(0, 4));
  const month = Number(sp.month) || Number(today.slice(5, 7));
  const cells = buildCalendar(active.program, year, month, completed, now);

  // Annonces déjà publiées seulement : une annonce datée du futur reste
  // invisible, exactement comme une séance programmée.
  const announcements = await prisma.announcement.findMany({
    where: { programId: active.program.id, publishAt: { lte: now } },
    orderBy: [{ isPinned: "desc" }, { publishAt: "desc" }],
    take: 5,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-medium">{t("dashboardTitle")}</h1>
      <StudentNav active="dashboard" />

      {/* En-tête : où j'en suis */}
      <section className="rounded-xl border border-ligne bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-medium leading-relaxed">
              {active.program.title}
            </h2>
            {active.currentWeek ? (
              <p className="mt-1 text-sm text-mutedink">
                {t("weekLabel", { n: active.currentWeek })}
              </p>
            ) : null}
          </div>
          <div className="text-end">
            <div className="text-2xl font-medium text-majorelle" dir="ltr">
              {active.progress.percent}%
            </div>
            <div className="text-xs text-mutedink">
              {t("sessionsDone", {
                done: active.progress.done,
                total: active.progress.total,
              })}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <ProgressBar percent={active.progress.percent} />
        </div>

        {hero ? (
          <Link
            href={{
              pathname: "/learn/session/[slug]",
              params: { slug: hero.session.slug },
            }}
            className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-majorelle px-5 py-3 font-medium text-white transition-opacity hover:opacity-90"
          >
            <PlayCircle className="h-5 w-5 shrink-0" aria-hidden />
            {heroIsToday
              ? heroCompleted
                ? t("resumeTodayLesson")
                : t("startTodayLesson")
              : t("continueLearning")}
          </Link>
        ) : null}
      </section>

      {/* الإعلانات — juste sous l'en-tête : c'est ce qui doit être lu en premier */}
      {announcements.length > 0 ? (
        <section className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 font-medium">
            <Megaphone className="h-4 w-4 text-majorelle" aria-hidden />
            {t("announcementsTitle")}
          </h2>
          <AnnouncementList announcements={announcements} locale={locale} />
        </section>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* جدول اليوم */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-medium">
            <CalendarDays className="h-4 w-4 text-majorelle" aria-hidden />
            {t("todaySchedule")}
          </h2>
          {todaySessions.length === 0 ? (
            <p className="rounded-xl border border-ligne bg-white p-4 text-sm text-mutedink">
              {t("todayEmpty")}
            </p>
          ) : (
            <div className="space-y-2">
              {todaySessions.map(({ session, week }) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  week={week}
                  completed={completed.has(session.id)}
                  locale={locale}
                />
              ))}
            </div>
          )}
        </section>

        {/* تابع المشاهدة */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-medium">
            <PlayCircle className="h-4 w-4 text-majorelle" aria-hidden />
            {t("continueWatching")}
          </h2>
          {continueItem ? (
            <SessionRow
              session={continueItem.session}
              week={continueItem.week}
              completed={false}
              locale={locale}
              showWeek
            />
          ) : (
            <p className="rounded-xl border border-ligne bg-white p-4 text-sm text-mutedink">
              {t("continueWatchingEmpty")}
            </p>
          )}
        </section>
      </div>

      {/* التقويم */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-medium">
            <CalendarDays className="h-4 w-4 text-majorelle" aria-hidden />
            {t("navCalendar")}
          </h2>
          <Link
            href="/learn/calendar"
            className="text-sm font-medium text-majorelle hover:underline"
          >
            {t("seeFullCalendar")}
          </Link>
        </div>
        <CalendarGrid
          cells={cells}
          locale={locale}
          year={year}
          month={month}
          pathname="/learn/dashboard"
          dayPathname="/learn/calendar"
          compact
        />
      </section>
    </div>
  );
}

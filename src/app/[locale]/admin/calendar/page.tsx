import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { requireEditor } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { dayKey, fmtSessionDate, fmtSessionDateTime, todayKey } from "@/lib/lms";
import { Link } from "@/i18n/navigation";

export default async function AdminCalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireEditor(locale);
  const t = await getTranslations("lms");
  const sp = await searchParams;

  const today = todayKey();
  const year = Number(sp.year) || Number(today.slice(0, 4));
  const month = Number(sp.month) || Number(today.slice(5, 7));

  // Fenêtre large d'un jour de chaque côté : le mois est calculé à l'heure du
  // Maghreb (UTC+1), le filtre SQL en UTC — on regroupe ensuite précisément.
  const from = new Date(Date.UTC(year, month - 1, 1, -2));
  const to = new Date(Date.UTC(year, month, 1, 2));

  const sessions = await prisma.programSession.findMany({
    where: { publishAt: { gte: from, lt: to } },
    include: { week: { include: { program: { select: { id: true, title: true } } } } },
    orderBy: { publishAt: "asc" },
  });

  const byDay = new Map<string, typeof sessions>();
  for (const s of sessions) {
    if (!s.publishAt) continue;
    const key = dayKey(s.publishAt);
    if (!key.startsWith(`${year}-${String(month).padStart(2, "0")}`)) continue;
    const list = byDay.get(key) ?? [];
    list.push(s);
    byDay.set(key, list);
  }
  const days = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b));

  const prev = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };
  const monthLabel = new Intl.DateTimeFormat(locale === "ar" ? "ar-TN" : locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 15)));
  const navBtn =
    "flex h-9 w-9 items-center justify-center rounded-lg border border-ligne text-mutedink transition-colors hover:border-majorelle hover:text-majorelle";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-medium">{t("adminCalendarTitle")}</h1>

      <div className="mb-6 flex items-center justify-between gap-2">
        <Link
          href={{
            pathname: "/admin/calendar",
            query: { year: String(prev.y), month: String(prev.m) },
          }}
          aria-label={t("prevMonth")}
          className={navBtn}
        >
          <ChevronRight className="h-4 w-4 rtl:hidden" aria-hidden />
          <ChevronLeft className="hidden h-4 w-4 rtl:block" aria-hidden />
        </Link>
        <span className="font-medium">{monthLabel}</span>
        <Link
          href={{
            pathname: "/admin/calendar",
            query: { year: String(next.y), month: String(next.m) },
          }}
          aria-label={t("nextMonth")}
          className={navBtn}
        >
          <ChevronLeft className="h-4 w-4 rtl:hidden" aria-hidden />
          <ChevronRight className="hidden h-4 w-4 rtl:block" aria-hidden />
        </Link>
      </div>

      {days.length === 0 ? (
        <p className="rounded-xl border border-ligne bg-white p-8 text-center text-mutedink">
          {t("adminCalendarEmpty")}
        </p>
      ) : (
        <div className="space-y-6">
          {days.map(([key, list]) => (
            <section key={key}>
              <h2
                className={`mb-2 flex items-center gap-2 text-sm font-medium ${
                  key === today ? "text-majorelle" : "text-mutedink"
                }`}
              >
                <CalendarDays className="h-4 w-4" aria-hidden />
                {fmtSessionDate(locale, list[0].publishAt!)}
                {key === today ? ` — ${t("today")}` : ""}
              </h2>
              <div className="space-y-2">
                {list.map((s) => (
                  <Link
                    key={s.id}
                    href={{
                      pathname: "/admin/programs/[id]/sessions/[sessionId]",
                      params: {
                        id: String(s.week.program.id),
                        sessionId: String(s.id),
                      },
                    }}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ligne bg-white p-4 transition-colors hover:border-majorelle"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{s.title}</span>
                      <span className="mt-0.5 block text-xs text-mutedink">
                        {s.week.program.title} —{" "}
                        {t("weekLabel", { n: s.week.weekNumber })} —{" "}
                        {fmtSessionDateTime(locale, s.publishAt)}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        s.status === "PUBLISHED"
                          ? "bg-oasisl text-oasis"
                          : s.status === "SCHEDULED"
                            ? "bg-majorellel text-majorelle"
                            : s.status === "LOCKED"
                              ? "bg-terracottal text-terracotta"
                              : "bg-sable2 text-mutedink"
                      }`}
                    >
                      {t(`adminSessionStatus${s.status}`)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <Link
        href="/admin/programs"
        className="mt-8 inline-block text-sm text-mutedink hover:text-majorelle"
      >
        {t("adminBackToPrograms")}
      </Link>
    </div>
  );
}

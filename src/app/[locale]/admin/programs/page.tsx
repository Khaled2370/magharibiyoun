import { getTranslations, setRequestLocale } from "next-intl/server";
import { GraduationCap, Plus } from "lucide-react";
import { requireEditor } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { fmtSessionDate } from "@/lib/lms";
import { Link } from "@/i18n/navigation";

export default async function AdminProgramsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ deleted?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireEditor(locale);
  const t = await getTranslations("lms");
  const ta = await getTranslations("admin");
  const sp = await searchParams;

  const programs = await prisma.program.findMany({
    include: {
      _count: { select: { enrollments: true } },
      weeks: { select: { _count: { select: { sessions: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-medium">{t("adminPrograms")}</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/calendar"
            className="rounded-lg border border-ligne px-4 py-2 text-sm font-medium text-mutedink transition-colors hover:border-majorelle hover:text-majorelle"
          >
            {t("adminCalendarTitle")}
          </Link>
          <Link
            href="/admin/programs/new"
            className="flex items-center gap-1.5 rounded-lg bg-majorelle px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" aria-hidden />
            {t("adminNewProgram")}
          </Link>
        </div>
      </div>

      {sp.deleted ? (
        <p className="mb-4 rounded-lg bg-oasisl px-4 py-2.5 text-sm text-oasis">
          {ta("deleted")}
        </p>
      ) : null}

      {programs.length === 0 ? (
        <p className="rounded-xl border border-ligne bg-white p-8 text-center text-mutedink">
          {t("adminNoPrograms")}
        </p>
      ) : (
        <div className="space-y-2">
          {programs.map((p) => (
            <Link
              key={p.id}
              href={{ pathname: "/admin/programs/[id]", params: { id: String(p.id) } }}
              className="flex items-start gap-3 rounded-xl border border-ligne bg-white p-4 transition-colors hover:border-majorelle"
            >
              <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-majorelle" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{p.title}</span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-mutedink">
                  <span>{t("weeksCount", { n: p.weeks.length })}</span>
                  <span>
                    {t("sessionsCount", {
                      n: p.weeks.reduce((n, w) => n + w._count.sessions, 0),
                    })}
                  </span>
                  <span>{t("adminEnrolledCount", { n: p._count.enrollments })}</span>
                  <span>{fmtSessionDate(locale, p.updatedAt)}</span>
                </span>
              </span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  p.status === "ACTIVE"
                    ? "bg-oasisl text-oasis"
                    : p.status === "ARCHIVED"
                      ? "bg-sable2 text-mutedink"
                      : "bg-majorellel text-majorelle"
                }`}
              >
                {t(`adminStatus${p.status}`)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { getEnrolledPrograms, isVisibleToStudents } from "@/lib/lms";
import StudentNav from "@/components/lms/student-nav";
import ProgramCard from "@/components/lms/program-card";
import { Link } from "@/i18n/navigation";

export default async function MyProgramsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const auth = await requireUser(locale);
  const t = await getTranslations("lms");

  const enrolled = await getEnrolledPrograms(auth.user.id);
  const covers = await prisma.mediaFile.findMany({
    where: {
      id: {
        in: enrolled
          .map((e) => e.program.coverMediaId)
          .filter((id): id is number => id !== null),
      },
    },
  });
  const coverById = new Map(covers.map((c) => [c.id, c]));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-medium">{t("myProgramsTitle")}</h1>
      <StudentNav active="programs" />

      {enrolled.length === 0 ? (
        <div className="rounded-xl border border-ligne bg-white p-8 text-center">
          <p className="text-mutedink">{t("myProgramsEmpty")}</p>
          <Link
            href="/learn/programs"
            className="mt-4 inline-block rounded-lg bg-majorelle px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {t("catalogCta")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrolled.map((e) => (
            <ProgramCard
              key={e.program.id}
              program={{
                ...e.program,
                coverMedia: e.program.coverMediaId
                  ? (coverById.get(e.program.coverMediaId) ?? null)
                  : null,
              }}
              weeksCount={e.program.weeks.length}
              sessionsCount={e.program.weeks.reduce(
                (n, w) => n + w.sessions.filter((s) => isVisibleToStudents(s.status)).length,
                0,
              )}
              progress={e.progress}
              state={e.state}
            />
          ))}
        </div>
      )}
    </div>
  );
}

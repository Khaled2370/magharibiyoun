import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { programStructureInclude } from "@/lib/lms";
import ProgramCard from "@/components/lms/program-card";

export default async function ProgramCatalogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("lms");

  const programs = await prisma.program.findMany({
    where: { status: "ACTIVE" },
    include: { ...programStructureInclude, coverMedia: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-medium">{t("catalogTitle")}</h1>
      <p className="mt-2 max-w-2xl leading-relaxed text-mutedink">{t("catalogIntro")}</p>

      {programs.length === 0 ? (
        <p className="mt-10 text-mutedink">{t("catalogEmpty")}</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <ProgramCard
              key={p.id}
              program={p}
              weeksCount={p.weeks.length}
              sessionsCount={p.weeks.reduce(
                (n, w) => n + w.sessions.filter((s) => s.status !== "DRAFT").length,
                0,
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

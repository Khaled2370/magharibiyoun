import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { fmtDate } from "@/lib/content";
import ContributionForm from "@/components/contribute/contribution-form";

export default async function ContributePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ submitted?: string; error?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const session = await auth();
  const t = await getTranslations("contribute");
  const ta = await getTranslations("auth");

  const myContributions = session?.user
    ? await prisma.contribution.findMany({
        where: { userId: session.user.id },
        include: {
          content: {
            include: {
              translations: { select: { locale: true, title: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    : [];

  const statusTone: Record<string, string> = {
    SUBMITTED: "bg-sable2 text-mutedink",
    IN_REVIEW: "bg-terracottal text-terracotta",
    ACCEPTED: "bg-oasisl text-oasis",
    PUBLISHED: "bg-oasisl text-oasis",
    REJECTED: "bg-terracottal text-terracotta",
    CHANGES_REQUESTED: "bg-terracottal text-terracotta",
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-medium">{t("pageTitle")}</h1>
      <p className="mt-2 leading-relaxed text-mutedink">{t("pageIntro")}</p>

      {sp.submitted ? (
        <p className="mt-4 rounded-lg bg-oasisl px-4 py-2.5 text-sm text-oasis">
          {t("submittedNotice")}
        </p>
      ) : null}
      {sp.error === "empty" ? (
        <p className="mt-4 rounded-lg bg-terracottal px-4 py-2.5 text-sm text-terracotta">
          {t("errorEmpty")}
        </p>
      ) : null}

      {session?.user ? (
        <div className="mt-6">
          <ContributionForm uiLocale={locale} defaultContentLocale={locale} />
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-ligne bg-white p-6 text-center">
          <p className="text-sm text-mutedink">{t("loginRequired")}</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-lg bg-majorelle px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {ta("loginButton")}
          </Link>
        </div>
      )}

      {myContributions.length > 0 ? (
        <div className="mt-10">
          <h2 className="mb-3 text-lg font-medium">{t("myContributions")}</h2>
          <div className="space-y-2">
            {myContributions.map((c) => {
              const title =
                c.content?.translations.find((t) => t.locale === locale)
                  ?.title ??
                c.content?.translations[0]?.title ??
                `#${c.id}`;
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-ligne bg-white px-4 py-2.5"
                >
                  <span className="text-sm font-medium">{title}</span>
                  <div className="flex items-center gap-2 text-xs text-mutedink">
                    <span>{fmtDate(locale, c.createdAt)}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-medium ${statusTone[c.status] ?? "bg-sable2 text-mutedink"}`}
                    >
                      {t(`status${c.status}`)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

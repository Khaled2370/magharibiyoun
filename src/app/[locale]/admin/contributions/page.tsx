import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireEditor } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { fmtDate } from "@/lib/content";
import { Link } from "@/i18n/navigation";
import RejectContributionButton from "@/components/admin/reject-contribution-button";

export default async function AdminContributionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ rejected?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireEditor(locale);
  const sp = await searchParams;
  const t = await getTranslations("admin");

  const contributions = await prisma.contribution.findMany({
    where: { status: { in: ["SUBMITTED", "IN_REVIEW"] } },
    include: {
      user: { select: { displayName: true, email: true } },
      content: {
        include: { translations: { select: { locale: true, title: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-medium">{t("contributionsTitle")}</h1>
        <Link
          href="/admin"
          className="text-sm font-medium text-mutedink hover:text-encre"
        >
          {t("backToList")}
        </Link>
      </div>

      {sp.rejected ? (
        <p className="mt-4 rounded-lg bg-sable2 px-4 py-2.5 text-sm text-mutedink">
          {t("contributionRejected")}
        </p>
      ) : null}

      {contributions.length === 0 ? (
        <p className="mt-8 text-mutedink">{t("noContributions")}</p>
      ) : (
        <div className="mt-5 space-y-3">
          {contributions.map((c) => {
            const title =
              c.content?.translations[0]?.title ?? `#${c.contentId}`;
            return (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ligne bg-white p-4"
              >
                <div>
                  <div className="font-medium">{title}</div>
                  <div className="mt-1 text-xs text-mutedink">
                    {c.user.displayName} ({c.user.email}) —{" "}
                    {fmtDate(locale, c.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.contentId ? (
                    <Link
                      href={{
                        pathname: "/admin/edit/[id]",
                        params: { id: String(c.contentId) },
                      }}
                      className="rounded-lg border border-majorelle px-3 py-1.5 text-xs font-medium text-majorelle transition-colors hover:bg-majorellel"
                    >
                      {t("reviewAndPublish")}
                    </Link>
                  ) : null}
                  <RejectContributionButton
                    contributionId={c.id}
                    uiLocale={locale}
                    label={t("reject")}
                    promptText={t("rejectReasonPlaceholder")}
                    confirmText={t("confirmReject")}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

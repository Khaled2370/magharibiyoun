import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ContentType } from "@prisma/client";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireEditor } from "@/lib/authz";
import { fmtDate } from "@/lib/content";
import { Link } from "@/i18n/navigation";

const TYPES: ContentType[] = [
  "ARTICLE",
  "INITIATIVE",
  "HISTORICAL_ENTRY",
  "PERSONALITY",
  "CULTURAL",
  "MEDIA_ITEM",
];
const LOCALES = ["ar", "fr", "en"] as const;

export default async function AdminDashboard({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; saved?: string; deleted?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireEditor(locale);
  const sp = await searchParams;
  const t = await getTranslations("admin");

  const typeFilter = TYPES.includes(sp.type as ContentType)
    ? (sp.type as ContentType)
    : undefined;

  const contents = await prisma.content.findMany({
    where: typeFilter ? { type: typeFilter } : undefined,
    include: {
      translations: { select: { locale: true, title: true, status: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  const statusTone = (status?: string) =>
    status === "PUBLISHED"
      ? "bg-oasisl text-oasis"
      : status === "IN_REVIEW"
        ? "bg-terracottal text-terracotta"
        : status
          ? "bg-sable2 text-mutedink"
          : "bg-transparent text-ligne";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-medium">{t("title")}</h1>
        <Link
          href="/admin/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-majorelle px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {t("newContent")}
        </Link>
      </div>

      {sp.saved ? (
        <p className="mt-4 rounded-lg bg-oasisl px-4 py-2.5 text-sm text-oasis">
          {t("saved")}
        </p>
      ) : null}
      {sp.deleted ? (
        <p className="mt-4 rounded-lg bg-sable2 px-4 py-2.5 text-sm text-mutedink">
          {t("deleted")}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/admin"
          className={`rounded-full px-3 py-1 text-xs font-medium ${!typeFilter ? "bg-encre text-sable" : "bg-white text-mutedink border border-ligne hover:border-majorelle"}`}
        >
          {t("all")}
        </Link>
        {TYPES.map((ty) => (
          <Link
            key={ty}
            href={{ pathname: "/admin", query: { type: ty } }}
            className={`rounded-full px-3 py-1 text-xs font-medium ${typeFilter === ty ? "bg-encre text-sable" : "bg-white text-mutedink border border-ligne hover:border-majorelle"}`}
          >
            {t(`type${ty}`)}
          </Link>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-ligne bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ligne text-start text-xs text-mutedink">
              <th className="px-4 py-3 text-start font-medium">
                {t("colTitle")}
              </th>
              <th className="px-4 py-3 text-start font-medium">
                {t("colType")}
              </th>
              <th className="px-4 py-3 text-start font-medium">
                {t("colLanguages")}
              </th>
              <th className="px-4 py-3 text-start font-medium">
                {t("colUpdated")}
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {contents.map((c) => {
              const title =
                c.translations.find((x) => x.locale === "ar")?.title ??
                c.translations[0]?.title ??
                `#${c.id}`;
              return (
                <tr key={c.id} className="border-b border-ligne/60 last:border-0">
                  <td className="px-4 py-3 font-medium">{title}</td>
                  <td className="px-4 py-3 text-mutedink">
                    {TYPES.includes(c.type) ? t(`type${c.type}`) : c.type}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {LOCALES.map((l) => {
                        const tr = c.translations.find((x) => x.locale === l);
                        return (
                          <span
                            key={l}
                            title={tr?.status ?? ""}
                            className={`rounded px-1.5 py-0.5 text-xs font-medium uppercase ${statusTone(tr?.status)}`}
                          >
                            {l}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-mutedink">
                    {fmtDate(locale, c.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <Link
                      href={{
                        pathname: "/admin/edit/[id]",
                        params: { id: String(c.id) },
                      }}
                      className="rounded-lg border border-majorelle px-3 py-1 text-xs font-medium text-majorelle transition-colors hover:bg-majorellel"
                    >
                      {t("edit")}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

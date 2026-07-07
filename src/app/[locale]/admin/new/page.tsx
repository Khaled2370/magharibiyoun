import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ContentType } from "@prisma/client";
import {
  BookOpen,
  Lightbulb,
  Mic,
  Network,
  Palette,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireEditor } from "@/lib/authz";
import { Link } from "@/i18n/navigation";
import ContentForm, {
  categoryModuleFor,
} from "@/components/admin/content-form";

const TYPES: { type: ContentType; icon: React.ElementType }[] = [
  { type: "ARTICLE", icon: Lightbulb },
  { type: "INITIATIVE", icon: Network },
  { type: "HISTORICAL_ENTRY", icon: BookOpen },
  { type: "PERSONALITY", icon: Users },
  { type: "CULTURAL", icon: Palette },
  { type: "MEDIA_ITEM", icon: Mic },
];

export default async function AdminNewPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; error?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireEditor(locale);
  const sp = await searchParams;
  const t = await getTranslations("admin");

  const chosen = TYPES.find((x) => x.type === sp.type)?.type;

  if (!chosen) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-medium">{t("chooseType")}</h1>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TYPES.map(({ type, icon: Icon }) => (
            <Link
              key={type}
              href={{ pathname: "/admin/new", query: { type } }}
              className="group rounded-xl border border-ligne bg-white p-5 transition-colors hover:border-majorelle"
            >
              <Icon className="h-6 w-6 text-majorelle" aria-hidden />
              <div className="mt-3 font-medium group-hover:text-majorelle">
                {t(`type${type}`)}
              </div>
            </Link>
          ))}
        </div>
        <Link
          href="/admin"
          className="mt-8 inline-block text-sm font-medium text-mutedink hover:text-encre"
        >
          {t("backToList")}
        </Link>
      </div>
    );
  }

  const catModule = categoryModuleFor(chosen);
  const [countries, categories] = await Promise.all([
    prisma.country.findMany(),
    catModule
      ? prisma.category.findMany({
          where: { module: catModule },
          orderBy: { sortOrder: "asc" },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-medium">
        {t("newContent")} — {t(`type${chosen}`)}
      </h1>
      {sp.error === "empty" ? (
        <p className="mt-4 rounded-lg bg-terracottal px-4 py-2.5 text-sm text-terracotta">
          {t("errorEmpty")}
        </p>
      ) : null}
      <div className="mt-6">
        <ContentForm
          locale={locale}
          type={chosen}
          countries={countries}
          categories={categories}
        />
      </div>
    </div>
  );
}

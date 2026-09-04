import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireEditor } from "@/lib/authz";
import { getSourceOptions } from "@/lib/content";
import ContentForm, {
  adminContentInclude,
  categoryModuleFor,
} from "@/components/admin/content-form";
import DeleteButton from "@/components/admin/delete-button";

export default async function AdminEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{
    error?: string;
    coverError?: string;
    pathStepError?: string;
  }>;
}) {
  const { locale, id: rawId } = await params;
  setRequestLocale(locale);
  await requireEditor(locale);
  const sp = await searchParams;
  const t = await getTranslations("admin");

  const id = Number(decodeURIComponent(rawId));
  if (Number.isNaN(id)) notFound();

  const content = await prisma.content.findUnique({
    where: { id },
    include: adminContentInclude,
  });
  if (!content) notFound();

  const catModule = categoryModuleFor(content.type);
  const [countries, categories, sourceOptions] = await Promise.all([
    prisma.country.findMany(),
    catModule
      ? prisma.category.findMany({
          where: { module: catModule },
          orderBy: { sortOrder: "asc" },
        })
      : Promise.resolve([]),
    content.type === "EDUCATIONAL" ? getSourceOptions() : Promise.resolve([]),
  ]);

  const typeLabel = [
    "ARTICLE",
    "INITIATIVE",
    "HISTORICAL_ENTRY",
    "PERSONALITY",
    "CULTURAL",
    "MEDIA_ITEM",
    "EDUCATIONAL",
    "LEARNING_PATH",
  ].includes(content.type)
    ? t(`type${content.type}`)
    : content.type;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-medium">
          {t("edit")} — {typeLabel}
        </h1>
        <DeleteButton
          id={content.id}
          uiLocale={locale}
          label={t("delete")}
          confirmText={t("confirmDelete")}
        />
      </div>
      {sp.error === "empty" ? (
        <p className="mt-4 rounded-lg bg-terracottal px-4 py-2.5 text-sm text-terracotta">
          {t("errorEmpty")}
        </p>
      ) : null}
      {sp.coverError ? (
        <p className="mt-4 rounded-lg bg-terracottal px-4 py-2.5 text-sm text-terracotta">
          {t("coverUploadError")}
        </p>
      ) : null}
      {sp.pathStepError ? (
        <p className="mt-4 rounded-lg bg-terracottal px-4 py-2.5 text-sm text-terracotta">
          {t("pathStepInvalid", { slug: sp.pathStepError })}
        </p>
      ) : null}
      <div className="mt-6">
        <ContentForm
          locale={locale}
          type={content.type}
          content={content}
          countries={countries}
          categories={categories}
          sourceOptions={sourceOptions}
        />
      </div>
    </div>
  );
}

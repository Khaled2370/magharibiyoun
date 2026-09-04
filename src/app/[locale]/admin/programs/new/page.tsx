import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireEditor } from "@/lib/authz";
import ProgramForm from "@/components/lms/program-form";
import { Link } from "@/i18n/navigation";

export default async function NewProgramPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireEditor(locale);
  const t = await getTranslations("lms");
  const ta = await getTranslations("admin");
  const sp = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-medium">{t("adminNewProgram")}</h1>

      {sp.error === "empty" ? (
        <p className="mb-4 rounded-lg bg-terracottal px-4 py-2.5 text-sm text-terracotta">
          {ta("errorEmpty")}
        </p>
      ) : null}

      <ProgramForm uiLocale={locale} />

      <Link
        href="/admin/programs"
        className="mt-6 inline-block text-sm text-mutedink hover:text-majorelle"
      >
        {t("adminBackToPrograms")}
      </Link>
    </div>
  );
}

import { getTranslations, setRequestLocale } from "next-intl/server";
import ContentCard from "@/components/content/content-card";
import { getPublishedList } from "@/lib/content";

export default async function InitiativesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tn = await getTranslations("nav");
  const t = await getTranslations("content");
  const items = await getPublishedList("INITIATIVE", locale, 50);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-medium">{tn("initiatives")}</h1>
      {items.length === 0 ? (
        <p className="mt-10 text-mutedink">{t("empty")}</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ContentCard key={item.id} item={item} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

import { getTranslations, setRequestLocale } from "next-intl/server";
import ContentCard from "@/components/content/content-card";
import JumpNav from "@/components/content/jump-nav";
import { getPublishedList } from "@/lib/content";

export default async function EncyclopediaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tn = await getTranslations("nav");
  const t = await getTranslations("content");

  const [history, personalities, culture] = await Promise.all([
    getPublishedList("HISTORICAL_ENTRY", locale, 12),
    getPublishedList("PERSONALITY", locale, 12),
    getPublishedList("CULTURAL", locale, 12),
  ]);

  const sections = [
    { key: "sectionHistory", items: history },
    { key: "sectionPersonalities", items: personalities },
    { key: "sectionCulture", items: culture },
  ].filter((s) => s.items.length > 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-medium">{tn("encyclopedia")}</h1>
      <p className="mt-2 max-w-2xl leading-relaxed text-mutedink">
        {t("encyclopediaIntro")}
      </p>
      {sections.length === 0 ? (
        <p className="mt-10 text-mutedink">{t("empty")}</p>
      ) : (
        <>
          <JumpNav
            items={sections.map((s) => ({
              key: s.key,
              label: t(s.key),
              count: s.items.length,
            }))}
          />
          {sections.map((s) => (
            <section key={s.key} id={s.key} className="scroll-mt-20 pt-10">
              <h2 className="mb-4 text-xl font-medium">{t(s.key)}</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {s.items.map((item) => (
                  <ContentCard key={item.id} item={item} locale={locale} />
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}

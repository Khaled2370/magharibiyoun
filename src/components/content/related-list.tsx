import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  contentHref,
  relatedEntries,
  type DetailItem,
} from "@/lib/content";

export default async function RelatedList({
  detail,
  locale,
}: {
  detail: DetailItem;
  locale: string;
}) {
  const entries = relatedEntries(detail, locale);
  if (entries.length === 0) return null;
  const t = await getTranslations("content");

  return (
    <section className="mt-10">
      <h2 className="mb-3 text-lg font-medium">{t("related")}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {entries.map((e) => (
          <Link
            key={`${e.type}-${e.slug}`}
            href={{ pathname: contentHref(e.type), params: { slug: e.slug } }}
            locale={e.inLocale ? undefined : "ar"}
            className="group rounded-xl border border-ligne bg-white p-4 transition-colors hover:border-majorelle"
          >
            <div className="text-sm font-medium leading-relaxed group-hover:text-majorelle">
              {e.title}
            </div>
            {!e.inLocale ? (
              <span className="mt-1 inline-block rounded-full bg-sable2 px-2 py-0.5 text-xs text-mutedink">
                {t("inArabic")}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}

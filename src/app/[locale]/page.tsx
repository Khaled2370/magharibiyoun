import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  BookOpen,
  GraduationCap,
  Lightbulb,
  Mic,
  Network,
  PenLine,
  Search,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import ContentCard from "@/components/content/content-card";
import {
  getFeaturedOne,
  getLatest,
  listJoin,
  tLabel,
} from "@/lib/content";

type TilePathname =
  | "/encyclopedia"
  | "/initiatives"
  | "/opinions"
  | "/learn"
  | "/media"
  | "/contribute";

const tiles: { key: string; href: TilePathname; icon: React.ElementType }[] = [
  { key: "encyclopedia", href: "/encyclopedia", icon: BookOpen },
  { key: "initiatives", href: "/initiatives", icon: Network },
  { key: "opinions", href: "/opinions", icon: Lightbulb },
  { key: "learn", href: "/learn", icon: GraduationCap },
  { key: "media", href: "/media", icon: Mic },
  { key: "contribute", href: "/contribute", icon: PenLine },
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tn = await getTranslations("nav");

  const [latestOpinions, featuredEncyclopedia, featuredInitiative, latestMedia] =
    await Promise.all([
      getLatest("ARTICLE", locale, 2),
      getFeaturedOne(["HISTORICAL_ENTRY", "PERSONALITY", "CULTURAL"], locale),
      getFeaturedOne(["INITIATIVE"], locale),
      getLatest("MEDIA_ITEM", locale, 1),
    ]);

  return (
    <div>
      <section className="px-4 pb-12 pt-16 text-center">
        <h1 className="mx-auto max-w-2xl text-3xl font-medium leading-relaxed sm:text-4xl">
          {t("heroTitle")}
        </h1>
        <p className="mx-auto mt-4 max-w-xl leading-loose text-mutedink">
          {t("heroSubtitle")}
        </p>
        <form
          className="mx-auto mt-8 flex max-w-lg items-center gap-2 rounded-full border border-ligne bg-white px-5 py-2.5"
          role="search"
        >
          <Search className="h-4 w-4 shrink-0 text-mutedink" aria-hidden />
          <input
            type="search"
            placeholder={t("searchPlaceholder")}
            className="w-full bg-transparent text-sm outline-none placeholder:text-mutedink"
            aria-label={t("searchButton")}
          />
        </form>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-12">
        <h2 className="mb-5 text-xl font-medium">{t("exploreTitle")}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map(({ key, href, icon: Icon }) => (
            <Link
              key={key}
              href={href}
              className="group rounded-xl border border-ligne bg-white p-5 transition-colors hover:border-majorelle"
            >
              <Icon className="h-6 w-6 text-majorelle" aria-hidden />
              <div className="mt-3 font-medium group-hover:text-majorelle">
                {tn(key)}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-mutedink">
                {t(`tiles.${key}`)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {latestOpinions.length > 0 ? (
        <section className="mx-auto max-w-5xl px-4 pb-12">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl font-medium">{t("latestOpinions")}</h2>
            <Link
              href="/opinions"
              className="text-sm font-medium text-majorelle hover:underline"
            >
              {t("seeAll")}
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {latestOpinions.map((item) => (
              <ContentCard key={item.id} item={item} locale={locale} />
            ))}
          </div>
        </section>
      ) : null}

      {featuredEncyclopedia || latestMedia.length > 0 ? (
        <section className="mx-auto max-w-5xl px-4 pb-12">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {featuredEncyclopedia ? (
              <div>
                <div className="mb-4 flex items-baseline justify-between">
                  <h2 className="text-xl font-medium">{t("fromEncyclopedia")}</h2>
                  <Link
                    href="/encyclopedia"
                    className="text-sm font-medium text-majorelle hover:underline"
                  >
                    {t("seeAll")}
                  </Link>
                </div>
                <ContentCard item={featuredEncyclopedia} locale={locale} />
              </div>
            ) : null}
            {latestMedia.length > 0 ? (
              <div>
                <div className="mb-4 flex items-baseline justify-between">
                  <h2 className="text-xl font-medium">{t("latestPodcast")}</h2>
                  <Link
                    href="/media"
                    className="text-sm font-medium text-majorelle hover:underline"
                  >
                    {t("seeAll")}
                  </Link>
                </div>
                <ContentCard item={latestMedia[0]} locale={locale} />
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {featuredInitiative ? (
        <section className="mx-auto max-w-5xl px-4 pb-12">
          <div className="flex flex-col gap-4 rounded-xl border border-ligne bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-block rounded-full bg-majorellel px-2.5 py-0.5 text-xs font-medium text-majorelle">
                {t("initiativeOfMonth")}
              </span>
              <div className="mt-2 text-lg font-medium">
                {featuredInitiative.title}
              </div>
              <div className="mt-1 text-sm text-mutedink">
                {listJoin(
                  locale,
                  featuredInitiative.content.countries.map((cc) =>
                    tLabel(cc.country.labels, locale),
                  ),
                )}
              </div>
            </div>
            <Link
              href={{
                pathname: "/initiatives/[slug]",
                params: { slug: featuredInitiative.slug },
              }}
              className="shrink-0 rounded-lg border border-majorelle px-5 py-2 text-sm font-medium text-majorelle transition-colors hover:bg-majorellel"
            >
              {t("details")}
            </Link>
          </div>
        </section>
      ) : null}

      <section className="bg-encre">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-12 text-center sm:flex-row sm:justify-between sm:text-start">
          <div>
            <h2 className="text-xl font-medium text-sable">
              {t("contributeTitle")}
            </h2>
            <p className="mt-2 text-sm text-sable2/80">{t("contributeText")}</p>
          </div>
          <Link
            href="/contribute"
            className="shrink-0 rounded-lg bg-terracotta px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {t("contributeCta")}
          </Link>
        </div>
      </section>
    </div>
  );
}

import { getTranslations } from "next-intl/server";
import type {
  Category,
  CategoryModule,
  ContentType,
  Country,
  Prisma,
} from "@prisma/client";
import { saveContent } from "@/actions/admin-content";
import { tLabel } from "@/lib/content";
import { Link } from "@/i18n/navigation";

export const adminContentInclude = {
  translations: true,
  article: true,
  initiative: true,
  historical: true,
  personality: true,
  cultural: true,
  mediaItem: true,
  educational: { include: { sourceContent: { include: { translations: true } } } },
  quiz: { include: { questions: { orderBy: { sortOrder: "asc" } } } },
  pathSteps: { orderBy: { sortOrder: "asc" }, include: { target: { include: { translations: true } } } },
  countries: true,
  categories: true,
  sources: { include: { source: true }, orderBy: { sortOrder: "asc" } },
  media: { include: { mediaFile: true }, orderBy: { sortOrder: "asc" } },
} satisfies Prisma.ContentInclude;

export type AdminContent = Prisma.ContentGetPayload<{
  include: typeof adminContentInclude;
}>;

export function categoryModuleFor(type: ContentType): CategoryModule | null {
  switch (type) {
    case "ARTICLE":
      return "OPINION_CATEGORY";
    case "INITIATIVE":
      return "INITIATIVE_DOMAIN";
    case "HISTORICAL_ENTRY":
      return "HISTORY_PERIOD";
    case "CULTURAL":
      return "CULTURAL_DOMAIN";
    case "MEDIA_ITEM":
      return "MEDIA_THEME";
    case "EDUCATIONAL":
      return "EDUCATION_THEME";
    default:
      return null;
  }
}

export type SourceOption = { id: number; title: string };

const LOCALES = ["ar", "fr", "en"] as const;
const LANG_NAMES: Record<string, string> = {
  ar: "العربية",
  fr: "Français",
  en: "English",
};
const STATUSES = ["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"] as const;
const LEVELS = ["NONE", "COMMUNITY", "VERIFIED", "ACADEMIC"] as const;
const STATES = ["ACTIVE", "HISTORICAL", "SUSPENDED", "IN_CONSTRUCTION"] as const;
const KINDS = [
  "PODCAST",
  "VIDEO",
  "INTERVIEW",
  "CONFERENCE",
  "DEBATE",
  "TESTIMONY",
  "PORTRAIT",
  "SHOW",
] as const;
const ACTORS = [
  "INSTITUTION",
  "ASSOCIATION",
  "CITIZEN_COLLECTIVE",
  "COMPANY",
  "MEDIA",
  "THINK_TANK",
  "UNIVERSITY",
  "FESTIVAL",
  "DIGITAL_PLATFORM",
  "DIASPORA_NETWORK",
] as const;
const VARIANTS = [
  "KABYLE",
  "TACHELHIT",
  "TARIFIT",
  "CHAOUI",
  "ATLAS_TAMAZIGHT",
  "TUAREG",
  "STANDARD",
  "OTHER",
] as const;
const SCRIPTS = ["LATIN", "TIFINAGH", "ARABIC"] as const;
const AGE_RANGES = ["KIDS", "TEENS", "ADULTS", "TEACHERS", "FAMILIES"] as const;
const EDU_FORMATS = [
  "SHEET",
  "QUIZ",
  "DOSSIER",
  "VIDEO",
  "TIMELINE",
  "MAP",
  "GLOSSARY",
] as const;
const DIFFICULTIES = ["INTRO", "EASY", "MEDIUM", "ADVANCED"] as const;

const inputCls =
  "w-full rounded-lg border border-ligne bg-white px-3 py-2 text-sm outline-none focus:border-majorelle";
const labelCls = "mb-1 block text-sm font-medium";
const cardCls = "rounded-xl border border-ligne bg-white p-5";

export default async function ContentForm({
  locale,
  type,
  content,
  countries,
  categories,
  sourceOptions = [],
}: {
  locale: string;
  type: ContentType;
  content?: AdminContent;
  countries: Country[];
  categories: Category[];
  sourceOptions?: SourceOption[];
}) {
  const t = await getTranslations("admin");
  const tc = await getTranslations("content");

  const tr = (l: string) => content?.translations.find((x) => x.locale === l);
  const originalLocale =
    content?.translations.find((x) => x.isOriginal)?.locale ?? "ar";
  const selectedCountries = new Set(
    content?.countries.map((c) => c.countryCode) ?? [],
  );
  const selectedCategories = new Set(
    content?.categories.map((c) => c.categoryId) ?? [],
  );
  const sourcesText = (content?.sources ?? [])
    .map((cs) =>
      [
        cs.source.author ?? "",
        cs.source.title ?? "",
        cs.source.publisher ?? "",
        cs.source.year ?? "",
        cs.source.url ?? "",
      ].join(" | "),
    )
    .join("\n");
  const linksText = (
    (content?.initiative?.officialLinks as
      | { label: string; url: string }[]
      | null) ?? []
  )
    .map((l) => `${l.label} | ${l.url}`)
    .join("\n");
  const worksText = (
    (content?.personality?.works as { title: string; year?: number }[] | null) ??
    []
  )
    .map((w) => `${w.title} | ${w.year ?? ""}`)
    .join("\n");
  const quotesText = (
    (content?.personality?.quotes as
      | { text: string; source?: string }[]
      | null) ?? []
  )
    .map((q) => `${q.text} | ${q.source ?? ""}`)
    .join("\n");
  const quizQuestionsText = (content?.quiz?.questions ?? [])
    .map((q) => {
      const prompt = tLabel(q.prompt, "ar") || tLabel(q.prompt, "fr") || "";
      const choices = (q.choices as string[] | null) ?? [];
      const explanation = q.explanation
        ? tLabel(q.explanation, "ar") || tLabel(q.explanation, "fr") || ""
        : "";
      return [prompt, ...choices, String(q.correctIndex + 1), explanation].join(" | ");
    })
    .join("\n");
  const pathStepsText = (content?.pathSteps ?? [])
    .map((s) => {
      const slug =
        s.target?.translations.find((t) => t.locale === "ar")?.slug ?? "";
      const override = s.titleOverride ? tLabel(s.titleOverride, "ar") : "";
      return `${slug} | ${override}`;
    })
    .join("\n");
  return (
    <form action={saveContent} className="space-y-6">
      <input type="hidden" name="uiLocale" value={locale} />
      <input type="hidden" name="id" value={content?.id ?? ""} />
      <input type="hidden" name="type" value={type} />

      <section className={cardCls}>
        <h2 className="mb-4 text-lg font-medium">{t("commonSection")}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="validationLevel">
              {t("validationLevel")}
            </label>
            <select
              id="validationLevel"
              name="validationLevel"
              defaultValue={content?.validationLevel ?? (type === "ARTICLE" ? "NONE" : "COMMUNITY")}
              className={inputCls}
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {t(`level${l}`)}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={content?.isFeatured ?? false}
            />
            {t("featured")}
          </label>
        </div>
        <div className="mt-4">
          <span className={labelCls}>{t("countries")}</span>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5">
            {countries.map((c) => (
              <label key={c.code} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  name="countries"
                  value={c.code}
                  defaultChecked={selectedCountries.has(c.code)}
                />
                {tLabel(c.labels, locale)}
              </label>
            ))}
          </div>
        </div>
        {categories.length > 0 ? (
          <div className="mt-4">
            <span className={labelCls}>{t("categories")}</span>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    name="categories"
                    value={c.id}
                    defaultChecked={selectedCategories.has(c.id)}
                  />
                  {tLabel(c.labels, locale)}
                </label>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className={cardCls}>
        <h2 className="mb-4 text-lg font-medium">{t("coverSection")}</h2>
        {content?.media[0]?.mediaFile ? (
          <div className="mb-4 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.media[0].mediaFile.url}
              alt=""
              className="h-20 w-32 rounded-lg border border-ligne object-cover"
            />
            <span className="text-xs text-mutedink">{t("currentCover")}</span>
          </div>
        ) : null}
        <input
          type="file"
          name="coverImage"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="block w-full text-sm text-mutedink file:mr-3 file:rounded-lg file:border file:border-ligne file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-majorelle hover:file:border-majorelle"
        />
        <p className="mt-1 text-xs text-mutedink">{t("coverHint")}</p>
      </section>

      <section className={cardCls}>
        <h2 className="mb-1 text-lg font-medium">{t("translationsSection")}</h2>
        <div className="space-y-6">
          {LOCALES.map((l) => {
            const x = tr(l);
            return (
              <div
                key={l}
                dir={l === "ar" ? "rtl" : "ltr"}
                className="rounded-lg border border-ligne p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-medium">{LANG_NAMES[l]}</span>
                  <label className="flex items-center gap-1.5 text-xs text-mutedink">
                    <input
                      type="radio"
                      name="originalLocale"
                      value={l}
                      defaultChecked={originalLocale === l}
                    />
                    {t("original")}
                  </label>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelCls} htmlFor={`title_${l}`}>
                      {t("fieldTitle")}
                    </label>
                    <input
                      id={`title_${l}`}
                      name={`title_${l}`}
                      defaultValue={x?.title ?? ""}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor={`slug_${l}`}>
                      {t("fieldSlug")}
                    </label>
                    <input
                      id={`slug_${l}`}
                      name={`slug_${l}`}
                      defaultValue={x?.slug ?? ""}
                      className={inputCls}
                    />
                    <p className="mt-1 text-xs text-mutedink">{t("slugHint")}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <label className={labelCls} htmlFor={`summary_${l}`}>
                    {t("fieldSummary")}
                  </label>
                  <textarea
                    id={`summary_${l}`}
                    name={`summary_${l}`}
                    rows={2}
                    defaultValue={x?.summary ?? ""}
                    className={inputCls}
                  />
                </div>
                <div className="mt-3">
                  <label className={labelCls} htmlFor={`body_${l}`}>
                    {t("fieldBody")}
                  </label>
                  <textarea
                    id={`body_${l}`}
                    name={`body_${l}`}
                    rows={10}
                    defaultValue={x?.body ?? ""}
                    className={inputCls}
                  />
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelCls} htmlFor={`seo_${l}`}>
                      {t("fieldSeo")}
                    </label>
                    <input
                      id={`seo_${l}`}
                      name={`seo_${l}`}
                      defaultValue={x?.seoDescription ?? ""}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor={`status_${l}`}>
                      {t("fieldStatus")}
                    </label>
                    <select
                      id={`status_${l}`}
                      name={`status_${l}`}
                      defaultValue={x?.status ?? "DRAFT"}
                      className={inputCls}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {t(`status${s}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className={cardCls}>
        <h2 className="mb-4 text-lg font-medium">{t("typeSection")}</h2>
        {type === "ARTICLE" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls} htmlFor="authorName">
                {t("authorName")}
              </label>
              <input
                id="authorName"
                name="authorName"
                defaultValue={content?.article?.authorName ?? ""}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="authorCountryCode">
                {t("countries")}
              </label>
              <select
                id="authorCountryCode"
                name="authorCountryCode"
                defaultValue={content?.article?.authorCountryCode ?? ""}
                className={inputCls}
              >
                <option value="">{t("none")}</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {tLabel(c.labels, locale)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="readingTimeMin">
                {t("readingTime")}
              </label>
              <input
                id="readingTimeMin"
                name="readingTimeMin"
                type="number"
                min={1}
                defaultValue={content?.article?.readingTimeMin ?? ""}
                className={inputCls}
              />
            </div>
          </div>
        ) : null}

        {type === "INITIATIVE" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className={labelCls} htmlFor="actorType">
                  {t("actorType")}
                </label>
                <select
                  id="actorType"
                  name="actorType"
                  defaultValue={content?.initiative?.actorType ?? ""}
                  className={inputCls}
                >
                  <option value="">{t("none")}</option>
                  {ACTORS.map((a) => (
                    <option key={a} value={a}>
                      {tc(`actor${a}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="state">
                  {t("state")}
                </label>
                <select
                  id="state"
                  name="state"
                  defaultValue={content?.initiative?.state ?? "ACTIVE"}
                  className={inputCls}
                >
                  {STATES.map((s) => (
                    <option key={s} value={s}>
                      {tc(`state${s}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="foundedYear">
                  {t("foundedYear")}
                </label>
                <input
                  id="foundedYear"
                  name="foundedYear"
                  type="number"
                  defaultValue={content?.initiative?.foundedYear ?? ""}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className={labelCls} htmlFor="founders">
                {t("founders")}
              </label>
              <input
                id="founders"
                name="founders"
                defaultValue={content?.initiative?.founders ?? ""}
                className={inputCls}
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                name="isVerified"
                defaultChecked={content?.initiative?.isVerified ?? false}
              />
              {t("verified")}
            </label>
            <div>
              <label className={labelCls} htmlFor="officialLinks">
                {t("officialLinks")}
              </label>
              <textarea
                id="officialLinks"
                name="officialLinks"
                rows={2}
                defaultValue={linksText}
                dir="ltr"
                className={inputCls}
              />
              <p className="mt-1 text-xs text-mutedink">{t("linksHint")}</p>
            </div>
          </div>
        ) : null}

        {type === "HISTORICAL_ENTRY" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls} htmlFor="yearStart">
                {t("yearStart")}
              </label>
              <input
                id="yearStart"
                name="yearStart"
                type="number"
                defaultValue={content?.historical?.yearStart ?? ""}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="yearEnd">
                {t("yearEnd")}
              </label>
              <input
                id="yearEnd"
                name="yearEnd"
                type="number"
                defaultValue={content?.historical?.yearEnd ?? ""}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="periodCategoryId">
                {t("period")}
              </label>
              <select
                id="periodCategoryId"
                name="periodCategoryId"
                defaultValue={content?.historical?.periodCategoryId ?? ""}
                className={inputCls}
              >
                <option value="">{t("none")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {tLabel(c.labels, locale)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        {type === "PERSONALITY" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className={labelCls} htmlFor="birthYear">
                  {t("birthYear")}
                </label>
                <input
                  id="birthYear"
                  name="birthYear"
                  type="number"
                  defaultValue={content?.personality?.birthYear ?? ""}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="deathYear">
                  {t("deathYear")}
                </label>
                <input
                  id="deathYear"
                  name="deathYear"
                  type="number"
                  defaultValue={content?.personality?.deathYear ?? ""}
                  className={inputCls}
                />
              </div>
              <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name="isLiving"
                  defaultChecked={content?.personality?.isLiving ?? false}
                />
                {t("isLiving")}
              </label>
            </div>
            <div>
              <label className={labelCls} htmlFor="works">
                {t("works")}
              </label>
              <textarea
                id="works"
                name="works"
                rows={3}
                defaultValue={worksText}
                className={inputCls}
              />
              <p className="mt-1 text-xs text-mutedink">{t("worksHint")}</p>
            </div>
            <div>
              <label className={labelCls} htmlFor="quotes">
                {t("quotes")}
              </label>
              <textarea
                id="quotes"
                name="quotes"
                rows={3}
                defaultValue={quotesText}
                className={inputCls}
              />
              <p className="mt-1 text-xs text-mutedink">{t("quotesHint")}</p>
            </div>
          </div>
        ) : null}

        {type === "CULTURAL" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls} htmlFor="contentLanguage">
                {t("contentLanguage")}
              </label>
              <select
                id="contentLanguage"
                name="contentLanguage"
                defaultValue={content?.cultural?.contentLanguage ?? ""}
                className={inputCls}
              >
                <option value="">{t("none")}</option>
                <option value="ar">العربية</option>
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="amz">Tamazight</option>
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="amazighVariant">
                {t("amazighVariant")}
              </label>
              <select
                id="amazighVariant"
                name="amazighVariant"
                defaultValue={content?.cultural?.amazighVariant ?? ""}
                className={inputCls}
              >
                <option value="">{t("none")}</option>
                {VARIANTS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="script">
                {t("script")}
              </label>
              <select
                id="script"
                name="script"
                defaultValue={content?.cultural?.script ?? ""}
                className={inputCls}
              >
                <option value="">{t("none")}</option>
                {SCRIPTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        {type === "MEDIA_ITEM" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className={labelCls} htmlFor="kind">
                  {t("kind")}
                </label>
                <select
                  id="kind"
                  name="kind"
                  defaultValue={content?.mediaItem?.kind ?? "PODCAST"}
                  className={inputCls}
                >
                  {KINDS.map((k) => (
                    <option key={k} value={k}>
                      {tc(`kind${k}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="externalUrl">
                  {t("externalUrl")}
                </label>
                <input
                  id="externalUrl"
                  name="externalUrl"
                  dir="ltr"
                  defaultValue={content?.mediaItem?.externalUrl ?? ""}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div>
                <label className={labelCls} htmlFor="durationMin">
                  {t("duration")}
                </label>
                <input
                  id="durationMin"
                  name="durationMin"
                  type="number"
                  min={1}
                  defaultValue={content?.mediaItem?.durationMin ?? ""}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="host">
                  {t("host")}
                </label>
                <input
                  id="host"
                  name="host"
                  defaultValue={content?.mediaItem?.host ?? ""}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="guests">
                  {t("guests")}
                </label>
                <input
                  id="guests"
                  name="guests"
                  defaultValue={content?.mediaItem?.guests ?? ""}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="showName">
                  {t("showName")}
                </label>
                <input
                  id="showName"
                  name="showName"
                  defaultValue={content?.mediaItem?.showName ?? ""}
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        ) : null}

        {type === "EDUCATIONAL" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className={labelCls} htmlFor="ageRange">
                  {t("ageRange")}
                </label>
                <select
                  id="ageRange"
                  name="ageRange"
                  defaultValue={content?.educational?.ageRange ?? ""}
                  className={inputCls}
                >
                  <option value="">{t("none")}</option>
                  {AGE_RANGES.map((a) => (
                    <option key={a} value={a}>
                      {tc(`age${a}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="format">
                  {t("format")}
                </label>
                <select
                  id="format"
                  name="format"
                  defaultValue={content?.educational?.format ?? "SHEET"}
                  className={inputCls}
                >
                  {EDU_FORMATS.map((f) => (
                    <option key={f} value={f}>
                      {tc(`format${f}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="difficulty">
                  {t("difficulty")}
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  defaultValue={content?.educational?.difficulty ?? ""}
                  className={inputCls}
                >
                  <option value="">{t("none")}</option>
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {tc(`difficulty${d}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls} htmlFor="sourceContentId">
                {t("sourceContent")}
              </label>
              <select
                id="sourceContentId"
                name="sourceContentId"
                defaultValue={content?.educational?.sourceContentId ?? ""}
                className={inputCls}
              >
                <option value="">{t("none")}</option>
                {sourceOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                name="downloadable"
                defaultChecked={content?.educational?.downloadable ?? false}
              />
              {t("downloadable")}
            </label>
            <div>
              <label className={labelCls} htmlFor="quizQuestions">
                {t("quizQuestions")}
              </label>
              <textarea
                id="quizQuestions"
                name="quizQuestions"
                rows={5}
                defaultValue={quizQuestionsText}
                className={inputCls}
              />
              <p className="mt-1 text-xs text-mutedink">
                {t("quizQuestionsHint")}
              </p>
            </div>
          </div>
        ) : null}

        {type === "LEARNING_PATH" ? (
          <div>
            <label className={labelCls} htmlFor="pathSteps">
              {t("pathSteps")}
            </label>
            <textarea
              id="pathSteps"
              name="pathSteps"
              rows={6}
              defaultValue={pathStepsText}
              dir="ltr"
              className={inputCls}
            />
            <p className="mt-1 text-xs text-mutedink">{t("pathStepsHint")}</p>
          </div>
        ) : null}
      </section>

      <section className={cardCls}>
        <h2 className="mb-2 text-lg font-medium">{t("sourcesSection")}</h2>
        <textarea
          name="sources"
          rows={4}
          defaultValue={sourcesText}
          className={inputCls}
        />
        <p className="mt-1 text-xs text-mutedink">{t("sourcesHint")}</p>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-majorelle px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {t("save")}
        </button>
        <Link
          href="/admin"
          className="text-sm font-medium text-mutedink hover:text-encre"
        >
          {t("backToList")}
        </Link>
      </div>
    </form>
  );
}

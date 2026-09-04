import { Prisma, ContentType } from "@prisma/client";
import { prisma } from "./prisma";

export const listInclude = {
  content: {
    include: {
      article: true,
      initiative: true,
      historical: { include: { periodCategory: true } },
      personality: true,
      cultural: true,
      mediaItem: true,
      educational: true,
      countries: { include: { country: true } },
      categories: { include: { category: true } },
      media: { include: { mediaFile: true }, orderBy: { sortOrder: "asc" } },
    },
  },
} satisfies Prisma.ContentTranslationInclude;

export type ListItem = Prisma.ContentTranslationGetPayload<{
  include: typeof listInclude;
}>;

export const detailInclude = {
  content: {
    include: {
      article: true,
      initiative: true,
      historical: { include: { periodCategory: true } },
      personality: true,
      cultural: true,
      mediaItem: true,
      educational: {
        include: {
          sourceContent: {
            include: { translations: { select: { locale: true, slug: true, title: true, status: true } } },
          },
        },
      },
      quiz: { include: { questions: { orderBy: { sortOrder: "asc" } } } },
      pathSteps: {
        orderBy: { sortOrder: "asc" },
        include: {
          target: {
            include: {
              translations: { select: { locale: true, slug: true, title: true, status: true } },
            },
          },
        },
      },
      countries: { include: { country: true } },
      categories: { include: { category: true } },
      media: { include: { mediaFile: true }, orderBy: { sortOrder: "asc" } },
      sources: { include: { source: true }, orderBy: { sortOrder: "asc" } },
      translations: { select: { locale: true, slug: true, title: true, status: true } },
      relatedFrom: { include: { to: { include: { translations: true } } } },
      relatedTo: { include: { from: { include: { translations: true } } } },
    },
  },
} satisfies Prisma.ContentTranslationInclude;

export type DetailItem = Prisma.ContentTranslationGetPayload<{
  include: typeof detailInclude;
}>;

export async function getPublishedList(
  type: ContentType,
  locale: string,
  take = 24,
): Promise<ListItem[]> {
  return prisma.contentTranslation.findMany({
    where: { locale, status: "PUBLISHED", content: { type } },
    include: listInclude,
    orderBy: { publishedAt: "desc" },
    take,
  });
}

export async function getFeaturedOne(
  types: ContentType[],
  locale: string,
): Promise<ListItem | null> {
  return prisma.contentTranslation.findFirst({
    where: {
      locale,
      status: "PUBLISHED",
      content: { type: { in: types }, isFeatured: true },
    },
    include: listInclude,
    orderBy: { publishedAt: "desc" },
  });
}

export async function getLatest(
  type: ContentType,
  locale: string,
  take = 2,
): Promise<ListItem[]> {
  return getPublishedList(type, locale, take);
}

export async function getSourceOptions(): Promise<
  { id: number; title: string }[]
> {
  const rows = await prisma.contentTranslation.findMany({
    where: {
      locale: "ar",
      status: "PUBLISHED",
      content: { type: { notIn: ["EDUCATIONAL", "LEARNING_PATH", "PAGE"] } },
    },
    select: { contentId: true, title: true },
    orderBy: { title: "asc" },
    take: 500,
  });
  return rows.map((r) => ({ id: r.contentId, title: r.title }));
}

export async function getDetail(
  locale: string,
  slug: string,
): Promise<DetailItem | null> {
  return prisma.contentTranslation.findUnique({
    where: { locale_slug: { locale, slug } },
    include: detailInclude,
  });
}

export function tLabel(labels: unknown, locale: string): string {
  const l = labels as Record<string, string> | null | undefined;
  return l?.[locale] ?? l?.ar ?? "";
}

export function paragraphs(body: string | null | undefined): string[] {
  return (body ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/,
  );
  return m ? m[1] : null;
}

export function fmtDate(locale: string, d: Date | null | undefined): string {
  if (!d) return "";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-TN" : locale, {
    dateStyle: "long",
  }).format(d);
}

export function fmtYear(locale: string, y: number | null | undefined): string {
  if (y == null) return "";
  if (y < 0) {
    if (locale === "ar") return `${-y} ق.م`;
    if (locale === "fr") return `${-y} av. J.-C.`;
    return `${-y} BC`;
  }
  return locale === "ar" ? `${y}م` : `${y}`;
}

export function listJoin(locale: string, items: string[]): string {
  return items.filter(Boolean).join(locale === "ar" ? "، " : ", ");
}

export type ContentPathname =
  | "/encyclopedia/[slug]"
  | "/opinions/[slug]"
  | "/initiatives/[slug]"
  | "/media/[slug]"
  | "/learn/[slug]";

export function contentHref(type: ContentType): ContentPathname {
  switch (type) {
    case "ARTICLE":
      return "/opinions/[slug]";
    case "INITIATIVE":
      return "/initiatives/[slug]";
    case "MEDIA_ITEM":
      return "/media/[slug]";
    case "EDUCATIONAL":
    case "LEARNING_PATH":
      return "/learn/[slug]";
    default:
      return "/encyclopedia/[slug]";
  }
}

export type RelatedEntry = {
  type: ContentType;
  slug: string;
  title: string;
  inLocale: boolean;
};

export function relatedEntries(
  detail: DetailItem,
  locale: string,
): RelatedEntry[] {
  const siblings = [
    ...detail.content.relatedFrom.map((r) => r.to),
    ...detail.content.relatedTo.map((r) => r.from),
  ];
  const entries: RelatedEntry[] = [];
  for (const s of siblings) {
    const inLoc = s.translations.find(
      (t) => t.locale === locale && t.status === "PUBLISHED",
    );
    const ar = s.translations.find(
      (t) => t.locale === "ar" && t.status === "PUBLISHED",
    );
    const tr = inLoc ?? ar;
    if (!tr) continue;
    entries.push({
      type: s.type,
      slug: tr.slug,
      title: tr.title,
      inLocale: Boolean(inLoc),
    });
  }
  return entries;
}

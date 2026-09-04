import type {
  ActorType,
  AmazighVariant,
  CategoryModule,
  ContentType,
  InitiativeState,
  PrismaClient,
  ScriptType,
  ValidationLevel,
} from "@prisma/client";

export type TrInput = {
  locale: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  seo?: string;
  date: string;
};

export type SourceInput = {
  author?: string;
  title: string;
  publisher?: string;
  year?: number;
  url?: string;
  kind?: string;
};

export async function createEntry(
  prisma: PrismaClient,
  opts: {
    type: ContentType;
    level?: ValidationLevel;
    featured?: boolean;
    countries?: string[];
    categoryIds?: number[];
    coverId?: number;
    translations: TrInput[];
    sources?: SourceInput[];
    historical?: {
      periodCategoryId?: number | null;
      yearStart?: number | null;
      yearEnd?: number | null;
    };
    personality?: {
      birthYear?: number;
      deathYear?: number;
      isLiving?: boolean;
      works?: object;
      quotes?: object;
    };
    cultural?: {
      contentLanguage?: string;
      amazighVariant?: AmazighVariant;
      script?: ScriptType;
    };
    initiative?: {
      actorType?: ActorType;
      state?: InitiativeState;
      foundedYear?: number;
      founders?: string;
      isVerified?: boolean;
      lastVerifiedAt?: Date;
      officialLinks?: object;
    };
  },
) {
  return prisma.content.create({
    data: {
      type: opts.type,
      validationLevel: opts.level ?? "VERIFIED",
      isFeatured: opts.featured ?? false,
      countries: opts.countries?.length
        ? { create: opts.countries.map((code) => ({ countryCode: code })) }
        : undefined,
      categories: opts.categoryIds?.length
        ? { create: opts.categoryIds.map((id) => ({ categoryId: id })) }
        : undefined,
      media: opts.coverId
        ? { create: [{ mediaFileId: opts.coverId }] }
        : undefined,
      historical: opts.historical ? { create: opts.historical } : undefined,
      personality: opts.personality ? { create: opts.personality } : undefined,
      cultural: opts.cultural ? { create: opts.cultural } : undefined,
      initiative: opts.initiative ? { create: opts.initiative } : undefined,
      sources: opts.sources?.length
        ? {
            create: opts.sources.map((s, i) => ({
              sortOrder: i + 1,
              source: {
                create: {
                  kind: s.kind ?? (s.url ? "web" : "book"),
                  author: s.author ?? null,
                  title: s.title,
                  publisher: s.publisher ?? null,
                  year: s.year ?? null,
                  url: s.url ?? null,
                },
              },
            })),
          }
        : undefined,
      translations: {
        create: opts.translations.map((t) => ({
          locale: t.locale,
          title: t.title,
          slug: t.slug,
          summary: t.summary,
          body: t.body,
          seoDescription: t.seo ?? t.summary,
          status: "PUBLISHED",
          isOriginal: t.locale === "ar",
          publishedAt: new Date(t.date),
        })),
      },
    },
  });
}

export async function findOrCreateCategory(
  prisma: PrismaClient,
  module: CategoryModule,
  labels: { ar: string; fr: string; en: string },
  sortOrder = 0,
): Promise<number> {
  const found = await prisma.category.findFirst({
    where: { module, labels: { path: ["ar"], equals: labels.ar } },
  });
  if (found) return found.id;
  const created = await prisma.category.create({
    data: { module, labels, sortOrder },
  });
  return created.id;
}

export async function hasArSlug(
  prisma: PrismaClient,
  slug: string,
): Promise<boolean> {
  const tr = await prisma.contentTranslation.findUnique({
    where: { locale_slug: { locale: "ar", slug } },
    select: { id: true },
  });
  return Boolean(tr);
}

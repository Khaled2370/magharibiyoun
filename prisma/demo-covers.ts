import type { PrismaClient } from "@prisma/client";

const COVERS = {
  antique: "antique.svg",
  islamic: "islamic.svg",
  modern: "modern.svg",
  portrait: "portrait.svg",
  music: "music.svg",
  craft: "craft.svg",
  calligraphy: "calligraphy.svg",
  architecture: "architecture.svg",
  cinema: "cinema.svg",
  food: "food.svg",
  network: "network.svg",
  media: "media.svg",
  heritage: "heritage.svg",
  equestrian: "equestrian.svg",
} as const;

export type CoverKey = keyof typeof COVERS;

export async function getCovers(
  prisma: PrismaClient,
): Promise<Record<CoverKey, number>> {
  const out = {} as Record<CoverKey, number>;
  for (const [key, file] of Object.entries(COVERS)) {
    const url = `/images/covers/${file}`;
    let media = await prisma.mediaFile.findFirst({ where: { url } });
    if (!media) {
      media = await prisma.mediaFile.create({
        data: {
          url,
          type: "IMAGE",
          caption: {
            ar: "صورة توضيحية من تصميم المنصة",
            fr: "Illustration créée par la plateforme",
            en: "Illustration created by the platform",
          },
          credit: "مغاربيون — Magharibiyoun",
          license: "CC BY-SA 4.0",
        },
      });
    }
    out[key as CoverKey] = media.id;
  }
  return out;
}

export async function attachCoverBySlug(
  prisma: PrismaClient,
  arSlug: string,
  mediaFileId: number,
) {
  const tr = await prisma.contentTranslation.findUnique({
    where: { locale_slug: { locale: "ar", slug: arSlug } },
    select: { contentId: true },
  });
  if (!tr) return;
  const existing = await prisma.contentMedia.findFirst({
    where: { contentId: tr.contentId },
  });
  if (existing) return;
  await prisma.contentMedia.create({
    data: { contentId: tr.contentId, mediaFileId },
  });
}

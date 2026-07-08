import type { PrismaClient } from "@prisma/client";

async function idOf(prisma: PrismaClient, slug: string): Promise<number | null> {
  const tr = await prisma.contentTranslation.findUnique({
    where: { locale_slug: { locale: "ar", slug } },
    select: { contentId: true },
  });
  return tr?.contentId ?? null;
}

export async function linkBatch2ToExisting(prisma: PrismaClient) {
  const pairs: [string, string][] = [
    ["الأدارسة", "تأسيس-القيروان"],
    ["الأدارسة", "الأندلس-والمغرب-الكبير"],
    ["الدولة-الفاطمية-في-إفريقية", "تأسيس-القيروان"],
    ["الممالك-المغاربية-بعد-الموحدين", "الموحدون"],
    ["الإباضية-ودولة-تاهرت", "وادي-مزاب"],
    ["الحسن-الوزان", "ابن-بطوطة"],
    ["تيفيناغ", "إمزاد"],
    ["تيفيناغ", "أهليل-قورارة"],
    ["تيفيناغ", "الكاهنة"],
    ["نقوش-طاسيلي-ناجر", "إمزاد"],
    ["المدن-الرومانية-في-المغرب-الكبير", "قرطاج"],
    ["المدن-الرومانية-في-المغرب-الكبير", "نوميديا"],
  ];

  let created = 0;
  for (const [a, b] of pairs) {
    const [fromId, toId] = await Promise.all([idOf(prisma, a), idOf(prisma, b)]);
    if (!fromId || !toId) continue;
    await prisma.relatedContent.createMany({
      data: [{ fromId, toId }],
      skipDuplicates: true,
    });
    created++;
  }
  console.log(`Liens croisés créés entre le lot 2 et le contenu existant : ${created}/${pairs.length}.`);
}

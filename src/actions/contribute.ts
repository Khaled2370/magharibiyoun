"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { slugify } from "@/lib/slug";
import { redirect } from "@/i18n/navigation";

const LOCALES = ["ar", "fr", "en"] as const;

async function uniqueSlug(locale: string, base: string): Promise<string> {
  let slug = base;
  let i = 2;
  for (;;) {
    const existing = await prisma.contentTranslation.findUnique({
      where: { locale_slug: { locale, slug } },
      select: { contentId: true },
    });
    if (!existing) return slug;
    slug = `${base}-${i++}`;
  }
}

export async function submitContribution(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  const session = await requireUser(locale);

  const contentLocale = LOCALES.includes(
    formData.get("contentLocale") as (typeof LOCALES)[number],
  )
    ? (formData.get("contentLocale") as string)
    : locale;
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "").trim();

  if (!title || !body) {
    redirect({ href: { pathname: "/contribute", query: { error: "empty" } }, locale });
  }

  const slug = await uniqueSlug(contentLocale, slugify(title) || `مساهمة-${Date.now()}`);

  const content = await prisma.content.create({
    data: {
      type: "ARTICLE",
      validationLevel: "NONE",
      createdById: session.user.id,
      article: {
        create: {
          authorName: session.user.name ?? undefined,
        },
      },
      translations: {
        create: {
          locale: contentLocale,
          title,
          slug,
          summary,
          body,
          status: "DRAFT",
          isOriginal: true,
        },
      },
    },
  });

  await prisma.contribution.create({
    data: {
      userId: session.user.id,
      kind: "NEW_CONTENT",
      contentId: content.id,
      targetLocale: contentLocale,
      status: "SUBMITTED",
    },
  });

  redirect({ href: { pathname: "/contribute", query: { submitted: "1" } }, locale });
}

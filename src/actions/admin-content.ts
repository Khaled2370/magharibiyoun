"use server";

import { revalidatePath } from "next/cache";
import type {
  ActorType,
  AmazighVariant,
  ContentType,
  InitiativeState,
  MediaKind,
  ScriptType,
  TranslationStatus,
  ValidationLevel,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireEditor } from "@/lib/authz";
import { slugify } from "@/lib/slug";
import { redirect } from "@/i18n/navigation";

const LOCALES = ["ar", "fr", "en"] as const;

function parseLines(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.split("|").map((p) => p.trim()));
}

async function uniqueSlug(
  locale: string,
  base: string,
  excludeContentId: number,
): Promise<string> {
  let slug = base;
  let i = 2;
  for (;;) {
    const existing = await prisma.contentTranslation.findUnique({
      where: { locale_slug: { locale, slug } },
      select: { contentId: true },
    });
    if (!existing || existing.contentId === excludeContentId) return slug;
    slug = `${base}-${i++}`;
  }
}

export async function saveContent(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  const session = await requireEditor(locale);

  const str = (name: string) => {
    const v = String(formData.get(name) ?? "").trim();
    return v || null;
  };
  const num = (name: string) => {
    const v = String(formData.get(name) ?? "").trim();
    if (!v) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };
  const on = (name: string) => formData.get(name) === "on";

  const idRaw = String(formData.get("id") ?? "").trim();
  const id = idRaw ? Number(idRaw) : null;
  const type = String(formData.get("type") ?? "") as ContentType;

  const anyTitle = LOCALES.some((l) =>
    String(formData.get(`title_${l}`) ?? "").trim(),
  );
  if (!anyTitle) {
    if (id) {
      redirect({
        href: {
          pathname: "/admin/edit/[id]",
          params: { id: String(id) },
          query: { error: "empty" },
        },
        locale,
      });
    }
    redirect({
      href: { pathname: "/admin/new", query: { type, error: "empty" } },
      locale,
    });
  }

  const validationLevel = String(
    formData.get("validationLevel") ?? "COMMUNITY",
  ) as ValidationLevel;
  const isFeatured = on("isFeatured");
  const countryCodes = formData.getAll("countries").map(String);
  const categoryIds = formData
    .getAll("categories")
    .map((v) => Number(v))
    .filter((n) => !Number.isNaN(n));
  const originalLocale = String(formData.get("originalLocale") ?? "ar");

  let contentId: number;
  if (id == null) {
    const created = await prisma.content.create({
      data: { type, validationLevel, isFeatured, createdById: session.user.id },
    });
    contentId = created.id;
  } else {
    contentId = id;
    await prisma.content.update({
      where: { id },
      data: { validationLevel, isFeatured },
    });
  }

  await prisma.contentCountry.deleteMany({ where: { contentId } });
  if (countryCodes.length) {
    await prisma.contentCountry.createMany({
      data: countryCodes.map((code) => ({ contentId, countryCode: code })),
    });
  }
  await prisma.contentCategory.deleteMany({ where: { contentId } });
  if (categoryIds.length) {
    await prisma.contentCategory.createMany({
      data: categoryIds.map((cid) => ({ contentId, categoryId: cid })),
    });
  }

  if (type === "ARTICLE") {
    const data = {
      authorName: str("authorName"),
      authorCountryCode: str("authorCountryCode"),
      readingTimeMin: num("readingTimeMin"),
    };
    await prisma.articleDetail.upsert({
      where: { contentId },
      create: { contentId, ...data },
      update: data,
    });
  } else if (type === "INITIATIVE") {
    const links = parseLines(String(formData.get("officialLinks") ?? ""))
      .map(([label, url]) => ({ label: label ?? "", url: url ?? "" }))
      .filter((l) => l.url);
    const verified = on("isVerified");
    const data = {
      actorType: (str("actorType") as ActorType | null) ?? null,
      state: String(formData.get("state") ?? "ACTIVE") as InitiativeState,
      foundedYear: num("foundedYear"),
      founders: str("founders"),
      isVerified: verified,
      lastVerifiedAt: verified ? new Date() : null,
      officialLinks: links,
    };
    await prisma.initiativeDetail.upsert({
      where: { contentId },
      create: { contentId, ...data },
      update: data,
    });
  } else if (type === "HISTORICAL_ENTRY") {
    const data = {
      yearStart: num("yearStart"),
      yearEnd: num("yearEnd"),
      periodCategoryId: num("periodCategoryId"),
    };
    await prisma.historicalDetail.upsert({
      where: { contentId },
      create: { contentId, ...data },
      update: data,
    });
  } else if (type === "PERSONALITY") {
    const works = parseLines(String(formData.get("works") ?? ""))
      .map(([title, year]) => ({
        title: title ?? "",
        ...(year && !Number.isNaN(Number(year)) ? { year: Number(year) } : {}),
      }))
      .filter((w) => w.title);
    const quotes = parseLines(String(formData.get("quotes") ?? ""))
      .map(([text, source]) => ({
        text: text ?? "",
        ...(source ? { source } : {}),
      }))
      .filter((q) => q.text);
    const data = {
      birthYear: num("birthYear"),
      deathYear: num("deathYear"),
      isLiving: on("isLiving"),
      works,
      quotes,
    };
    await prisma.personalityDetail.upsert({
      where: { contentId },
      create: { contentId, ...data },
      update: data,
    });
  } else if (type === "CULTURAL") {
    const data = {
      contentLanguage: str("contentLanguage"),
      amazighVariant: (str("amazighVariant") as AmazighVariant | null) ?? null,
      script: (str("script") as ScriptType | null) ?? null,
    };
    await prisma.culturalDetail.upsert({
      where: { contentId },
      create: { contentId, ...data },
      update: data,
    });
  } else if (type === "MEDIA_ITEM") {
    const data = {
      kind: (str("kind") as MediaKind | null) ?? "PODCAST",
      externalUrl: str("externalUrl") ?? "",
      durationMin: num("durationMin"),
      host: str("host"),
      guests: str("guests"),
      showName: str("showName"),
    };
    await prisma.mediaItemDetail.upsert({
      where: { contentId },
      create: { contentId, ...data },
      update: data,
    });
  }

  const existingTranslations = await prisma.contentTranslation.findMany({
    where: { contentId },
  });
  const prevOriginal = existingTranslations.find(
    (t) => t.locale === originalLocale,
  );
  const newOriginalBody = String(formData.get(`body_${originalLocale}`) ?? "");
  const originalChanged = Boolean(
    prevOriginal && (prevOriginal.body ?? "") !== newOriginalBody,
  );

  for (const l of LOCALES) {
    const title = String(formData.get(`title_${l}`) ?? "").trim();
    if (!title) continue;
    const existing = existingTranslations.find((t) => t.locale === l);
    const summary = str(`summary_${l}`);
    const body = String(formData.get(`body_${l}`) ?? "").trim() || null;
    const seoDescription = str(`seo_${l}`);
    const status = String(
      formData.get(`status_${l}`) ?? "DRAFT",
    ) as TranslationStatus;
    const desired = slugify(str(`slug_${l}`) ?? "") || slugify(title) || `contenu-${contentId}`;
    const slug =
      existing && existing.slug === desired
        ? desired
        : await uniqueSlug(l, desired, contentId);
    const isOriginal = originalLocale === l;
    const publishedAt =
      status === "PUBLISHED"
        ? (existing?.publishedAt ?? new Date())
        : (existing?.publishedAt ?? null);
    const unchanged = Boolean(
      existing &&
        existing.title === title &&
        (existing.body ?? "") === (body ?? ""),
    );
    const isOutdated = isOriginal
      ? false
      : originalChanged && unchanged
        ? true
        : unchanged
          ? (existing?.isOutdated ?? false)
          : false;

    await prisma.contentTranslation.upsert({
      where: { contentId_locale: { contentId, locale: l } },
      create: {
        contentId,
        locale: l,
        title,
        slug,
        summary,
        body,
        seoDescription,
        status,
        isOriginal,
        isOutdated: false,
        publishedAt,
      },
      update: {
        title,
        slug,
        summary,
        body,
        seoDescription,
        status,
        isOriginal,
        isOutdated,
        publishedAt,
      },
    });
  }

  const sourceLines = parseLines(String(formData.get("sources") ?? ""));
  await prisma.contentSource.deleteMany({ where: { contentId } });
  let order = 1;
  for (const [author, title, publisher, year, url] of sourceLines) {
    if (!title && !author) continue;
    const source = await prisma.source.create({
      data: {
        kind: url ? "web" : "book",
        author: author || null,
        title: title || author || "?",
        publisher: publisher || null,
        year: year && !Number.isNaN(Number(year)) ? Number(year) : null,
        url: url || null,
      },
    });
    await prisma.contentSource.create({
      data: { contentId, sourceId: source.id, sortOrder: order++ },
    });
  }

  await prisma.contentVersion.create({
    data: {
      contentId,
      editedById: session.user.id,
      note: id == null ? "création (admin)" : "modification (admin)",
      snapshot: {
        type,
        validationLevel,
        translations: Object.fromEntries(
          LOCALES.map((l) => [
            l,
            {
              title: String(formData.get(`title_${l}`) ?? ""),
              status: String(formData.get(`status_${l}`) ?? ""),
            },
          ]),
        ),
      },
    },
  });

  revalidatePath("/", "layout");
  redirect({ href: { pathname: "/admin", query: { saved: "1" } }, locale });
}

export async function deleteContent(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  await requireEditor(locale);
  const id = Number(formData.get("id"));
  if (!Number.isNaN(id)) {
    await prisma.content.delete({ where: { id } });
  }
  revalidatePath("/", "layout");
  redirect({ href: { pathname: "/admin", query: { deleted: "1" } }, locale });
}

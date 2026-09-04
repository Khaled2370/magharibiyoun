"use server";

import { revalidatePath } from "next/cache";
import type {
  ContentBlockType,
  LinkKind,
  ProgramStatus,
  SessionStatus,
  WeekKind,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireEditor } from "@/lib/authz";
import { slugify } from "@/lib/slug";
import { uploadDocument, uploadImage } from "@/lib/cloudinary";
import { fromDateTimeInputs } from "@/lib/lms";
import { redirect } from "@/i18n/navigation";

// ─────────────────────────────────────────────
// Petits utilitaires (même conventions que admin-content.ts)
// ─────────────────────────────────────────────

function readers(formData: FormData) {
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
  const file = (name: string) => {
    const f = formData.get(name);
    return f instanceof File && f.size > 0 ? f : null;
  };
  return { str, num, on, file };
}

async function uniqueProgramSlug(base: string, excludeId: number | null) {
  let slug = base || "programme";
  let i = 2;
  for (;;) {
    const found = await prisma.program.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!found || found.id === excludeId) return slug;
    slug = `${base}-${i++}`;
  }
}

async function uniqueSessionSlug(base: string, excludeId: number | null) {
  let slug = base || "seance";
  let i = 2;
  for (;;) {
    const found = await prisma.programSession.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!found || found.id === excludeId) return slug;
    slug = `${base}-${i++}`;
  }
}

function refresh() {
  revalidatePath("/", "layout");
}

async function backToProgram(locale: string, programId: number, query?: Record<string, string>) {
  redirect({
    href: {
      pathname: "/admin/programs/[id]",
      params: { id: String(programId) },
      ...(query ? { query } : {}),
    },
    locale,
  });
}

async function backToSession(
  locale: string,
  programId: number,
  sessionId: number,
  query?: Record<string, string>,
) {
  redirect({
    href: {
      pathname: "/admin/programs/[id]/sessions/[sessionId]",
      params: { id: String(programId), sessionId: String(sessionId) },
      ...(query ? { query } : {}),
    },
    locale,
  });
}

/** Programme auquel appartient une séance (pour les redirections). */
async function programIdOfSession(sessionId: number): Promise<number | null> {
  const s = await prisma.programSession.findUnique({
    where: { id: sessionId },
    select: { week: { select: { programId: true } } },
  });
  return s?.week.programId ?? null;
}

// ─────────────────────────────────────────────
// Programmes
// ─────────────────────────────────────────────

export async function saveProgram(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  await requireEditor(locale);
  const { str, num, file } = readers(formData);

  const idRaw = str("id");
  const id = idRaw ? Number(idRaw) : null;
  const title = str("title");
  if (!title) {
    if (id) return backToProgram(locale, id, { error: "empty" });
    redirect({ href: { pathname: "/admin/programs/new", query: { error: "empty" } }, locale });
    return;
  }

  const slug = await uniqueProgramSlug(str("slug") ?? slugify(title), id);
  const data = {
    title,
    slug,
    description: str("description"),
    durationWeeks: num("durationWeeks"),
    status: (str("status") as ProgramStatus | null) ?? "DRAFT",
  };

  const program = id
    ? await prisma.program.update({ where: { id }, data })
    : await prisma.program.create({ data });

  // Couverture : si l'envoi échoue, le reste est déjà enregistré.
  let uploadError = false;
  const cover = file("cover");
  if (cover) {
    try {
      const uploaded = await uploadImage(cover);
      const media = await prisma.mediaFile.create({
        data: {
          type: "IMAGE",
          url: uploaded.url,
          width: uploaded.width,
          height: uploaded.height,
        },
      });
      await prisma.program.update({
        where: { id: program.id },
        data: { coverMediaId: media.id },
      });
    } catch {
      uploadError = true;
    }
  }

  refresh();
  return backToProgram(locale, program.id, uploadError ? { uploadError: "1" } : { saved: "1" });
}

export async function deleteProgram(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  await requireEditor(locale);
  const id = Number(formData.get("id"));
  if (Number.isNaN(id)) return;

  // Garde-fou : on n'efface pas un programme suivi par des élèves (leur
  // progression disparaîtrait avec) — l'archivage est fait pour ça.
  const enrolled = await prisma.enrollment.count({ where: { programId: id } });
  if (enrolled > 0) {
    return backToProgram(locale, id, { error: "enrolled" });
  }

  await prisma.program.delete({ where: { id } });
  refresh();
  redirect({ href: { pathname: "/admin/programs", query: { deleted: "1" } }, locale });
}

// ─────────────────────────────────────────────
// Semaines
// ─────────────────────────────────────────────

export async function addWeeks(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  await requireEditor(locale);
  const { num, str } = readers(formData);
  const programId = Number(formData.get("programId"));
  if (Number.isNaN(programId)) return;

  const count = Math.min(Math.max(num("count") ?? 1, 1), 20);
  const kind = (str("kind") as WeekKind | null) ?? "LEARNING";
  const last = await prisma.programWeek.findFirst({
    where: { programId },
    orderBy: { weekNumber: "desc" },
    select: { weekNumber: true },
  });
  let next = (last?.weekNumber ?? 0) + 1;

  for (let i = 0; i < count; i++) {
    await prisma.programWeek.create({
      data: { programId, weekNumber: next++, kind },
    });
  }
  refresh();
  return backToProgram(locale, programId);
}

export async function saveWeek(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  await requireEditor(locale);
  const { str } = readers(formData);
  const id = Number(formData.get("id"));
  const programId = Number(formData.get("programId"));
  if (Number.isNaN(id) || Number.isNaN(programId)) return;

  await prisma.programWeek.update({
    where: { id },
    data: {
      title: str("title"),
      kind: (str("kind") as WeekKind | null) ?? "LEARNING",
      opensAt: fromDateTimeInputs(str("opensAtDate"), str("opensAtTime")),
    },
  });
  refresh();
  return backToProgram(locale, programId);
}

export async function deleteWeek(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  await requireEditor(locale);
  const id = Number(formData.get("id"));
  const programId = Number(formData.get("programId"));
  if (Number.isNaN(id) || Number.isNaN(programId)) return;

  await prisma.programWeek.delete({ where: { id } });
  // On renumérote pour éviter les trous (1, 2, 4… → 1, 2, 3…).
  const rest = await prisma.programWeek.findMany({
    where: { programId },
    orderBy: { weekNumber: "asc" },
    select: { id: true },
  });
  // Passage par des numéros négatifs : la paire (programme, numéro) est unique,
  // une renumérotation directe entrerait en collision en cours de route.
  for (let i = 0; i < rest.length; i++) {
    await prisma.programWeek.update({
      where: { id: rest[i].id },
      data: { weekNumber: -(i + 1) },
    });
  }
  for (let i = 0; i < rest.length; i++) {
    await prisma.programWeek.update({
      where: { id: rest[i].id },
      data: { weekNumber: i + 1 },
    });
  }
  refresh();
  return backToProgram(locale, programId);
}

export async function moveWeek(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  await requireEditor(locale);
  const id = Number(formData.get("id"));
  const programId = Number(formData.get("programId"));
  const dir = String(formData.get("direction")) === "up" ? -1 : 1;
  if (Number.isNaN(id) || Number.isNaN(programId)) return;

  const current = await prisma.programWeek.findUnique({ where: { id } });
  if (!current) return;
  const neighbour = await prisma.programWeek.findFirst({
    where: {
      programId,
      weekNumber: dir === -1 ? { lt: current.weekNumber } : { gt: current.weekNumber },
    },
    orderBy: { weekNumber: dir === -1 ? "desc" : "asc" },
  });
  if (!neighbour) return backToProgram(locale, programId);

  // Échange en trois temps (numéro temporaire) à cause de la contrainte d'unicité.
  await prisma.programWeek.update({ where: { id: current.id }, data: { weekNumber: -1 } });
  await prisma.programWeek.update({
    where: { id: neighbour.id },
    data: { weekNumber: current.weekNumber },
  });
  await prisma.programWeek.update({
    where: { id: current.id },
    data: { weekNumber: neighbour.weekNumber },
  });
  refresh();
  return backToProgram(locale, programId);
}

// ─────────────────────────────────────────────
// Séances
// ─────────────────────────────────────────────

export async function saveSession(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  await requireEditor(locale);
  const { str, num, on } = readers(formData);

  const idRaw = str("id");
  const id = idRaw ? Number(idRaw) : null;
  const programId = Number(formData.get("programId"));
  const weekId = Number(formData.get("weekId"));
  const title = str("title");
  if (Number.isNaN(programId) || Number.isNaN(weekId)) return;
  if (!title) {
    if (id) return backToSession(locale, programId, id, { error: "empty" });
    return backToProgram(locale, programId, { error: "empty" });
  }

  const slug = await uniqueSessionSlug(str("slug") ?? slugify(title), id);
  const publishAt = fromDateTimeInputs(str("publishDate"), str("publishTime"));
  const data = {
    weekId,
    title,
    slug,
    description: str("description"),
    instructor: str("instructor"),
    durationMin: num("durationMin"),
    publishAt,
    status: (str("status") as SessionStatus | null) ?? "DRAFT",
    isMandatory: on("isMandatory"),
  };

  if (id) {
    await prisma.programSession.update({ where: { id }, data });
    refresh();
    return backToSession(locale, programId, id, { saved: "1" });
  }

  const last = await prisma.programSession.findFirst({
    where: { weekId },
    orderBy: { orderInWeek: "desc" },
    select: { orderInWeek: true },
  });
  const created = await prisma.programSession.create({
    data: { ...data, orderInWeek: (last?.orderInWeek ?? -1) + 1 },
  });
  refresh();
  return backToSession(locale, programId, created.id, { saved: "1" });
}

export async function deleteSession(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  await requireEditor(locale);
  const id = Number(formData.get("id"));
  const programId = Number(formData.get("programId"));
  if (Number.isNaN(id) || Number.isNaN(programId)) return;
  await prisma.programSession.delete({ where: { id } });
  refresh();
  return backToProgram(locale, programId);
}

export async function duplicateSession(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  await requireEditor(locale);
  const id = Number(formData.get("id"));
  const programId = Number(formData.get("programId"));
  if (Number.isNaN(id) || Number.isNaN(programId)) return;

  const source = await prisma.programSession.findUnique({
    where: { id },
    include: { blocks: { orderBy: { sortOrder: "asc" } } },
  });
  if (!source) return backToProgram(locale, programId);

  const last = await prisma.programSession.findFirst({
    where: { weekId: source.weekId },
    orderBy: { orderInWeek: "desc" },
    select: { orderInWeek: true },
  });

  // La copie repart en brouillon sans date : on ne republie jamais par accident.
  const copy = await prisma.programSession.create({
    data: {
      weekId: source.weekId,
      title: `${source.title} (نسخة)`,
      slug: await uniqueSessionSlug(`${source.slug}-copie`, null),
      description: source.description,
      instructor: source.instructor,
      durationMin: source.durationMin,
      isMandatory: source.isMandatory,
      status: "DRAFT",
      publishAt: null,
      orderInWeek: (last?.orderInWeek ?? -1) + 1,
    },
  });

  for (const b of source.blocks) {
    await prisma.contentBlock.create({
      data: {
        sessionId: copy.id,
        sortOrder: b.sortOrder,
        type: b.type,
        isSupplementary: b.isSupplementary,
        title: b.title,
        videoUrl: b.videoUrl,
        videoTitle: b.videoTitle,
        videoInstructor: b.videoInstructor,
        videoDurationMin: b.videoDurationMin,
        textBody: b.textBody,
        mediaFileId: b.mediaFileId,
        linkUrl: b.linkUrl,
        linkLabel: b.linkLabel,
        linkKind: b.linkKind,
      },
    });
  }
  refresh();
  return backToSession(locale, programId, copy.id);
}

export async function moveSession(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  await requireEditor(locale);
  const id = Number(formData.get("id"));
  const programId = Number(formData.get("programId"));
  const dir = String(formData.get("direction")) === "up" ? -1 : 1;
  if (Number.isNaN(id) || Number.isNaN(programId)) return;

  const current = await prisma.programSession.findUnique({ where: { id } });
  if (!current) return;
  const neighbour = await prisma.programSession.findFirst({
    where: {
      weekId: current.weekId,
      orderInWeek: dir === -1 ? { lt: current.orderInWeek } : { gt: current.orderInWeek },
    },
    orderBy: { orderInWeek: dir === -1 ? "desc" : "asc" },
  });
  if (!neighbour) return backToProgram(locale, programId);

  await prisma.programSession.update({
    where: { id: current.id },
    data: { orderInWeek: neighbour.orderInWeek },
  });
  await prisma.programSession.update({
    where: { id: neighbour.id },
    data: { orderInWeek: current.orderInWeek },
  });
  refresh();
  return backToProgram(locale, programId);
}

export async function moveSessionToWeek(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  await requireEditor(locale);
  const id = Number(formData.get("id"));
  const programId = Number(formData.get("programId"));
  const weekId = Number(formData.get("weekId"));
  if (Number.isNaN(id) || Number.isNaN(programId) || Number.isNaN(weekId)) return;

  const last = await prisma.programSession.findFirst({
    where: { weekId },
    orderBy: { orderInWeek: "desc" },
    select: { orderInWeek: true },
  });
  await prisma.programSession.update({
    where: { id },
    data: { weekId, orderInWeek: (last?.orderInWeek ?? -1) + 1 },
  });
  refresh();
  return backToProgram(locale, programId);
}

/** Boutons rapides : publier maintenant / verrouiller / déverrouiller. */
export async function setSessionAvailability(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  await requireEditor(locale);
  const id = Number(formData.get("id"));
  const programId = Number(formData.get("programId"));
  const op = String(formData.get("op"));
  if (Number.isNaN(id) || Number.isNaN(programId)) return;

  const current = await prisma.programSession.findUnique({ where: { id } });
  if (!current) return;

  if (op === "publishNow") {
    await prisma.programSession.update({
      where: { id },
      data: { status: "PUBLISHED", publishAt: new Date() },
    });
  } else if (op === "lock") {
    await prisma.programSession.update({ where: { id }, data: { status: "LOCKED" } });
  } else if (op === "unlock") {
    // On recalcule le bon statut à partir de la date, pour éviter à l'admin
    // d'avoir à réconcilier statut et date à la main.
    const future = current.publishAt && current.publishAt.getTime() > Date.now();
    await prisma.programSession.update({
      where: { id },
      data: { status: future ? "SCHEDULED" : "PUBLISHED" },
    });
  }
  refresh();
  return backToProgram(locale, programId);
}

// ─────────────────────────────────────────────
// Blocs de contenu
// ─────────────────────────────────────────────

export async function saveBlock(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  await requireEditor(locale);
  const { str, num, on, file } = readers(formData);

  const sessionId = Number(formData.get("sessionId"));
  if (Number.isNaN(sessionId)) return;
  const programId = (await programIdOfSession(sessionId)) ?? 0;

  const idRaw = str("id");
  const id = idRaw ? Number(idRaw) : null;
  const type = (str("type") as ContentBlockType | null) ?? "TEXT";

  // Fichier éventuel (PDF ou image) — l'échec n'annule pas l'enregistrement.
  let mediaFileId: number | null = null;
  let uploadError = false;
  const upload = file("file");
  if (upload) {
    try {
      if (type === "PDF") {
        const doc = await uploadDocument(upload);
        const media = await prisma.mediaFile.create({
          data: { type: "PDF", url: doc.url },
        });
        mediaFileId = media.id;
      } else if (type === "IMAGE") {
        const img = await uploadImage(upload);
        const media = await prisma.mediaFile.create({
          data: {
            type: "IMAGE",
            url: img.url,
            width: img.width,
            height: img.height,
          },
        });
        mediaFileId = media.id;
      }
    } catch {
      uploadError = true;
    }
  }

  const common = {
    type,
    title: str("title"),
    isSupplementary: on("isSupplementary"),
    videoUrl: type === "VIDEO" ? str("videoUrl") : null,
    videoTitle: type === "VIDEO" ? str("videoTitle") : null,
    videoInstructor: type === "VIDEO" ? str("videoInstructor") : null,
    videoDurationMin: type === "VIDEO" ? num("videoDurationMin") : null,
    textBody: type === "TEXT" ? str("textBody") : null,
    linkUrl: type === "LINK" ? str("linkUrl") : null,
    linkLabel: type === "LINK" ? str("linkLabel") : null,
    linkKind: type === "LINK" ? ((str("linkKind") as LinkKind | null) ?? "OTHER") : null,
  };

  if (id) {
    await prisma.contentBlock.update({
      where: { id },
      // On ne remplace le fichier que si un nouveau a été envoyé.
      data: { ...common, ...(mediaFileId ? { mediaFileId } : {}) },
    });
  } else {
    const last = await prisma.contentBlock.findFirst({
      where: { sessionId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    await prisma.contentBlock.create({
      data: {
        ...common,
        sessionId,
        mediaFileId,
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });
  }
  refresh();
  return backToSession(
    locale,
    programId,
    sessionId,
    uploadError ? { uploadError: "1" } : { saved: "1" },
  );
}

export async function deleteBlock(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  await requireEditor(locale);
  const id = Number(formData.get("id"));
  const sessionId = Number(formData.get("sessionId"));
  if (Number.isNaN(id) || Number.isNaN(sessionId)) return;
  const programId = (await programIdOfSession(sessionId)) ?? 0;
  await prisma.contentBlock.delete({ where: { id } });
  refresh();
  return backToSession(locale, programId, sessionId);
}

export async function moveBlock(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  await requireEditor(locale);
  const id = Number(formData.get("id"));
  const sessionId = Number(formData.get("sessionId"));
  const dir = String(formData.get("direction")) === "up" ? -1 : 1;
  if (Number.isNaN(id) || Number.isNaN(sessionId)) return;
  const programId = (await programIdOfSession(sessionId)) ?? 0;

  const current = await prisma.contentBlock.findUnique({ where: { id } });
  if (!current) return;
  const neighbour = await prisma.contentBlock.findFirst({
    where: {
      sessionId,
      sortOrder: dir === -1 ? { lt: current.sortOrder } : { gt: current.sortOrder },
    },
    orderBy: { sortOrder: dir === -1 ? "desc" : "asc" },
  });
  if (!neighbour) return backToSession(locale, programId, sessionId);

  await prisma.contentBlock.update({
    where: { id: current.id },
    data: { sortOrder: neighbour.sortOrder },
  });
  await prisma.contentBlock.update({
    where: { id: neighbour.id },
    data: { sortOrder: current.sortOrder },
  });
  refresh();
  return backToSession(locale, programId, sessionId);
}

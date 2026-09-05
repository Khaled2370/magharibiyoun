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
import {
  CloudinaryNotConfiguredError,
  uploadDocument,
  uploadImage,
} from "@/lib/cloudinary";
import { effectiveUnlockAt, fromDateTimeInputs } from "@/lib/lms";
import { redirect } from "@/i18n/navigation";

/**
 * Enregistrement unique de la page « planning » d'un programme.
 *
 * Conçu après que Khaled a perdu sa saisie (2026-09-05) : la page comptait
 * onze formulaires indépendants, un seul bouton n'enregistrait qu'un bloc, et
 * les échecs étaient muets.
 *
 * Principe désormais : **un seul formulaire, une seule action**. Tout ce qui
 * est à l'écran est enregistré à chaque envoi — y compris quand l'envoi sert
 * en réalité à déplacer une semaine ou supprimer une séance. Le bouton pressé
 * transmet une opération dans le champ `op`, appliquée APRÈS l'enregistrement.
 * Conséquence : cliquer sur « descendre » ne fait plus jamais perdre ce qui
 * vient d'être tapé.
 */

type Op =
  | { kind: "none" }
  | { kind: "weekAdd" }
  | { kind: "weekUp" | "weekDown" | "weekDelete" | "weekActivateDrafts"; id: number }
  | { kind: "sessionAdd"; weekId: number }
  | {
      kind:
        | "sessionUp"
        | "sessionDown"
        | "sessionDelete"
        | "sessionDuplicate"
        | "sessionPublishNow"
        | "sessionLock"
        | "sessionUnlock";
      id: number;
    }
  | { kind: "sessionMove"; id: number };

function parseOp(raw: string | null): Op {
  if (!raw) return { kind: "none" };
  const [kind, rest] = raw.split(":");
  const id = Number(rest);
  switch (kind) {
    case "weekAdd":
      return { kind: "weekAdd" };
    case "weekUp":
    case "weekDown":
    case "weekDelete":
    case "weekActivateDrafts":
      return Number.isNaN(id) ? { kind: "none" } : { kind, id };
    case "sessionAdd":
      return Number.isNaN(id) ? { kind: "none" } : { kind: "sessionAdd", weekId: id };
    case "sessionUp":
    case "sessionDown":
    case "sessionDelete":
    case "sessionDuplicate":
    case "sessionPublishNow":
    case "sessionLock":
    case "sessionUnlock":
    case "sessionMove":
      return Number.isNaN(id) ? { kind: "none" } : { kind, id };
    default:
      return { kind: "none" };
  }
}

async function uniqueSessionSlug(base: string) {
  const clean = base || "seance";
  let slug = clean;
  let i = 2;
  for (;;) {
    const found = await prisma.programSession.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!found) return slug;
    slug = `${clean}-${i++}`;
  }
}

/** Renumérote les semaines 1..N sans heurter la contrainte d'unicité. */
async function renumberWeeks(programId: number) {
  const weeks = await prisma.programWeek.findMany({
    where: { programId },
    orderBy: { weekNumber: "asc" },
    select: { id: true },
  });
  // Passage par des valeurs négatives : (programme, numéro) est unique, une
  // renumérotation directe entrerait en collision en cours de route.
  for (let i = 0; i < weeks.length; i++) {
    await prisma.programWeek.update({
      where: { id: weeks[i].id },
      data: { weekNumber: -(i + 1) },
    });
  }
  for (let i = 0; i < weeks.length; i++) {
    await prisma.programWeek.update({
      where: { id: weeks[i].id },
      data: { weekNumber: i + 1 },
    });
  }
}

export async function saveProgramPlanning(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  await requireEditor(locale);

  const programId = Number(formData.get("programId"));
  if (Number.isNaN(programId)) return;

  const str = (n: string) => {
    const v = String(formData.get(n) ?? "").trim();
    return v || null;
  };
  const num = (n: string) => {
    const v = String(formData.get(n) ?? "").trim();
    if (!v) return null;
    const x = Number(v);
    return Number.isNaN(x) ? null : x;
  };

  const messages: string[] = [];
  const op = parseOp(str("op"));

  // ── 1. Le programme lui-même ────────────────────────────────
  const title = str("title");
  if (!title) {
    return redirect({
      href: {
        pathname: "/admin/programs/[id]",
        params: { id: String(programId) },
        query: { msg: "titleRequired" },
      },
      locale,
    });
  }

  const existing = await prisma.program.findUnique({
    where: { id: programId },
    select: { title: true, slug: true },
  });
  if (!existing) return;

  await prisma.program.update({
    where: { id: programId },
    data: {
      title,
      description: str("description"),
      durationWeeks: num("durationWeeks"),
      status: (str("status") as ProgramStatus | null) ?? "DRAFT",
      // Le slug ne suit le titre que s'il n'a jamais été personnalisé,
      // pour ne pas casser une adresse déjà partagée.
      ...(existing.title !== title && existing.slug === slugify(existing.title)
        ? { slug: await uniqueProgramSlugFor(slugify(title), programId) }
        : {}),
    },
  });

  // ── 2. Les semaines affichées ───────────────────────────────
  const weeks = await prisma.programWeek.findMany({
    where: { programId },
    orderBy: { weekNumber: "asc" },
    include: { sessions: { orderBy: { orderInWeek: "asc" } } },
  });

  for (const w of weeks) {
    if (formData.get(`week_${w.id}_kind`) === null) continue; // semaine absente de l'écran
    await prisma.programWeek.update({
      where: { id: w.id },
      data: {
        title: str(`week_${w.id}_title`),
        kind: (str(`week_${w.id}_kind`) as WeekKind | null) ?? "LEARNING",
        opensAt: fromDateTimeInputs(
          str(`week_${w.id}_date`),
          str(`week_${w.id}_time`),
        ),
      },
    });
  }

  // ── 3. Les séances affichées (planning : date, heure, statut) ──
  for (const w of weeks) {
    for (const s of w.sessions) {
      if (formData.get(`session_${s.id}_status`) === null) continue;
      await prisma.programSession.update({
        where: { id: s.id },
        data: {
          title: str(`session_${s.id}_title`) ?? s.title,
          publishAt: fromDateTimeInputs(
            str(`session_${s.id}_date`),
            str(`session_${s.id}_time`),
          ),
          status: (str(`session_${s.id}_status`) as SessionStatus | null) ?? s.status,
        },
      });
    }
  }
  messages.push("saved");

  // ── 4. La couverture, si un fichier a été joint ─────────────
  const cover = formData.get("cover");
  if (cover instanceof File && cover.size > 0) {
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
        where: { id: programId },
        data: { coverMediaId: media.id },
      });
    } catch (e) {
      messages.push(
        e instanceof CloudinaryNotConfiguredError ? "uploadConfig" : "uploadFailed",
      );
    }
  }

  // ── 5. L'opération demandée par le bouton pressé ────────────
  switch (op.kind) {
    case "weekAdd": {
      const count = Math.min(Math.max(num("addWeeksCount") ?? 1, 1), 20);
      const kind = (str("addWeeksKind") as WeekKind | null) ?? "LEARNING";
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
      messages.push("weeksAdded");
      break;
    }

    case "weekUp":
    case "weekDown": {
      const current = weeks.find((w) => w.id === op.id);
      if (!current) break;
      const dir = op.kind === "weekUp" ? -1 : 1;
      const neighbour = await prisma.programWeek.findFirst({
        where: {
          programId,
          weekNumber:
            dir === -1 ? { lt: current.weekNumber } : { gt: current.weekNumber },
        },
        orderBy: { weekNumber: dir === -1 ? "desc" : "asc" },
      });
      if (!neighbour) {
        messages.push("alreadyAtEdge");
        break;
      }
      await prisma.programWeek.update({
        where: { id: current.id },
        data: { weekNumber: -999 },
      });
      await prisma.programWeek.update({
        where: { id: neighbour.id },
        data: { weekNumber: current.weekNumber },
      });
      await prisma.programWeek.update({
        where: { id: current.id },
        data: { weekNumber: neighbour.weekNumber },
      });
      messages.push("weekMoved");
      break;
    }

    case "weekDelete": {
      await prisma.programWeek.delete({ where: { id: op.id } });
      await renumberWeeks(programId);
      messages.push("weekDeleted");
      break;
    }

    /**
     * « Rendre visibles les brouillons de cette semaine ».
     *
     * Les séances créées en lot naissent en brouillon — donc invisibles pour
     * les élèves. Khaled a signalé (2026-09-05) une séance datée qui
     * n'apparaissait nulle part : c'était ça. Les publier une par une devient
     * pénible quand on en ajoute dix d'un coup.
     *
     * Chaque brouillon prend le statut qui correspond à sa date : « mbrmja »
     * (programmée) si l'ouverture est encore devant nous, « publiée » sinon.
     * Même règle que le bouton « fatḥ » d'une séance verrouillée.
     */
    case "weekActivateDrafts": {
      const week = await prisma.programWeek.findUnique({
        where: { id: op.id },
        include: { sessions: { where: { status: "DRAFT" } } },
      });
      if (!week) break;
      if (week.sessions.length === 0) {
        messages.push("noDrafts");
        break;
      }
      const now = Date.now();
      for (const s of week.sessions) {
        const unlock = effectiveUnlockAt(s, week);
        await prisma.programSession.update({
          where: { id: s.id },
          data: { status: unlock && unlock.getTime() > now ? "SCHEDULED" : "PUBLISHED" },
        });
      }
      messages.push("draftsActivated");
      break;
    }

    case "sessionAdd": {
      const raw = String(formData.get(`addSessions_${op.weekId}`) ?? "");
      const titles = raw
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (titles.length === 0) {
        messages.push("noSessionTitle");
        break;
      }
      const last = await prisma.programSession.findFirst({
        where: { weekId: op.weekId },
        orderBy: { orderInWeek: "desc" },
        select: { orderInWeek: true },
      });
      let order = (last?.orderInWeek ?? -1) + 1;
      for (const t of titles) {
        await prisma.programSession.create({
          data: {
            weekId: op.weekId,
            title: t,
            slug: await uniqueSessionSlug(slugify(t)),
            orderInWeek: order++,
            status: "DRAFT",
            isMandatory: true,
          },
        });
      }
      messages.push(titles.length > 1 ? "sessionsAdded" : "sessionAdded");
      break;
    }

    case "sessionUp":
    case "sessionDown": {
      const current = await prisma.programSession.findUnique({ where: { id: op.id } });
      if (!current) break;
      const dir = op.kind === "sessionUp" ? -1 : 1;
      const neighbour = await prisma.programSession.findFirst({
        where: {
          weekId: current.weekId,
          orderInWeek:
            dir === -1 ? { lt: current.orderInWeek } : { gt: current.orderInWeek },
        },
        orderBy: { orderInWeek: dir === -1 ? "desc" : "asc" },
      });
      if (!neighbour) {
        messages.push("alreadyAtEdge");
        break;
      }
      await prisma.programSession.update({
        where: { id: current.id },
        data: { orderInWeek: neighbour.orderInWeek },
      });
      await prisma.programSession.update({
        where: { id: neighbour.id },
        data: { orderInWeek: current.orderInWeek },
      });
      messages.push("sessionMoved");
      break;
    }

    case "sessionDelete": {
      await prisma.programSession.delete({ where: { id: op.id } });
      messages.push("sessionDeleted");
      break;
    }

    case "sessionDuplicate": {
      const source = await prisma.programSession.findUnique({
        where: { id: op.id },
        include: { blocks: { orderBy: { sortOrder: "asc" } } },
      });
      if (!source) break;
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
          slug: await uniqueSessionSlug(`${source.slug}-copie`),
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
      messages.push("sessionDuplicated");
      break;
    }

    case "sessionMove": {
      const target = Number(formData.get(`session_${op.id}_moveTo`));
      if (Number.isNaN(target)) {
        messages.push("noTargetWeek");
        break;
      }
      const last = await prisma.programSession.findFirst({
        where: { weekId: target },
        orderBy: { orderInWeek: "desc" },
        select: { orderInWeek: true },
      });
      await prisma.programSession.update({
        where: { id: op.id },
        data: { weekId: target, orderInWeek: (last?.orderInWeek ?? -1) + 1 },
      });
      messages.push("sessionMovedToWeek");
      break;
    }

    case "sessionPublishNow": {
      await prisma.programSession.update({
        where: { id: op.id },
        data: { status: "PUBLISHED", publishAt: new Date() },
      });
      messages.push("sessionPublished");
      break;
    }

    case "sessionLock": {
      await prisma.programSession.update({
        where: { id: op.id },
        data: { status: "LOCKED" },
      });
      messages.push("sessionLocked");
      break;
    }

    case "sessionUnlock": {
      const s = await prisma.programSession.findUnique({ where: { id: op.id } });
      if (!s) break;
      // On recalcule le statut à partir de la date : l'admin n'a pas à
      // réconcilier statut et date à la main.
      const future = s.publishAt && s.publishAt.getTime() > Date.now();
      await prisma.programSession.update({
        where: { id: op.id },
        data: { status: future ? "SCHEDULED" : "PUBLISHED" },
      });
      messages.push("sessionUnlocked");
      break;
    }

    case "none":
      break;
  }

  revalidatePath("/", "layout");
  redirect({
    href: {
      pathname: "/admin/programs/[id]",
      params: { id: String(programId) },
      query: { msg: messages.join(",") },
    },
    locale,
  });
}

async function uniqueProgramSlugFor(base: string, excludeId: number) {
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

// ─────────────────────────────────────────────
// Page d'une séance : réglages + blocs de contenu, un seul enregistrement
// ─────────────────────────────────────────────

type BlockOp =
  | { kind: "none" }
  | { kind: "blockAdd"; type: ContentBlockType }
  | { kind: "blockUp" | "blockDown" | "blockDelete"; id: number };

function parseBlockOp(raw: string | null): BlockOp {
  if (!raw) return { kind: "none" };
  const [kind, rest] = raw.split(":");
  if (kind === "blockAdd") {
    const types: ContentBlockType[] = ["VIDEO", "TEXT", "PDF", "IMAGE", "LINK"];
    return types.includes(rest as ContentBlockType)
      ? { kind: "blockAdd", type: rest as ContentBlockType }
      : { kind: "none" };
  }
  const id = Number(rest);
  if (Number.isNaN(id)) return { kind: "none" };
  if (kind === "blockUp" || kind === "blockDown" || kind === "blockDelete") {
    return { kind, id };
  }
  return { kind: "none" };
}

export async function saveSessionPage(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  await requireEditor(locale);

  const sessionId = Number(formData.get("sessionId"));
  const programId = Number(formData.get("programId"));
  if (Number.isNaN(sessionId) || Number.isNaN(programId)) return;

  const str = (n: string) => {
    const v = String(formData.get(n) ?? "").trim();
    return v || null;
  };
  const num = (n: string) => {
    const v = String(formData.get(n) ?? "").trim();
    if (!v) return null;
    const x = Number(v);
    return Number.isNaN(x) ? null : x;
  };
  const on = (n: string) => formData.get(n) === "on";

  const messages: string[] = [];
  let newBlockId: number | null = null;
  const op = parseBlockOp(str("op"));

  const session = await prisma.programSession.findUnique({
    where: { id: sessionId },
    include: { blocks: { orderBy: { sortOrder: "asc" } } },
  });
  if (!session) return;

  // ── 1. Les réglages de la séance ────────────────────────────
  const title = str("title");
  if (!title) {
    return redirect({
      href: {
        pathname: "/admin/programs/[id]/sessions/[sessionId]",
        params: { id: String(programId), sessionId: String(sessionId) },
        query: { msg: "titleRequired" },
      },
      locale,
    });
  }
  const weekId = num("weekId") ?? session.weekId;
  await prisma.programSession.update({
    where: { id: sessionId },
    data: {
      title,
      description: str("description"),
      instructor: str("instructor"),
      durationMin: num("durationMin"),
      weekId,
      publishAt: fromDateTimeInputs(str("publishDate"), str("publishTime")),
      status: (str("status") as SessionStatus | null) ?? session.status,
      isMandatory: on("isMandatory"),
    },
  });

  // ── 2. Tous les blocs affichés ──────────────────────────────
  for (const b of session.blocks) {
    if (formData.get(`block_${b.id}_present`) === null) continue;
    await prisma.contentBlock.update({
      where: { id: b.id },
      data: {
        title: str(`block_${b.id}_title`),
        isSupplementary: on(`block_${b.id}_isSupplementary`),
        videoUrl: b.type === "VIDEO" ? str(`block_${b.id}_videoUrl`) : b.videoUrl,
        videoTitle: b.type === "VIDEO" ? str(`block_${b.id}_videoTitle`) : b.videoTitle,
        videoInstructor:
          b.type === "VIDEO" ? str(`block_${b.id}_videoInstructor`) : b.videoInstructor,
        videoDurationMin:
          b.type === "VIDEO" ? num(`block_${b.id}_videoDurationMin`) : b.videoDurationMin,
        textBody: b.type === "TEXT" ? str(`block_${b.id}_textBody`) : b.textBody,
        linkUrl: b.type === "LINK" ? str(`block_${b.id}_linkUrl`) : b.linkUrl,
        linkLabel: b.type === "LINK" ? str(`block_${b.id}_linkLabel`) : b.linkLabel,
        linkKind:
          b.type === "LINK"
            ? ((str(`block_${b.id}_linkKind`) as LinkKind | null) ?? b.linkKind)
            : b.linkKind,
      },
    });

    // Fichier de remplacement éventuel pour ce bloc
    const file = formData.get(`block_${b.id}_file`);
    if (file instanceof File && file.size > 0 && (b.type === "PDF" || b.type === "IMAGE")) {
      try {
        const media =
          b.type === "PDF"
            ? await prisma.mediaFile.create({
                data: { type: "PDF", url: (await uploadDocument(file)).url },
              })
            : await (async () => {
                const img = await uploadImage(file);
                return prisma.mediaFile.create({
                  data: {
                    type: "IMAGE",
                    url: img.url,
                    width: img.width,
                    height: img.height,
                  },
                });
              })();
        await prisma.contentBlock.update({
          where: { id: b.id },
          data: { mediaFileId: media.id },
        });
      } catch (e) {
        messages.push(
          e instanceof CloudinaryNotConfiguredError ? "uploadConfig" : "uploadFailed",
        );
      }
    }
  }
  messages.push("saved");

  // ── 3. L'opération demandée ─────────────────────────────────
  switch (op.kind) {
    case "blockAdd": {
      const last = await prisma.contentBlock.findFirst({
        where: { sessionId },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
      const created = await prisma.contentBlock.create({
        data: {
          sessionId,
          type: op.type,
          sortOrder: (last?.sortOrder ?? -1) + 1,
        },
      });
      newBlockId = created.id;
      messages.push("blockAdded");
      break;
    }
    case "blockUp":
    case "blockDown": {
      const current = session.blocks.find((b) => b.id === op.id);
      if (!current) break;
      const dir = op.kind === "blockUp" ? -1 : 1;
      const neighbour = await prisma.contentBlock.findFirst({
        where: {
          sessionId,
          sortOrder: dir === -1 ? { lt: current.sortOrder } : { gt: current.sortOrder },
        },
        orderBy: { sortOrder: dir === -1 ? "desc" : "asc" },
      });
      if (!neighbour) {
        messages.push("alreadyAtEdge");
        break;
      }
      await prisma.contentBlock.update({
        where: { id: current.id },
        data: { sortOrder: neighbour.sortOrder },
      });
      await prisma.contentBlock.update({
        where: { id: neighbour.id },
        data: { sortOrder: current.sortOrder },
      });
      messages.push("blockMoved");
      break;
    }
    case "blockDelete": {
      await prisma.contentBlock.delete({ where: { id: op.id } });
      messages.push("blockDeleted");
      break;
    }
    case "none":
      break;
  }

  revalidatePath("/", "layout");
  redirect({
    href: {
      pathname: "/admin/programs/[id]/sessions/[sessionId]",
      params: { id: String(programId), sessionId: String(sessionId) },
      query: {
        msg: messages.join(","),
        ...(newBlockId ? { new: String(newBlockId) } : {}),
      },
    },
    locale,
  });
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEditor } from "@/lib/authz";
import { fromDateTimeInputs } from "@/lib/lms";
import { redirect } from "@/i18n/navigation";

/**
 * Page « annonces » d'un programme : un seul formulaire, une seule action.
 *
 * Même principe que le planning (voir `lms-planning.ts`) : tout ce qui est à
 * l'écran est enregistré à chaque envoi, puis l'opération demandée par le
 * bouton pressé s'applique. Ajouter ou supprimer une annonce ne fait donc
 * jamais perdre ce qui vient d'être tapé ailleurs sur la page.
 */

type Op = { kind: "none" } | { kind: "add" } | { kind: "delete"; id: number };

function parseOp(raw: string | null): Op {
  if (!raw) return { kind: "none" };
  const [kind, rest] = raw.split(":");
  if (kind === "add") return { kind: "add" };
  if (kind === "delete") {
    const id = Number(rest);
    return Number.isInteger(id) && id > 0 ? { kind: "delete", id } : { kind: "none" };
  }
  return { kind: "none" };
}

export async function saveAnnouncements(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  await requireEditor(locale);

  const programId = Number(formData.get("programId"));
  if (!Number.isInteger(programId) || programId <= 0) return;

  const messages: string[] = [];
  const op = parseOp(String(formData.get("op") ?? "") || null);

  const program = await prisma.program.findUnique({
    where: { id: programId },
    select: { id: true, announcements: { select: { id: true } } },
  });
  if (!program) return;

  // ── 1. Enregistrer les annonces affichées ───────────────────
  for (const a of program.announcements) {
    // Absente du formulaire : elle n'était pas à l'écran (envoi partiel).
    // On ne l'efface surtout pas.
    if (formData.get(`ann_${a.id}_present`) === null) continue;

    const title = String(formData.get(`ann_${a.id}_title`) ?? "").trim();
    const body = String(formData.get(`ann_${a.id}_body`) ?? "").trim();
    const publishAt = fromDateTimeInputs(
      String(formData.get(`ann_${a.id}_date`) ?? "") || null,
      String(formData.get(`ann_${a.id}_time`) ?? "") || null,
    );

    await prisma.announcement.update({
      where: { id: a.id },
      data: {
        title: title || "—",
        body,
        isPinned: formData.get(`ann_${a.id}_pinned`) !== null,
        ...(publishAt ? { publishAt } : {}),
      },
    });
  }
  messages.push("saved");

  // ── 2. Appliquer l'opération du bouton pressé ───────────────
  switch (op.kind) {
    case "add": {
      await prisma.announcement.create({
        data: { programId, title: "", body: "" },
      });
      messages.push("announcementAdded");
      break;
    }
    case "delete": {
      await prisma.announcement.deleteMany({
        // `deleteMany` + programId : on ne peut pas supprimer l'annonce
        // d'un autre programme en falsifiant l'identifiant.
        where: { id: op.id, programId },
      });
      messages.push("announcementDeleted");
      break;
    }
  }

  revalidatePath("/", "layout");
  redirect({
    href: {
      pathname: "/admin/programs/[id]/announcements",
      params: { id: String(programId) },
      query: { msg: messages.join(",") },
    },
    locale,
  });
}

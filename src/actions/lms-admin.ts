"use server";

import { revalidatePath } from "next/cache";
import type { ProgramStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireEditor } from "@/lib/authz";
import { slugify } from "@/lib/slug";
import { CloudinaryNotConfiguredError, uploadImage } from "@/lib/cloudinary";
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

/**
 * Lit un identifiant numerique depuis un formulaire.
 *
 * Attention au piege corrige le 2026-09-05 : `Number(null)` vaut **0**, pas
 * NaN. Un simple `Number.isNaN(...)` ne rattrapait donc pas un champ absent,
 * et l'action partait avec l'identifiant 0 — ce qui provoquait une erreur 500
 * au lieu d'un abandon propre.
 */
function idField(formData: FormData, name: string): number | null {
  const raw = formData.get(name);
  if (raw === null) return null;
  const n = Number(String(raw).trim());
  return Number.isFinite(n) && n > 0 ? n : null;
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
  // On distingue « service non configuré » d'un échec ponctuel : le premier
  // appelle une action de Khaled (variables Vercel), le second non.
  let uploadError: string | null = null;
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
    } catch (e) {
      uploadError = e instanceof CloudinaryNotConfiguredError ? "config" : "1";
    }
  }

  refresh();
  return backToProgram(
    locale,
    program.id,
    uploadError ? { uploadError } : { saved: "1" },
  );
}

export async function deleteProgram(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  await requireEditor(locale);
  const id = idField(formData, "id");
  if (id === null) return;

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

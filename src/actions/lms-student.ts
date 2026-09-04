"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { isSessionOpen } from "@/lib/lms";
import { redirect } from "@/i18n/navigation";

/** Séance + son programme, avec l'inscription éventuelle de l'utilisateur. */
async function loadSessionContext(sessionId: number, userId: string) {
  const session = await prisma.programSession.findUnique({
    where: { id: sessionId },
    include: { week: { select: { opensAt: true, programId: true } } },
  });
  if (!session) return null;
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_programId: { userId, programId: session.week.programId } },
    select: { status: true },
  });
  return { session, enrollment };
}

export async function enrollInProgram(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  const auth = await requireUser(locale);
  const userId = auth.user.id;
  const programId = Number(formData.get("programId"));
  if (Number.isNaN(programId) || !userId) return;

  const program = await prisma.program.findUnique({
    where: { id: programId },
    select: { status: true },
  });
  if (!program || program.status !== "ACTIVE") return;

  // upsert : réactive une inscription abandonnée au lieu d'échouer sur l'unicité.
  await prisma.enrollment.upsert({
    where: { userId_programId: { userId, programId } },
    create: { userId, programId },
    update: { status: "ACTIVE" },
  });

  revalidatePath("/", "layout");
  redirect({ href: "/learn/dashboard", locale });
}

export async function markSessionComplete(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  const auth = await requireUser(locale);
  const userId = auth.user.id;
  const sessionId = Number(formData.get("sessionId"));
  if (Number.isNaN(sessionId) || !userId) return;

  const ctx = await loadSessionContext(sessionId, userId);
  if (!ctx) return;
  // On revérifie côté serveur : inscrit ET séance réellement ouverte.
  // Sans ça, un formulaire forgé permettrait de valider une séance verrouillée.
  if (!ctx.enrollment || ctx.enrollment.status === "DROPPED") return;
  if (!isSessionOpen(ctx.session, ctx.session.week)) return;

  await prisma.sessionProgress.upsert({
    where: { userId_sessionId: { userId, sessionId } },
    create: { userId, sessionId },
    update: {},
  });

  revalidatePath("/", "layout");
}

export async function unmarkSessionComplete(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  const auth = await requireUser(locale);
  const userId = auth.user.id;
  const sessionId = Number(formData.get("sessionId"));
  if (Number.isNaN(sessionId) || !userId) return;

  await prisma.sessionProgress.deleteMany({ where: { userId, sessionId } });
  revalidatePath("/", "layout");
}

export async function saveNote(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  const auth = await requireUser(locale);
  const userId = auth.user.id;
  const sessionId = Number(formData.get("sessionId"));
  const idRaw = String(formData.get("id") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (Number.isNaN(sessionId) || !userId) return;

  if (idRaw) {
    const id = Number(idRaw);
    if (Number.isNaN(id)) return;
    // where composé : personne ne peut modifier la note d'un autre.
    if (!body) {
      await prisma.personalNote.deleteMany({ where: { id, userId } });
    } else {
      await prisma.personalNote.updateMany({
        where: { id, userId },
        data: { body },
      });
    }
  } else if (body) {
    const ctx = await loadSessionContext(sessionId, userId);
    if (!ctx?.enrollment || ctx.enrollment.status === "DROPPED") return;
    await prisma.personalNote.create({ data: { userId, sessionId, body } });
  }

  revalidatePath("/", "layout");
}

export async function deleteNote(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  const auth = await requireUser(locale);
  const userId = auth.user.id;
  const id = Number(formData.get("id"));
  if (Number.isNaN(id) || !userId) return;

  await prisma.personalNote.deleteMany({ where: { id, userId } });
  revalidatePath("/", "layout");
}

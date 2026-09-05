"use server";

import { revalidatePath } from "next/cache";
import type { QuestionKind, SessionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireEditor, requireUser } from "@/lib/authz";
import { fromDateTimeInputs, isExamOpen } from "@/lib/lms";
import { redirect } from "@/i18n/navigation";

/**
 * Examen d'une semaine : côté administration puis côté élève.
 *
 * Même principe qu'ailleurs dans ce back-office : **un seul formulaire, une
 * seule action**. Tout ce qui est à l'écran est enregistré à chaque envoi, puis
 * l'opération du bouton pressé s'applique. Ajouter une question ne fait donc
 * jamais perdre les réponses déjà tapées dans les autres.
 */

// ─────────────────────────────────────────────
// Administration
// ─────────────────────────────────────────────

type Op =
  | { kind: "none" }
  | { kind: "examCreate" }
  | { kind: "questionAdd"; questionKind: QuestionKind }
  | { kind: "questionUp" | "questionDown" | "questionDelete" | "choiceAdd"; id: number }
  | { kind: "choiceDelete"; id: number };

function parseOp(raw: string | null): Op {
  if (!raw) return { kind: "none" };
  const [kind, rest] = raw.split(":");
  if (kind === "examCreate") return { kind: "examCreate" };
  if (kind === "questionAdd") {
    const k = rest as QuestionKind;
    return ["SINGLE", "MULTIPLE", "TRUE_FALSE"].includes(k)
      ? { kind: "questionAdd", questionKind: k }
      : { kind: "none" };
  }
  const id = Number(rest);
  if (!Number.isInteger(id) || id <= 0) return { kind: "none" };
  switch (kind) {
    case "questionUp":
    case "questionDown":
    case "questionDelete":
    case "choiceAdd":
      return { kind, id };
    case "choiceDelete":
      return { kind: "choiceDelete", id };
    default:
      return { kind: "none" };
  }
}

export async function saveExamPage(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  await requireEditor(locale);

  const programId = Number(formData.get("programId"));
  const weekId = Number(formData.get("weekId"));
  if (!Number.isInteger(programId) || !Number.isInteger(weekId)) return;

  const str = (n: string) => {
    const v = String(formData.get(n) ?? "").trim();
    return v || null;
  };
  const num = (n: string, fallback: number) => {
    const v = Number(String(formData.get(n) ?? "").trim());
    return Number.isFinite(v) ? v : fallback;
  };

  const messages: string[] = [];
  const op = parseOp(str("op"));
  const back = {
    pathname: "/admin/programs/[id]/exam/[weekId]" as const,
    params: { id: String(programId), weekId: String(weekId) },
  };

  const week = await prisma.programWeek.findUnique({
    where: { id: weekId },
    include: { exam: { include: { questions: { include: { choices: true } } } } },
  });
  if (!week || week.programId !== programId) return;

  // ── Créer l'examen s'il n'existe pas encore ─────────────────
  if (!week.exam) {
    if (op.kind === "examCreate") {
      await prisma.exam.create({
        data: { weekId, title: str("title") ?? "" },
      });
      messages.push("examCreated");
    }
    revalidatePath("/", "layout");
    return redirect({
      href: { ...back, query: { msg: messages.join(",") } },
      locale,
    });
  }

  const exam = week.exam;

  // ── 1. Réglages de l'examen ─────────────────────────────────
  await prisma.exam.update({
    where: { id: exam.id },
    data: {
      title: str("title") ?? exam.title,
      description: str("description"),
      // Bornes volontaires : un seuil hors de 0–100 n'a pas de sens, et
      // « 0 essai » signifierait un examen impassable — on lit 0 comme illimité.
      passScore: Math.min(100, Math.max(0, num("passScore", exam.passScore))),
      timeLimitMin: str("timeLimitMin") ? Math.max(1, num("timeLimitMin", 0)) : null,
      maxAttempts: Math.max(0, num("maxAttempts", exam.maxAttempts)),
      showAnswers: formData.get("showAnswers") !== null,
      status: (str("status") as SessionStatus | null) ?? exam.status,
      opensAt: fromDateTimeInputs(str("opensDate"), str("opensTime")),
      closesAt: fromDateTimeInputs(str("closesDate"), str("closesTime")),
    },
  });

  // ── 2. Questions et propositions affichées ──────────────────
  for (const q of exam.questions) {
    // Absente du formulaire : envoi partiel, on ne touche à rien.
    if (formData.get(`q_${q.id}_present`) === null) continue;

    await prisma.examQuestion.update({
      where: { id: q.id },
      data: {
        text: String(formData.get(`q_${q.id}_text`) ?? "").trim(),
        explanation: str(`q_${q.id}_explanation`),
        points: Math.max(1, num(`q_${q.id}_points`, q.points)),
      },
    });

    for (const c of q.choices) {
      if (formData.get(`c_${c.id}_present`) === null) continue;
      await prisma.examChoice.update({
        where: { id: c.id },
        data: {
          text: String(formData.get(`c_${c.id}_text`) ?? "").trim(),
          isCorrect:
            q.kind === "MULTIPLE"
              ? formData.get(`c_${c.id}_correct`) !== null
              : // Choix unique et vrai/faux : une seule bonne réponse, portée
                // par un bouton radio commun à la question.
                String(formData.get(`q_${q.id}_correct`) ?? "") === String(c.id),
        },
      });
    }
  }
  messages.push("saved");

  // ── 3. Opération du bouton pressé ───────────────────────────
  switch (op.kind) {
    case "questionAdd": {
      const last = await prisma.examQuestion.findFirst({
        where: { examId: exam.id },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
      const created = await prisma.examQuestion.create({
        data: {
          examId: exam.id,
          kind: op.questionKind,
          text: "",
          sortOrder: (last?.sortOrder ?? -1) + 1,
        },
      });
      // Vrai/faux : les deux propositions sont connues d'avance, on évite à
      // l'administrateur de les retaper à chaque question.
      const labels =
        op.questionKind === "TRUE_FALSE" ? ["صحيح", "خطأ"] : ["", "", ""];
      await prisma.examChoice.createMany({
        data: labels.map((text, i) => ({
          questionId: created.id,
          text,
          sortOrder: i,
          isCorrect: false,
        })),
      });
      messages.push("questionAdded");
      break;
    }

    case "questionUp":
    case "questionDown": {
      const current = await prisma.examQuestion.findUnique({ where: { id: op.id } });
      if (!current || current.examId !== exam.id) break;
      const dir = op.kind === "questionUp" ? -1 : 1;
      const neighbour = await prisma.examQuestion.findFirst({
        where: {
          examId: exam.id,
          sortOrder:
            dir === -1 ? { lt: current.sortOrder } : { gt: current.sortOrder },
        },
        orderBy: { sortOrder: dir === -1 ? "desc" : "asc" },
      });
      if (!neighbour) {
        messages.push("alreadyAtEdge");
        break;
      }
      await prisma.examQuestion.update({
        where: { id: current.id },
        data: { sortOrder: neighbour.sortOrder },
      });
      await prisma.examQuestion.update({
        where: { id: neighbour.id },
        data: { sortOrder: current.sortOrder },
      });
      messages.push("questionMoved");
      break;
    }

    case "questionDelete": {
      await prisma.examQuestion.deleteMany({ where: { id: op.id, examId: exam.id } });
      messages.push("questionDeleted");
      break;
    }

    case "choiceAdd": {
      const q = exam.questions.find((x) => x.id === op.id);
      if (!q) break;
      const last = Math.max(-1, ...q.choices.map((c) => c.sortOrder));
      await prisma.examChoice.create({
        data: { questionId: q.id, text: "", sortOrder: last + 1 },
      });
      messages.push("choiceAdded");
      break;
    }

    case "choiceDelete": {
      const owner = exam.questions.find((q) =>
        q.choices.some((c) => c.id === op.id),
      );
      if (!owner) break;
      // Deux propositions au minimum : une question à une seule proposition
      // n'a plus rien d'une question.
      if (owner.choices.length <= 2) {
        messages.push("choiceMinimum");
        break;
      }
      await prisma.examChoice.delete({ where: { id: op.id } });
      messages.push("choiceDeleted");
      break;
    }
  }

  revalidatePath("/", "layout");
  redirect({ href: { ...back, query: { msg: messages.join(",") } }, locale });
}

// ─────────────────────────────────────────────
// Passage par l'élève
// ─────────────────────────────────────────────

export async function submitExam(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  const auth = await requireUser(locale);
  const userId = auth.user.id;

  const weekId = Number(formData.get("weekId"));
  if (!Number.isInteger(weekId)) return;

  const week = await prisma.programWeek.findUnique({
    where: { id: weekId },
    include: {
      exam: { include: { questions: { include: { choices: true } } } },
      program: { select: { id: true } },
    },
  });
  const exam = week?.exam;
  if (!week || !exam) return;

  const back = {
    pathname: "/learn/exam/[weekId]" as const,
    params: { weekId: String(weekId) },
  };
  const fail = (msg: string) =>
    redirect({ href: { ...back, query: { msg } }, locale });

  // Contrôles refaits ici, jamais seulement dans la page : sans cela, un envoi
  // direct contournerait la fermeture de l'examen ou la limite d'essais.
  const enrolled = await prisma.enrollment.findUnique({
    where: { userId_programId: { userId, programId: week.programId } },
    select: { id: true },
  });
  if (!enrolled) return fail("notEnrolled");
  if (!isExamOpen(exam, week)) return fail("examClosed");

  const previous = await prisma.examAttempt.count({
    where: { examId: exam.id, userId, submittedAt: { not: null } },
  });
  if (exam.maxAttempts > 0 && previous >= exam.maxAttempts) {
    return fail("noAttemptsLeft");
  }

  // ── Correction ──────────────────────────────────────────────
  let earned = 0;
  let possible = 0;
  const answers: { questionId: number; choiceIds: number[]; isCorrect: boolean }[] = [];

  for (const q of exam.questions) {
    possible += q.points;
    const raw = formData.getAll(`answer_${q.id}`).map((v) => Number(v));
    const picked = raw.filter(
      (id) => Number.isInteger(id) && q.choices.some((c) => c.id === id),
    );
    const expected = q.choices.filter((c) => c.isCorrect).map((c) => c.id);

    // Correct = exactement l'ensemble attendu. Une réponse partielle sur une
    // question à choix multiples ne rapporte rien : c'est la règle la plus
    // simple à expliquer, et la seule qui ne récompense pas le fait de tout cocher.
    const isCorrect =
      expected.length > 0 &&
      picked.length === expected.length &&
      expected.every((id) => picked.includes(id));

    if (isCorrect) earned += q.points;
    answers.push({ questionId: q.id, choiceIds: picked, isCorrect });
  }

  const score = possible === 0 ? 0 : Math.round((earned / possible) * 100);
  const passed = score >= exam.passScore;

  const attempt = await prisma.examAttempt.create({
    data: { examId: exam.id, userId, submittedAt: new Date(), score, passed },
  });
  if (answers.length > 0) {
    await prisma.examAnswer.createMany({
      data: answers.map((a) => ({ ...a, attemptId: attempt.id })),
    });
  }

  if (passed) await issueCertificateIfEarned(userId, week.programId, score);

  revalidatePath("/", "layout");
  redirect({
    href: { ...back, query: { attempt: String(attempt.id) } },
    locale,
  });
}

/** Code public d'un certificat : lisible, sans caractères ambigus (0/O, 1/I). */
function certificateCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 8; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `MGH-${new Date().getFullYear()}-${suffix}`;
}

/**
 * Délivre le certificat si l'élève a tout terminé ET réussi l'examen.
 * Sans effet s'il en a déjà un : le certificat ne se redélivre jamais.
 */
export async function issueCertificateIfEarned(
  userId: string,
  programId: number,
  score: number | null,
) {
  const existing = await prisma.certificate.findUnique({
    where: { userId_programId: { userId, programId } },
    select: { id: true },
  });
  if (existing) return;

  const mandatory = await prisma.programSession.findMany({
    where: {
      week: { programId },
      isMandatory: true,
      status: { in: ["SCHEDULED", "PUBLISHED"] },
    },
    select: { id: true },
  });
  if (mandatory.length === 0) return;

  const done = await prisma.sessionProgress.count({
    where: { userId, sessionId: { in: mandatory.map((s) => s.id) } },
  });
  if (done < mandatory.length) return;

  await prisma.certificate.create({
    data: { code: certificateCode(), userId, programId, score },
  });
  await prisma.enrollment.updateMany({
    where: { userId, programId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
}

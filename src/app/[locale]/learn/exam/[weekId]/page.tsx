import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Award, CheckCircle2, Clock, Lock, RotateCcw, XCircle } from "lucide-react";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { examOpensAt, examState, fmtSessionDateTime } from "@/lib/lms";
import Markdown from "@/components/lms/markdown";
import ExamTimer from "@/components/lms/exam-timer";
import { submitExam } from "@/actions/lms-exam";
import { Link } from "@/i18n/navigation";

const FORM_ID = "exam";

const MSG_KEYS: Record<string, string> = {
  notEnrolled: "examNotEnrolled",
  examClosed: "examClosedNow",
  noAttemptsLeft: "examNoAttemptsLeft",
};

export default async function StudentExamPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; weekId: string }>;
  searchParams: Promise<{ msg?: string; attempt?: string; retry?: string }>;
}) {
  const { locale, weekId } = await params;
  setRequestLocale(locale);
  const auth = await requireUser(locale);
  const t = await getTranslations("lms");
  const sp = await searchParams;

  const userId = auth.user.id;
  const wid = Number(weekId);
  if (!Number.isInteger(wid)) notFound();

  const week = await prisma.programWeek.findUnique({
    where: { id: wid },
    include: {
      program: { select: { id: true, slug: true, title: true } },
      exam: {
        include: {
          questions: {
            orderBy: { sortOrder: "asc" },
            include: { choices: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
  });
  const exam = week?.exam;
  // Un examen en brouillon n'existe pas pour l'élève.
  if (!week || !exam || exam.status === "DRAFT") notFound();

  const enrolled = await prisma.enrollment.findUnique({
    where: { userId_programId: { userId, programId: week.programId } },
    select: { id: true },
  });
  if (!enrolled) notFound();

  const attempts = await prisma.examAttempt.findMany({
    where: { examId: exam.id, userId, submittedAt: { not: null } },
    orderBy: { submittedAt: "desc" },
    include: { answers: true },
  });
  const state = examState(exam, week, attempts.length);
  const best = attempts.reduce<number | null>(
    (acc, a) => (a.score !== null && (acc === null || a.score > acc) ? a.score : acc),
    null,
  );

  // Copie à afficher : celle qu'on vient d'envoyer, sinon la plus récente.
  const shown =
    attempts.find((a) => String(a.id) === sp.attempt) ?? attempts[0] ?? null;
  const pickedByQuestion = new Map<number, number[]>(
    shown?.answers.map((a) => [a.questionId, a.choiceIds]) ?? [],
  );

  const certificate = await prisma.certificate.findUnique({
    where: { userId_programId: { userId, programId: week.programId } },
    select: { code: true },
  });

  const retrying = sp.retry === "1";
  const card = "rounded-xl border border-ligne bg-white p-5";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs text-mutedink">
        {week.program.title} — {week.title ?? t("weekLabel", { n: week.weekNumber })}
      </p>
      <h1 className="mb-2 mt-1 text-2xl font-medium sm:text-3xl">{exam.title}</h1>
      {exam.description ? (
        <div className="mb-4 text-sm leading-relaxed text-mutedink">
          <Markdown source={exam.description} />
        </div>
      ) : null}

      {sp.msg && MSG_KEYS[sp.msg] ? (
        <p className="mb-4 rounded-lg bg-terracottal px-4 py-2.5 text-sm text-terracotta">
          {t(MSG_KEYS[sp.msg])}
        </p>
      ) : null}

      {/* Ce que l'élève doit savoir avant de commencer */}
      <div className="mb-6 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-sable2 px-2.5 py-1 text-mutedink">
          {t("examPassScore", { n: exam.passScore })}
        </span>
        <span className="rounded-full bg-sable2 px-2.5 py-1 text-mutedink">
          {t("examQuestionCount", { n: exam.questions.length })}
        </span>
        {exam.timeLimitMin ? (
          <span className="flex items-center gap-1 rounded-full bg-sable2 px-2.5 py-1 text-mutedink">
            <Clock className="h-3 w-3" aria-hidden />
            {t("examTimeLimit", { n: exam.timeLimitMin })}
          </span>
        ) : null}
        <span className="rounded-full bg-sable2 px-2.5 py-1 text-mutedink">
          {exam.maxAttempts === 0
            ? t("examAttemptsUnlimited")
            : t("examAttemptsLeft", {
                n: Math.max(0, exam.maxAttempts - attempts.length),
              })}
        </span>
      </div>

      {/* ── Dernier résultat ─────────────────────────── */}
      {shown && shown.score !== null ? (
        <section
          className={`mb-6 rounded-xl border p-5 ${
            shown.passed ? "border-oasis bg-oasisl" : "border-terracotta bg-terracottal"
          }`}
        >
          <h2 className="flex items-center gap-2 text-lg font-medium">
            {shown.passed ? (
              <CheckCircle2 className="h-5 w-5 text-oasis" aria-hidden />
            ) : (
              <XCircle className="h-5 w-5 text-terracotta" aria-hidden />
            )}
            {shown.passed ? t("examPassed") : t("examFailed")}
          </h2>
          <p className="mt-1 text-3xl font-medium" dir="ltr">
            {shown.score}%
          </p>
          {best !== null && attempts.length > 1 ? (
            <p className="mt-1 text-sm text-mutedink" dir="ltr">
              {t("examBestScore", { n: best })}
            </p>
          ) : null}

          {certificate ? (
            <Link
              href={{
                pathname: "/learn/certificate/[code]",
                params: { code: certificate.code },
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-majorelle px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <Award className="h-4 w-4" aria-hidden />
              {t("seeCertificate")}
            </Link>
          ) : null}
        </section>
      ) : null}

      {/* ── Correction ───────────────────────────────── */}
      {/* Jamais pendant une nouvelle tentative : sinon l'élève n'aurait qu'à
          recopier les bonnes réponses affichées juste au-dessus. */}
      {shown && exam.showAnswers && !retrying ? (
        <section className="mb-6 space-y-3">
          <h2 className="font-medium">{t("examCorrection")}</h2>
          {exam.questions.map((q, i) => {
            const picked = pickedByQuestion.get(q.id) ?? [];
            const right = q.choices.filter((c) => c.isCorrect).map((c) => c.id);
            const ok =
              picked.length === right.length && right.every((id) => picked.includes(id));
            return (
              <article key={q.id} className={card}>
                <h3 className="mb-2 flex items-start gap-2 font-medium">
                  {ok ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-oasis" aria-hidden />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" aria-hidden />
                  )}
                  <span>
                    {i + 1}. {q.text}
                  </span>
                </h3>
                <ul className="space-y-1 text-sm">
                  {q.choices.map((c) => {
                    const chosen = picked.includes(c.id);
                    const cls = c.isCorrect
                      ? "text-oasis font-medium"
                      : chosen
                        ? "text-terracotta line-through"
                        : "text-mutedink";
                    return (
                      <li key={c.id} className={cls}>
                        {chosen ? "◉ " : "○ "}
                        {c.text}
                      </li>
                    );
                  })}
                </ul>
                {q.explanation ? (
                  <p className="mt-2 rounded-lg bg-sable2 px-3 py-2 text-sm text-mutedink">
                    {q.explanation}
                  </p>
                ) : null}
              </article>
            );
          })}
        </section>
      ) : null}

      {/* ── Passage ──────────────────────────────────── */}
      {/* Une fois la copie envoyée, on n'affiche plus le questionnaire vide
          sous le résultat : c'était illisible. Il faut demander une nouvelle
          tentative pour le revoir. */}
      {shown && !retrying ? (
        state === "open" ? (
          <Link
            href={{
              pathname: "/learn/exam/[weekId]",
              params: { weekId: String(week.id) },
              query: { retry: "1" },
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-majorelle px-5 py-2.5 text-sm font-medium text-majorelle transition-colors hover:bg-majorellel"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            {t("examRetry")}
          </Link>
        ) : (
          <p className={`${card} flex items-center gap-2 text-sm text-mutedink`}>
            <Lock className="h-4 w-4 shrink-0" aria-hidden />
            {state === "noAttemptsLeft" ? t("examNoAttemptsLeft") : t("examClosedNow")}
          </p>
        )
      ) : state === "open" ? (
        <form action={submitExam} id={FORM_ID} className="space-y-4">
          <input type="hidden" name="uiLocale" value={locale} />
          <input type="hidden" name="weekId" value={week.id} />
          {exam.timeLimitMin ? (
            <ExamTimer
              formId={FORM_ID}
              minutes={exam.timeLimitMin}
              label={t("examTimeRemaining")}
              expiredLabel={t("examTimeUp")}
            />
          ) : null}

          {exam.questions.length === 0 ? (
            <p className={`${card} text-center text-mutedink`}>{t("examNoQuestions")}</p>
          ) : (
            exam.questions.map((q, i) => (
              <fieldset key={q.id} className={card}>
                <legend className="mb-2 font-medium">
                  {i + 1}. {q.text}
                </legend>
                <p className="mb-2 text-xs text-mutedink">
                  {q.kind === "MULTIPLE" ? t("examPickSeveral") : t("examPickOne")}
                </p>
                <div className="space-y-2">
                  {q.choices.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-sm">
                      <input
                        type={q.kind === "MULTIPLE" ? "checkbox" : "radio"}
                        name={`answer_${q.id}`}
                        value={c.id}
                        className="h-4 w-4 shrink-0"
                      />
                      {c.text}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))
          )}

          {exam.questions.length > 0 ? (
            <button
              type="submit"
              className="w-full rounded-lg bg-majorelle px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
            >
              {t("examSubmit")}
            </button>
          ) : null}
        </form>
      ) : (
        <p className={`${card} flex items-center gap-2 text-sm text-mutedink`}>
          <Lock className="h-4 w-4 shrink-0" aria-hidden />
          {state === "notYet"
            ? t("examOpensOn", {
                date: fmtSessionDateTime(locale, examOpensAt(exam, week)),
              })
            : state === "noAttemptsLeft"
              ? t("examNoAttemptsLeft")
              : t("examClosedNow")}
        </p>
      )}

      <Link
        href={{ pathname: "/learn/programs/[slug]", params: { slug: week.program.slug } }}
        className="mt-8 inline-block text-sm text-mutedink hover:text-majorelle"
      >
        {t("backToProgram")}
      </Link>
    </div>
  );
}

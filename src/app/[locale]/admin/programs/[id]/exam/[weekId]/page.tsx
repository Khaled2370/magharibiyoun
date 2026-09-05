import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckSquare, ChevronDown, ChevronUp, CircleDot, Plus, Save, ToggleLeft } from "lucide-react";
import { requireEditor } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { toDateTimeInputs } from "@/lib/lms";
import { saveExamPage } from "@/actions/lms-exam";
import UnsavedGuard from "@/components/admin/unsaved-guard";
import { FormPending } from "@/components/admin/form-feedback";
import BackLink from "@/components/admin/safe-link";
import { getPathname } from "@/i18n/navigation";

const FORM_ID = "exam-editor";
const SESSION_STATUSES = ["DRAFT", "SCHEDULED", "PUBLISHED", "LOCKED"] as const;
const QUESTION_KINDS = [
  { kind: "SINGLE", Icon: CircleDot },
  { kind: "MULTIPLE", Icon: CheckSquare },
  { kind: "TRUE_FALSE", Icon: ToggleLeft },
] as const;

const input =
  "w-full rounded-lg border border-ligne bg-white px-3 py-2 text-sm outline-none focus:border-majorelle";
const label = "mb-1 block text-sm font-medium";
const quiet =
  "rounded-lg border border-ligne bg-white px-2.5 py-1 text-xs text-mutedink transition-colors hover:border-majorelle hover:text-majorelle disabled:opacity-40";

const MSG_KEYS: Record<string, string> = {
  saved: "msgSaved",
  examCreated: "msgExamCreated",
  questionAdded: "msgQuestionAdded",
  questionMoved: "msgQuestionMoved",
  questionDeleted: "msgQuestionDeleted",
  choiceAdded: "msgChoiceAdded",
  choiceDeleted: "msgChoiceDeleted",
  choiceMinimum: "msgChoiceMinimum",
  alreadyAtEdge: "msgAlreadyAtEdge",
};
const PROBLEMS = new Set(["choiceMinimum", "alreadyAtEdge"]);

export default async function AdminExamPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string; weekId: string }>;
  searchParams: Promise<{ msg?: string }>;
}) {
  const { locale, id, weekId } = await params;
  setRequestLocale(locale);
  await requireEditor(locale);
  const t = await getTranslations("lms");
  const sp = await searchParams;

  const programId = Number(id);
  const wid = Number(weekId);
  if (!Number.isInteger(programId) || !Number.isInteger(wid)) notFound();

  const week = await prisma.programWeek.findUnique({
    where: { id: wid },
    include: {
      program: { select: { title: true } },
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
  if (!week || week.programId !== programId) notFound();

  const exam = week.exam;
  const opens = toDateTimeInputs(exam?.opensAt);
  const closes = toDateTimeInputs(exam?.closesAt);

  const messages = (sp.msg ?? "").split(",").filter(Boolean);
  const good = messages.filter((m) => !PROBLEMS.has(m));
  const bad = messages.filter((m) => PROBLEMS.has(m));

  const header = (
    <>
      <BackLink
        href={getPathname({
          locale,
          href: { pathname: "/admin/programs/[id]", params: { id: String(programId) } },
        })}
        label={t("adminBackToProgram")}
        confirmText={t("unsavedLeaveConfirm")}
      />
      <p className="text-xs text-mutedink">
        {week.program.title} — {week.title ?? t("weekLabel", { n: week.weekNumber })}
      </p>
      <h1 className="mb-2 mt-1 text-2xl font-medium sm:text-3xl">{t("adminExam")}</h1>
    </>
  );

  // ── L'examen n'existe pas encore ──────────────────────────
  if (!exam) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        {header}
        <p className="mb-6 text-sm text-mutedink">{t("adminExamIntro")}</p>
        <form action={saveExamPage} className="rounded-xl border border-ligne bg-white p-6">
          <FormPending label={t("savingInProgress")} />
          <input type="hidden" name="uiLocale" value={locale} />
          <input type="hidden" name="programId" value={programId} />
          <input type="hidden" name="weekId" value={week.id} />
          <label className={label} htmlFor="title">
            {t("adminExamTitle")}
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={t("adminExamDefaultTitle")}
            className={input}
          />
          <button
            type="submit"
            name="op"
            value="examCreate"
            className="mt-4 flex items-center gap-2 rounded-lg bg-majorelle px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" aria-hidden />
            {t("adminCreateExam")}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {header}
      <p className="mb-6 text-sm text-mutedink">{t("adminExamIntro")}</p>

      <UnsavedGuard formId={FORM_ID} label={t("unsavedWarning")} />

      {good.length > 0 ? (
        <p className="mb-3 rounded-lg bg-oasisl px-4 py-2.5 text-sm text-oasis">
          {good.map((m) => t(MSG_KEYS[m] ?? "msgSaved")).join(" ")}
        </p>
      ) : null}
      {bad.length > 0 ? (
        <p className="mb-3 rounded-lg bg-terracottal px-4 py-2.5 text-sm text-terracotta">
          {bad.map((m) => t(MSG_KEYS[m] ?? "msgSaved")).join(" ")}
        </p>
      ) : null}

      <form action={saveExamPage} id={FORM_ID} className="space-y-8">
        <FormPending label={t("savingInProgress")} />
        <input type="hidden" name="uiLocale" value={locale} />
        <input type="hidden" name="programId" value={programId} />
        <input type="hidden" name="weekId" value={week.id} />

        {/* ── Réglages ──────────────────────────────── */}
        <section className="space-y-4 rounded-xl border border-ligne bg-white p-5">
          <h2 className="font-medium">{t("adminExamSettings")}</h2>

          <div>
            <label className={label} htmlFor="title">
              {t("adminExamTitle")}
            </label>
            <input id="title" name="title" defaultValue={exam.title} required className={input} />
          </div>
          <div>
            <label className={label} htmlFor="description">
              {t("adminExamDesc")}
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={exam.description ?? ""}
              className={input}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={label} htmlFor="passScore">
                {t("adminPassScore")}
              </label>
              <input
                id="passScore"
                name="passScore"
                type="number"
                min={0}
                max={100}
                defaultValue={exam.passScore}
                className={input}
                dir="ltr"
              />
            </div>
            <div>
              <label className={label} htmlFor="timeLimitMin">
                {t("adminTimeLimit")}
              </label>
              <input
                id="timeLimitMin"
                name="timeLimitMin"
                type="number"
                min={1}
                defaultValue={exam.timeLimitMin ?? ""}
                className={input}
                dir="ltr"
              />
              <p className="mt-1 text-xs text-mutedink">{t("adminTimeLimitHint")}</p>
            </div>
            <div>
              <label className={label} htmlFor="maxAttempts">
                {t("adminMaxAttempts")}
              </label>
              <input
                id="maxAttempts"
                name="maxAttempts"
                type="number"
                min={0}
                defaultValue={exam.maxAttempts}
                className={input}
                dir="ltr"
              />
              <p className="mt-1 text-xs text-mutedink">{t("adminMaxAttemptsHint")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="opensDate">
                {t("adminExamOpensAt")}
              </label>
              <div className="flex gap-2">
                <input
                  id="opensDate"
                  name="opensDate"
                  type="date"
                  defaultValue={opens.date}
                  className={input}
                  dir="ltr"
                />
                <input
                  name="opensTime"
                  type="time"
                  defaultValue={opens.time}
                  aria-label={t("adminPublishTime")}
                  className={input}
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <label className={label} htmlFor="closesDate">
                {t("adminExamClosesAt")}
              </label>
              <div className="flex gap-2">
                <input
                  id="closesDate"
                  name="closesDate"
                  type="date"
                  defaultValue={closes.date}
                  className={input}
                  dir="ltr"
                />
                <input
                  name="closesTime"
                  type="time"
                  defaultValue={closes.time}
                  aria-label={t("adminPublishTime")}
                  className={input}
                  dir="ltr"
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-mutedink">{t("adminTimeHint")}</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="status">
                {t("adminExamStatus")}
              </label>
              <select id="status" name="status" defaultValue={exam.status} className={input}>
                {SESSION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(`adminSessionStatus${s}`)}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-end gap-2 pb-2 text-sm font-medium">
              <input
                type="checkbox"
                name="showAnswers"
                defaultChecked={exam.showAnswers}
                className="h-4 w-4"
              />
              {t("adminShowAnswers")}
            </label>
          </div>
        </section>

        {/* ── Questions ─────────────────────────────── */}
        <section>
          <h2 className="text-xl font-medium">{t("adminQuestions")}</h2>
          <p className="mt-1 text-sm text-mutedink">{t("adminQuestionsIntro")}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-mutedink">{t("adminAddQuestion")} :</span>
            {QUESTION_KINDS.map(({ kind, Icon }) => (
              <button
                key={kind}
                type="submit"
                name="op"
                value={`questionAdd:${kind}`}
                className="flex items-center gap-1.5 rounded-lg border border-ligne bg-white px-3 py-1.5 text-sm font-medium text-mutedink transition-colors hover:border-majorelle hover:text-majorelle"
              >
                <Icon className="h-4 w-4" aria-hidden />
                {t(`adminKind${kind}`)}
              </button>
            ))}
          </div>

          {exam.questions.length === 0 ? (
            <p className="mt-4 rounded-xl border border-ligne bg-white p-6 text-center text-mutedink">
              {t("adminNoQuestions")}
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {exam.questions.map((q, i) => (
                <section key={q.id} className="rounded-xl border border-ligne bg-white p-5">
                  <input type="hidden" name={`q_${q.id}_present`} value="1" />

                  <header className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-ligne pb-2">
                    <span className="rounded-full bg-sable2 px-2.5 py-0.5 text-xs font-medium text-mutedink">
                      {t(`adminKind${q.kind}`)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <button
                        type="submit"
                        name="op"
                        value={`questionUp:${q.id}`}
                        className={quiet}
                        disabled={i === 0}
                        aria-label={t("adminMoveUp")}
                      >
                        <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button
                        type="submit"
                        name="op"
                        value={`questionDown:${q.id}`}
                        className={quiet}
                        disabled={i === exam.questions.length - 1}
                        aria-label={t("adminMoveDown")}
                      >
                        <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button
                        type="submit"
                        name="op"
                        value={`questionDelete:${q.id}`}
                        className="rounded-lg border border-terracotta px-2.5 py-1 text-xs font-medium text-terracotta transition-colors hover:bg-terracottal"
                      >
                        {t("adminDelete")}
                      </button>
                    </span>
                  </header>

                  <div className="space-y-3">
                    <div>
                      <label className={label} htmlFor={`q-${q.id}-text`}>
                        {t("adminQuestionText")}
                      </label>
                      <textarea
                        id={`q-${q.id}-text`}
                        name={`q_${q.id}_text`}
                        rows={2}
                        defaultValue={q.text}
                        className={input}
                      />
                    </div>

                    <fieldset>
                      <legend className={label}>
                        {q.kind === "MULTIPLE"
                          ? t("adminChoicesMultiple")
                          : t("adminChoicesSingle")}
                      </legend>
                      <div className="space-y-2">
                        {q.choices.map((c) => (
                          <div key={c.id} className="flex items-center gap-2">
                            <input type="hidden" name={`c_${c.id}_present`} value="1" />
                            {q.kind === "MULTIPLE" ? (
                              <input
                                type="checkbox"
                                name={`c_${c.id}_correct`}
                                defaultChecked={c.isCorrect}
                                aria-label={t("adminCorrectAnswer")}
                                className="h-4 w-4 shrink-0"
                              />
                            ) : (
                              <input
                                type="radio"
                                name={`q_${q.id}_correct`}
                                value={c.id}
                                defaultChecked={c.isCorrect}
                                aria-label={t("adminCorrectAnswer")}
                                className="h-4 w-4 shrink-0"
                              />
                            )}
                            <input
                              name={`c_${c.id}_text`}
                              defaultValue={c.text}
                              readOnly={q.kind === "TRUE_FALSE"}
                              className={`${input} ${q.kind === "TRUE_FALSE" ? "bg-sable2" : ""}`}
                            />
                            {q.kind === "TRUE_FALSE" ? null : (
                              <button
                                type="submit"
                                name="op"
                                value={`choiceDelete:${c.id}`}
                                className={quiet}
                                aria-label={t("adminDelete")}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {q.kind === "TRUE_FALSE" ? null : (
                        <button
                          type="submit"
                          name="op"
                          value={`choiceAdd:${q.id}`}
                          className={`${quiet} mt-2 flex items-center gap-1.5`}
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden />
                          {t("adminAddChoice")}
                        </button>
                      )}
                    </fieldset>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                      <div className="sm:col-span-3">
                        <label className={label} htmlFor={`q-${q.id}-explanation`}>
                          {t("adminExplanation")}
                        </label>
                        <input
                          id={`q-${q.id}-explanation`}
                          name={`q_${q.id}_explanation`}
                          defaultValue={q.explanation ?? ""}
                          className={input}
                        />
                      </div>
                      <div>
                        <label className={label} htmlFor={`q-${q.id}-points`}>
                          {t("adminPoints")}
                        </label>
                        <input
                          id={`q-${q.id}-points`}
                          name={`q_${q.id}_points`}
                          type="number"
                          min={1}
                          defaultValue={q.points}
                          className={input}
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>

        <div className="sticky bottom-0 -mx-4 border-t border-ligne bg-sable/95 px-4 py-3 backdrop-blur">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-majorelle px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
          >
            <Save className="h-5 w-5" aria-hidden />
            {t("saveAll")}
          </button>
        </div>
      </form>
    </div>
  );
}

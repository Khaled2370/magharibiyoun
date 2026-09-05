import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChevronDown, ChevronUp, Plus, Save } from "lucide-react";
import { requireEditor } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { programStructureInclude, toDateTimeInputs } from "@/lib/lms";
import { MAX_UPLOAD_BYTES } from "@/lib/cloudinary";
import { saveProgramPlanning } from "@/actions/lms-planning";
import { deleteProgram } from "@/actions/lms-admin";
import ConfirmSubmit from "@/components/lms/confirm-submit";
import FileField from "@/components/admin/file-field";
import UnsavedGuard from "@/components/admin/unsaved-guard";
import { FormPending } from "@/components/admin/form-feedback";
import { Link } from "@/i18n/navigation";

const WEEK_KINDS = ["LEARNING", "REVIEW", "EXAM"] as const;
const SESSION_STATUSES = ["DRAFT", "SCHEDULED", "PUBLISHED", "LOCKED"] as const;
const PROGRAM_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;

const FORM_ID = "planning";
const input =
  "w-full rounded-lg border border-ligne bg-white px-3 py-2 text-sm outline-none focus:border-majorelle";
const small =
  "rounded-lg border border-ligne bg-white px-2 py-1 text-sm outline-none focus:border-majorelle";
const label = "mb-1 block text-sm font-medium";
const quiet =
  "rounded-lg border border-ligne bg-white px-2.5 py-1 text-xs text-mutedink transition-colors hover:border-majorelle hover:text-majorelle disabled:opacity-40";

/** Messages renvoyés par l'action → clés de traduction, dans l'ordre reçu. */
const MSG_KEYS: Record<string, string> = {
  saved: "msgSaved",
  weeksAdded: "msgWeeksAdded",
  weekMoved: "msgWeekMoved",
  weekDeleted: "msgWeekDeleted",
  sessionAdded: "msgSessionAdded",
  sessionsAdded: "msgSessionsAdded",
  sessionMoved: "msgSessionMoved",
  sessionDeleted: "msgSessionDeleted",
  sessionDuplicated: "msgSessionDuplicated",
  sessionMovedToWeek: "msgSessionMovedToWeek",
  sessionPublished: "msgSessionPublished",
  sessionLocked: "msgSessionLocked",
  sessionUnlocked: "msgSessionUnlocked",
  alreadyAtEdge: "msgAlreadyAtEdge",
  noSessionTitle: "msgNoSessionTitle",
  noTargetWeek: "msgNoTargetWeek",
  titleRequired: "msgTitleRequired",
  uploadConfig: "msgUploadConfig",
  uploadFailed: "msgUploadFailed",
};
const PROBLEMS = new Set([
  "alreadyAtEdge",
  "noSessionTitle",
  "noTargetWeek",
  "titleRequired",
  "uploadConfig",
  "uploadFailed",
]);

export default async function AdminProgramPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ msg?: string; error?: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireEditor(locale);
  const t = await getTranslations("lms");
  const ta = await getTranslations("admin");
  const sp = await searchParams;

  const programId = Number(id);
  if (Number.isNaN(programId)) notFound();

  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: programStructureInclude,
  });
  if (!program) notFound();

  const cover = program.coverMediaId
    ? await prisma.mediaFile.findUnique({ where: { id: program.coverMediaId } })
    : null;

  const messages = (sp.msg ?? "").split(",").filter(Boolean);
  const good = messages.filter((m) => !PROBLEMS.has(m));
  const bad = messages.filter((m) => PROBLEMS.has(m));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-medium sm:text-3xl">{t("adminEditProgram")}</h1>
        <ConfirmSubmit
          action={deleteProgram}
          fields={{ id: program.id, uiLocale: locale }}
          label={t("adminDelete")}
          confirmText={t("adminConfirmDeleteProgram")}
        />
      </div>

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
      {sp.error === "enrolled" ? (
        <p className="mb-3 rounded-lg bg-terracottal px-4 py-2.5 text-sm text-terracotta">
          {t("adminCannotDeleteEnrolled")}
        </p>
      ) : null}

      {/* UN SEUL formulaire pour toute la page : chaque bouton enregistre
          d'abord la saisie, puis exécute son opération via le champ « op ». */}
      <form action={saveProgramPlanning} id={FORM_ID} className="space-y-8">
        <FormPending label={t("savingInProgress")} />
        <input type="hidden" name="uiLocale" value={locale} />
        <input type="hidden" name="programId" value={program.id} />

        {/* ── Le programme ─────────────────────────────── */}
        <section className="space-y-4 rounded-xl border border-ligne bg-white p-5">
          <div>
            <label className={label} htmlFor="title">
              {t("adminProgramTitle")}
            </label>
            <input id="title" name="title" defaultValue={program.title} required className={input} />
          </div>
          <div>
            <label className={label} htmlFor="description">
              {t("adminProgramDesc")}
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={program.description ?? ""}
              className={input}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="durationWeeks">
                {t("adminDurationWeeks")}
              </label>
              <input
                id="durationWeeks"
                name="durationWeeks"
                type="number"
                min={1}
                defaultValue={program.durationWeeks ?? ""}
                className={input}
                dir="ltr"
              />
            </div>
            <div>
              <label className={label} htmlFor="status">
                {ta("fieldStatus")}
              </label>
              <select id="status" name="status" defaultValue={program.status} className={input}>
                {PROGRAM_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(`adminStatus${s}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={label} htmlFor="cover">
              {t("adminCover")}
            </label>
            {cover?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover.url}
                alt=""
                className="mb-2 h-24 rounded-lg border border-ligne object-cover"
              />
            ) : null}
            <FileField
              name="cover"
              accept="image/jpeg,image/png,image/webp,image/gif"
              maxBytes={MAX_UPLOAD_BYTES}
              tooBigLabel={ta("fileTooBig")}
            />
          </div>
        </section>

        {/* ── Le planning ──────────────────────────────── */}
        <section>
          <h2 className="text-xl font-medium">{t("planningTitle")}</h2>
          <p className="mt-1 text-sm text-mutedink">{t("planningIntro")}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-ligne bg-white p-3">
            <input
              name="addWeeksCount"
              type="number"
              min={1}
              max={20}
              defaultValue={1}
              aria-label={t("adminWeeksToAdd")}
              className={`${small} w-16`}
              dir="ltr"
            />
            <select name="addWeeksKind" defaultValue="LEARNING" className={small}>
              {WEEK_KINDS.map((k) => (
                <option key={k} value={k}>
                  {t(`weekKind${k}`)}
                </option>
              ))}
            </select>
            <button
              type="submit"
              name="op"
              value="weekAdd"
              className="flex items-center gap-1.5 rounded-lg border border-majorelle px-3 py-1.5 text-sm font-medium text-majorelle transition-colors hover:bg-majorellel"
            >
              <Plus className="h-4 w-4" aria-hidden />
              {t("adminAddWeek")}
            </button>
          </div>

          {program.weeks.length === 0 ? (
            <p className="mt-4 rounded-xl border border-ligne bg-white p-6 text-center text-mutedink">
              {t("adminNoWeeks")}
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {program.weeks.map((week, wi) => {
                const opens = toDateTimeInputs(week.opensAt);
                return (
                  <section key={week.id} className="rounded-xl border border-ligne bg-white p-4">
                    <div className="flex flex-wrap items-end gap-2 border-b border-ligne pb-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-majorellel text-sm font-medium text-majorelle">
                        {week.weekNumber}
                      </span>
                      <input
                        name={`week_${week.id}_title`}
                        defaultValue={week.title ?? ""}
                        placeholder={t("adminWeekTitle")}
                        className={`${small} min-w-40 flex-1`}
                      />
                      <select
                        name={`week_${week.id}_kind`}
                        defaultValue={week.kind}
                        className={small}
                      >
                        {WEEK_KINDS.map((k) => (
                          <option key={k} value={k}>
                            {t(`weekKind${k}`)}
                          </option>
                        ))}
                      </select>
                      <input
                        name={`week_${week.id}_date`}
                        type="date"
                        defaultValue={opens.date}
                        aria-label={t("adminWeekOpensAt")}
                        className={small}
                        dir="ltr"
                      />
                      <input
                        name={`week_${week.id}_time`}
                        type="time"
                        defaultValue={opens.time}
                        className={small}
                        dir="ltr"
                      />
                      <button
                        type="submit"
                        name="op"
                        value={`weekUp:${week.id}`}
                        className={quiet}
                        disabled={wi === 0}
                        aria-label={t("adminMoveUp")}
                      >
                        <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button
                        type="submit"
                        name="op"
                        value={`weekDown:${week.id}`}
                        className={quiet}
                        disabled={wi === program.weeks.length - 1}
                        aria-label={t("adminMoveDown")}
                      >
                        <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button
                        type="submit"
                        name="op"
                        value={`weekDelete:${week.id}`}
                        className="rounded-lg border border-terracotta px-2.5 py-1 text-xs font-medium text-terracotta transition-colors hover:bg-terracottal"
                      >
                        {t("adminDelete")}
                      </button>
                    </div>

                    {week.sessions.length === 0 ? (
                      <p className="py-3 text-sm text-mutedink">{t("adminNoSessions")}</p>
                    ) : (
                      <ul className="space-y-2 py-3">
                        {week.sessions.map((s, si) => {
                          const pub = toDateTimeInputs(s.publishAt);
                          return (
                            <li key={s.id} className="rounded-lg border border-ligne bg-sable p-3">
                              <div className="flex flex-wrap items-end gap-2">
                                <input
                                  name={`session_${s.id}_title`}
                                  defaultValue={s.title}
                                  className={`${small} min-w-48 flex-1`}
                                />
                                <input
                                  name={`session_${s.id}_date`}
                                  type="date"
                                  defaultValue={pub.date}
                                  aria-label={t("sessionDate")}
                                  className={small}
                                  dir="ltr"
                                />
                                <input
                                  name={`session_${s.id}_time`}
                                  type="time"
                                  defaultValue={pub.time}
                                  aria-label={t("sessionTime")}
                                  className={small}
                                  dir="ltr"
                                />
                                <select
                                  name={`session_${s.id}_status`}
                                  defaultValue={s.status}
                                  className={small}
                                >
                                  {SESSION_STATUSES.map((st) => (
                                    <option key={st} value={st}>
                                      {t(`adminSessionStatus${st}`)}
                                    </option>
                                  ))}
                                </select>
                                <Link
                                  href={{
                                    pathname: "/admin/programs/[id]/sessions/[sessionId]",
                                    params: {
                                      id: String(program.id),
                                      sessionId: String(s.id),
                                    },
                                  }}
                                  className="rounded-lg border border-majorelle px-3 py-1 text-xs font-medium text-majorelle transition-colors hover:bg-majorellel"
                                >
                                  {t("openSessionEditor")}
                                </Link>
                              </div>

                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <button
                                  type="submit"
                                  name="op"
                                  value={`sessionUp:${s.id}`}
                                  className={quiet}
                                  disabled={si === 0}
                                  aria-label={t("adminMoveUp")}
                                >
                                  <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                                </button>
                                <button
                                  type="submit"
                                  name="op"
                                  value={`sessionDown:${s.id}`}
                                  className={quiet}
                                  disabled={si === week.sessions.length - 1}
                                  aria-label={t("adminMoveDown")}
                                >
                                  <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                                </button>
                                <button
                                  type="submit"
                                  name="op"
                                  value={`sessionPublishNow:${s.id}`}
                                  className={quiet}
                                >
                                  {t("adminPublishNow")}
                                </button>
                                <button
                                  type="submit"
                                  name="op"
                                  value={
                                    s.status === "LOCKED"
                                      ? `sessionUnlock:${s.id}`
                                      : `sessionLock:${s.id}`
                                  }
                                  className={quiet}
                                >
                                  {s.status === "LOCKED" ? t("adminUnlock") : t("adminLock")}
                                </button>
                                <button
                                  type="submit"
                                  name="op"
                                  value={`sessionDuplicate:${s.id}`}
                                  className={quiet}
                                >
                                  {t("adminDuplicate")}
                                </button>
                                {program.weeks.length > 1 ? (
                                  <>
                                    <select
                                      name={`session_${s.id}_moveTo`}
                                      defaultValue={week.id}
                                      aria-label={t("adminMoveToWeek")}
                                      className={`${small} py-0.5 text-xs`}
                                    >
                                      {program.weeks.map((w) => (
                                        <option key={w.id} value={w.id}>
                                          {t("weekLabel", { n: w.weekNumber })}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      type="submit"
                                      name="op"
                                      value={`sessionMove:${s.id}`}
                                      className={quiet}
                                    >
                                      {t("adminMoveToWeek")}
                                    </button>
                                  </>
                                ) : null}
                                <button
                                  type="submit"
                                  name="op"
                                  value={`sessionDelete:${s.id}`}
                                  className="rounded-lg border border-terracotta px-2.5 py-1 text-xs font-medium text-terracotta transition-colors hover:bg-terracottal"
                                >
                                  {t("adminDelete")}
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {/* Ajout de plusieurs séances d'un coup */}
                    <div className="border-t border-ligne pt-3">
                      <label className={label} htmlFor={`addSessions_${week.id}`}>
                        {t("addSessionsLabel")}
                      </label>
                      <textarea
                        id={`addSessions_${week.id}`}
                        name={`addSessions_${week.id}`}
                        rows={2}
                        placeholder={t("adminSessionTitle")}
                        className={input}
                      />
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-xs text-mutedink">{t("addSessionsHint")}</p>
                        <button
                          type="submit"
                          name="op"
                          value={`sessionAdd:${week.id}`}
                          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-majorelle px-3 py-1 text-sm font-medium text-majorelle transition-colors hover:bg-majorellel"
                        >
                          <Plus className="h-4 w-4" aria-hidden />
                          {t("adminAddSession")}
                        </button>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </section>

        {/* Barre d'enregistrement, toujours visible en bas d'écran */}
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

      <Link
        href="/admin/programs"
        className="mt-8 inline-block text-sm text-mutedink hover:text-majorelle"
      >
        {t("adminBackToPrograms")}
      </Link>
    </div>
  );
}

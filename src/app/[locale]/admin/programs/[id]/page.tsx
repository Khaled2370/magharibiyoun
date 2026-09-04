import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { requireEditor } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { fmtSessionDateTime, programStructureInclude, toDateTimeInputs } from "@/lib/lms";
import {
  addWeeks,
  deleteProgram,
  deleteSession,
  deleteWeek,
  duplicateSession,
  moveSession,
  moveSessionToWeek,
  moveWeek,
  saveSession,
  saveWeek,
  setSessionAvailability,
} from "@/actions/lms-admin";
import ProgramForm from "@/components/lms/program-form";
import ConfirmSubmit from "@/components/lms/confirm-submit";
import { Link } from "@/i18n/navigation";

const WEEK_KINDS = ["LEARNING", "REVIEW", "EXAM"] as const;

const smallInput =
  "rounded-lg border border-ligne bg-white px-2 py-1 text-sm outline-none focus:border-majorelle";
const quietBtn =
  "rounded-lg border border-ligne px-2.5 py-1 text-xs text-mutedink transition-colors hover:border-majorelle hover:text-majorelle";

export default async function AdminProgramPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ saved?: string; error?: string; uploadError?: string }>;
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

      {sp.saved ? (
        <p className="mb-4 rounded-lg bg-oasisl px-4 py-2.5 text-sm text-oasis">
          {t("adminSaved")}
        </p>
      ) : null}
      {sp.uploadError ? (
        <p className="mb-4 rounded-lg bg-terracottal px-4 py-2.5 text-sm text-terracotta">
          {t("adminUploadError")}
        </p>
      ) : null}
      {sp.error === "enrolled" ? (
        <p className="mb-4 rounded-lg bg-terracottal px-4 py-2.5 text-sm text-terracotta">
          {t("adminCannotDeleteEnrolled")}
        </p>
      ) : null}
      {sp.error === "empty" ? (
        <p className="mb-4 rounded-lg bg-terracottal px-4 py-2.5 text-sm text-terracotta">
          {ta("errorEmpty")}
        </p>
      ) : null}

      <ProgramForm program={program} cover={cover} uiLocale={locale} />

      {/* Semaines et séances */}
      <div className="mb-4 mt-10 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-medium">{t("adminWeeks")}</h2>
        <form action={addWeeks} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="programId" value={program.id} />
          <input type="hidden" name="uiLocale" value={locale} />
          <input
            name="count"
            type="number"
            min={1}
            max={20}
            defaultValue={1}
            aria-label={t("adminWeeksToAdd")}
            className={`${smallInput} w-16`}
            dir="ltr"
          />
          <select name="kind" defaultValue="LEARNING" className={smallInput}>
            {WEEK_KINDS.map((k) => (
              <option key={k} value={k}>
                {t(`weekKind${k}`)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-majorelle px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" aria-hidden />
            {t("adminAddWeek")}
          </button>
        </form>
      </div>

      {program.weeks.length === 0 ? (
        <p className="rounded-xl border border-ligne bg-white p-6 text-center text-mutedink">
          {t("adminNoWeeks")}
        </p>
      ) : (
        <div className="space-y-4">
          {program.weeks.map((week, wi) => {
            const opens = toDateTimeInputs(week.opensAt);
            return (
              <section key={week.id} className="rounded-xl border border-ligne bg-white p-4">
                {/* Réglages de la semaine */}
                <form
                  action={saveWeek}
                  className="flex flex-wrap items-end gap-2 border-b border-ligne pb-3"
                >
                  <input type="hidden" name="id" value={week.id} />
                  <input type="hidden" name="programId" value={program.id} />
                  <input type="hidden" name="uiLocale" value={locale} />

                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-majorellel text-sm font-medium text-majorelle">
                    {week.weekNumber}
                  </span>
                  <input
                    name="title"
                    defaultValue={week.title ?? ""}
                    placeholder={t("adminWeekTitle")}
                    className={`${smallInput} min-w-40 flex-1`}
                  />
                  <select name="kind" defaultValue={week.kind} className={smallInput}>
                    {WEEK_KINDS.map((k) => (
                      <option key={k} value={k}>
                        {t(`weekKind${k}`)}
                      </option>
                    ))}
                  </select>
                  <input
                    name="opensAtDate"
                    type="date"
                    defaultValue={opens.date}
                    aria-label={t("adminWeekOpensAt")}
                    className={smallInput}
                    dir="ltr"
                  />
                  <input
                    name="opensAtTime"
                    type="time"
                    defaultValue={opens.time}
                    className={smallInput}
                    dir="ltr"
                  />
                  <button type="submit" className={quietBtn}>
                    {t("adminSave")}
                  </button>
                </form>

                <div className="flex flex-wrap items-center gap-2 py-2">
                  <form action={moveWeek}>
                    <input type="hidden" name="id" value={week.id} />
                    <input type="hidden" name="programId" value={program.id} />
                    <input type="hidden" name="uiLocale" value={locale} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      className={quietBtn}
                      disabled={wi === 0}
                      aria-label={t("adminMoveUp")}
                    >
                      <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </form>
                  <form action={moveWeek}>
                    <input type="hidden" name="id" value={week.id} />
                    <input type="hidden" name="programId" value={program.id} />
                    <input type="hidden" name="uiLocale" value={locale} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      className={quietBtn}
                      disabled={wi === program.weeks.length - 1}
                      aria-label={t("adminMoveDown")}
                    >
                      <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </form>
                  <ConfirmSubmit
                    action={deleteWeek}
                    fields={{ id: week.id, programId: program.id, uiLocale: locale }}
                    label={t("adminDelete")}
                    confirmText={t("adminConfirmDeleteWeek")}
                    variant="quiet"
                  />
                </div>

                {/* Séances de la semaine */}
                {week.sessions.length === 0 ? (
                  <p className="py-2 text-sm text-mutedink">{t("adminNoSessions")}</p>
                ) : (
                  <ul className="space-y-2 py-2">
                    {week.sessions.map((s, si) => (
                      <li
                        key={s.id}
                        className="rounded-lg border border-ligne bg-sable p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Link
                            href={{
                              pathname: "/admin/programs/[id]/sessions/[sessionId]",
                              params: { id: String(program.id), sessionId: String(s.id) },
                            }}
                            className="min-w-0 flex-1 font-medium hover:text-majorelle"
                          >
                            {s.title}
                          </Link>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              s.status === "PUBLISHED"
                                ? "bg-oasisl text-oasis"
                                : s.status === "SCHEDULED"
                                  ? "bg-majorellel text-majorelle"
                                  : s.status === "LOCKED"
                                    ? "bg-terracottal text-terracotta"
                                    : "bg-sable2 text-mutedink"
                            }`}
                          >
                            {t(`adminSessionStatus${s.status}`)}
                          </span>
                        </div>

                        {s.publishAt ? (
                          <p className="mt-1 text-xs text-mutedink">
                            {fmtSessionDateTime(locale, s.publishAt)}
                          </p>
                        ) : null}

                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <form action={moveSession}>
                            <input type="hidden" name="id" value={s.id} />
                            <input type="hidden" name="programId" value={program.id} />
                            <input type="hidden" name="uiLocale" value={locale} />
                            <input type="hidden" name="direction" value="up" />
                            <button
                              type="submit"
                              className={quietBtn}
                              disabled={si === 0}
                              aria-label={t("adminMoveUp")}
                            >
                              <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                            </button>
                          </form>
                          <form action={moveSession}>
                            <input type="hidden" name="id" value={s.id} />
                            <input type="hidden" name="programId" value={program.id} />
                            <input type="hidden" name="uiLocale" value={locale} />
                            <input type="hidden" name="direction" value="down" />
                            <button
                              type="submit"
                              className={quietBtn}
                              disabled={si === week.sessions.length - 1}
                              aria-label={t("adminMoveDown")}
                            >
                              <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                            </button>
                          </form>

                          <form action={setSessionAvailability}>
                            <input type="hidden" name="id" value={s.id} />
                            <input type="hidden" name="programId" value={program.id} />
                            <input type="hidden" name="uiLocale" value={locale} />
                            <input type="hidden" name="op" value="publishNow" />
                            <button type="submit" className={quietBtn}>
                              {t("adminPublishNow")}
                            </button>
                          </form>
                          <form action={setSessionAvailability}>
                            <input type="hidden" name="id" value={s.id} />
                            <input type="hidden" name="programId" value={program.id} />
                            <input type="hidden" name="uiLocale" value={locale} />
                            <input
                              type="hidden"
                              name="op"
                              value={s.status === "LOCKED" ? "unlock" : "lock"}
                            />
                            <button type="submit" className={quietBtn}>
                              {s.status === "LOCKED" ? t("adminUnlock") : t("adminLock")}
                            </button>
                          </form>

                          <form action={duplicateSession}>
                            <input type="hidden" name="id" value={s.id} />
                            <input type="hidden" name="programId" value={program.id} />
                            <input type="hidden" name="uiLocale" value={locale} />
                            <button type="submit" className={quietBtn}>
                              {t("adminDuplicate")}
                            </button>
                          </form>

                          {program.weeks.length > 1 ? (
                            <form
                              action={moveSessionToWeek}
                              className="flex items-center gap-1"
                            >
                              <input type="hidden" name="id" value={s.id} />
                              <input type="hidden" name="programId" value={program.id} />
                              <input type="hidden" name="uiLocale" value={locale} />
                              <select
                                name="weekId"
                                defaultValue={week.id}
                                aria-label={t("adminMoveToWeek")}
                                className={`${smallInput} py-0.5 text-xs`}
                              >
                                {program.weeks.map((w) => (
                                  <option key={w.id} value={w.id}>
                                    {t("weekLabel", { n: w.weekNumber })}
                                  </option>
                                ))}
                              </select>
                              <button type="submit" className={quietBtn}>
                                {t("adminMoveToWeek")}
                              </button>
                            </form>
                          ) : null}

                          <ConfirmSubmit
                            action={deleteSession}
                            fields={{
                              id: s.id,
                              programId: program.id,
                              uiLocale: locale,
                            }}
                            label={t("adminDelete")}
                            confirmText={t("adminConfirmDeleteSession")}
                            variant="quiet"
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Ajout rapide d'une séance : titre seul, le reste se règle ensuite */}
                <form action={saveSession} className="flex flex-wrap items-center gap-2 pt-1">
                  <input type="hidden" name="programId" value={program.id} />
                  <input type="hidden" name="weekId" value={week.id} />
                  <input type="hidden" name="uiLocale" value={locale} />
                  <input type="hidden" name="status" value="DRAFT" />
                  <input type="hidden" name="isMandatory" value="on" />
                  <input
                    name="title"
                    required
                    placeholder={t("adminSessionTitle")}
                    className={`${smallInput} min-w-48 flex-1`}
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-lg border border-majorelle px-3 py-1 text-sm font-medium text-majorelle transition-colors hover:bg-majorellel"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    {t("adminAddSession")}
                  </button>
                </form>
              </section>
            );
          })}
        </div>
      )}

      <Link
        href="/admin/programs"
        className="mt-8 inline-block text-sm text-mutedink hover:text-majorelle"
      >
        {t("adminBackToPrograms")}
      </Link>
    </div>
  );
}

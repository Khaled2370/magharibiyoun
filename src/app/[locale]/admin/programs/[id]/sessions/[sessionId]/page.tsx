import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChevronDown, ChevronUp, FileText, Image, Link2, Plus, Type, Video } from "lucide-react";
import type { ContentBlockType } from "@prisma/client";
import { requireEditor } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { sessionDetailInclude, toDateTimeInputs } from "@/lib/lms";
import { deleteBlock, moveBlock, saveSession } from "@/actions/lms-admin";
import BlockForm from "@/components/lms/block-form";
import ConfirmSubmit from "@/components/lms/confirm-submit";
import { Link } from "@/i18n/navigation";

const SESSION_STATUSES = ["DRAFT", "SCHEDULED", "PUBLISHED", "LOCKED"] as const;
const BLOCK_TYPES = [
  { type: "VIDEO", Icon: Video },
  { type: "TEXT", Icon: Type },
  { type: "PDF", Icon: FileText },
  { type: "IMAGE", Icon: Image },
  { type: "LINK", Icon: Link2 },
] as const;

const inputCls =
  "w-full rounded-lg border border-ligne bg-white px-3 py-2 text-sm outline-none focus:border-majorelle";
const labelCls = "mb-1 block text-sm font-medium";
const quietBtn =
  "rounded-lg border border-ligne px-2.5 py-1 text-xs text-mutedink transition-colors hover:border-majorelle hover:text-majorelle";

export default async function AdminSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string; sessionId: string }>;
  searchParams: Promise<{ addType?: string; saved?: string; uploadError?: string; error?: string }>;
}) {
  const { locale, id, sessionId } = await params;
  setRequestLocale(locale);
  await requireEditor(locale);
  const t = await getTranslations("lms");
  const ta = await getTranslations("admin");
  const sp = await searchParams;

  const programId = Number(id);
  const sid = Number(sessionId);
  if (Number.isNaN(programId) || Number.isNaN(sid)) notFound();

  const session = await prisma.programSession.findUnique({
    where: { id: sid },
    include: sessionDetailInclude,
  });
  if (!session || session.week.programId !== programId) notFound();

  const weeks = await prisma.programWeek.findMany({
    where: { programId },
    orderBy: { weekNumber: "asc" },
  });

  const publish = toDateTimeInputs(session.publishAt);
  const addType = BLOCK_TYPES.some((b) => b.type === sp.addType)
    ? (sp.addType as ContentBlockType)
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs text-mutedink">{session.week.program.title}</p>
      <h1 className="mb-6 mt-1 text-2xl font-medium sm:text-3xl">{t("adminEditSession")}</h1>

      {sp.saved ? (
        <p className="mb-4 rounded-lg bg-oasisl px-4 py-2.5 text-sm text-oasis">
          {t("adminSaved")}
        </p>
      ) : null}
      {sp.uploadError ? (
        <p className="mb-4 rounded-lg bg-terracottal px-4 py-2.5 text-sm text-terracotta">
          {sp.uploadError === "config"
            ? ta("uploadNotConfigured")
            : t("adminUploadError")}
        </p>
      ) : null}
      {sp.error === "empty" ? (
        <p className="mb-4 rounded-lg bg-terracottal px-4 py-2.5 text-sm text-terracotta">
          {ta("errorEmpty")}
        </p>
      ) : null}

      {/* Réglages de la séance */}
      <form action={saveSession} className="space-y-4 rounded-xl border border-ligne bg-white p-5">
        <input type="hidden" name="id" value={session.id} />
        <input type="hidden" name="programId" value={programId} />
        <input type="hidden" name="uiLocale" value={locale} />

        <div>
          <label className={labelCls} htmlFor="title">
            {t("adminSessionTitle")}
          </label>
          <input
            id="title"
            name="title"
            defaultValue={session.title}
            required
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="description">
            {t("adminSessionDesc")}
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={session.description ?? ""}
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls} htmlFor="weekId">
              {t("adminMoveToWeek")}
            </label>
            <select
              id="weekId"
              name="weekId"
              defaultValue={session.weekId}
              className={inputCls}
            >
              {weeks.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title ?? t("weekLabel", { n: w.weekNumber })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="instructor">
              {t("adminInstructor")}
            </label>
            <input
              id="instructor"
              name="instructor"
              defaultValue={session.instructor ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="durationMin">
              {t("adminDurationMin")}
            </label>
            <input
              id="durationMin"
              name="durationMin"
              type="number"
              min={1}
              defaultValue={session.durationMin ?? ""}
              className={inputCls}
              dir="ltr"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls} htmlFor="publishDate">
              {t("adminPublishDate")}
            </label>
            <input
              id="publishDate"
              name="publishDate"
              type="date"
              defaultValue={publish.date}
              className={inputCls}
              dir="ltr"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="publishTime">
              {t("adminPublishTime")}
            </label>
            <input
              id="publishTime"
              name="publishTime"
              type="time"
              defaultValue={publish.time}
              className={inputCls}
              dir="ltr"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="status">
              {ta("fieldStatus")}
            </label>
            <select
              id="status"
              name="status"
              defaultValue={session.status}
              className={inputCls}
            >
              {SESSION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`adminSessionStatus${s}`)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-mutedink">{t("adminTimeHint")}</p>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isMandatory"
            defaultChecked={session.isMandatory}
            className="h-4 w-4"
          />
          {t("adminMandatory")}
        </label>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-majorelle px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {t("adminSave")}
          </button>
        </div>
      </form>

      {/* Blocs de contenu */}
      <h2 className="mb-3 mt-10 text-xl font-medium">{t("adminBlocks")}</h2>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-mutedink">{t("adminAddBlock")} :</span>
        {BLOCK_TYPES.map(({ type, Icon }) => (
          <Link
            key={type}
            href={{
              pathname: "/admin/programs/[id]/sessions/[sessionId]",
              params: { id: String(programId), sessionId: String(session.id) },
              query: { addType: type },
            }}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              addType === type
                ? "border-majorelle bg-majorellel text-majorelle"
                : "border-ligne text-mutedink hover:border-majorelle hover:text-majorelle"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {t(`adminBlock${type}`)}
          </Link>
        ))}
      </div>

      {addType ? (
        <section className="mb-6 rounded-xl border border-majorelle bg-majorellel/30 p-5">
          <h3 className="mb-3 flex items-center gap-2 font-medium">
            <Plus className="h-4 w-4" aria-hidden />
            {t(`adminBlock${addType}`)}
          </h3>
          <BlockForm type={addType} sessionId={session.id} uiLocale={locale} />
        </section>
      ) : null}

      {session.blocks.length === 0 ? (
        <p className="rounded-xl border border-ligne bg-white p-6 text-center text-mutedink">
          {t("adminNoBlocks")}
        </p>
      ) : (
        <div className="space-y-4">
          {session.blocks.map((block, i) => (
            <section key={block.id} className="rounded-xl border border-ligne bg-white p-5">
              <header className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-ligne pb-2">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span className="rounded-full bg-sable2 px-2.5 py-0.5 text-xs text-mutedink">
                    {t(`adminBlock${block.type}`)}
                  </span>
                  {block.isSupplementary ? (
                    <span className="rounded-full bg-majorellel px-2.5 py-0.5 text-xs text-majorelle">
                      {t("supplementary")}
                    </span>
                  ) : null}
                </span>
                <span className="flex items-center gap-1.5">
                  <form action={moveBlock}>
                    <input type="hidden" name="id" value={block.id} />
                    <input type="hidden" name="sessionId" value={session.id} />
                    <input type="hidden" name="uiLocale" value={locale} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      className={quietBtn}
                      disabled={i === 0}
                      aria-label={t("adminMoveUp")}
                    >
                      <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </form>
                  <form action={moveBlock}>
                    <input type="hidden" name="id" value={block.id} />
                    <input type="hidden" name="sessionId" value={session.id} />
                    <input type="hidden" name="uiLocale" value={locale} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      className={quietBtn}
                      disabled={i === session.blocks.length - 1}
                      aria-label={t("adminMoveDown")}
                    >
                      <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </form>
                  <ConfirmSubmit
                    action={deleteBlock}
                    fields={{ id: block.id, sessionId: session.id, uiLocale: locale }}
                    label={t("adminDelete")}
                    confirmText={t("adminConfirmDeleteBlock")}
                    variant="quiet"
                  />
                </span>
              </header>
              <BlockForm
                type={block.type}
                block={block}
                sessionId={session.id}
                uiLocale={locale}
              />
            </section>
          ))}
        </div>
      )}

      <Link
        href={{ pathname: "/admin/programs/[id]", params: { id: String(programId) } }}
        className="mt-8 inline-block text-sm text-mutedink hover:text-majorelle"
      >
        {t("adminBackToProgram")}
      </Link>
    </div>
  );
}

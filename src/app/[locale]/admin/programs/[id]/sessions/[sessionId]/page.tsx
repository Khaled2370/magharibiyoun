import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Image,
  Link2,
  Save,
  Type,
  Video,
} from "lucide-react";
import { requireEditor } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { sessionDetailInclude, toDateTimeInputs } from "@/lib/lms";
import { MAX_UPLOAD_BYTES } from "@/lib/cloudinary";
import { saveSessionPage } from "@/actions/lms-planning";
import FileField from "@/components/admin/file-field";
import UnsavedGuard from "@/components/admin/unsaved-guard";
import { Link } from "@/i18n/navigation";

const SESSION_STATUSES = ["DRAFT", "SCHEDULED", "PUBLISHED", "LOCKED"] as const;
const LINK_KINDS = ["ARTICLE", "SITE", "PODCAST", "VIDEO", "DOCUMENT", "OTHER"] as const;
const BLOCK_TYPES = [
  { type: "VIDEO", Icon: Video },
  { type: "TEXT", Icon: Type },
  { type: "PDF", Icon: FileText },
  { type: "IMAGE", Icon: Image },
  { type: "LINK", Icon: Link2 },
] as const;

const FORM_ID = "session-editor";
const input =
  "w-full rounded-lg border border-ligne bg-white px-3 py-2 text-sm outline-none focus:border-majorelle";
const label = "mb-1 block text-sm font-medium";
const quiet =
  "rounded-lg border border-ligne bg-white px-2.5 py-1 text-xs text-mutedink transition-colors hover:border-majorelle hover:text-majorelle disabled:opacity-40";

const MSG_KEYS: Record<string, string> = {
  saved: "msgSaved",
  blockAdded: "msgBlockAdded",
  blockMoved: "msgBlockMoved",
  blockDeleted: "msgBlockDeleted",
  alreadyAtEdge: "msgAlreadyAtEdge",
  titleRequired: "msgTitleRequired",
  uploadConfig: "msgUploadConfig",
  uploadFailed: "msgUploadFailed",
};
const PROBLEMS = new Set(["alreadyAtEdge", "titleRequired", "uploadConfig", "uploadFailed"]);

export default async function AdminSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string; sessionId: string }>;
  searchParams: Promise<{ msg?: string }>;
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

  const messages = (sp.msg ?? "").split(",").filter(Boolean);
  const good = messages.filter((m) => !PROBLEMS.has(m));
  const bad = messages.filter((m) => PROBLEMS.has(m));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs text-mutedink">{session.week.program.title}</p>
      <h1 className="mb-6 mt-1 text-2xl font-medium sm:text-3xl">{t("adminEditSession")}</h1>

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

      {/* UN SEUL formulaire : réglages + tous les blocs. Les boutons d'ajout,
          de déplacement et de suppression enregistrent d'abord la saisie. */}
      <form action={saveSessionPage} id={FORM_ID} className="space-y-8">
        <input type="hidden" name="uiLocale" value={locale} />
        <input type="hidden" name="programId" value={programId} />
        <input type="hidden" name="sessionId" value={session.id} />

        <section className="space-y-4 rounded-xl border border-ligne bg-white p-5">
          <h2 className="font-medium">{t("sessionSettings")}</h2>

          <div>
            <label className={label} htmlFor="title">
              {t("adminSessionTitle")}
            </label>
            <input id="title" name="title" defaultValue={session.title} required className={input} />
          </div>

          <div>
            <label className={label} htmlFor="description">
              {t("adminSessionDesc")}
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={session.description ?? ""}
              className={input}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={label} htmlFor="weekId">
                {t("adminMoveToWeek")}
              </label>
              <select id="weekId" name="weekId" defaultValue={session.weekId} className={input}>
                {weeks.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.title ?? t("weekLabel", { n: w.weekNumber })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="instructor">
                {t("adminInstructor")}
              </label>
              <input
                id="instructor"
                name="instructor"
                defaultValue={session.instructor ?? ""}
                className={input}
              />
            </div>
            <div>
              <label className={label} htmlFor="durationMin">
                {t("adminDurationMin")}
              </label>
              <input
                id="durationMin"
                name="durationMin"
                type="number"
                min={1}
                defaultValue={session.durationMin ?? ""}
                className={input}
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={label} htmlFor="publishDate">
                {t("adminPublishDate")}
              </label>
              <input
                id="publishDate"
                name="publishDate"
                type="date"
                defaultValue={publish.date}
                className={input}
                dir="ltr"
              />
            </div>
            <div>
              <label className={label} htmlFor="publishTime">
                {t("adminPublishTime")}
              </label>
              <input
                id="publishTime"
                name="publishTime"
                type="time"
                defaultValue={publish.time}
                className={input}
                dir="ltr"
              />
            </div>
            <div>
              <label className={label} htmlFor="status">
                {ta("fieldStatus")}
              </label>
              <select id="status" name="status" defaultValue={session.status} className={input}>
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
        </section>

        <section>
          <h2 className="text-xl font-medium">{t("adminBlocks")}</h2>
          <p className="mt-1 text-sm text-mutedink">{t("sessionContentIntro")}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-mutedink">{t("adminAddBlock")} :</span>
            {BLOCK_TYPES.map(({ type, Icon }) => (
              <button
                key={type}
                type="submit"
                name="op"
                value={`blockAdd:${type}`}
                className="flex items-center gap-1.5 rounded-lg border border-ligne bg-white px-3 py-1.5 text-sm font-medium text-mutedink transition-colors hover:border-majorelle hover:text-majorelle"
              >
                <Icon className="h-4 w-4" aria-hidden />
                {t(`adminBlock${type}`)}
              </button>
            ))}
          </div>

          {session.blocks.length === 0 ? (
            <p className="mt-4 rounded-xl border border-ligne bg-white p-6 text-center text-mutedink">
              {t("adminNoBlocks")}
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {session.blocks.map((block, i) => (
                <section key={block.id} className="rounded-xl border border-ligne bg-white p-5">
                  <input type="hidden" name={`block_${block.id}_present`} value="1" />

                  <header className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-ligne pb-2">
                    <span className="rounded-full bg-sable2 px-2.5 py-0.5 text-xs font-medium text-mutedink">
                      {t(`adminBlock${block.type}`)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <button
                        type="submit"
                        name="op"
                        value={`blockUp:${block.id}`}
                        className={quiet}
                        disabled={i === 0}
                        aria-label={t("adminMoveUp")}
                      >
                        <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button
                        type="submit"
                        name="op"
                        value={`blockDown:${block.id}`}
                        className={quiet}
                        disabled={i === session.blocks.length - 1}
                        aria-label={t("adminMoveDown")}
                      >
                        <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button
                        type="submit"
                        name="op"
                        value={`blockDelete:${block.id}`}
                        className="rounded-lg border border-terracotta px-2.5 py-1 text-xs font-medium text-terracotta transition-colors hover:bg-terracottal"
                      >
                        {t("adminDelete")}
                      </button>
                    </span>
                  </header>

                  <div className="space-y-3">
                    <div>
                      <label className={label}>{t("adminBlockTitle")}</label>
                      <input
                        name={`block_${block.id}_title`}
                        defaultValue={block.title ?? ""}
                        className={input}
                      />
                    </div>

                    {block.type === "VIDEO" ? (
                      <>
                        <div>
                          <label className={label}>{t("adminVideoUrl")}</label>
                          <input
                            name={`block_${block.id}_videoUrl`}
                            defaultValue={block.videoUrl ?? ""}
                            placeholder="https://www.youtube.com/watch?v=…"
                            className={input}
                            dir="ltr"
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div>
                            <label className={label}>{t("adminVideoTitle")}</label>
                            <input
                              name={`block_${block.id}_videoTitle`}
                              defaultValue={block.videoTitle ?? ""}
                              className={input}
                            />
                          </div>
                          <div>
                            <label className={label}>{t("adminVideoInstructor")}</label>
                            <input
                              name={`block_${block.id}_videoInstructor`}
                              defaultValue={block.videoInstructor ?? ""}
                              className={input}
                            />
                          </div>
                          <div>
                            <label className={label}>{t("adminVideoDuration")}</label>
                            <input
                              name={`block_${block.id}_videoDurationMin`}
                              type="number"
                              min={1}
                              defaultValue={block.videoDurationMin ?? ""}
                              className={input}
                              dir="ltr"
                            />
                          </div>
                        </div>
                      </>
                    ) : null}

                    {block.type === "TEXT" ? (
                      <div>
                        <label className={label}>{t("adminTextBody")}</label>
                        <textarea
                          name={`block_${block.id}_textBody`}
                          rows={8}
                          defaultValue={block.textBody ?? ""}
                          className={input}
                        />
                        <p className="mt-1 text-xs text-mutedink">{t("adminTextHint")}</p>
                      </div>
                    ) : null}

                    {block.type === "PDF" || block.type === "IMAGE" ? (
                      <div>
                        <label className={label}>
                          {block.type === "PDF" ? t("adminPdfFile") : t("adminImageFile")}
                        </label>
                        {block.mediaFile?.url ? (
                          <p className="mb-2 text-xs text-mutedink">
                            {t("adminCurrentFile")} :{" "}
                            <a
                              href={block.mediaFile.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-majorelle underline"
                              dir="ltr"
                            >
                              {block.mediaFile.url.split("/").pop()}
                            </a>
                          </p>
                        ) : null}
                        <FileField
                          name={`block_${block.id}_file`}
                          accept={
                            block.type === "PDF"
                              ? "application/pdf"
                              : "image/jpeg,image/png,image/webp,image/gif"
                          }
                          maxBytes={MAX_UPLOAD_BYTES}
                          tooBigLabel={ta("fileTooBig")}
                        />
                      </div>
                    ) : null}

                    {block.type === "LINK" ? (
                      <>
                        <div>
                          <label className={label}>{t("adminLinkUrl")}</label>
                          <input
                            name={`block_${block.id}_linkUrl`}
                            defaultValue={block.linkUrl ?? ""}
                            placeholder="https://…"
                            className={input}
                            dir="ltr"
                          />
                          <p className="mt-1 text-xs text-mutedink">
                            {t("adminLinkYoutubeHint")}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className={label}>{t("adminLinkLabel")}</label>
                            <input
                              name={`block_${block.id}_linkLabel`}
                              defaultValue={block.linkLabel ?? ""}
                              className={input}
                            />
                          </div>
                          <div>
                            <label className={label}>{t("adminLinkKind")}</label>
                            <select
                              name={`block_${block.id}_linkKind`}
                              defaultValue={block.linkKind ?? "ARTICLE"}
                              className={input}
                            >
                              {LINK_KINDS.map((k) => (
                                <option key={k} value={k}>
                                  {t(`adminLinkKind${k}`)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </>
                    ) : null}

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name={`block_${block.id}_isSupplementary`}
                        defaultChecked={block.isSupplementary}
                        className="h-4 w-4"
                      />
                      {t("adminSupplementary")}
                    </label>
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

      <Link
        href={{ pathname: "/admin/programs/[id]", params: { id: String(programId) } }}
        className="mt-8 inline-block text-sm text-mutedink hover:text-majorelle"
      >
        {t("adminBackToProgram")}
      </Link>
    </div>
  );
}

import { getTranslations } from "next-intl/server";
import type { ContentBlockType } from "@prisma/client";
import type { BlockWithMedia } from "@/lib/lms";
import { saveBlock } from "@/actions/lms-admin";

const LINK_KINDS = ["ARTICLE", "SITE", "PODCAST", "VIDEO", "DOCUMENT", "OTHER"] as const;

const inputCls =
  "w-full rounded-lg border border-ligne bg-white px-3 py-2 text-sm outline-none focus:border-majorelle";
const labelCls = "mb-1 block text-sm font-medium";
const fileCls =
  "block w-full text-sm text-mutedink file:me-3 file:rounded-lg file:border-0 file:bg-sable2 file:px-3 file:py-2 file:text-sm file:font-medium file:text-encre";

/** Formulaire d'un bloc de contenu — champs affichés selon le type choisi. */
export default async function BlockForm({
  type,
  block,
  sessionId,
  uiLocale,
}: {
  type: ContentBlockType;
  block?: BlockWithMedia | null;
  sessionId: number;
  uiLocale: string;
}) {
  const t = await getTranslations("lms");

  return (
    <form action={saveBlock} className="space-y-3">
      {block ? <input type="hidden" name="id" value={block.id} /> : null}
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="uiLocale" value={uiLocale} />
      <input type="hidden" name="type" value={type} />

      <div>
        <label className={labelCls} htmlFor={`title-${block?.id ?? "new"}`}>
          {t("adminBlockTitle")}
        </label>
        <input
          id={`title-${block?.id ?? "new"}`}
          name="title"
          defaultValue={block?.title ?? ""}
          className={inputCls}
        />
      </div>

      {type === "VIDEO" ? (
        <>
          <div>
            <label className={labelCls}>{t("adminVideoUrl")}</label>
            <input
              name="videoUrl"
              defaultValue={block?.videoUrl ?? ""}
              placeholder="https://www.youtube.com/watch?v=…"
              className={inputCls}
              dir="ltr"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className={labelCls}>{t("adminVideoTitle")}</label>
              <input
                name="videoTitle"
                defaultValue={block?.videoTitle ?? ""}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{t("adminVideoInstructor")}</label>
              <input
                name="videoInstructor"
                defaultValue={block?.videoInstructor ?? ""}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{t("adminVideoDuration")}</label>
              <input
                name="videoDurationMin"
                type="number"
                min={1}
                defaultValue={block?.videoDurationMin ?? ""}
                className={inputCls}
                dir="ltr"
              />
            </div>
          </div>
        </>
      ) : null}

      {type === "TEXT" ? (
        <div>
          <label className={labelCls}>{t("adminTextBody")}</label>
          <textarea
            name="textBody"
            rows={8}
            defaultValue={block?.textBody ?? ""}
            className={inputCls}
          />
          <p className="mt-1 text-xs text-mutedink">{t("adminTextHint")}</p>
        </div>
      ) : null}

      {type === "PDF" || type === "IMAGE" ? (
        <div>
          <label className={labelCls}>
            {type === "PDF" ? t("adminPdfFile") : t("adminImageFile")}
          </label>
          {block?.mediaFile?.url ? (
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
          <input
            name="file"
            type="file"
            accept={type === "PDF" ? "application/pdf" : "image/jpeg,image/png,image/webp,image/gif"}
            className={fileCls}
          />
        </div>
      ) : null}

      {type === "LINK" ? (
        <>
          <div>
            <label className={labelCls}>{t("adminLinkUrl")}</label>
            <input
              name="linkUrl"
              defaultValue={block?.linkUrl ?? ""}
              placeholder="https://…"
              className={inputCls}
              dir="ltr"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>{t("adminLinkLabel")}</label>
              <input
                name="linkLabel"
                defaultValue={block?.linkLabel ?? ""}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{t("adminLinkKind")}</label>
              <select
                name="linkKind"
                defaultValue={block?.linkKind ?? "ARTICLE"}
                className={inputCls}
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
          name="isSupplementary"
          defaultChecked={block?.isSupplementary ?? false}
          className="h-4 w-4"
        />
        {t("adminSupplementary")}
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-lg bg-majorelle px-5 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {t("adminSave")}
        </button>
      </div>
    </form>
  );
}

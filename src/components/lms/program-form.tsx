import { getTranslations } from "next-intl/server";
import type { MediaFile, Program } from "@prisma/client";
import { saveProgram } from "@/actions/lms-admin";

const STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;

const inputCls =
  "w-full rounded-lg border border-ligne bg-white px-3 py-2 text-sm outline-none focus:border-majorelle";
const labelCls = "mb-1 block text-sm font-medium";

export default async function ProgramForm({
  program,
  cover,
  uiLocale,
}: {
  program?: Program | null;
  cover?: MediaFile | null;
  uiLocale: string;
}) {
  const t = await getTranslations("lms");
  const ta = await getTranslations("admin");

  return (
    <form action={saveProgram} className="space-y-4 rounded-xl border border-ligne bg-white p-5">
      {program ? <input type="hidden" name="id" value={program.id} /> : null}
      <input type="hidden" name="uiLocale" value={uiLocale} />

      <div>
        <label className={labelCls} htmlFor="title">
          {t("adminProgramTitle")}
        </label>
        <input
          id="title"
          name="title"
          defaultValue={program?.title ?? ""}
          required
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="description">
          {t("adminProgramDesc")}
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={program?.description ?? ""}
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="durationWeeks">
            {t("adminDurationWeeks")}
          </label>
          <input
            id="durationWeeks"
            name="durationWeeks"
            type="number"
            min={1}
            defaultValue={program?.durationWeeks ?? ""}
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
            defaultValue={program?.status ?? "DRAFT"}
            className={inputCls}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`adminStatus${s}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="cover">
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
        <input
          id="cover"
          name="cover"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="block w-full text-sm text-mutedink file:me-3 file:rounded-lg file:border-0 file:bg-sable2 file:px-3 file:py-2 file:text-sm file:font-medium file:text-encre"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-lg bg-majorelle px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {t("adminSave")}
        </button>
      </div>
    </form>
  );
}

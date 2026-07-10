"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { submitContribution } from "@/actions/contribute";

const LOCALES = ["ar", "fr", "en"] as const;
const LANG_NAMES: Record<string, string> = {
  ar: "العربية",
  fr: "Français",
  en: "English",
};

export default function ContributionForm({
  uiLocale,
  defaultContentLocale,
}: {
  uiLocale: string;
  defaultContentLocale: string;
}) {
  const t = useTranslations("contribute");
  const [loading, setLoading] = useState(false);

  return (
    <form
      action={async (formData) => {
        setLoading(true);
        await submitContribution(formData);
      }}
      className="space-y-4 rounded-xl border border-ligne bg-white p-6"
    >
      <input type="hidden" name="uiLocale" value={uiLocale} />
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="contentLocale">
          {t("contentLanguage")}
        </label>
        <select
          id="contentLocale"
          name="contentLocale"
          defaultValue={defaultContentLocale}
          className="w-full rounded-lg border border-ligne bg-white px-3 py-2 text-sm outline-none focus:border-majorelle"
        >
          {LOCALES.map((l) => (
            <option key={l} value={l}>
              {LANG_NAMES[l]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="title">
          {t("fieldTitle")}
        </label>
        <input
          id="title"
          name="title"
          required
          className="w-full rounded-lg border border-ligne bg-white px-3 py-2 text-sm outline-none focus:border-majorelle"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="summary">
          {t("fieldSummary")}
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={2}
          className="w-full rounded-lg border border-ligne bg-white px-3 py-2 text-sm outline-none focus:border-majorelle"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="body">
          {t("fieldBody")}
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={10}
          className="w-full rounded-lg border border-ligne bg-white px-3 py-2 text-sm outline-none focus:border-majorelle"
        />
        <p className="mt-1 text-xs text-mutedink">{t("bodyHint")}</p>
      </div>
      <p className="rounded-lg bg-majorellel px-4 py-2.5 text-sm text-majorelle">
        {t("reviewNotice")}
      </p>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-majorelle px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {loading ? t("submitting") : t("submitButton")}
      </button>
    </form>
  );
}

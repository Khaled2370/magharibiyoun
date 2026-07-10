"use client";

import { useState } from "react";
import { rejectContribution } from "@/actions/admin-content";

export default function RejectContributionButton({
  contributionId,
  uiLocale,
  label,
  promptText,
  confirmText,
}: {
  contributionId: number;
  uiLocale: string;
  label: string;
  promptText: string;
  confirmText: string;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-terracotta px-3 py-1.5 text-xs font-medium text-terracotta transition-colors hover:bg-terracottal"
      >
        {label}
      </button>
    );
  }

  return (
    <form
      action={rejectContribution}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="uiLocale" value={uiLocale} />
      <input type="hidden" name="contributionId" value={contributionId} />
      <input
        name="comments"
        placeholder={promptText}
        className="w-40 rounded-lg border border-ligne bg-white px-2 py-1 text-xs outline-none focus:border-majorelle"
      />
      <button
        type="submit"
        className="rounded-lg bg-terracotta px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
      >
        {label}
      </button>
    </form>
  );
}

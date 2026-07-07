"use client";

import { deleteContent } from "@/actions/admin-content";

export default function DeleteButton({
  id,
  uiLocale,
  label,
  confirmText,
}: {
  id: number;
  uiLocale: string;
  label: string;
  confirmText: string;
}) {
  return (
    <form
      action={deleteContent}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="uiLocale" value={uiLocale} />
      <button
        type="submit"
        className="rounded-lg border border-terracotta px-4 py-1.5 text-sm font-medium text-terracotta transition-colors hover:bg-terracottal"
      >
        {label}
      </button>
    </form>
  );
}

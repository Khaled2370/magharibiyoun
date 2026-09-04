"use client";

import { useFormStatus } from "react-dom";
import { NotebookPen } from "lucide-react";
import { saveNote } from "@/actions/lms-student";

function SaveButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-majorelle px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

/** Notes privées de l'élève sur une séance. */
export default function NotePanel({
  sessionId,
  uiLocale,
  noteId,
  initialBody,
  labels,
}: {
  sessionId: number;
  uiLocale: string;
  noteId: number | null;
  initialBody: string;
  labels: {
    title: string;
    placeholder: string;
    save: string;
    saving: string;
    hint: string;
  };
}) {
  return (
    <section className="rounded-xl border border-ligne bg-white p-5">
      <h2 className="flex items-center gap-2 font-medium">
        <NotebookPen className="h-4 w-4 text-majorelle" aria-hidden />
        {labels.title}
      </h2>
      <p className="mt-1 text-xs text-mutedink">{labels.hint}</p>
      <form action={saveNote} className="mt-3">
        <input type="hidden" name="sessionId" value={sessionId} />
        <input type="hidden" name="uiLocale" value={uiLocale} />
        {noteId ? <input type="hidden" name="id" value={noteId} /> : null}
        <textarea
          name="body"
          rows={5}
          defaultValue={initialBody}
          placeholder={labels.placeholder}
          className="w-full rounded-lg border border-ligne bg-white px-3 py-2 text-sm leading-relaxed outline-none focus:border-majorelle"
        />
        <div className="mt-2 flex justify-end">
          <SaveButton label={labels.save} pendingLabel={labels.saving} />
        </div>
      </form>
    </section>
  );
}

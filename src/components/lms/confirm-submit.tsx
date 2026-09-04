"use client";

/**
 * Bouton de formulaire avec confirmation avant envoi.
 * Version générique de delete-button.tsx (qui est câblé sur une seule action) :
 * ce module a cinq suppressions différentes à couvrir.
 */
export default function ConfirmSubmit({
  action,
  fields,
  label,
  confirmText,
  variant = "danger",
}: {
  action: (formData: FormData) => void | Promise<void>;
  fields: Record<string, string | number>;
  label: string;
  confirmText?: string;
  variant?: "danger" | "quiet";
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (confirmText && !window.confirm(confirmText)) e.preventDefault();
      }}
    >
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={String(value)} />
      ))}
      <button
        type="submit"
        className={
          variant === "danger"
            ? "rounded-lg border border-terracotta px-3 py-1.5 text-sm font-medium text-terracotta transition-colors hover:bg-terracottal"
            : "rounded-lg border border-ligne px-3 py-1.5 text-sm text-mutedink transition-colors hover:border-majorelle hover:text-majorelle"
        }
      >
        {label}
      </button>
    </form>
  );
}

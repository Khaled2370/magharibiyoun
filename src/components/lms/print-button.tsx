"use client";

import { Printer } from "lucide-react";

/**
 * Ouvre la boîte d'impression du navigateur.
 *
 * C'est ainsi que l'élève obtient son certificat en PDF : « Imprimer » puis
 * « Enregistrer au format PDF », disponible sur ordinateur comme sur téléphone.
 * Choix assumé plutôt qu'une génération de PDF côté serveur, qui obligerait à
 * embarquer une police arabe et une bibliothèque de plus.
 */
export default function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex items-center gap-2 rounded-lg bg-majorelle px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
    >
      <Printer className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}

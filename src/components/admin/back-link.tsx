"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

/**
 * Retour vers la page parente, à placer **en haut** de l'écran.
 *
 * Ajouté après un retour de Khaled (2026-09-05) : sur la page d'édition d'une
 * séance, le lien de retour existait mais tout en bas, sous la barre
 * d'enregistrement collante — donc invisible sans dérouler toute la page.
 *
 * Deux raisons d'en faire un composant client avec une vraie balise `<a>` :
 *  - `beforeunload` (le garde-fou d'`UnsavedGuard`) ne se déclenche PAS sur une
 *    navigation côté client. Un `<Link>` Next aurait fait perdre la saisie en
 *    silence — exactement l'accident qu'on cherche à empêcher ici.
 *  - on peut demander confirmation avant de quitter, en lisant le drapeau posé
 *    sur `<html>` par `UnsavedGuard`.
 */
export default function BackLink({
  href,
  label,
  confirmText,
}: {
  /** Chemin déjà localisé (calculé côté serveur avec `getPathname`). */
  href: string;
  label: string;
  confirmText: string;
}) {
  return (
    <a
      href={href}
      onClick={(e) => {
        if (!document.documentElement.dataset.unsavedForm) return;
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
      className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-ligne bg-white px-3 py-1.5 text-sm text-mutedink transition-colors hover:border-majorelle hover:text-majorelle"
    >
      <ArrowLeft className="h-4 w-4 rtl:hidden" aria-hidden />
      <ArrowRight className="hidden h-4 w-4 rtl:block" aria-hidden />
      {label}
    </a>
  );
}

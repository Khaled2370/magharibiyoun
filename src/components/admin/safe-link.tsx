"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

/**
 * Liens de navigation du back-office qui ne font pas perdre la saisie.
 *
 * **Piège central : `beforeunload` ne se déclenche PAS sur une navigation côté
 * client.** Un `<Link>` Next quitterait la page en silence, saisie comprise —
 * exactement l'accident qu'`UnsavedGuard` cherche à empêcher. D'où deux
 * précautions ici : une vraie balise `<a>` (rechargement complet, donc
 * `beforeunload` actif) et une demande de confirmation lisant le drapeau posé
 * sur `<html>` par `UnsavedGuard`.
 *
 * Le chemin doit arriver déjà localisé : le calculer côté serveur avec
 * `getPathname` de `@/i18n/navigation`.
 */
function guard(confirmText: string) {
  return (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!document.documentElement.dataset.unsavedForm) return;
    if (!window.confirm(confirmText)) e.preventDefault();
  };
}

/** Retour vers la page parente, à placer **en haut** de l'écran. */
export default function BackLink({
  href,
  label,
  confirmText,
}: {
  href: string;
  label: string;
  confirmText: string;
}) {
  return (
    <a
      href={href}
      onClick={guard(confirmText)}
      className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-ligne bg-white px-3 py-1.5 text-sm text-mutedink transition-colors hover:border-majorelle hover:text-majorelle"
    >
      <ArrowLeft className="h-4 w-4 rtl:hidden" aria-hidden />
      <ArrowRight className="hidden h-4 w-4 rtl:block" aria-hidden />
      {label}
    </a>
  );
}

/** Onglet vers une autre page du même programme (annonces, élèves…). */
export function ProgramTab({
  href,
  label,
  confirmText,
  small = false,
}: {
  href: string;
  label: string;
  confirmText: string;
  /** Format réduit, pour s'aligner sur les boutons d'une ligne de semaine. */
  small?: boolean;
}) {
  return (
    <a
      href={href}
      onClick={guard(confirmText)}
      className={`rounded-lg border border-ligne bg-white font-medium text-mutedink transition-colors hover:border-majorelle hover:text-majorelle ${
        small ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
      }`}
    >
      {label}
    </a>
  );
}

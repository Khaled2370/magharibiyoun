"use client";

import { useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

/**
 * Retour visuel immédiat pendant l'envoi d'un formulaire d'administration.
 *
 * Ajouté après un retour de Khaled : « tous ces boutons ne fonctionnent pas ».
 * Ils fonctionnaient — mais l'aller-retour serveur prend une seconde ou deux
 * sans que rien ne bouge à l'écran, et le résultat (un bloc vide) apparaît tout
 * en bas de la page. Sans signal, l'utilisateur conclut logiquement que le
 * bouton est mort.
 *
 * À placer DANS le formulaire : `useFormStatus` ne voit que le formulaire parent.
 */
export function FormPending({ label }: { label: string }) {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center p-3">
      <p className="flex items-center gap-2 rounded-full bg-encre px-5 py-2 text-sm font-medium text-sable shadow-lg">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        {label}
      </p>
    </div>
  );
}

/**
 * Amène à l'écran l'élément qui vient d'être créé, et le laisse surligné.
 *
 * Les ancres HTML seules se sont révélées peu fiables avec le routage de Next
 * (voir la note sur jump-nav dans CLAUDE.md) : on fait défiler en JavaScript.
 */
export function ScrollToNew({ targetId }: { targetId: string }) {
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    // « start » et non « center » : un bloc peut être plus haut que l'écran,
    // et le centrer ferait sortir son en-tête par le haut. La marge dégage
    // l'en-tête collant du site.
    const top = el.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top, behavior: "smooth" });
  }, [targetId]);
  return null;
}

"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

/**
 * Prévient avant de quitter une page dont la saisie n'est pas enregistrée.
 *
 * Ajouté après que Khaled a perdu tout son travail en revenant à l'accueil
 * (2026-09-05). Deux signaux complémentaires :
 *  - un bandeau visible dès la première frappe, pour qu'on sache qu'il reste
 *    quelque chose à enregistrer ;
 *  - la boîte de dialogue native du navigateur si on quitte quand même.
 */
export default function UnsavedGuard({
  formId,
  label,
}: {
  formId: string;
  label: string;
}) {
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const form = document.getElementById(formId);
    if (!form) return;

    const markDirty = () => setDirty(true);
    // On ne réinitialise pas à l'envoi : la page est rechargée derrière.
    form.addEventListener("input", markDirty);
    form.addEventListener("change", markDirty);
    const onSubmit = () => setDirty(false);
    form.addEventListener("submit", onSubmit);

    return () => {
      form.removeEventListener("input", markDirty);
      form.removeEventListener("change", markDirty);
      form.removeEventListener("submit", onSubmit);
    };
  }, [formId]);

  useEffect(() => {
    if (!dirty) return;
    // Drapeau lisible par les autres composants de la page — `BackLink` s'en
    // sert pour demander confirmation, `beforeunload` ne couvrant pas les
    // navigations internes.
    document.documentElement.dataset.unsavedForm = formId;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Les navigateurs affichent leur propre texte ; il faut néanmoins
      // renseigner returnValue pour déclencher la boîte de dialogue.
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      delete document.documentElement.dataset.unsavedForm;
      window.removeEventListener("beforeunload", warn);
    };
  }, [dirty, formId]);

  if (!dirty) return null;

  return (
    <p className="sticky top-0 z-20 mb-4 flex items-center gap-2 rounded-lg bg-terracottal px-4 py-2.5 text-sm font-medium text-terracotta">
      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </p>
  );
}

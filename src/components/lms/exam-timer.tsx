"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

/**
 * Compte à rebours d'un examen limité dans le temps.
 *
 * Le décompte démarre à l'ouverture de la page et **envoie la copie tout seul**
 * quand le temps est écoulé : sans cela, un élève distrait perdrait son travail.
 *
 * Ce minuteur est un confort d'affichage, pas une sécurité : rien n'empêche de
 * le contourner côté navigateur. La limite qui compte reste la date de fermeture
 * de l'examen, vérifiée sur le serveur à la réception de la copie.
 */
export default function ExamTimer({
  formId,
  minutes,
  label,
  expiredLabel,
}: {
  formId: string;
  minutes: number;
  label: string;
  expiredLabel: string;
}) {
  const [left, setLeft] = useState(minutes * 60);
  const sent = useRef(false);

  useEffect(() => {
    const end = Date.now() + minutes * 60_000;
    const tick = () => {
      const remaining = Math.max(0, Math.round((end - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0 && !sent.current) {
        sent.current = true;
        const form = document.getElementById(formId);
        if (form instanceof HTMLFormElement) form.requestSubmit();
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [formId, minutes]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const urgent = left <= 60;

  return (
    <p
      className={`sticky top-0 z-20 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium ${
        urgent ? "bg-terracottal text-terracotta" : "bg-sable2 text-mutedink"
      }`}
      role="timer"
      aria-live={urgent ? "assertive" : "off"}
    >
      <Clock className="h-4 w-4 shrink-0" aria-hidden />
      {left === 0 ? (
        expiredLabel
      ) : (
        <>
          {label}
          <span dir="ltr" className="tabular-nums">
            {mm}:{ss}
          </span>
        </>
      )}
    </p>
  );
}

"use client";

import { useState } from "react";

/**
 * Champ fichier qui refuse un fichier trop lourd **avant** l'envoi.
 *
 * Sans ce garde-fou, un fichier dépassant la limite des Server Actions fait
 * échouer la requête entière : l'utilisateur perd sa saisie et tombe sur une
 * page « Application error » incompréhensible, sans savoir que le poids de son
 * image est en cause. Ici on vide le champ et on explique, le reste du
 * formulaire est préservé.
 */
export default function FileField({
  name,
  accept,
  maxBytes,
  tooBigLabel,
}: {
  name: string;
  accept: string;
  maxBytes: number;
  /** Message affiché si le fichier est trop lourd (doit mentionner la limite). */
  tooBigLabel: string;
}) {
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <input
        name={name}
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (file && file.size > maxBytes) {
            setError(tooBigLabel);
            e.currentTarget.value = "";
          } else {
            setError(null);
          }
        }}
        className="block w-full text-sm text-mutedink file:me-3 file:rounded-lg file:border-0 file:bg-sable2 file:px-3 file:py-2 file:text-sm file:font-medium file:text-encre"
      />
      {error ? (
        <p className="mt-1.5 rounded-lg bg-terracottal px-3 py-2 text-sm text-terracotta">
          {error}
        </p>
      ) : null}
    </>
  );
}

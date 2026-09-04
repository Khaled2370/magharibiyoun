"use client";

import { useRef, useState } from "react";
import { Download, Maximize2 } from "lucide-react";

export type PdfLabels = {
  fullscreen: string;
  download: string;
  loading: string;
  fallback: string;
};

/**
 * Lecteur PDF intégré, sans bibliothèque externe.
 *
 * Le fichier est servi par /api/documents/[id] avec le bon type MIME, ce qui
 * laisse le navigateur l'afficher dans sa visionneuse native : pagination,
 * zoom, recherche et impression y sont déjà présents et bien traduits.
 * On ajoute par-dessus le plein écran et le téléchargement, plus un lien de
 * repli pour les navigateurs mobiles qui n'affichent pas les PDF en ligne.
 */
export default function PdfBlock({
  src,
  labels,
}: {
  src: string;
  labels: PdfLabels;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  const btn =
    "flex items-center gap-1.5 rounded-lg border border-ligne bg-white px-3 py-1.5 text-xs font-medium text-mutedink transition-colors hover:border-majorelle hover:text-majorelle";

  return (
    <div ref={boxRef} className="overflow-hidden rounded-xl border border-ligne bg-sable2">
      <div className="flex flex-wrap items-center justify-end gap-1.5 border-b border-ligne bg-white px-3 py-2">
        <button
          type="button"
          className={btn}
          onClick={() => {
            if (document.fullscreenElement) document.exitFullscreen();
            else boxRef.current?.requestFullscreen?.();
          }}
        >
          <Maximize2 className="h-4 w-4" aria-hidden />
          {labels.fullscreen}
        </button>
        <a href={src} target="_blank" rel="noopener noreferrer" className={btn}>
          <Download className="h-4 w-4" aria-hidden />
          {labels.download}
        </a>
      </div>

      <div className="relative bg-white">
        {!loaded ? (
          <p className="absolute inset-x-0 top-1/2 text-center text-sm text-mutedink">
            {labels.loading}
          </p>
        ) : null}
        <iframe
          src={src}
          title={labels.download}
          onLoad={() => setLoaded(true)}
          className="h-[70vh] max-h-[720px] min-h-80 w-full bg-white"
        />
      </div>

      <p className="border-t border-ligne bg-white px-3 py-2 text-center text-xs text-mutedink">
        <a href={src} target="_blank" rel="noopener noreferrer" className="text-majorelle underline">
          {labels.fallback}
        </a>
      </p>
    </div>
  );
}

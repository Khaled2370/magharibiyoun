import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // isomorphic-dompurify embarque jsdom, que le regroupement de Vercel n'arrive
  // pas à tracer : la page de séance renvoyait 500 en production alors qu'elle
  // fonctionnait en local. Déclaré externe, le paquet est chargé à l'exécution
  // depuis node_modules au lieu d'être inliné.
  serverExternalPackages: ["isomorphic-dompurify"],
  experimental: {
    serverActions: {
      // Par défaut Next.js refuse tout envoi de formulaire dépassant 1 Mo, et
      // le refus prend la forme d'une page « Application error » illisible.
      // On monte à 4 Mo : c'est le maximum utilisable, Vercel plafonnant de
      // toute façon le corps d'une requête à 4,5 Mo sur l'offre gratuite.
      // Les fichiers sont en plus contrôlés avant l'envoi (composant FileField)
      // et à la réception (lib/cloudinary.ts).
      bodySizeLimit: "4mb",
    },
  },
};

export default withNextIntl(nextConfig);

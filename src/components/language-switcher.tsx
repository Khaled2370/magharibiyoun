"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type AppPathname } from "@/i18n/routing";

const labels: Record<string, string> = {
  ar: "العربية",
  fr: "FR",
  en: "EN",
};

type StaticPathname = Exclude<AppPathname, `${string}[${string}`>;

const STATIC_PATHNAMES = Object.keys(routing.pathnames).filter(
  (p) => !p.includes("["),
);

/**
 * Les adresses traduites diffèrent d'une langue à l'autre : depuis une page de
 * détail on renvoie vers la page de rubrique la plus proche (comportement voulu
 * et déjà en place). On remonte les segments jusqu'à tomber sur une adresse
 * connue — nécessaire depuis que certaines routes ont deux paramètres
 * (ex. /admin/programs/[id]/sessions/[sessionId]).
 */
function toStaticPathname(pathname: string): StaticPathname {
  let p = pathname.replace(/\/\[.*$/, "");
  while (p && p !== "/") {
    if (STATIC_PATHNAMES.includes(p)) return p as StaticPathname;
    p = p.slice(0, p.lastIndexOf("/"));
  }
  return "/";
}

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const target = toStaticPathname(pathname);

  return (
    <div className="flex items-center gap-2.5 text-sm" dir="ltr">
      {routing.locales.map((l) => (
        <Link
          key={l}
          href={target}
          locale={l}
          className={
            l === locale
              ? "font-medium text-encre underline underline-offset-4"
              : "text-mutedink transition-colors hover:text-encre"
          }
        >
          {labels[l]}
        </Link>
      ))}
    </div>
  );
}

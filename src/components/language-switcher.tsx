"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type AppPathname } from "@/i18n/routing";

const labels: Record<string, string> = {
  ar: "العربية",
  fr: "FR",
  en: "EN",
};

type StaticPathname = Exclude<
  AppPathname,
  `${string}/[slug]` | `${string}/[id]`
>;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const target = pathname.replace(/\/\[[^\]]+\]$/, "") as StaticPathname;

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

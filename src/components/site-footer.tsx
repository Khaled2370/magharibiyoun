import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function SiteFooter() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");

  return (
    <footer className="border-t border-ligne bg-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-6 text-center text-xs text-mutedink sm:flex-row sm:justify-between">
        <span>{t("rights")}</span>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          <Link href="/about" className="hover:text-encre">
            {tn("about")}
          </Link>
          <span className="cursor-default">{t("charter")}</span>
          <span className="cursor-default">{t("privacy")}</span>
          <span className="cursor-default">{t("reply")}</span>
        </div>
      </div>
    </footer>
  );
}

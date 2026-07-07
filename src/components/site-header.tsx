import { getTranslations } from "next-intl/server";
import { Settings, UserRound } from "lucide-react";
import { auth } from "@/auth";
import { canEdit } from "@/lib/authz";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "./language-switcher";

export default async function SiteHeader() {
  const t = await getTranslations("nav");
  const th = await getTranslations("home");
  const session = await auth();

  return (
    <header className="border-b border-ligne bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-2.5 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-baseline gap-3">
            <span className="font-logo text-2xl font-medium">مغاربيون</span>
            <span className="hidden text-xs text-mutedink sm:inline">
              {th("tagline")}
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {canEdit(session) ? (
              <Link
                href="/admin"
                className="flex items-center gap-1 text-sm font-medium text-mutedink transition-colors hover:text-encre"
              >
                <Settings className="h-4 w-4" aria-hidden />
                {t("admin")}
              </Link>
            ) : null}
            {session?.user ? (
              <Link
                href="/account"
                className="flex items-center gap-1.5 rounded-lg border border-majorelle px-3 py-1 text-sm font-medium text-majorelle transition-colors hover:bg-majorellel"
              >
                <UserRound className="h-4 w-4" aria-hidden />
                <span className="max-w-28 truncate">{session.user.name}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-lg border border-majorelle px-3 py-1 text-sm font-medium text-majorelle transition-colors hover:bg-majorellel"
              >
                {t("login")}
              </Link>
            )}
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium">
          <Link href="/encyclopedia" className="hover:text-majorelle">
            {t("encyclopedia")}
          </Link>
          <Link href="/initiatives" className="hover:text-majorelle">
            {t("initiatives")}
          </Link>
          <Link href="/opinions" className="hover:text-majorelle">
            {t("opinions")}
          </Link>
          <Link href="/learn" className="hover:text-majorelle">
            {t("learn")}
          </Link>
          <Link href="/media" className="hover:text-majorelle">
            {t("media")}
          </Link>
          <Link href="/contribute" className="text-terracotta hover:underline">
            {t("contribute")}
          </Link>
        </nav>
      </div>
    </header>
  );
}

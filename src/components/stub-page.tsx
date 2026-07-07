import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type NavKey =
  | "encyclopedia"
  | "initiatives"
  | "opinions"
  | "learn"
  | "media"
  | "contribute"
  | "about";

export default async function StubPage({ titleKey }: { titleKey: NavKey }) {
  const t = await getTranslations("nav");
  const ts = await getTranslations("stub");

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-3xl font-medium">{t(titleKey)}</h1>
      <p className="mt-4 leading-loose text-mutedink">{ts("wip")}</p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-lg border border-majorelle px-5 py-2 text-sm font-medium text-majorelle transition-colors hover:bg-majorellel"
      >
        {ts("back")}
      </Link>
    </div>
  );
}

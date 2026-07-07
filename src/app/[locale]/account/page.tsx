import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth, signOut } from "@/auth";
import { redirect } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user) {
    redirect({ href: "/login", locale });
  }

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    include: { roles: { include: { role: true } } },
  });
  if (!user) {
    redirect({ href: "/login", locale });
  }

  const t = await getTranslations("account");
  const ta = await getTranslations("auth");

  const roleLabels = user!.roles.map((r) => {
    const labels = r.role.labels as Record<string, string>;
    return labels[locale] ?? r.role.key;
  });
  const joined = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-TN" : locale,
    { dateStyle: "long" },
  ).format(user!.createdAt);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-medium">{t("title")}</h1>
      <div className="mt-6 rounded-xl border border-ligne bg-white p-6">
        <p className="text-lg font-medium">
          {t("welcome", { name: user!.displayName })}
        </p>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-mutedink">{ta("email")}</dt>
            <dd dir="ltr">{user!.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-mutedink">{t("roles")}</dt>
            <dd>{roleLabels.join(locale === "ar" ? "، " : ", ")}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-mutedink">{t("memberSince")}</dt>
            <dd>{joined}</dd>
          </div>
        </dl>
      </div>
      <p className="mt-4 text-sm text-mutedink">{t("contributionsSoon")}</p>
      <form
        className="mt-6"
        action={async () => {
          "use server";
          await signOut({ redirectTo: locale === "ar" ? "/" : `/${locale}` });
        }}
      >
        <button
          type="submit"
          className="rounded-lg border border-terracotta px-5 py-2 text-sm font-medium text-terracotta transition-colors hover:bg-terracottal"
        >
          {ta("logout")}
        </button>
      </form>
    </div>
  );
}

import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth, signOut } from "@/auth";
import { redirect } from "@/i18n/navigation";
import { KeyRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { changePassword } from "@/actions/account";

const inputCls =
  "w-full rounded-lg border border-ligne bg-white px-3 py-2 text-sm outline-none focus:border-majorelle";
const labelCls = "mb-1 block text-sm font-medium";

/** Motif d'échec renvoyé par l'action → clé de traduction affichée. */
const PWD_ERRORS: Record<string, string> = {
  required: "errRequired",
  tooShort: "errTooShort",
  mismatch: "errMismatch",
  wrongPassword: "errWrongPassword",
  generic: "errGeneric",
};

export default async function AccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ pwd?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
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
      <section className="mt-6 rounded-xl border border-ligne bg-white p-6">
        <h2 className="flex items-center gap-2 font-medium">
          <KeyRound className="h-4 w-4 text-majorelle" aria-hidden />
          {t("changePassword")}
        </h2>

        {sp.pwd === "ok" ? (
          <p className="mt-3 rounded-lg bg-oasisl px-4 py-2.5 text-sm text-oasis">
            {t("changeSuccess")}
          </p>
        ) : null}
        {sp.pwd && sp.pwd !== "ok" ? (
          <p className="mt-3 rounded-lg bg-terracottal px-4 py-2.5 text-sm text-terracotta">
            {t(PWD_ERRORS[sp.pwd] ?? "errGeneric")}
          </p>
        ) : null}

        <form action={changePassword} className="mt-4 space-y-4">
          <input type="hidden" name="uiLocale" value={locale} />
          <div>
            <label className={labelCls} htmlFor="currentPassword">
              {t("currentPassword")}
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="newPassword">
                {t("newPassword")}
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="confirmPassword">
                {t("confirmPassword")}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className={inputCls}
              />
            </div>
          </div>
          <p className="text-xs text-mutedink">{t("passwordHint")}</p>
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-majorelle px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {t("changeSubmit")}
            </button>
          </div>
        </form>
      </section>

      <p className="mt-6 text-sm text-mutedink">{t("contributionsSoon")}</p>
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

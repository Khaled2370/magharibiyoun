import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { Link, redirect } from "@/i18n/navigation";
import RegisterForm from "@/components/register-form";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (session?.user) {
    redirect({ href: "/account", locale });
  }
  const t = await getTranslations("auth");

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center text-2xl font-medium">{t("registerTitle")}</h1>
      <div className="mt-8 rounded-xl border border-ligne bg-white p-6">
        <RegisterForm />
      </div>
      <p className="mt-4 text-center text-sm text-mutedink">
        {t("haveAccount")}{" "}
        <Link
          href="/login"
          className="font-medium text-majorelle hover:underline"
        >
          {t("loginLink")}
        </Link>
      </p>
    </div>
  );
}

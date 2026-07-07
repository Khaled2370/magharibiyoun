"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { registerUser } from "@/actions/register";

export default function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const result = await registerUser(form);
    if (!result.ok) {
      setLoading(false);
      const map: Record<string, string> = {
        required: t("errorRequired"),
        emailInvalid: t("errorEmailInvalid"),
        passwordShort: t("errorPasswordShort"),
        emailExists: t("errorEmailExists"),
        generic: t("errorGeneric"),
      };
      setError(map[result.error] ?? t("errorGeneric"));
      return;
    }
    const res = await signIn("credentials", {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      router.push("/login");
    } else {
      router.push("/account");
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-terracottal px-4 py-2.5 text-sm text-terracotta">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="displayName" className="mb-1 block text-sm font-medium">
          {t("displayName")}
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          autoComplete="name"
          className="w-full rounded-lg border border-ligne bg-white px-3 py-2 text-sm outline-none focus:border-majorelle"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          dir="ltr"
          autoComplete="email"
          className="w-full rounded-lg border border-ligne bg-white px-3 py-2 text-sm outline-none focus:border-majorelle"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          {t("password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          dir="ltr"
          autoComplete="new-password"
          className="w-full rounded-lg border border-ligne bg-white px-3 py-2 text-sm outline-none focus:border-majorelle"
        />
        <p className="mt-1 text-xs text-mutedink">{t("passwordHint")}</p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-majorelle px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {loading ? t("creating") : t("registerButton")}
      </button>
    </form>
  );
}

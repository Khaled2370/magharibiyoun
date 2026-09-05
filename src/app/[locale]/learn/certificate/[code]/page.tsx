import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Award } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { fmtSessionDate } from "@/lib/lms";
import PrintButton from "@/components/lms/print-button";

/**
 * Certificat public, consultable par son numéro.
 *
 * Volontairement **accessible sans connexion** : c'est ce qui permet à un tiers
 * de vérifier qu'un certificat présenté est authentique. On n'y publie donc que
 * le strict nécessaire — nom, programme, date, numéro — jamais l'adresse
 * e-mail ni le détail du parcours.
 */
export default async function CertificatePage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("lms");

  const certificate = await prisma.certificate.findUnique({
    where: { code },
    include: {
      user: { select: { displayName: true } },
      program: { select: { title: true, durationWeeks: true } },
    },
  });
  if (!certificate) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <article className="rounded-2xl border-2 border-majorelle bg-white p-8 text-center sm:p-12 print:border-encre">
        <Award className="mx-auto h-14 w-14 text-majorelle" aria-hidden />
        <p className="mt-4 text-sm uppercase tracking-widest text-mutedink">
          {t("certificateLabel")}
        </p>
        <h1 className="mt-2 text-2xl font-medium sm:text-3xl">
          {t("certificateHeading")}
        </h1>

        <p className="mt-8 text-sm text-mutedink">{t("certificateAwardedTo")}</p>
        <p className="mt-1 text-2xl font-medium">{certificate.user.displayName}</p>

        <p className="mt-6 text-sm text-mutedink">{t("certificateForProgram")}</p>
        <p className="mt-1 text-lg font-medium leading-relaxed">
          {certificate.program.title}
        </p>

        <dl className="mt-8 grid grid-cols-1 gap-4 border-t border-ligne pt-6 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-mutedink">{t("certificateIssuedOn")}</dt>
            <dd className="mt-0.5 font-medium">
              {fmtSessionDate(locale, certificate.issuedAt)}
            </dd>
          </div>
          {certificate.score !== null ? (
            <div>
              <dt className="text-mutedink">{t("certificateScore")}</dt>
              <dd className="mt-0.5 font-medium" dir="ltr">
                {certificate.score}%
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-mutedink">{t("certificateCode")}</dt>
            <dd className="mt-0.5 font-medium" dir="ltr">
              {certificate.code}
            </dd>
          </div>
        </dl>

        <p className="mt-6 text-xs leading-relaxed text-mutedink">
          {t("certificateVerifyHint")}
        </p>
      </article>

      <div className="mt-6 flex justify-center print:hidden">
        <PrintButton label={t("certificatePrint")} />
      </div>
    </div>
  );
}

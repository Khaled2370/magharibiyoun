import { setRequestLocale } from "next-intl/server";
import StubPage from "@/components/stub-page";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <StubPage titleKey="about" />;
}

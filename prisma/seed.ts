import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedDemoContent } from "./demo-content";
import { seedHistory } from "./demo-history";
import { seedPersonalities } from "./demo-personalities";
import { seedCulture } from "./demo-culture";
import { seedHistory2 } from "./demo-history2";
import { seedPersonalities2 } from "./demo-personalities2";
import { seedCulture2 } from "./demo-culture2";
import { linkBatch2ToExisting } from "./demo-crosslinks2";
import { seedInitiativeVGM } from "./demo-initiative-vgm";
import { seedEducation } from "./demo-education";

const prisma = new PrismaClient();

async function main() {
  const languages = [
    { code: "ar", name: "العربية", dir: "rtl", isInterface: true },
    { code: "fr", name: "Français", dir: "ltr", isInterface: true },
    { code: "en", name: "English", dir: "ltr", isInterface: true },
    { code: "amz", name: "Tamazight", dir: "ltr", isInterface: false },
  ];
  for (const l of languages) {
    await prisma.language.upsert({
      where: { code: l.code },
      update: l,
      create: l,
    });
  }

  const countries = [
    { code: "TN", labels: { ar: "تونس", fr: "Tunisie", en: "Tunisia" }, flagEmoji: "🇹🇳" },
    { code: "DZ", labels: { ar: "الجزائر", fr: "Algérie", en: "Algeria" }, flagEmoji: "🇩🇿" },
    { code: "MA", labels: { ar: "المغرب", fr: "Maroc", en: "Morocco" }, flagEmoji: "🇲🇦" },
    { code: "LY", labels: { ar: "ليبيا", fr: "Libye", en: "Libya" }, flagEmoji: "🇱🇾" },
    { code: "MR", labels: { ar: "موريتانيا", fr: "Mauritanie", en: "Mauritania" }, flagEmoji: "🇲🇷" },
    { code: "DSP", labels: { ar: "الجالية المغاربية", fr: "Diaspora maghrébine", en: "Maghrebi diaspora" }, flagEmoji: "🌍" },
  ];
  for (const c of countries) {
    await prisma.country.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }

  const roles = [
    { key: "member", labels: { ar: "عضو", fr: "Membre", en: "Member" } },
    { key: "contributor", labels: { ar: "مساهم", fr: "Contributeur", en: "Contributor" } },
    { key: "verified_author", labels: { ar: "كاتب موثّق", fr: "Auteur vérifié", en: "Verified author" } },
    { key: "researcher", labels: { ar: "باحث", fr: "Chercheur", en: "Researcher" } },
    { key: "translator", labels: { ar: "مترجم", fr: "Traducteur", en: "Translator" } },
    { key: "moderator", labels: { ar: "مشرف", fr: "Modérateur", en: "Moderator" } },
    { key: "editor", labels: { ar: "محرّر", fr: "Éditeur", en: "Editor" } },
    { key: "admin", labels: { ar: "مدير", fr: "Administrateur", en: "Administrator" } },
    { key: "super_admin", labels: { ar: "مدير عام", fr: "Super administrateur", en: "Super administrator" } },
  ];
  for (const r of roles) {
    await prisma.role.upsert({
      where: { key: r.key },
      update: { labels: r.labels },
      create: r,
    });
  }

  const adminEmail = "admin@magharibiyoun.tn";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (!existingAdmin) {
    const adminPassword = process.env.ADMIN_PASSWORD ?? "MagharibAdmin2026!";
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        displayName: "Admin",
        passwordHash,
        identityVerified: true,
        roles: {
          create: [
            { role: { connect: { key: "super_admin" } } },
            { role: { connect: { key: "admin" } } },
            { role: { connect: { key: "editor" } } },
          ],
        },
      },
    });
  }

  await seedDemoContent(prisma);
  await seedHistory(prisma);
  await seedPersonalities(prisma);
  await seedCulture(prisma);
  await seedHistory2(prisma);
  await seedPersonalities2(prisma);
  await seedCulture2(prisma);
  await linkBatch2ToExisting(prisma);
  await seedInitiativeVGM(prisma);
  await seedEducation(prisma);

  console.log("Seed terminé : langues, pays, rôles et compte admin créés.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Réinitialise le mot de passe du compte administrateur.
 *
 * Deux usages :
 *  - en local :   tsx scripts/reset-admin-password.ts "<nouveau-mot-de-passe>"
 *  - au build :   la variable d'environnement ADMIN_PASSWORD est lue si elle
 *                 existe. C'est le moyen de reprendre la main sur la production
 *                 sans jamais faire circuler ni les identifiants de la base, ni
 *                 le mot de passe choisi : Khaled le saisit dans Vercel, le
 *                 déploiement l'applique, puis la variable est supprimée.
 *
 * Sans mot de passe fourni, le script ne fait rien et n'échoue pas — il peut
 * donc rester dans la chaîne de build sans effet.
 */
async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@magharibiyoun.tn";
  const newPassword = process.argv[2] ?? process.env.ADMIN_PASSWORD;

  if (!newPassword) {
    console.log("[admin] aucun ADMIN_PASSWORD fourni — rien à faire.");
    return;
  }
  if (newPassword.length < 8) {
    throw new Error("Le mot de passe doit faire au moins 8 caractères.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    console.log(`[admin] compte ${email} introuvable — rien à faire.`);
    return;
  }

  await prisma.user.update({
    where: { email },
    data: { passwordHash: await bcrypt.hash(newPassword, 12) },
  });
  // On n'affiche jamais le mot de passe : les journaux de build sont consultables.
  console.log(`[admin] mot de passe réinitialisé pour ${email}.`);
}

main()
  .catch((e) => {
    console.error("[admin] échec :", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

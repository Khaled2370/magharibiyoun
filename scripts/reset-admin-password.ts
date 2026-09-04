import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@magharibiyoun.tn";
  const newPassword = process.argv[2];
  if (!newPassword) {
    console.error("Usage: tsx scripts/reset-admin-password.ts <nouveau-mot-de-passe>");
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(newPassword, 12);
  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });
  console.log(`Mot de passe reinitialise pour ${user.email} (id ${user.id}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

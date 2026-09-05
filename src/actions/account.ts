"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/authz";
import { redirect } from "@/i18n/navigation";

/**
 * Changement de mot de passe par l'utilisateur lui-même.
 *
 * Exige le mot de passe actuel : sans ça, quelqu'un trouvant une session
 * ouverte sur un poste partagé pourrait verrouiller le compte de son
 * propriétaire.
 *
 * Renvoie le résultat par un paramètre d'adresse plutôt que par un état
 * React, comme le reste du site : ça marche même si le JavaScript échoue,
 * et ça reste testable sans navigateur.
 */
export async function changePassword(formData: FormData) {
  const locale = String(formData.get("uiLocale") ?? "ar");
  const session = await auth();
  if (!isAuthenticated(session)) {
    redirect({ href: "/login", locale });
    return;
  }

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  const back = (pwd: string) => {
    redirect({ href: { pathname: "/account", query: { pwd } }, locale });
  };

  if (!current || !next || !confirm) return back("required");
  if (next.length < 8) return back("tooShort");
  if (next !== confirm) return back("mismatch");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, passwordHash: true },
  });
  if (!user?.passwordHash) return back("generic");

  if (!(await bcrypt.compare(current, user.passwordHash))) {
    return back("wrongPassword");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(next, 12) },
  });

  return back("ok");
}

import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";
import type { Session } from "next-auth";

export const EDITOR_ROLES = ["editor", "admin", "super_admin"];

/** Session dont on a vérifié qu'elle correspond à un vrai compte connecté. */
export type AuthenticatedSession = Session & {
  user: Session["user"] & { id: string };
};

/**
 * Vérifie qu'une session est réellement authentifiée.
 *
 * Pourquoi ne pas se contenter de « l'objet session existe » : l'avis de
 * sécurité Auth.js GHSA-8fpg-xm3f-6cx3 a montré qu'une erreur de configuration
 * pouvait renvoyer un objet session **peuplé mais non authentifié**. Tout
 * contrôle du type `if (session?.user)` passait alors à tort — c'est exactement
 * la forme qu'avait `requireUser` avant le 2026-09-04.
 *
 * La bibliothèque est désormais à jour, mais on ne s'en remet pas à elle seule :
 * on exige un identifiant d'utilisateur exploitable et l'absence de champ
 * d'erreur. Une session dégradée est traitée comme une absence de session.
 */
export function isAuthenticated(
  session: Session | null,
): session is AuthenticatedSession {
  if (!session) return false;
  if ((session as { error?: unknown }).error) return false;
  const id = session.user?.id;
  return typeof id === "string" && id.length > 0;
}

export function canEdit(session: Session | null): boolean {
  if (!isAuthenticated(session)) return false;
  const roles = session.user.roles;
  return Array.isArray(roles) && roles.some((r) => EDITOR_ROLES.includes(r));
}

export async function requireEditor(locale: string): Promise<AuthenticatedSession> {
  const session = await auth();
  if (!canEdit(session)) {
    redirect({ href: "/login", locale });
  }
  return session as AuthenticatedSession;
}

export async function requireUser(locale: string): Promise<AuthenticatedSession> {
  const session = await auth();
  if (!isAuthenticated(session)) {
    redirect({ href: "/login", locale });
  }
  // `redirect` interrompt l'exécution, mais TypeScript ne le sait pas : à ce
  // point la session a forcément passé le contrôle ci-dessus.
  return session as AuthenticatedSession;
}

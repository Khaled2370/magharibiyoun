import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";
import type { Session } from "next-auth";

export const EDITOR_ROLES = ["editor", "admin", "super_admin"];

export function canEdit(session: Session | null): boolean {
  return Boolean(
    session?.user?.roles?.some((r) => EDITOR_ROLES.includes(r)),
  );
}

export async function requireEditor(locale: string): Promise<Session> {
  const session = await auth();
  if (!canEdit(session)) {
    redirect({ href: "/login", locale });
  }
  return session!;
}

export async function requireUser(locale: string): Promise<Session> {
  const session = await auth();
  if (!session?.user) {
    redirect({ href: "/login", locale });
  }
  return session!;
}

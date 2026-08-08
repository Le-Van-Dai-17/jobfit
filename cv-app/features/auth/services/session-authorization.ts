import type { UserRole } from "@prisma/client";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { prisma } from "@/lib/db/prisma";

const validRoles = new Set<UserRole>(["ADMIN", "CANDIDATE", "RECRUITER"]);

export type SessionPrincipal = {
  id?: string | null;
  role?: UserRole | string | null;
};

export function normalizePrincipal(principal: SessionPrincipal | null | undefined) {
  if (!principal?.id || !principal.role || !validRoles.has(principal.role as UserRole)) return null;
  return { id: principal.id, role: principal.role as UserRole };
}

export function isActiveRole(principal: SessionPrincipal | null | undefined, role: UserRole) {
  return normalizePrincipal(principal)?.role === role;
}

export function requireRole(principal: SessionPrincipal | null | undefined, role: UserRole) {
  const normalized = normalizePrincipal(principal);
  if (!normalized || normalized.role !== role) return null;
  return normalized;
}

export async function requireActiveRole(principal: SessionPrincipal | null | undefined, role: UserRole) {
  const tokenPrincipal = requireRole(principal, role);
  if (!tokenPrincipal) return null;

  const user = await prisma.user.findFirst({
    where: { id: tokenPrincipal.id, role, deletedAt: null },
    select: { id: true, role: true },
  });

  return user ? { id: user.id, role: user.role } : null;
}

export function normalizeJwtPrincipal(token: JWT) {
  return normalizePrincipal({ id: token.sub ?? token.id, role: token.role });
}

export function clearJwtPrincipal(token: JWT) {
  delete token.id;
  delete token.sub;
  delete token.role;
  delete token.name;
  delete token.email;
  delete token.picture;
  return token;
}

export function applySessionPrincipal(session: Session, token: JWT) {
  const principal = normalizeJwtPrincipal(token);
  if (!principal) {
    return { ...session, user: undefined } as unknown as Session;
  }
  return {
    ...session,
    user: {
      ...session.user,
      id: principal.id,
      role: principal.role,
    },
  } as Session;
}

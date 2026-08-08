import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAuthUserRepository } from "@/features/auth/repositories/auth.repository";
import { normalizePrincipal } from "@/features/auth/services/session-authorization";
import { AuthService, InvalidCredentialsError } from "@/features/auth/services/auth.service";
import { getDashboardPathForRole, getRouteDecision } from "@/features/auth/services/role-redirects";

export default {
  providers: [
    Google,
    GitHub,
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const authService = new AuthService(new PrismaAuthUserRepository());
        try {
          const user = await authService.authenticate(email, password);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          if (!(error instanceof InvalidCredentialsError)) {
            throw error;
          }
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const user = normalizePrincipal(auth?.user);
      const isLoggedIn = !!user;
      const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");

      if (isApiAuthRoute) return true;

      const decision = getRouteDecision({
        pathname: nextUrl.pathname,
        user,
      });

      if ("redirectTo" in decision) {
        if (!isLoggedIn && decision.redirectTo === "/login") {
          return false;
        }
        return Response.redirect(new URL(decision.redirectTo, nextUrl));
      }

      if (isLoggedIn && nextUrl.pathname === "/") {
        return Response.redirect(new URL(getDashboardPathForRole(user.role), nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;

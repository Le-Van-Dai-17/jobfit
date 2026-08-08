import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import { applySessionPrincipal, clearJwtPrincipal } from "@/features/auth/services/session-authorization";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      const userId = user?.id ?? token.sub;
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true, deletedAt: true },
        });
        if (!dbUser || dbUser.deletedAt) {
          return clearJwtPrincipal(token);
        }
        token.id = dbUser.id;
        token.sub = dbUser.id;
        token.role = dbUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      return applySessionPrincipal(session, token);
    },
  },
});

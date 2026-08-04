import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account }) {
      if (user && account) {
        // For Credentials provider, the adapter does NOT create a DB user.
        // We must upsert manually so foreign-key references work.
        if (account.provider === "credentials" && user.email) {
          const dbUser = await prisma.user.upsert({
            where: { email: user.email },
            update: { name: user.name },
            create: {
              email: user.email,
              name: user.name || user.email.split("@")[0],
              role: "USER",
            },
          });
          token.id = dbUser.id;
          token.sub = dbUser.id;
        } else {
          // OAuth providers — adapter already created the user
          token.id = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});

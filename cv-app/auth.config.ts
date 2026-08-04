import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

// Notice this is only an object, not a full Auth instance.
export default {
  providers: [Google, GitHub],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
      const isPublicRoute = nextUrl.pathname === "/" || nextUrl.pathname === "/login";

      if (isApiAuthRoute) return true;

      if (!isLoggedIn && !isPublicRoute) {
        return false; // Redirect unauthenticated users to login page
      }

      if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/", nextUrl)); // Redirect to dashboard if already logged in
      }

      return true;
    },
  },
} satisfies NextAuthConfig;

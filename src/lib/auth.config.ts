import type { NextAuthConfig } from "next-auth";

// Edge-safe subset of the auth config (no Prisma/bcrypt) so middleware can use it.
export const authConfig = {
  providers: [],
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (pathname.startsWith("/admin/login")) return true;
      return auth?.user?.role === "ADMIN";
    },
  },
} satisfies NextAuthConfig;

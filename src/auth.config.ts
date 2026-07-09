/**
 * FICHIER : src/auth.config.ts
 * RÔLE : Configuration NextAuth "légère", compatible Edge Runtime.
 * Utilisée par le middleware (src/middleware.ts) ET par la config
 * complète (src/lib/auth.ts).
 *
 * IMPORTANT : copie le rôle (role) ET l'identifiant (id) de l'utilisateur
 * dans le token puis la session — sans le id, impossible de savoir quel
 * utilisateur est connecté dans les Server Actions (ex: activerAbonnementTest
 * dans src/app/(site)/abonnez-vous/actions.ts).
 */
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/admin/connexion",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.id = (user as { id: string }).id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const estConnecte = !!auth?.user;
      const estAdmin = auth?.user?.role === "ADMIN";
      const cibleAdmin = nextUrl.pathname.startsWith("/admin");
      const cibleConnexion = nextUrl.pathname === "/admin/connexion";

      if (cibleAdmin && !cibleConnexion) {
        return estConnecte && estAdmin;
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
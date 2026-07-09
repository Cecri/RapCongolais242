/**
 * FICHIER : src/components/Providers.tsx
 * RÔLE : Regroupe tous les "contextes globaux" du site (session NextAuth
 * + lecteur audio), posé une seule fois dans src/app/layout.tsx pour
 * qu'ils soient disponibles sur toutes les pages.
 */
"use client";

import { SessionProvider } from "next-auth/react";
import { PlayerProvider } from "@/context/PlayerContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PlayerProvider>{children}</PlayerProvider>
    </SessionProvider>
  );
}
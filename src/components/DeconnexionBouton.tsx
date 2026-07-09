"use client";

import { signOut } from "next-auth/react";

export default function DeconnexionBouton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-ink-softer"
    >
      Déconnexion
    </button>
  );
}
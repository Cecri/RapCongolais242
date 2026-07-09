/**
 * FICHIER : src/app/admin/artistes/[id]/BoutonSupprimerArtiste.tsx
 * RÔLE : Bouton de suppression d'un artiste, avec confirmation. La
 * suppression entraîne aussi celle de tous ses sons (cascade en base).
 */
"use client";

import { useTransition } from "react";
import { supprimerArtiste } from "../actions";

export default function BoutonSupprimerArtiste({ artistId }: { artistId: string }) {
  const [enCours, startTransition] = useTransition();

  function handleClic() {
    if (!confirm("Supprimer cet artiste et TOUS ses sons ? Cette action est irréversible.")) return;
    startTransition(() => supprimerArtiste(artistId));
  }

  return (
    <button onClick={handleClic} disabled={enCours} className="rounded-lg border border-ember/40 px-4 py-2 text-sm font-semibold text-ember hover:bg-ember/10 disabled:opacity-60">
      {enCours ? "..." : "Supprimer"}
    </button>
  );
}
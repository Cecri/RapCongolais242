/**
 * FICHIER : src/app/(site)/mes-playlists/BoutonSupprimerPlaylist.tsx
 * RÔLE : Bouton de suppression d'une playlist, avec confirmation avant
 * suppression réelle (irréversible).
 */
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { supprimerPlaylist } from "./actions";

export default function BoutonSupprimerPlaylist({ playlistId }: { playlistId: string }) {
  const router = useRouter();
  const [enCours, startTransition] = useTransition();

  function handleClic(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm("Supprimer cette playlist ? Cette action est irréversible.")) return;
    startTransition(async () => {
      await supprimerPlaylist(playlistId);
      router.refresh();
    });
  }

  return (
    <button onClick={handleClic} disabled={enCours} className="ml-3 text-sm text-ash hover:text-ember disabled:opacity-60">
      {enCours ? "..." : "Supprimer"}
    </button>
  );
}
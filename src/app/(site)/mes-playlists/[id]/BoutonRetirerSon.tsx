/**
 * FICHIER : src/app/(site)/mes-playlists/[id]/BoutonRetirerSon.tsx
 * RÔLE : Bouton pour retirer un son d'une playlist.
 */
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { retirerSonDePlaylist } from "../actions";

export default function BoutonRetirerSon({ playlistId, trackId }: { playlistId: string; trackId: string }) {
  const router = useRouter();
  const [enCours, startTransition] = useTransition();

  return (
    <button
      disabled={enCours}
      onClick={() => startTransition(async () => { await retirerSonDePlaylist(playlistId, trackId); router.refresh(); })}
      className="text-sm text-ash hover:text-ember disabled:opacity-60"
    >
      {enCours ? "..." : "Retirer"}
    </button>
  );
}
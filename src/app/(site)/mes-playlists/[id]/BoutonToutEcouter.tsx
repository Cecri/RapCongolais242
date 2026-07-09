/**
 * FICHIER : src/app/(site)/mes-playlists/[id]/BoutonToutEcouter.tsx
 * RÔLE : Lance la lecture de toute la playlist comme une vraie file
 * d'attente (playQueue), activant précédent/suivant/aléatoire/boucle
 * dans PlayerBar.
 */
"use client";

import { usePlayer, type PlayerTrack } from "@/context/PlayerContext";

export default function BoutonToutEcouter({ sons }: { sons: PlayerTrack[] }) {
  const { playQueue } = usePlayer();

  return (
    <button
      onClick={() => playQueue(sons, 0)}
      className="rounded-lg bg-ember px-4 py-2 text-sm font-semibold"
    >
      ▶ Tout écouter
    </button>
  );
}
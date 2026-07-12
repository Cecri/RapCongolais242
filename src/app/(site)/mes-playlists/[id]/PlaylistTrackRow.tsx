/**
 * FICHIER : src/app/(site)/mes-playlists/[id]/PlaylistTrackRow.tsx
 * RÔLE : Ligne d'un son dans une playlist. Icône lecture toujours
 * visible sur mobile, au survol seulement sur desktop.
 */
"use client";

import { usePlayer, type PlayerTrack } from "@/context/PlayerContext";
import BoutonRetirerSon from "./BoutonRetirerSon";

export default function PlaylistTrackRow({
  track,
  index,
  toutesLesPistes,
  playlistId,
  numero,
}: {
  track: PlayerTrack;
  index: number;
  toutesLesPistes: PlayerTrack[];
  playlistId: string;
  numero: number;
}) {
  const { currentTrack, isPlaying, playQueue, togglePlay } = usePlayer();
  const estCeSon = currentTrack?.id === track.id;
  const estEnCours = estCeSon && isPlaying;

  function handleClic() {
    if (estCeSon) {
      togglePlay();
    } else {
      playQueue(toutesLesPistes, index);
    }
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-ink-soft px-5 py-4">
      <button
        onClick={handleClic}
        aria-label={estEnCours ? `Mettre en pause ${track.title}` : `Écouter ${track.title}`}
        className="group relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-ink-softer"
      >
        {track.coverUrl && <img src={track.coverUrl} alt="" className="h-full w-full scale-135 object-cover" />}
        <span
          className={`absolute inset-0 flex items-center justify-center bg-black/50 text-sm text-paper transition-opacity ${
            estEnCours ? "opacity-100" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          }`}
        >
          {estEnCours ? "⏸" : "▶"}
        </span>
      </button>

      <div className="flex-1">
        <p className={`font-semibold ${estCeSon ? "text-copper" : ""}`}>{track.title}</p>
        <p className="text-xs text-ash">{track.artistName}</p>
      </div>

      <span className="w-5 text-right font-mono text-xs text-ash">{numero}</span>
      <BoutonRetirerSon playlistId={playlistId} trackId={track.id} />
    </div>
  );
}
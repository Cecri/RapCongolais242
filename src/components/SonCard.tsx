/**
 * FICHIER : src/components/SonCard.tsx
 * RÔLE : Carte d'un son. Correction : overflow-hidden déplacé uniquement
 * sur la zone image (pas sur toute la carte), pour que le menu déroulant
 * du bouton "+" (playlist) puisse s'afficher par-dessus sans être coupé.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePlayer } from "@/context/PlayerContext";
import YoutubeModal from "@/components/YoutubeModal";
import FavoriButton from "@/components/FavoriButton";
import AjouterAPlaylistButton from "@/components/AjouterAPlaylistButton";

type SonCardProps = {
  id: string;
  title: string;
  artistName: string;
  artistSlug: string;
  coverUrl: string | null;
  isExclusive: boolean;
  audioUrl: string | null;
  externalUrl?: string | null;
  verrouille: boolean;
  estConnecte?: boolean;
};

function extraireIdYoutube(url: string): string | null {
  const correspondance = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  return correspondance ? correspondance[1] : null;
}

export default function SonCard({
  id,
  title,
  artistName,
  coverUrl,
  isExclusive,
  audioUrl,
  externalUrl,
  verrouille,
  estConnecte = false,
}: SonCardProps) {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const estEnCours = currentTrack?.id === id && isPlaying;
  const droitsAcquis = !!audioUrl;
  const idYoutube = externalUrl ? extraireIdYoutube(externalUrl) : null;

  function handleClic() {
    if (verrouille) return;
    if (audioUrl) {
      playTrack({ id, title, artistName, audioUrl, coverUrl });
    } else if (idYoutube) {
      setModaleOuverte(true);
    }
  }

  const peutLire = !verrouille && (!!audioUrl || !!idYoutube);

  return (
    <div className="group rounded-2xl border border-white/10 bg-ink-soft transition-colors hover:border-white/20">
      <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-ink-softer">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="h-full w-full scale-140 object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-3xl text-white/15">♪</div>
        )}

        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1">
          {isExclusive && (<span className="rounded-full bg-copper-dim px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-copper">Exclusif</span>)}
          {droitsAcquis && !verrouille && (<span className="rounded-full bg-emerald-dim px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-emerald">Droits acquis</span>)}
        </div>

        {verrouille ? (
          <Link href="/abonnez-vous" aria-label="Réservé aux abonnés Premium" className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-ink text-paper opacity-0 transition-opacity group-hover:opacity-100">🔒</Link>
        ) : peutLire ? (
          <button
            aria-label={audioUrl && estEnCours ? `Mettre en pause ${title}` : `Écouter ${title}`}
            onClick={handleClic}
            className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-ember text-paper opacity-0 transition-opacity group-hover:opacity-100"
          >
            {audioUrl && estEnCours ? "⏸" : "▶"}
          </button>
        ) : null}
      </div>
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="truncate text-xs text-ash">{artistName}</p>
        </div>
        <div className="flex items-center gap-2.5">
          {droitsAcquis && <AjouterAPlaylistButton trackId={id} estConnecte={estConnecte} />}
          <FavoriButton trackId={id} estConnecte={estConnecte} />
        </div>
      </div>

      {modaleOuverte && idYoutube && (
        <YoutubeModal videoId={idYoutube} onClose={() => setModaleOuverte(false)} />
      )}
    </div>
  );
}
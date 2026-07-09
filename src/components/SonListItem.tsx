/**
 * FICHIER : src/components/SonListItem.tsx
 * RÔLE : Variante "liste horizontale" d'un son (au lieu de la carte
 * carrée de SonCard) — utilisée sur le profil artiste pour retrouver
 * la discographie en liste. Mêmes fonctionnalités que SonCard : lecture
 * réelle, favoris, ajout playlist, badges, verrouillage Premium.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePlayer } from "@/context/PlayerContext";
import YoutubeModal from "@/components/YoutubeModal";
import FavoriButton from "@/components/FavoriButton";
import AjouterAPlaylistButton from "@/components/AjouterAPlaylistButton";

type SonListItemProps = {
  id: string;
  title: string;
  artistName: string;
  coverUrl: string | null;
  isExclusive: boolean;
  audioUrl: string | null;
  externalUrl?: string | null;
  verrouille: boolean;
  estConnecte?: boolean;
  numero?: number;
};

function extraireIdYoutube(url: string): string | null {
  const correspondance = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  return correspondance ? correspondance[1] : null;
}

export default function SonListItem({
  id,
  title,
  artistName,
  coverUrl,
  isExclusive,
  audioUrl,
  externalUrl,
  verrouille,
  estConnecte = false,
  numero,
}: SonListItemProps) {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const estEnCours = currentTrack?.id === id && isPlaying;
  const droitsAcquis = !!audioUrl;
  const idYoutube = externalUrl ? extraireIdYoutube(externalUrl) : null;
  const peutLire = !verrouille && (!!audioUrl || !!idYoutube);

  function handleClic() {
    if (verrouille) return;
    if (audioUrl) {
      playTrack({ id, title, artistName, audioUrl, coverUrl });
    } else if (idYoutube) {
      setModaleOuverte(true);
    }
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-ink-soft px-5 py-4">
      {numero !== undefined && (
        <span className="w-5 shrink-0 font-mono text-sm text-ash">{String(numero).padStart(2, "0")}</span>
      )}

      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-ink-softer">
        {coverUrl && <img src={coverUrl} alt="" className="h-full w-full scale-140 object-cover" />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">
          {title}
          {isExclusive && <span className="ml-2 text-[10px] font-mono uppercase text-copper">Exclusif</span>}
          {droitsAcquis && !verrouille && <span className="ml-2 text-[10px] font-mono uppercase text-emerald">Droits acquis</span>}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {droitsAcquis && <AjouterAPlaylistButton trackId={id} estConnecte={estConnecte} />}
        <FavoriButton trackId={id} estConnecte={estConnecte} />

        {verrouille ? (
          <Link href="/abonnez-vous" aria-label="Réservé aux abonnés Premium" className="text-sm text-ash">🔒</Link>
        ) : peutLire ? (
          <button
            aria-label={audioUrl && estEnCours ? `Mettre en pause ${title}` : `Écouter ${title}`}
            onClick={handleClic}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-ink-softer"
          >
            {audioUrl && estEnCours ? "⏸" : "▶"}
          </button>
        ) : null}
      </div>

      {modaleOuverte && idYoutube && (
        <YoutubeModal videoId={idYoutube} onClose={() => setModaleOuverte(false)} />
      )}
    </div>
  );
}
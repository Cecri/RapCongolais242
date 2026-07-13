/**
 * FICHIER : src/components/SonListItem.tsx
 * RÔLE : Variante liste d'un son. Icônes SVG au lieu de caractères texte.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePlayer, type PlayerTrack } from "@/context/PlayerContext";
import YoutubeModal from "@/components/YoutubeModal";
import FavoriButton from "@/components/FavoriButton";
import AjouterAPlaylistButton from "@/components/AjouterAPlaylistButton";
import { IconPlaySmall, IconPauseSmall, IconLock } from "@/components/PlayPauseIcon";

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
  queueContext?: PlayerTrack[];
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
  queueContext,
}: SonListItemProps) {
  const { playTrack, playQueue, currentTrack, isPlaying } = usePlayer();
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const estEnCours = currentTrack?.id === id && isPlaying;
  const droitsAcquis = !!audioUrl;
  const idYoutube = externalUrl ? extraireIdYoutube(externalUrl) : null;
  const peutLire = !verrouille && (!!audioUrl || !!idYoutube);

  function handleClic() {
    if (verrouille) return;

    if (audioUrl) {
      if (queueContext && queueContext.length > 0) {
        const index = queueContext.findIndex((t) => t.id === id);
        if (index >= 0) {
          playQueue(queueContext, index);
          return;
        }
      }
      playTrack({ id, title, artistName, audioUrl, coverUrl });
    } else if (idYoutube) {
      setModaleOuverte(true);
    }
  }

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-white/10 bg-ink-soft px-5 py-4">
      {numero !== undefined && (
        <span className="w-5 shrink-0 font-mono text-sm text-ash">{String(numero).padStart(2, "0")}</span>
      )}

      {verrouille ? (
        <Link href="/abonnez-vous" aria-label="Réservé aux abonnés Premium" className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-ink-softer">
          {coverUrl && <img src={coverUrl} alt="" className="h-full w-full scale-115 object-cover" />}
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-paper"><IconLock /></span>
        </Link>
      ) : peutLire ? (
        <button onClick={handleClic} aria-label={estEnCours ? `Mettre en pause ${title}` : `Écouter ${title}`} className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-ink-softer">
          {coverUrl && <img src={coverUrl} alt="" className="h-full w-full scale-115 object-cover" />}
          <span className={`absolute inset-0 flex items-center justify-center bg-black/50 text-paper transition-opacity ${estEnCours ? "opacity-100" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"}`}>
            {estEnCours ? <IconPauseSmall /> : <IconPlaySmall />}
          </span>
        </button>
      ) : (
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-ink-softer">
          {coverUrl && <img src={coverUrl} alt="" className="h-full w-full scale-115 object-cover" />}
        </div>
      )}

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
      </div>

      {modaleOuverte && idYoutube && (
        <YoutubeModal videoId={idYoutube} onClose={() => setModaleOuverte(false)} />
      )}
    </div>
  );
}
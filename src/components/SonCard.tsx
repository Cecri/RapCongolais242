/**
 * FICHIER : src/components/SonCard.tsx
 * RÔLE : Carte d'un son. Nouveau : accepte un prop optionnel
 * `queueContext` — la liste complète des sons "autour" de celui-ci
 * (ex: tous les sons de la page /sons, tous les sons récents de
 * l'accueil, toute la discographie d'un artiste). Si fourni, cliquer
 * lance une VRAIE file d'attente sur cette liste entière (précédent/
 * suivant/aléatoire/boucle deviennent utiles) au lieu d'un son isolé.
 */
"use client";

import Link from "next/link";
import { usePlayer, type PlayerTrack } from "@/context/PlayerContext";
import YoutubeModal from "@/components/YoutubeModal";
import FavoriButton from "@/components/FavoriButton";
import AjouterAPlaylistButton from "@/components/AjouterAPlaylistButton";
import { useState } from "react";

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
  queueContext?: PlayerTrack[];
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
  queueContext,
}: SonCardProps) {
  const { playTrack, playQueue, currentTrack, isPlaying } = usePlayer();
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const estEnCours = currentTrack?.id === id && isPlaying;
  const droitsAcquis = !!audioUrl;
  const idYoutube = externalUrl ? extraireIdYoutube(externalUrl) : null;
  const peutLire = !verrouille && (!!audioUrl || !!idYoutube);

  function handleClic() {
    if (verrouille) return;

    if (audioUrl) {
      // Si un contexte de file existe et contient bien ce son, on
      // lance toute la file (précédent/suivant/aléatoire deviennent
      // utiles) — sinon on retombe sur la lecture d'un son isolé.
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
    <div className="group rounded-2xl border border-white/10 bg-ink-soft transition-colors hover:border-white/20">
      {verrouille ? (
        <Link href="/abonnez-vous" aria-label="Réservé aux abonnés Premium" className="relative block aspect-square overflow-hidden rounded-t-2xl bg-ink-softer">
          <ContenuCover coverUrl={coverUrl} isExclusive={isExclusive} droitsAcquis={false} icone="🔒" toujoursVisible />
        </Link>
      ) : peutLire ? (
        <button onClick={handleClic} aria-label={estEnCours ? `Mettre en pause ${title}` : `Écouter ${title}`} className="relative block aspect-square w-full overflow-hidden rounded-t-2xl bg-ink-softer">
          <ContenuCover coverUrl={coverUrl} isExclusive={isExclusive} droitsAcquis={droitsAcquis} icone={estEnCours ? "⏸" : "▶"} />
        </button>
      ) : (
        <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-ink-softer">
          <ContenuCover coverUrl={coverUrl} isExclusive={isExclusive} droitsAcquis={droitsAcquis} />
        </div>
      )}

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

function ContenuCover({
  coverUrl,
  isExclusive,
  droitsAcquis,
  icone,
  toujoursVisible = false,
}: {
  coverUrl: string | null;
  isExclusive: boolean;
  droitsAcquis: boolean;
  icone?: string;
  toujoursVisible?: boolean;
}) {
  return (
    <>
      {coverUrl ? (
        <img src={coverUrl} alt="" className="h-full w-full scale-135 object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center font-display text-3xl text-white/15">♪</div>
      )}

      <div className="absolute left-2.5 top-2.5 flex flex-col gap-1">
        {isExclusive && (<span className="rounded-full bg-copper-dim px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-copper">Exclusif</span>)}
        {droitsAcquis && (<span className="rounded-full bg-emerald-dim px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-emerald">Droits acquis</span>)}
      </div>

      {icone && (
        <span
          className={`absolute bottom-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-ember text-sm text-paper transition-opacity ${
            toujoursVisible ? "opacity-100" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          }`}
        >
          {icone}
        </span>
      )}
    </>
  );
}
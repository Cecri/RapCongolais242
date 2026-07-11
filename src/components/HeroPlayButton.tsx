/**
 * FICHIER : src/components/HeroPlayButton.tsx
 * RÔLE : Bouton de lecture du hero. Taille réduite sur mobile (padding
 * et texte plus petits), normale à partir de sm:.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePlayer } from "@/context/PlayerContext";
import YoutubeModal from "@/components/YoutubeModal";

function extraireIdYoutube(url: string): string | null {
  const correspondance = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  return correspondance ? correspondance[1] : null;
}

export default function HeroPlayButton({
  trackId,
  title,
  artistName,
  audioUrl,
  externalUrl,
  coverUrl,
  verrouille,
}: {
  trackId: string;
  title: string;
  artistName: string;
  audioUrl: string | null;
  externalUrl: string | null;
  coverUrl: string | null;
  verrouille: boolean;
}) {
  const { playTrack } = usePlayer();
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const idYoutube = externalUrl ? extraireIdYoutube(externalUrl) : null;

  if (verrouille) {
    return (
      <Link href="/abonnez-vous" className="rounded-lg bg-ember px-3.5 py-2 text-xs font-semibold sm:px-5 sm:py-2.5 sm:text-sm">
        🔒 Premium
      </Link>
    );
  }

  function handleClic() {
    if (audioUrl) {
      playTrack({ id: trackId, title, artistName, audioUrl, coverUrl });
    } else if (idYoutube) {
      setModaleOuverte(true);
    }
  }

  return (
    <>
      <button onClick={handleClic} className="rounded-lg bg-ember px-3.5 py-2 text-xs font-semibold sm:px-5 sm:py-2.5 sm:text-sm">
        ▶ Écouter
      </button>
      {modaleOuverte && idYoutube && (
        <YoutubeModal videoId={idYoutube} onClose={() => setModaleOuverte(false)} />
      )}
    </>
  );
}
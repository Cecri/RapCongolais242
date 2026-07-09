/**
 * FICHIER : src/components/HeroPlayButton.tsx
 * RÔLE : Bouton de lecture pour le son mis en avant dans le hero de la
 * page d'accueil (artiste de la semaine). Même logique que SonCard.tsx :
 * lecture native si fichier audio disponible, fenêtre YouTube si lien
 * externe uniquement, verrouillage si exclusif + non-Premium.
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
      <Link href="/abonnez-vous" className="rounded-lg bg-ember px-5 py-2.5 text-sm font-semibold">
        🔒 Réservé aux abonnés Premium
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
      <button onClick={handleClic} className="rounded-lg bg-ember px-5 py-2.5 text-sm font-semibold">
        ▶ Écouter &quot;{title}&quot;
      </button>
      {modaleOuverte && idYoutube && (
        <YoutubeModal videoId={idYoutube} onClose={() => setModaleOuverte(false)} />
      )}
    </>
  );
}
/**
 * FICHIER : src/components/RatingStars.tsx
 * RÔLE : Widget 5 étoiles cliquables pour noter un artiste. Affiche la
 * note actuelle de l'utilisateur (si déjà notée), survol pour prévisualiser,
 * clic pour valider/modifier. Redirige vers /connexion si non connecté.
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { obtenirMaNote, noterArtiste } from "@/lib/ratings";

export default function RatingStars({
  artistId,
  slug,
  estConnecte,
}: {
  artistId: string;
  slug: string;
  estConnecte: boolean;
}) {
  const router = useRouter();
  const [maNote, setMaNote] = useState<number | null>(null);
  const [survol, setSurvol] = useState<number | null>(null);
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    if (!estConnecte) return;
    obtenirMaNote(artistId).then(setMaNote);
  }, [artistId, estConnecte]);

  async function handleClic(score: number) {
    if (!estConnecte) {
      router.push("/connexion");
      return;
    }
    setEnCours(true);
    await noterArtiste(artistId, score, slug);
    setMaNote(score);
    setEnCours(false);
    router.refresh();
  }

  const noteAffichee = survol ?? maNote ?? 0;

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setSurvol(null)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          disabled={enCours}
          onMouseEnter={() => setSurvol(n)}
          onClick={() => handleClic(n)}
          aria-label={`Noter ${n} étoile${n > 1 ? "s" : ""}`}
          className={`text-lg ${n <= noteAffichee ? "text-copper" : "text-white/20"} disabled:opacity-60`}
        >
          ★
        </button>
      ))}
      {maNote && <span className="ml-2 text-xs text-ash">Ta note : {maNote}/5</span>}
    </div>
  );
}
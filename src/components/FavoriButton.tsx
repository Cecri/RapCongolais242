/**
 * FICHIER : src/components/FavoriButton.tsx
 * RÔLE : Bouton cœur pour ajouter/retirer un son des favoris. Vérifie
 * l'état au montage (estFavori), puis bascule au clic (toggleFavori).
 * Invisible si l'utilisateur n'est pas connecté.
 */
"use client";

import { useState, useEffect } from "react";
import { estFavori, toggleFavori } from "@/lib/favorites";

export default function FavoriButton({ trackId, estConnecte }: { trackId: string; estConnecte: boolean }) {
  const [favori, setFavori] = useState(false);
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    if (!estConnecte) return;
    estFavori(trackId).then(setFavori);
  }, [trackId, estConnecte]);

  if (!estConnecte) return null;

  async function handleClic(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEnCours(true);
    const resultat = await toggleFavori(trackId);
    setFavori(resultat.estFavori);
    setEnCours(false);
  }

  return (
    <button
      onClick={handleClic}
      disabled={enCours}
      aria-label={favori ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={`text-sm ${favori ? "text-ember" : "text-ash hover:text-paper"}`}
    >
      {favori ? "♥" : "♡"}
    </button>
  );
}
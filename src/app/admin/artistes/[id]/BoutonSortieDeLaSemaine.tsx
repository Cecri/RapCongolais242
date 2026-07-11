/**
 * FICHIER : src/app/admin/artistes/[id]/BoutonSortieDeLaSemaine.tsx
 * RÔLE : Bascule le statut "Sortie de la semaine" d'un son. Plusieurs
 * sons peuvent être actifs en même temps sur tout le site.
 */
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleSortieDeLaSemaine } from "../actions";

export default function BoutonSortieDeLaSemaine({ trackId, artistId, estActif }: { trackId: string; artistId: string; estActif: boolean }) {
  const router = useRouter();
  const [enCours, startTransition] = useTransition();

  return (
    <button
      disabled={enCours}
      onClick={() => startTransition(async () => { await toggleSortieDeLaSemaine(trackId, artistId); router.refresh(); })}
      className={`rounded-lg border px-3 py-1.5 text-sm font-semibold disabled:opacity-60 ${estActif ? "border-copper bg-copper-dim text-copper" : "border-white/20 text-paper-dim hover:bg-ink-softer"}`}
    >
      {estActif ? "★ Sortie" : "Marquer sortie"}
    </button>
  );
}
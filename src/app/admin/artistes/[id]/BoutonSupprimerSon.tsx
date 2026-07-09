/**
 * FICHIER : src/app/admin/artistes/[id]/BoutonSupprimerSon.tsx
 * RÔLE : Bouton de suppression d'un son individuel, avec confirmation.
 */
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { supprimerSon } from "../actions";

export default function BoutonSupprimerSon({ trackId }: { trackId: string }) {
  const router = useRouter();
  const [enCours, startTransition] = useTransition();

  function handleClic() {
    if (!confirm("Supprimer ce son ? Cette action est irréversible.")) return;
    startTransition(async () => {
      await supprimerSon(trackId);
      router.refresh();
    });
  }

  return (
    <button onClick={handleClic} disabled={enCours} className="text-sm text-ash hover:text-ember disabled:opacity-60">
      {enCours ? "..." : "Suppr."}
    </button>
  );
}
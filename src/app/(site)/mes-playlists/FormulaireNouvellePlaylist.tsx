/**
 * FICHIER : src/app/(site)/mes-playlists/FormulaireNouvellePlaylist.tsx
 * RÔLE : Formulaire de création de playlist. Le champ nom est maintenant
 * "required" (empêche la soumission vide directement dans le navigateur).
 */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { creerPlaylist } from "./actions";

export default function FormulaireNouvellePlaylist() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [enCours, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nom.trim()) return;
    startTransition(async () => {
      await creerPlaylist(nom);
      setNom("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex gap-3">
      <input
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        placeholder="Nom de la nouvelle playlist"
        required
        className="flex-1 rounded-lg border border-white/20 bg-ink-soft px-4 py-2.5 text-sm focus:border-copper focus:outline-none"
      />
      <button type="submit" disabled={enCours} className="rounded-lg bg-ember px-5 py-2.5 text-sm font-semibold disabled:opacity-60">
        {enCours ? "..." : "Créer"}
      </button>
    </form>
  );
}
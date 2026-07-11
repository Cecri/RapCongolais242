/**
 * FICHIER : src/app/admin/artistes/[id]/albums/nouveau/FormulaireAlbum.tsx
 * RÔLE : Formulaire de création d'album/EP/mixtape, avec upload de
 * pochette et date de sortie réelle.
 */
"use client";

import { useState } from "react";
import { creerAlbum } from "../../../actions";
import { useUpload } from "@/lib/useUpload";

export default function FormulaireAlbum({ artistId }: { artistId: string }) {
  const { uploaderVersR2 } = useUpload();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur("");
    setEnCours(true);

    try {
      const formData = new FormData(e.currentTarget);
      const fichierPochette = formData.get("pochette") as File;

      let coverUrl: string | undefined;
      if (fichierPochette && fichierPochette.size > 0) {
        coverUrl = await uploaderVersR2(fichierPochette, "pochettes");
      }

      const resultat = await creerAlbum({
        artistId,
        title: formData.get("title") as string,
        type: formData.get("type") as "ALBUM" | "EP" | "MIXTAPE" | "SINGLE",
        releaseDate: formData.get("releaseDate") as string,
        coverUrl,
      });

      if (resultat?.erreur) {
        setErreur(resultat.erreur);
        setEnCours(false);
      }
    } catch {
      setErreur("Une erreur est survenue.");
      setEnCours(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Titre du projet *</label>
        <input name="title" required className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Type *</label>
        <select name="type" required defaultValue="ALBUM" className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none">
          <option value="ALBUM">Album</option>
          <option value="EP">EP</option>
          <option value="MIXTAPE">Mixtape</option>
          <option value="SINGLE">Single</option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Date de sortie réelle *</label>
        <input type="date" name="releaseDate" required className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
        <p className="mt-1.5 text-xs text-ash">La vraie date de sortie originale, même si tu l&apos;ajoutes sur le site aujourd&apos;hui.</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Pochette</label>
        <input type="file" name="pochette" accept="image/*" className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-copper file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-ink" />
      </div>

      {erreur && <p className="text-sm text-ember">{erreur}</p>}

      <button type="submit" disabled={enCours} className="mt-2 rounded-lg bg-ember px-5 py-3 text-sm font-semibold disabled:opacity-60">
        {enCours ? "Création..." : "Créer le projet"}
      </button>
    </form>
  );
}
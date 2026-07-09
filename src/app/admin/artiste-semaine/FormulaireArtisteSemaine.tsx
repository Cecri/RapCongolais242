/**
 * FICHIER : src/app/admin/artiste-semaine/FormulaireArtisteSemaine.tsx
 * RÔLE : Formulaire de sélection de l'artiste de la semaine — choix de
 * l'artiste, du son à mettre en avant (parmi ses titres existants),
 * d'une photo spécifique (upload via R2, optionnel — sinon la photo
 * habituelle de l'artiste sera utilisée), et d'un texte de présentation.
 */
"use client";

import { useState } from "react";
import { definirArtisteDeLaSemaine } from "./actions";
import { useUpload } from "@/lib/useUpload";

type Artiste = {
  id: string;
  stageName: string;
  tracks: { id: string; title: string }[];
};

export default function FormulaireArtisteSemaine({ artistes }: { artistes: Artiste[] }) {
  const { uploaderVersR2 } = useUpload();
  const [artistIdChoisi, setArtistIdChoisi] = useState("");
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);

  const artisteSelectionne = artistes.find((a) => a.id === artistIdChoisi);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur("");
    setEnCours(true);

    try {
      const formData = new FormData(e.currentTarget);
      const fichierPhoto = formData.get("photo") as File;

      let photoUrl: string | undefined;
      if (fichierPhoto && fichierPhoto.size > 0) {
        photoUrl = await uploaderVersR2(fichierPhoto, "photos-artistes");
      }

      const resultat = await definirArtisteDeLaSemaine({
        artistId: formData.get("artistId") as string,
        trackId: (formData.get("trackId") as string) || undefined,
        photoUrl,
        blurb: (formData.get("blurb") as string) || undefined,
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
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Artiste *</label>
        <select
          name="artistId"
          required
          value={artistIdChoisi}
          onChange={(e) => setArtistIdChoisi(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none"
        >
          <option value="">Sélectionner un artiste</option>
          {artistes.map((a) => (<option key={a.id} value={a.id}>{a.stageName}</option>))}
        </select>
      </div>

      {artisteSelectionne && (
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Son à mettre en avant</label>
          <select name="trackId" className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none">
            <option value="">Aucun son en particulier</option>
            {artisteSelectionne.tracks.map((t) => (<option key={t.id} value={t.id}>{t.title}</option>))}
          </select>
          {artisteSelectionne.tracks.length === 0 && (
            <p className="mt-1.5 text-xs text-ash">Cet artiste n&apos;a encore aucun son.</p>
          )}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Photo spéciale (optionnel)</label>
        <input type="file" name="photo" accept="image/*" className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-copper file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-ink" />
        <p className="mt-1.5 text-xs text-ash">Si vide, la photo habituelle de l&apos;artiste sera utilisée.</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Texte de présentation (optionnel)</label>
        <textarea name="blurb" rows={4} placeholder="Un texte spécial pour cette mise en avant..." className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
        <p className="mt-1.5 text-xs text-ash">Si vide, la bio habituelle de l&apos;artiste sera utilisée.</p>
      </div>

      {erreur && <p className="text-sm text-ember">{erreur}</p>}

      <button type="submit" disabled={enCours} className="mt-2 rounded-lg bg-ember px-5 py-3 text-sm font-semibold disabled:opacity-60">
        {enCours ? "Enregistrement..." : "Définir comme artiste de la semaine"}
      </button>
    </form>
  );
}
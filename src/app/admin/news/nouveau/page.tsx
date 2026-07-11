/**
 * FICHIER : src/app/admin/news/nouveau/page.tsx
 * RÔLE : Formulaire de création d'actualité, avec un texte d'exemple
 * pré-rempli (modifiable) pour te donner un point de départ.
 */
"use client";

import { useState } from "react";
import { creerNews } from "../actions";
import { useUpload } from "@/lib/useUpload";

const TEXTE_EXEMPLE = `Grosse semaine pour RapCongolais242 ! On prépare la sortie d'un nouveau son exclusif, un concert est en approche à Brazzaville — restez connectés pour les détails. N'hésitez pas à nous suivre sur nos réseaux pour ne rien manquer de l'actualité du rap congolais et de sa diaspora.`;

export default function NouvelleNewsPage() {
  const { uploaderVersR2 } = useUpload();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur("");
    setEnCours(true);

    try {
      const formData = new FormData(e.currentTarget);
      const fichierImage = formData.get("image") as File;

      let imageUrl: string | undefined;
      if (fichierImage && fichierImage.size > 0) {
        imageUrl = await uploaderVersR2(fichierImage, "photos-artistes");
      }

      const resultat = await creerNews({
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        imageUrl,
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
    <main className="mx-auto max-w-xl px-8 pb-24 pt-14">
      <h1 className="font-display text-3xl font-bold">Nouvelle actualité</h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Titre *</label>
          <input name="title" required defaultValue="Quoi de neuf chez RapCongolais242" className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Contenu *</label>
          <textarea name="content" required rows={6} defaultValue={TEXTE_EXEMPLE} className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
          <p className="mt-1.5 text-xs text-ash">Texte d&apos;exemple pré-rempli — modifie-le avant de publier.</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Image (optionnel)</label>
          <input type="file" name="image" accept="image/*" className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-copper file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-ink" />
        </div>

        {erreur && <p className="text-sm text-ember">{erreur}</p>}

        <button type="submit" disabled={enCours} className="mt-2 rounded-lg bg-ember px-5 py-3 text-sm font-semibold disabled:opacity-60">
          {enCours ? "Publication..." : "Publier"}
        </button>
      </form>
    </main>
  );
}
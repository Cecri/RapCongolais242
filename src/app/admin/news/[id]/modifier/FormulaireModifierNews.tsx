/**
 * FICHIER : src/app/admin/news/[id]/modifier/FormulaireModifierNews.tsx
 * RÔLE : Formulaire pré-rempli pour modifier une actualité.
 */
"use client";

import { useState } from "react";
import { modifierNews } from "../../actions";
import { useUpload } from "@/lib/useUpload";

type News = { id: string; title: string; content: string; imageUrl: string | null };

export default function FormulaireModifierNews({ news }: { news: News }) {
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

      const resultat = await modifierNews(news.id, {
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
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Titre *</label>
        <input name="title" required defaultValue={news.title} className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Contenu *</label>
        <textarea name="content" required rows={6} defaultValue={news.content} className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Remplacer l&apos;image</label>
        {news.imageUrl && <img src={news.imageUrl} alt="" className="mt-1 mb-2 h-24 w-full rounded-lg object-cover" />}
        <input type="file" name="image" accept="image/*" className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-copper file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-ink" />
      </div>

      {erreur && <p className="text-sm text-ember">{erreur}</p>}

      <button type="submit" disabled={enCours} className="mt-2 rounded-lg bg-ember px-5 py-3 text-sm font-semibold disabled:opacity-60">
        {enCours ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
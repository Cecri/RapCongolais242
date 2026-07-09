/**
 * FICHIER : src/app/admin/sons/[id]/modifier/FormulaireModifierSon.tsx
 * RÔLE : Formulaire pré-rempli pour modifier un son existant.
 */
"use client";

import { useState } from "react";
import { modifierSon } from "../../../artistes/actions";
import { useUpload } from "@/lib/useUpload";

type Track = {
  id: string;
  title: string;
  audioUrl: string | null;
  externalUrl: string | null;
  coverUrl: string | null;
  isExclusive: boolean;
};

export default function FormulaireModifierSon({ track }: { track: Track }) {
  const { uploaderVersR2 } = useUpload();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur("");
    setEnCours(true);

    try {
      const formData = new FormData(e.currentTarget);
      const fichierAudio = formData.get("audio") as File;
      const fichierPochette = formData.get("pochette") as File;

      let audioUrl: string | undefined;
      if (fichierAudio && fichierAudio.size > 0) {
        audioUrl = await uploaderVersR2(fichierAudio, "sons");
      }

      let coverUrl: string | undefined;
      if (fichierPochette && fichierPochette.size > 0) {
        coverUrl = await uploaderVersR2(fichierPochette, "pochettes");
      }

      const resultat = await modifierSon(track.id, {
        title: formData.get("title") as string,
        audioUrl,
        externalUrl: formData.get("externalUrl") as string,
        coverUrl,
        isExclusive: formData.get("isExclusive") === "on",
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
        <input name="title" required defaultValue={track.title} className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Remplacer le fichier audio</label>
        <input type="file" name="audio" accept="audio/*" className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-copper file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-ink" />
        <p className="mt-1.5 text-xs text-ash">{track.audioUrl ? "Un fichier est déjà hébergé — laisse vide pour le garder." : "Aucun fichier actuellement."}</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Lien externe</label>
        <input name="externalUrl" defaultValue={track.externalUrl ?? ""} placeholder="https://..." className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Remplacer la pochette</label>
        {track.coverUrl && <img src={track.coverUrl} alt="" className="mt-1 mb-2 h-16 w-16 rounded-lg object-cover" />}
        <input type="file" name="pochette" accept="image/*" className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-copper file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-ink" />
      </div>

      <label className="flex items-center gap-2.5 rounded-lg border border-copper/40 bg-copper-dim px-4 py-3 text-sm">
        <input type="checkbox" name="isExclusive" defaultChecked={track.isExclusive} className="h-4 w-4" />
        <span className="font-semibold text-copper">Son exclusif</span>
      </label>

      {erreur && <p className="text-sm text-ember">{erreur}</p>}

      <button type="submit" disabled={enCours} className="mt-2 rounded-lg bg-ember px-5 py-3 text-sm font-semibold disabled:opacity-60">
        {enCours ? "Enregistrement..." : "Enregistrer les modifications"}
      </button>
    </form>
  );
}
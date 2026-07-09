/**
 * FICHIER : src/app/(site)/soumettre-artiste/FormulaireSoumission.tsx
 * RÔLE : Formulaire de soumission — lien externe OU upload direct d'un
 * fichier audio (via useUpload.ts, envoi direct vers R2). Description
 * obligatoire dans tous les cas.
 */
"use client";

import { useState } from "react";
import { soumettreArtiste } from "./actions";
import { useUpload } from "@/lib/useUpload";

export default function FormulaireSoumission() {
  const { uploaderVersR2 } = useUpload();
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);
  const [enCours, setEnCours] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur("");
    setEnCours(true);

    try {
      const formData = new FormData(e.currentTarget);
      const fichier = formData.get("fichier") as File;

      let fichierUrl: string | undefined;
      if (fichier && fichier.size > 0) {
        fichierUrl = await uploaderVersR2(fichier, "sons");
      }

      const resultat = await soumettreArtiste({
        artistName: formData.get("artistName") as string,
        links: (formData.get("links") as string) || undefined,
        fichierUrl,
        message: formData.get("message") as string,
      });

      setEnCours(false);

      if (resultat?.erreur) {
        setErreur(resultat.erreur);
        return;
      }

      setSucces(true);
    } catch {
      setErreur("Une erreur est survenue pendant l'envoi.");
      setEnCours(false);
    }
  }

  if (succes) {
    return (
      <div className="rounded-2xl border border-emerald/30 bg-emerald-dim px-6 py-8 text-center">
        <p className="font-display text-lg font-bold text-emerald">Merci pour cette découverte !</p>
        <p className="mt-2 text-sm text-paper-dim">On va regarder ça de près. Si ça correspond à notre ligne éditoriale, on prendra contact.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Nom de l&apos;artiste ou du titre *</label>
        <input name="artistName" required className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
        <p className="mt-1.5 text-xs text-ash">Si l&apos;artiste est déjà chez nous, ça viendra simplement enrichir son catalogue.</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Lien (Instagram, YouTube, TikTok...)</label>
        <input name="links" placeholder="https://..." className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>

      <div className="flex items-center gap-3 text-sm text-ash">
        <span className="h-px flex-1 bg-white/10" />
        ou
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Uploader directement un fichier audio</label>
        <input type="file" name="fichier" accept="audio/*" className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-copper file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-ink" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Pourquoi il/elle mérite d&apos;être découvert(e) ? *</label>
        <textarea name="message" required minLength={10} rows={4} className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>

      {erreur && <p className="text-sm text-ember">{erreur}</p>}

      <button type="submit" disabled={enCours} className="mt-2 rounded-lg bg-ember px-5 py-3 text-sm font-semibold disabled:opacity-60">
        {enCours ? "Envoi..." : "Soumettre"}
      </button>
    </form>
  );
}
/**
 * FICHIER : src/app/admin/sons/nouveau/FormulaireSon.tsx
 * RÔLE : Formulaire admin d'ajout de son. Gère lui-même le processus
 * d'upload (via useUpload.ts, envoi direct vers R2) AVANT d'appeler
 * creerSon avec les URLs finales — jamais de fichier brut envoyé à
 * notre serveur, donc aucune limite de taille (WAV volumineux compris).
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { creerSon } from "../../artistes/actions";
import { useUpload } from "@/lib/useUpload";

export default function FormulaireSon({
  artistes,
}: {
  artistes: { id: string; stageName: string }[];
}) {
  const router = useRouter();
  const { uploaderVersR2 } = useUpload();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur("");
    setEnCours(true);

    try {
      const formEl = e.currentTarget;
      const formData = new FormData(formEl);

      const artistId = formData.get("artistId") as string;
      const title = formData.get("title") as string;
      const externalUrl = formData.get("externalUrl") as string;
      const isExclusive = formData.get("isExclusive") === "on";

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

      const resultat = await creerSon({
        artistId,
        title,
        audioUrl,
        externalUrl,
        coverUrl,
        isExclusive,
      });

      if (resultat?.erreur) {
        setErreur(resultat.erreur);
        setEnCours(false);
        return;
      }

      router.push("/admin/artistes");
    } catch {
      setErreur("Une erreur est survenue pendant l'upload.");
      setEnCours(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">
          Artiste *
        </label>
        <select
          name="artistId"
          required
          className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none"
        >
          <option value="">Sélectionner un artiste</option>
          {artistes.map((a) => (
            <option key={a.id} value={a.id}>
              {a.stageName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">
          Titre *
        </label>
        <input
          name="title"
          required
          className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">
          Fichier audio (MP3, WAV — toute taille)
        </label>
        <input
          type="file"
          name="audio"
          accept="audio/*"
          className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-copper file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-ink"
        />
      </div>

      <div className="flex items-center gap-3 text-sm text-ash">
        <span className="h-px flex-1 bg-white/10" />
        ou
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">
          Lien externe (YouTube / SoundCloud / Spotify)
        </label>
        <input
          name="externalUrl"
          placeholder="https://..."
          className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">
          Pochette (optionnel — récupérée auto si lien YouTube/Spotify/SoundCloud)
        </label>
        <input
          type="file"
          name="pochette"
          accept="image/*"
          className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-copper file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-ink"
        />
      </div>

      <label className="flex items-center gap-2.5 rounded-lg border border-copper/40 bg-copper-dim px-4 py-3 text-sm">
        <input type="checkbox" name="isExclusive" className="h-4 w-4" />
        <span>
          <span className="font-semibold text-copper">Son exclusif</span>
          <span className="block text-xs text-paper-dim">
            Pas encore disponible sur YouTube ou une autre plateforme de streaming.
          </span>
        </span>
      </label>

      {erreur && <p className="text-sm text-ember">{erreur}</p>}

      <button
        type="submit"
        disabled={enCours}
        className="mt-2 rounded-lg bg-ember px-5 py-3 text-sm font-semibold disabled:opacity-60"
      >
        {enCours ? "Upload en cours..." : "Ajouter le son"}
      </button>
    </form>
  );
}
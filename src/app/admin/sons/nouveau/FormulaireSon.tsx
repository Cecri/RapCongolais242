/**
 * FICHIER : src/app/admin/sons/nouveau/FormulaireSon.tsx
 * RÔLE : Formulaire d'ajout de son. Le champ "Numéro de piste" apparaît
 * uniquement si un album (nouveau ou existant) est sélectionné —
 * inutile pour un single.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { creerSon } from "../../artistes/actions";
import { useUpload } from "@/lib/useUpload";

type Artiste = {
  id: string;
  stageName: string;
  albums: { id: string; title: string; type: string }[];
};

type ModeAlbum = "none" | "new" | "existing";

export default function FormulaireSon({ artistes }: { artistes: Artiste[] }) {
  const router = useRouter();
  const { uploaderVersR2 } = useUpload();
  const [artistIdChoisi, setArtistIdChoisi] = useState("");
  const [modeAlbum, setModeAlbum] = useState<ModeAlbum>("none");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  const artisteSelectionne = artistes.find((a) => a.id === artistIdChoisi);
  const aujourdHui = new Date().toISOString().split("T")[0];

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

      const resultat = await creerSon({
        artistId: formData.get("artistId") as string,
        title: formData.get("title") as string,
        audioUrl,
        externalUrl: formData.get("externalUrl") as string,
        coverUrl,
        isExclusive: formData.get("isExclusive") === "on",
        releaseDate: formData.get("releaseDate") as string,
        albumMode: modeAlbum,
        albumId: modeAlbum === "existing" ? (formData.get("albumId") as string) : undefined,
        newAlbumTitle: modeAlbum === "new" ? (formData.get("newAlbumTitle") as string) : undefined,
        newAlbumType: modeAlbum === "new" ? (formData.get("newAlbumType") as "ALBUM" | "EP" | "MIXTAPE" | "SINGLE") : undefined,
        trackNumber: modeAlbum !== "none" ? (formData.get("trackNumber") as string) : undefined,
        featuringNames: formData.get("featuringNames") as string,
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
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Artiste principal *</label>
        <select
          name="artistId" required value={artistIdChoisi}
          onChange={(e) => { setArtistIdChoisi(e.target.value); setModeAlbum("none"); }}
          className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none"
        >
          <option value="">Sélectionner un artiste</option>
          {artistes.map((a) => (<option key={a.id} value={a.id}>{a.stageName}</option>))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Titre *</label>
        <input name="title" required className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Featuring (optionnel)</label>
        <input name="featuringNames" placeholder="Ex: Snika, DAYARGA" className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
        <p className="mt-1.5 text-xs text-ash">Noms séparés par des virgules. Un artiste inconnu aura un profil créé automatiquement.</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Date de sortie réelle *</label>
        <input type="date" name="releaseDate" required defaultValue={aujourdHui} max={aujourdHui} className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
        <p className="mt-1.5 text-xs text-ash">Important pour le tri "récent → ancien" — mets la vraie date, pas la date d&apos;upload.</p>
      </div>

      <div className="border-t border-white/10 pt-4">
        <label className="mb-2 block text-sm font-semibold text-paper-dim">Type de sortie</label>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setModeAlbum("none")} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${modeAlbum === "none" ? "border-copper bg-copper-dim text-copper" : "border-white/20 text-paper-dim"}`}>Single</button>
          <button type="button" onClick={() => setModeAlbum("new")} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${modeAlbum === "new" ? "border-copper bg-copper-dim text-copper" : "border-white/20 text-paper-dim"}`}>+ Nouvel album/EP/mixtape</button>
          {!!artisteSelectionne?.albums.length && (
            <button type="button" onClick={() => setModeAlbum("existing")} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${modeAlbum === "existing" ? "border-copper bg-copper-dim text-copper" : "border-white/20 text-paper-dim"}`}>Album existant</button>
          )}
        </div>

        {modeAlbum === "new" && (
          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-white/10 bg-ink p-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-paper-dim">Nom du projet *</label>
              <input name="newAlbumTitle" required className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-2.5 text-sm focus:border-copper focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-paper-dim">Type *</label>
              <select name="newAlbumType" defaultValue="ALBUM" className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-2.5 text-sm focus:border-copper focus:outline-none">
                <option value="ALBUM">Album</option>
                <option value="EP">EP</option>
                <option value="MIXTAPE">Mixtape</option>
              </select>
            </div>
          </div>
        )}

        {modeAlbum === "existing" && artisteSelectionne && (
          <div className="mt-4">
            <select name="albumId" required className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none">
              {artisteSelectionne.albums.map((al) => (<option key={al.id} value={al.id}>{al.title} ({al.type})</option>))}
            </select>
          </div>
        )}

        {modeAlbum !== "none" && (
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-semibold text-paper-dim">Numéro de piste</label>
            <input type="number" name="trackNumber" min={1} placeholder="Ex: 3" className="w-32 rounded-lg border border-white/20 bg-ink-soft px-4 py-2.5 text-sm focus:border-copper focus:outline-none" />
            <p className="mt-1.5 text-xs text-ash">Détermine l&apos;ordre d&apos;affichage dans le projet (piste 1, 2, 3...). Laisse vide si tu ne sais pas encore — tu pourras le préciser en modifiant le son plus tard.</p>
          </div>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Fichier audio</label>
        <input type="file" name="audio" accept="audio/*" className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-copper file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-ink" />
      </div>

      <div className="flex items-center gap-3 text-sm text-ash">
        <span className="h-px flex-1 bg-white/10" />ou<span className="h-px flex-1 bg-white/10" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Lien externe (YouTube / SoundCloud / Spotify)</label>
        <input name="externalUrl" placeholder="https://..." className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
        <p className="mt-1.5 text-xs text-ash">Récupère automatiquement la pochette officielle — fonctionne même avec un fichier audio déjà uploadé ci-dessus.</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Pochette manuelle (optionnel)</label>
        <input type="file" name="pochette" accept="image/*" className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-copper file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-ink" />
        <p className="mt-1.5 text-xs text-ash">Prend le dessus sur la récupération automatique.</p>
      </div>

      <label className="flex items-center gap-2.5 rounded-lg border border-copper/40 bg-copper-dim px-4 py-3 text-sm">
        <input type="checkbox" name="isExclusive" className="h-4 w-4" />
        <span>
          <span className="font-semibold text-copper">Son exclusif</span>
          <span className="block text-xs text-paper-dim">Pas encore disponible sur YouTube ou une autre plateforme de streaming.</span>
        </span>
      </label>

      {erreur && <p className="text-sm text-ember">{erreur}</p>}

      <button type="submit" disabled={enCours} className="mt-2 rounded-lg bg-ember px-5 py-3 text-sm font-semibold disabled:opacity-60">
        {enCours ? "Upload en cours..." : "Ajouter le son"}
      </button>
    </form>
  );
}
/**
 * FICHIER : src/app/admin/artistes/[id]/modifier/FormulaireModifierArtiste.tsx
 * RÔLE : Formulaire pré-rempli avec les valeurs actuelles de l'artiste.
 * La photo est optionnelle à remplacer — si aucun nouveau fichier n'est
 * choisi, l'ancienne est conservée.
 */
"use client";

import { useState } from "react";
import { modifierArtiste } from "../../actions";
import { useUpload } from "@/lib/useUpload";

type Artiste = {
  id: string;
  stageName: string;
  country: string;
  genre: string | null;
  bio: string | null;
  photoUrl: string | null;
  instagram: string | null;
  youtube: string | null;
  tiktok: string | null;
  x: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
};

export default function FormulaireModifierArtiste({ artiste }: { artiste: Artiste }) {
  const { uploaderVersR2 } = useUpload();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

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

      const resultat = await modifierArtiste(artiste.id, {
        stageName: formData.get("stageName") as string,
        country: formData.get("country") as string,
        genre: formData.get("genre") as string,
        bio: formData.get("bio") as string,
        photoUrl,
        instagram: formData.get("instagram") as string,
        youtube: formData.get("youtube") as string,
        tiktok: formData.get("tiktok") as string,
        x: formData.get("x") as string,
        contactEmail: formData.get("contactEmail") as string,
        contactPhone: formData.get("contactPhone") as string,
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
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Nom de scène *</label>
        <input name="stageName" required defaultValue={artiste.stageName} className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Pays *</label>
        <input name="country" required defaultValue={artiste.country} className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Style</label>
        <input name="genre" defaultValue={artiste.genre ?? ""} className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Bio</label>
        <textarea name="bio" rows={4} defaultValue={artiste.bio ?? ""} className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Photo actuelle</label>
        {artiste.photoUrl && <img src={artiste.photoUrl} alt="" className="mt-1 mb-2 h-20 w-20 rounded-lg object-cover" />}
        <input type="file" name="photo" accept="image/*" className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-copper file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-ink" />
        <p className="mt-1.5 text-xs text-ash">Laisse vide pour garder la photo actuelle.</p>
      </div>

      <div className="mt-2 border-t border-white/10 pt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ash">Réseaux sociaux</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Instagram</label>
        <input name="instagram" defaultValue={artiste.instagram ?? ""} className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">YouTube</label>
        <input name="youtube" defaultValue={artiste.youtube ?? ""} className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">TikTok</label>
        <input name="tiktok" defaultValue={artiste.tiktok ?? ""} className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">X</label>
        <input name="x" defaultValue={artiste.x ?? ""} className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>

      <div className="mt-2 border-t border-white/10 pt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ash">Contact professionnel</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Email</label>
        <input type="email" name="contactEmail" defaultValue={artiste.contactEmail ?? ""} className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Téléphone</label>
        <input name="contactPhone" defaultValue={artiste.contactPhone ?? ""} className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>

      {erreur && <p className="text-sm text-ember">{erreur}</p>}

      <button type="submit" disabled={enCours} className="mt-2 rounded-lg bg-ember px-5 py-3 text-sm font-semibold disabled:opacity-60">
        {enCours ? "Enregistrement..." : "Enregistrer les modifications"}
      </button>
    </form>
  );
}
/**
 * FICHIER : src/app/admin/artistes/nouveau/page.tsx
 * RÔLE : Formulaire admin d'ajout d'artiste. Réseaux sociaux (Instagram,
 * YouTube, TikTok, X) et coordonnées de contact (email, téléphone) tous
 * facultatifs — n'affiche sur le profil public que ce qui est renseigné.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { creerArtiste } from "../actions";
import { useUpload } from "@/lib/useUpload";

export default function NouvelArtistePage() {
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

      const fichierPhoto = formData.get("photo") as File;
      let photoUrl: string | undefined;
      if (fichierPhoto && fichierPhoto.size > 0) {
        photoUrl = await uploaderVersR2(fichierPhoto, "photos-artistes");
      }

      const resultat = await creerArtiste({
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
        return;
      }

      router.push("/admin/artistes");
    } catch {
      setErreur("Une erreur est survenue pendant l'upload.");
      setEnCours(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-8 pb-24 pt-14">
      <h1 className="font-display text-3xl font-bold">Ajouter un artiste</h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Nom de scène *</label>
          <input name="stageName" required className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Pays *</label>
          <input name="country" required className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Style</label>
          <input name="genre" placeholder="Rap, Trap, Drill, Afro..." className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Bio</label>
          <textarea name="bio" rows={4} className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Photo de l&apos;artiste</label>
          <input type="file" name="photo" accept="image/*" className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-copper file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-ink" />
        </div>

        <div className="mt-2 border-t border-white/10 pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ash">Réseaux sociaux (facultatif)</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Instagram</label>
          <input name="instagram" placeholder="https://instagram.com/..." className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-paper-dim">YouTube</label>
          <input name="youtube" placeholder="https://youtube.com/..." className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-paper-dim">TikTok</label>
          <input name="tiktok" placeholder="https://tiktok.com/@..." className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-paper-dim">X (Twitter)</label>
          <input name="x" placeholder="https://x.com/..." className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
        </div>

        <div className="mt-2 border-t border-white/10 pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ash">Contact professionnel (facultatif)</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Email</label>
          <input type="email" name="contactEmail" placeholder="contact@..." className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Téléphone</label>
          <input name="contactPhone" placeholder="+242 06 ..." className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
        </div>

        {erreur && <p className="text-sm text-ember">{erreur}</p>}

        <button type="submit" disabled={enCours} className="mt-2 rounded-lg bg-ember px-5 py-3 text-sm font-semibold disabled:opacity-60">
          {enCours ? "Upload en cours..." : "Créer l'artiste"}
        </button>
      </form>
    </main>
  );
}
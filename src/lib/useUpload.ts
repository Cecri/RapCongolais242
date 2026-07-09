/**
 * FICHIER : src/lib/useUpload.ts
 * RÔLE : Hook React réutilisable qui gère le processus d'upload complet
 * côté navigateur : demande une URL signée à /api/upload, puis envoie
 * le fichier directement à R2 avec cette URL. Utilisé par les formulaires
 * admin (ajout d'artiste, ajout de son).
 */
"use client";

export function useUpload() {
  async function uploaderVersR2(
    fichier: File,
    dossier: "photos-artistes" | "sons" | "pochettes"
  ): Promise<string> {
    const reponse = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nomFichier: fichier.name,
        typeMime: fichier.type,
        dossier,
      }),
    });

    if (!reponse.ok) {
      throw new Error("Impossible de préparer l'upload.");
    }

    const { urlUpload, urlPublique } = await reponse.json();

    const uploadReel = await fetch(urlUpload, {
      method: "PUT",
      headers: { "Content-Type": fichier.type },
      body: fichier,
    });

    if (!uploadReel.ok) {
      throw new Error("L'upload du fichier a échoué.");
    }

    return urlPublique;
  }

  return { uploaderVersR2 };
}
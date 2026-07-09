/**
 * FICHIER : src/app/admin/artiste-semaine/actions.ts
 * RÔLE : Définit manuellement l'artiste de la semaine, avec une photo,
 * un son mis en avant et un texte de présentation propres à cette mise
 * en avant (indépendants du profil habituel de l'artiste). Un seul
 * artiste "de la semaine" à la fois — on retire le statut des autres
 * avant de l'attribuer au nouveau.
 */
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type EtatFormulaire = { erreur?: string } | undefined;

const Schema = z.object({
  artistId: z.string().min(1, "Choisis un artiste"),
  trackId: z.string().optional(),
  photoUrl: z.string().optional(),
  blurb: z.string().optional(),
});

export async function definirArtisteDeLaSemaine(data: {
  artistId: string;
  trackId?: string;
  photoUrl?: string;
  blurb?: string;
}): Promise<EtatFormulaire> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { erreur: "Non autorisé." };
  }

  const resultat = Schema.safeParse(data);
  if (!resultat.success) {
    return { erreur: resultat.error.issues[0].message };
  }

  await prisma.artist.updateMany({
    where: { isFeatured: true },
    data: { isFeatured: false },
  });

  await prisma.artist.update({
    where: { id: resultat.data.artistId },
    data: {
      isFeatured: true,
      featuredAt: new Date(),
      featuredTrackId: resultat.data.trackId || null,
      featuredPhotoUrl: resultat.data.photoUrl || null,
      featuredBlurb: resultat.data.blurb || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/artiste-semaine");
  redirect("/admin/artiste-semaine");
}
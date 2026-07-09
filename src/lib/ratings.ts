/**
 * FICHIER : src/lib/ratings.ts
 * RÔLE : Server Actions pour noter un artiste (table Rating). Un
 * utilisateur ne peut avoir qu'une seule note par artiste (contrainte
 * @@unique en base) — noter à nouveau met simplement à jour sa note
 * existante plutôt que d'en créer une seconde.
 */
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function obtenirMaNote(artistId: string): Promise<number | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const note = await prisma.rating.findUnique({
    where: { userId_artistId: { userId: session.user.id, artistId } },
  });

  return note?.score ?? null;
}

export async function noterArtiste(artistId: string, score: number, slug: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Connecte-toi pour noter un artiste.");
  }

  if (score < 1 || score > 5) {
    throw new Error("La note doit être entre 1 et 5.");
  }

  await prisma.rating.upsert({
    where: { userId_artistId: { userId: session.user.id, artistId } },
    update: { score },
    create: { userId: session.user.id, artistId, score },
  });

  revalidatePath(`/artistes/${slug}`);
  revalidatePath("/artistes");
  revalidatePath("/");
}
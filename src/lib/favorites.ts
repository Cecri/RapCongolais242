/**
 * FICHIER : src/lib/favorites.ts
 * RÔLE : Server Actions pour gérer les favoris (table Favorite).
 * toggleFavori bascule l'état (ajoute si absent, retire si présent).
 * estFavori vérifie l'état actuel pour un son donné.
 */
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function estFavori(trackId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  const favori = await prisma.favorite.findUnique({
    where: { userId_trackId: { userId: session.user.id, trackId } },
  });

  return !!favori;
}

export async function toggleFavori(trackId: string): Promise<{ estFavori: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Connecte-toi pour ajouter des favoris.");
  }

  const existant = await prisma.favorite.findUnique({
    where: { userId_trackId: { userId: session.user.id, trackId } },
  });

  if (existant) {
    await prisma.favorite.delete({ where: { id: existant.id } });
    revalidatePath("/mes-favoris");
    return { estFavori: false };
  }

  await prisma.favorite.create({ data: { userId: session.user.id, trackId } });
  revalidatePath("/mes-favoris");
  return { estFavori: true };
}
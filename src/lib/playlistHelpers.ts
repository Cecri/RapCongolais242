/**
 * FICHIER : src/lib/playlistHelpers.ts
 * RÔLE : Vérifie si un son est déjà présent dans une playlist donnée,
 * pour afficher "déjà ajouté" au lieu de le dupliquer silencieusement.
 */
"use server";

import { prisma } from "@/lib/prisma";

export async function sonDejaDansPlaylist(playlistId: string, trackId: string): Promise<boolean> {
  const existant = await prisma.playlistTrack.findUnique({
    where: { playlistId_trackId: { playlistId, trackId } },
  });
  return !!existant;
}
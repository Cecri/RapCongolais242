/**
 * FICHIER : src/app/(site)/mes-playlists/actions.ts
 * RÔLE : Server Actions pour créer/supprimer une playlist, y ajouter/
 * retirer un son. Seuls les sons avec un vrai audioUrl (droits acquis)
 * peuvent être ajoutés.
 */
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function creerPlaylist(nom: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Connecte-toi d'abord.");
  if (!nom.trim()) throw new Error("Le nom de la playlist est requis.");

  await prisma.playlist.create({
    data: { userId: session.user.id, name: nom.trim() },
  });

  revalidatePath("/mes-playlists");
}

export async function supprimerPlaylist(playlistId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non connecté.");

  await prisma.playlist.deleteMany({
    where: { id: playlistId, userId: session.user.id },
  });

  revalidatePath("/mes-playlists");
}

export async function ajouterSonAPlaylist(playlistId: string, trackId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Connecte-toi d'abord.");

  const track = await prisma.track.findUnique({ where: { id: trackId } });
  if (!track?.audioUrl) {
    throw new Error("Seuls les sons dont on a les droits peuvent être ajoutés à une playlist.");
  }

  const playlist = await prisma.playlist.findFirst({
    where: { id: playlistId, userId: session.user.id },
  });
  if (!playlist) throw new Error("Playlist introuvable.");

  await prisma.playlistTrack.upsert({
    where: { playlistId_trackId: { playlistId, trackId } },
    update: {},
    create: { playlistId, trackId },
  });

  revalidatePath("/mes-playlists");
}

export async function retirerSonDePlaylist(playlistId: string, trackId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non connecté.");

  await prisma.playlistTrack.deleteMany({
    where: { playlistId, trackId, playlist: { userId: session.user.id } },
  });

  revalidatePath(`/mes-playlists/${playlistId}`);
}
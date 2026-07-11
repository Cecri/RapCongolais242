/**
 * FICHIER : src/lib/plays.ts
 * RÔLE : Incrémente le compteur d'écoutes d'un son (Track.playsCount)
 * à chaque nouvelle lecture. Appelée depuis PlayerContext.tsx dès
 * qu'un son démarre — jamais compté avant, indispensable pour que
 * "Meilleur démarrage" ait de vraies données à afficher.
 */
"use server";

import { prisma } from "@/lib/prisma";

export async function incrementerEcoute(trackId: string) {
  try {
    await prisma.track.update({
      where: { id: trackId },
      data: { playsCount: { increment: 1 } },
    });
  } catch {
    // Si le son a été supprimé entre-temps, on ignore silencieusement
  }
}
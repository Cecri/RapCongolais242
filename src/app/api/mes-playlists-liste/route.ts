/**
 * FICHIER : src/app/api/mes-playlists-liste/route.ts
 * RÔLE : Renvoie la liste des playlists de l'utilisateur connecté
 * (nom + id), utilisée par AjouterAPlaylistButton.tsx.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json([]);

  const playlists = await prisma.playlist.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(playlists);
}
/**
 * FICHIER : src/app/api/upload/route.ts
 * RÔLE : Route API appelée par les formulaires admin AVANT l'upload réel.
 * Reçoit le nom/type du fichier à uploader, vérifie que l'appelant est
 * bien un admin, puis renvoie une URL signée temporaire (voir
 * src/lib/upload.ts) que le navigateur utilisera pour envoyer le fichier
 * directement à Cloudflare R2.
 *
 * Un Route Handler (pas un Server Action) est volontairement utilisé ici
 * car c'est un point d'entrée technique appelé via fetch() en JavaScript
 * classique côté client, pas via un <form>.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { genererUrlUploadSignee } from "@/lib/upload";

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 403 });
  }

  const { nomFichier, typeMime, dossier } = await request.json();

  if (!nomFichier || !typeMime || !dossier) {
    return NextResponse.json({ erreur: "Paramètres manquants." }, { status: 400 });
  }

  const { urlUpload, urlPublique } = await genererUrlUploadSignee(
    nomFichier,
    typeMime,
    dossier
  );

  return NextResponse.json({ urlUpload, urlPublique });
}
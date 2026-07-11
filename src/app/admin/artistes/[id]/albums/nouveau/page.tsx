/**
 * FICHIER : src/app/admin/artistes/[id]/albums/nouveau/page.tsx
 * RÔLE : Formulaire admin pour créer un album/EP/mixtape rattaché à un
 * artiste. URL : /admin/artistes/[id]/albums/nouveau
 */
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import FormulaireAlbum from "./FormulaireAlbum";

export default async function NouvelAlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artiste = await prisma.artist.findUnique({ where: { id } });
  if (!artiste) notFound();

  return (
    <main className="mx-auto max-w-xl px-8 pb-24 pt-14">
      <h1 className="font-display text-3xl font-bold">Nouveau projet — {artiste.stageName}</h1>
      <FormulaireAlbum artistId={id} />
    </main>
  );
}
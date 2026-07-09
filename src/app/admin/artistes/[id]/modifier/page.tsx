/**
 * FICHIER : src/app/admin/artistes/[id]/modifier/page.tsx
 * RÔLE : Récupère les données actuelles de l'artiste côté serveur, les
 * transmet au formulaire client de modification.
 */
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import FormulaireModifierArtiste from "./FormulaireModifierArtiste";

export default async function ModifierArtistePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artiste = await prisma.artist.findUnique({ where: { id } });

  if (!artiste) notFound();

  return (
    <main className="mx-auto max-w-xl px-8 pb-24 pt-14">
      <h1 className="font-display text-3xl font-bold">Modifier {artiste.stageName}</h1>
      <FormulaireModifierArtiste artiste={artiste} />
    </main>
  );
}
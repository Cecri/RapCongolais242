/**
 * FICHIER : src/app/admin/sons/[id]/modifier/page.tsx
 * RÔLE : Récupère les données actuelles du son, les transmet au
 * formulaire de modification.
 */
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import FormulaireModifierSon from "./FormulaireModifierSon";

export default async function ModifierSonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const track = await prisma.track.findUnique({ where: { id } });

  if (!track) notFound();

  return (
    <main className="mx-auto max-w-xl px-8 pb-24 pt-14">
      <h1 className="font-display text-3xl font-bold">Modifier {track.title}</h1>
      <FormulaireModifierSon track={track} />
    </main>
  );
}
/**
 * FICHIER : src/app/admin/news/[id]/modifier/page.tsx
 * RÔLE : Formulaire de modification d'une actualité existante.
 */
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import FormulaireModifierNews from "./FormulaireModifierNews";

export default async function ModifierNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const news = await prisma.newsPost.findUnique({ where: { id } });
  if (!news) notFound();

  return (
    <main className="mx-auto max-w-xl px-8 pb-24 pt-14">
      <h1 className="font-display text-3xl font-bold">Modifier l&apos;actualité</h1>
      <FormulaireModifierNews news={news} />
    </main>
  );
}
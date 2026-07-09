import { prisma } from "@/lib/prisma";
import FormulaireSon from "./FormulaireSon";

export default async function NouveauSonPage() {
  const artistes = await prisma.artist.findMany({
    orderBy: { stageName: "asc" },
    select: { id: true, stageName: true },
  });

  return (
    <main className="mx-auto max-w-xl px-8 pb-24 pt-14">
      <h1 className="font-display text-3xl font-bold">Ajouter un son</h1>
      <FormulaireSon artistes={artistes} />
    </main>
  );
}
/**
 * FICHIER : src/app/admin/artiste-semaine/page.tsx
 * RÔLE : Page admin pour choisir/gérer l'artiste de la semaine.
 * URL : /admin/artiste-semaine
 */
import { prisma } from "@/lib/prisma";
import FormulaireArtisteSemaine from "./FormulaireArtisteSemaine";

export default async function ArtisteSemainePage() {
  const artistes = await prisma.artist.findMany({
    orderBy: { stageName: "asc" },
    include: { tracks: { select: { id: true, title: true } } },
  });

  const artisteActuel = artistes.find((a) => a.isFeatured) ?? null;

  return (
    <main className="mx-auto max-w-xl px-8 pb-24 pt-14">
      <h1 className="font-display text-3xl font-bold">Artiste de la semaine</h1>

      {artisteActuel && (
        <div className="mt-6 rounded-2xl border border-copper/30 bg-copper-dim px-6 py-5">
          <p className="text-sm text-paper-dim">Actuellement en avant :</p>
          <p className="mt-1 font-display text-lg font-bold text-copper">{artisteActuel.stageName}</p>
        </div>
      )}

      <FormulaireArtisteSemaine
        artistes={artistes.map((a) => ({
          id: a.id,
          stageName: a.stageName,
          tracks: a.tracks,
        }))}
      />
    </main>
  );
}
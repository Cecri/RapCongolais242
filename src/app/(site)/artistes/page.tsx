/**
 * FICHIER : src/app/(site)/artistes/page.tsx
 * RÔLE : Page annuaire des artistes. Limite maintenant la requête
 * initiale à 60 artistes les plus récents — la recherche interroge
 * directement toute la base, comme sur /sons.
 */
import { prisma } from "@/lib/prisma";
import ArtistesListe from "./ArtistesListe";

const TAILLE_INITIALE = 60;

export default async function ArtistesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const recherche = q?.trim();

  const artistes = await prisma.artist.findMany({
    where: recherche
      ? { stageName: { contains: recherche, mode: "insensitive" } }
      : undefined,
    include: { tracks: true, ratings: true },
    orderBy: { createdAt: "desc" },
    take: recherche ? 100 : TAILLE_INITIALE,
  });

  const artistesPourAffichage = artistes.map((a) => {
    const note = a.ratings.length > 0
      ? a.ratings.reduce((somme, r) => somme + r.score, 0) / a.ratings.length
      : null;

    const derniereSortie = a.tracks.length > 0
      ? a.tracks.reduce((plusRecent, t) => (t.releaseDate > plusRecent ? t.releaseDate : plusRecent), a.tracks[0].releaseDate).toISOString()
      : a.createdAt.toISOString();

    return {
      slug: a.slug,
      name: a.stageName,
      country: a.country,
      genre: a.genre,
      photoUrl: a.photoUrl,
      note,
      nbSons: a.tracks.length,
      derniereSortie,
    };
  });

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-8">
      <header className="pt-14">
        <span className="block font-mono text-xs uppercase tracking-wider text-ash">Annuaire</span>
        <h1 className="mt-2.5 font-display text-4xl font-bold">Nos talents du Congo, de la diaspora et d&apos;ailleurs en Afrique</h1>
        {recherche && <p className="mt-2 text-paper-dim">Résultats pour &quot;{recherche}&quot;</p>}
      </header>

      <ArtistesListe artistes={artistesPourAffichage} rechercheInitiale={recherche ?? ""} />
    </main>
  );
}
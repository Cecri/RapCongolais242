/**
 * FICHIER : src/app/(site)/artistes/page.tsx
 * RÔLE : Page annuaire des artistes. Récupère maintenant les VRAIS
 * artistes depuis Prisma (table Artist), plus le fichier statique
 * src/data/artists.ts utilisé au début du projet. Calcule pour chacun :
 * nombre de sons, date de dernière sortie, note moyenne (si notée).
 * Transmet ensuite à ArtistesListe (Client Component) pour la recherche/
 * le tri/le "voir plus".
 */
import { prisma } from "@/lib/prisma";
import ArtistesListe from "./ArtistesListe";

export default async function ArtistesPage() {
  const artistes = await prisma.artist.findMany({
    include: { tracks: true, ratings: true },
    orderBy: { createdAt: "desc" },
  });

  const artistesPourAffichage = artistes.map((a) => {
    const note = a.ratings.length > 0
      ? a.ratings.reduce((somme, r) => somme + r.score, 0) / a.ratings.length
      : null;

    const derniereSortie = a.tracks.length > 0
      ? a.tracks.reduce((plusRecent, t) => (t.publishedAt > plusRecent ? t.publishedAt : plusRecent), a.tracks[0].publishedAt).toISOString()
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
    <main className="mx-auto max-w-6xl px-8">
      <header className="pt-14">
        <span className="block font-mono text-xs uppercase tracking-wider text-ash">Annuaire</span>
        <h1 className="mt-2.5 font-display text-4xl font-bold">Nos talents du Congo, de la diaspora et d&apos;ailleurs en Afrique</h1>
      </header>

      <ArtistesListe artistes={artistesPourAffichage} />
    </main>
  );
}
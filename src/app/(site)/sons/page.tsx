/**
 * FICHIER : src/app/(site)/sons/page.tsx
 * RÔLE : Page publique listant les sons. Limite maintenant la requête
 * initiale à 60 sons les plus récents (au lieu de tout charger) — la
 * recherche texte, elle, interroge directement la base (pas seulement
 * les 60 déjà chargés), pour rester fiable même avec un gros catalogue.
 */
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { estUtilisateurPremium } from "@/lib/premium";
import SonsListe from "./SonsListe";
import SoumissionBanner from "@/components/SoumissionBanner";

const TAILLE_INITIALE = 60;

export default async function SonsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const session = await auth();
  const estPremium = session?.user?.id ? await estUtilisateurPremium(session.user.id) : false;
  const estConnecte = !!session?.user;

  const recherche = q?.trim();

  const sons = await prisma.track.findMany({
    where: recherche
      ? {
          OR: [
            { title: { contains: recherche, mode: "insensitive" } },
            { artist: { stageName: { contains: recherche, mode: "insensitive" } } },
          ],
        }
      : undefined,
    orderBy: { releaseDate: "desc" },
    take: recherche ? 100 : TAILLE_INITIALE,
    include: { artist: { select: { stageName: true, slug: true } } },
  });

  const sonsPourAffichage = sons.map((son) => {
    const verrouille = son.isExclusive && !estPremium;
    return {
      id: son.id,
      title: son.title,
      coverUrl: son.coverUrl,
      isExclusive: son.isExclusive,
      publishedAt: son.releaseDate.toISOString(),
      artistName: son.artist.stageName,
      artistSlug: son.artist.slug,
      audioUrl: verrouille ? null : son.audioUrl,
      externalUrl: son.externalUrl,
      verrouille,
      estPremium,
      estConnecte,
    };
  });

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-8">
      <header className="pt-14">
        <span className="block font-mono text-xs uppercase tracking-wider text-ash">Écouter</span>
        <h1 className="mt-2.5 font-display text-4xl font-bold">Tous les sons</h1>
        <p className="mt-2 text-paper-dim">
          {recherche
            ? `Résultats pour "${recherche}"`
            : `Les ${TAILLE_INITIALE} sons les plus récents — utilise la recherche pour explorer tout le catalogue.`}
        </p>
      </header>
      <SonsListe sons={sonsPourAffichage} rechercheInitiale={recherche ?? ""} />
      <SoumissionBanner />
    </main>
  );
}
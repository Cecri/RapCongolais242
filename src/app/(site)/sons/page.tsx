/**
 * FICHIER : src/app/(site)/sons/page.tsx
 * RÔLE : Page publique listant tous les sons. Transmet maintenant aussi
 * externalUrl à chaque carte, pour permettre la lecture YouTube intégrée
 * quand aucun fichier audio n'est hébergé chez nous.
 */
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { estUtilisateurPremium } from "@/lib/premium";
import SonsListe from "./SonsListe";
import SoumissionBanner from "@/components/SoumissionBanner";

export default async function SonsPage() {
  const session = await auth();
  const estPremium = session?.user?.id ? await estUtilisateurPremium(session.user.id) : false;
  const estConnecte = !!session?.user;

  const sons = await prisma.track.findMany({
    orderBy: { publishedAt: "desc" },
    include: { artist: { select: { stageName: true, slug: true } } },
  });

  const sonsPourAffichage = sons.map((son) => {
    const verrouille = son.isExclusive && !estPremium;
    return {
      id: son.id,
      title: son.title,
      coverUrl: son.coverUrl,
      isExclusive: son.isExclusive,
      publishedAt: son.publishedAt.toISOString(),
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
    <main className="mx-auto max-w-6xl px-8">
      <header className="pt-14">
        <span className="block font-mono text-xs uppercase tracking-wider text-ash">Écouter</span>
        <h1 className="mt-2.5 font-display text-4xl font-bold">Tous les sons</h1>
        <p className="mt-2 text-paper-dim">Les morceaux de nos artistes, y compris nos exclusivités introuvables ailleurs.</p>
      </header>

      <SonsListe sons={sonsPourAffichage} />

      <SoumissionBanner />
    </main>
  );
}
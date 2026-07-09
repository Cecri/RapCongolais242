/**
 * FICHIER : src/app/(site)/mes-favoris/page.tsx
 * RÔLE : Liste les sons favoris de l'utilisateur connecté.
 * URL : /mes-favoris
 */
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { estUtilisateurPremium } from "@/lib/premium";
import SonCard from "@/components/SonCard";

export default async function MesFavorisPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main className="mx-auto max-w-lg px-8 py-24 text-center">
        <p className="text-paper-dim">Connecte-toi pour voir tes favoris.</p>
        <a href="/connexion" className="mt-4 inline-block rounded-lg bg-ember px-5 py-2.5 text-sm font-semibold">Se connecter</a>
      </main>
    );
  }

  const estPremium = await estUtilisateurPremium(session.user.id);

  const favoris = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { track: { include: { artist: { select: { stageName: true, slug: true } } } } },
  });

  const sons = favoris.map((f) => {
    const verrouille = f.track.isExclusive && !estPremium;
    return {
      id: f.track.id,
      title: f.track.title,
      coverUrl: f.track.coverUrl,
      isExclusive: f.track.isExclusive,
      artistName: f.track.artist.stageName,
      artistSlug: f.track.artist.slug,
      audioUrl: verrouille ? null : f.track.audioUrl,
      externalUrl: f.track.externalUrl,
      verrouille,
      estConnecte: true,
    };
  });

  return (
    <main className="mx-auto max-w-6xl px-8 pb-24">
      <header className="pt-14">
        <span className="block font-mono text-xs uppercase tracking-wider text-ash">Ta sélection</span>
        <h1 className="mt-2.5 font-display text-4xl font-bold">Mes favoris</h1>
      </header>

      {sons.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
          {sons.map((son) => (<SonCard key={son.id} {...son} />))}
        </div>
      ) : (
        <p className="mt-16 text-center text-ash">Aucun favori pour l&apos;instant — clique sur ♡ sur un son pour l&apos;ajouter ici.</p>
      )}
    </main>
  );
}
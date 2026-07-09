/**
 * FICHIER : src/app/(site)/page.tsx
 * RÔLE : Page d'accueil. La section "Nouveautés" (derniers artistes
 * ajoutés) est remplacée par "Les mieux notés" — tri par note moyenne
 * décroissante, calculée depuis la table Rating. Un artiste sans aucun
 * avis compte comme note 0 (donc apparaît en dernier).
 */
import ArtistCard from "@/components/ArtistCard";
import SonCard from "@/components/SonCard";
import ClipCard from "@/components/ClipCard";
import HeroPlayButton from "@/components/HeroPlayButton";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { estUtilisateurPremium } from "@/lib/premium";
import { recupererClipsPlaylist } from "@/lib/youtube";

export default async function Home() {
  const session = await auth();
  const estPremium = session?.user?.id ? await estUtilisateurPremium(session.user.id) : false;
  const estConnecte = !!session?.user;

  const artisteVedette = await prisma.artist.findFirst({
    where: { isFeatured: true },
    include: { featuredTrack: true },
  });

  const tousLesArtistes = await prisma.artist.findMany({
    include: { tracks: true, ratings: true },
  });

  const artistesAvecNote = tousLesArtistes.map((a) => ({
    slug: a.slug,
    name: a.stageName,
    country: a.country,
    genre: a.genre,
    photoUrl: a.photoUrl,
    note: a.ratings.length > 0 ? a.ratings.reduce((s, r) => s + r.score, 0) / a.ratings.length : 0,
    nbSons: a.tracks.length,
  }));

  const mieuxNotes = [...artistesAvecNote]
    .sort((a, b) => b.note - a.note)
    .slice(0, 4)
    .map((a) => ({ ...a, note: a.note > 0 ? a.note : null })); // 0 → null pour ne pas afficher "★ 0.0" sur la carte

  const sonsRecentsRaw = await prisma.track.findMany({
    orderBy: { publishedAt: "desc" },
    take: 4,
    include: { artist: { select: { stageName: true, slug: true } } },
  });

  const sonsRecents = sonsRecentsRaw.map((son) => {
    const verrouille = son.isExclusive && !estPremium;
    return {
      id: son.id,
      title: son.title,
      coverUrl: son.coverUrl,
      isExclusive: son.isExclusive,
      artistName: son.artist.stageName,
      artistSlug: son.artist.slug,
      audioUrl: verrouille ? null : son.audioUrl,
      externalUrl: son.externalUrl,
      verrouille,
      estPremium,
      estConnecte,
    };
  });

  const tousLesClips = await recupererClipsPlaylist();
  const clipsRecents = tousLesClips.slice(0, 4);

  const photoVedette = artisteVedette?.featuredPhotoUrl ?? artisteVedette?.photoUrl ?? null;
  const texteVedette = artisteVedette?.featuredBlurb ?? artisteVedette?.bio ?? (artisteVedette ? `${artisteVedette.country} · ${artisteVedette.genre ?? "Rap"}` : "");
  const initialesVedette = artisteVedette?.stageName.split(" ").map((m) => m[0]).slice(0, 2).join("").toUpperCase();

  const trackVedette = artisteVedette?.featuredTrack;
  const trackVedetteVerrouille = !!(trackVedette?.isExclusive && !estPremium);

  return (
    <main className="mx-auto max-w-6xl px-8">

      {artisteVedette && (
        <section className="grid grid-cols-1 items-center gap-14 pt-14 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-copper-dim px-3 py-1 font-mono text-xs font-semibold text-copper">★ Artiste de la semaine</span>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05]">{artisteVedette.stageName}</h1>
            <p className="mt-5 max-w-md text-paper-dim">{texteVedette}</p>
            <div className="mt-8 flex gap-3.5">
              {trackVedette ? (
                <HeroPlayButton
                  trackId={trackVedette.id}
                  title={trackVedette.title}
                  artistName={artisteVedette.stageName}
                  audioUrl={trackVedetteVerrouille ? null : trackVedette.audioUrl}
                  externalUrl={trackVedette.externalUrl}
                  coverUrl={trackVedette.coverUrl}
                  verrouille={trackVedetteVerrouille}
                />
              ) : (
                <a href="/sons" className="rounded-lg bg-ember px-5 py-2.5 text-sm font-semibold">▶ Voir ses sons</a>
              )}
              <a href={`/artistes/${artisteVedette.slug}`} className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold">Voir le profil</a>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="flex h-72 w-72 items-center justify-center overflow-hidden rounded-full bg-ink-softer font-display text-6xl text-white/15">
              {photoVedette ? (
                <img src={photoVedette} alt="" className="h-full w-full object-cover" />
              ) : initialesVedette}
            </div>
          </div>
        </section>
      )}

      {mieuxNotes.length > 0 && (
        <section className="mt-24">
          <div className="mb-7 flex items-baseline justify-between">
            <div>
              <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-ash">Le classement</span>
              <h2 className="font-display text-2xl font-semibold">Les mieux notés</h2>
            </div>
            <a href="/artistes" className="text-sm font-semibold text-copper">Tout voir →</a>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {mieuxNotes.map((a) => (<ArtistCard key={a.slug} {...a} />))}
          </div>
        </section>
      )}

      {sonsRecents.length > 0 && (
        <section className="mt-24">
          <div className="mb-7 flex items-baseline justify-between">
            <div>
              <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-ash">À l&apos;écoute</span>
              <h2 className="font-display text-2xl font-semibold">Sons récents</h2>
            </div>
            <a href="/sons" className="text-sm font-semibold text-copper">Tout voir →</a>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {sonsRecents.map((son) => (<SonCard key={son.id} {...son} />))}
          </div>
        </section>
      )}

      {clipsRecents.length > 0 && (
        <section className="mt-24 pb-24">
          <div className="mb-7 flex items-baseline justify-between">
            <div>
              <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-ash">Playlist YouTube</span>
              <h2 className="font-display text-2xl font-semibold">Clips récents</h2>
            </div>
            <a href="/clips" className="text-sm font-semibold text-copper">Tout voir →</a>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {clipsRecents.map((clip) => (<ClipCard key={clip.id} {...clip} />))}
          </div>
        </section>
      )}

    </main>
  );
}
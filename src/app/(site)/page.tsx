/**
 * FICHIER : src/app/(site)/page.tsx
 * RÔLE : Page d'accueil. Podium extrait dans son propre composant
 * client (interactif). Ordre des sections : ... Top artistes, puis
 * Notre catalogue (inversé par rapport à avant).
 */
import ArtistCard from "@/components/ArtistCard";
import SonCard from "@/components/SonCard";
import ClipCard from "@/components/ClipCard";
import HeroPlayButton from "@/components/HeroPlayButton";
import Podium from "@/components/Podium";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { estUtilisateurPremium } from "@/lib/premium";
import { recupererClipsPlaylist } from "@/lib/youtube";
import type { PlayerTrack } from "@/context/PlayerContext";

type SonAffichage = {
  id: string;
  title: string;
  coverUrl: string | null;
  isExclusive: boolean;
  artistName: string;
  artistSlug: string;
  audioUrl: string | null;
  externalUrl: string | null;
  verrouille: boolean;
  estPremium: boolean;
  estConnecte: boolean;
  playsCount?: number;
};

function construireQueue(sons: SonAffichage[]): PlayerTrack[] {
  return sons
    .filter((s) => !!s.audioUrl)
    .map((s) => ({
      id: s.id,
      title: s.title,
      artistName: s.artistName,
      audioUrl: s.audioUrl!,
      coverUrl: s.coverUrl,
    }));
}

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

  const mieuxNotes = tousLesArtistes
    .map((a) => ({
      slug: a.slug,
      name: a.stageName,
      country: a.country,
      genre: a.genre,
      photoUrl: a.photoUrl,
      note: a.ratings.length > 0 ? a.ratings.reduce((s, r) => s + r.score, 0) / a.ratings.length : 0,
      nbSons: a.tracks.length,
    }))
    .sort((a, b) => b.note - a.note)
    .slice(0, 8)
    .map((a) => ({ ...a, note: a.note > 0 ? a.note : null }));

  function mapperSon(son: {
    id: string;
    title: string;
    coverUrl: string | null;
    isExclusive: boolean;
    audioUrl: string | null;
    externalUrl: string | null;
    playsCount: number;
    artist: { stageName: string; slug: string };
  }): SonAffichage {
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
      playsCount: son.playsCount,
    };
  }

  const sortiesDeLaSemaineRaw = await prisma.track.findMany({
    where: { isReleaseOfWeek: true },
    orderBy: { releaseDate: "desc" },
    take: 8,
    include: { artist: { select: { stageName: true, slug: true } } },
  });
  const sortiesDeLaSemaine = sortiesDeLaSemaineRaw.map(mapperSon);

  const ilYA30Jours = new Date();
  ilYA30Jours.setDate(ilYA30Jours.getDate() - 30);

  const meilleurDemarrageRaw = await prisma.track.findMany({
    where: { releaseDate: { gte: ilYA30Jours }, playsCount: { gt: 0 } },
    orderBy: { playsCount: "desc" },
    take: 3,
    include: { artist: { select: { stageName: true, slug: true } } },
  });
  const meilleurDemarrage = meilleurDemarrageRaw.map(mapperSon);

  const plusEcoutesRaw = await prisma.track.findMany({
    where: { playsCount: { gt: 0 } },
    orderBy: { playsCount: "desc" },
    take: 3,
    include: { artist: { select: { stageName: true, slug: true } } },
  });
  const plusEcoutes = plusEcoutesRaw.map(mapperSon);

  const catalogueRaw = await prisma.track.findMany({
    orderBy: { releaseDate: "desc" },
    take: 12,
    include: { artist: { select: { stageName: true, slug: true } } },
  });
  const catalogue = catalogueRaw.map(mapperSon);

  const news = await prisma.newsPost.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const tousLesClips = await recupererClipsPlaylist();
  const clipsRecents = tousLesClips.slice(0, 8);

  const photoVedette = artisteVedette?.featuredPhotoUrl ?? artisteVedette?.photoUrl ?? null;
  const texteVedette =
    artisteVedette?.featuredBlurb ??
    artisteVedette?.bio ??
    (artisteVedette ? `${artisteVedette.country} · ${artisteVedette.genre ?? "Rap"}` : "");
  const initialesVedette = artisteVedette?.stageName
    .split(" ")
    .map((m) => m[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const trackVedette = artisteVedette?.featuredTrack;
  const trackVedetteVerrouille = !!(trackVedette?.isExclusive && !estPremium);

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-8">
      {artisteVedette && (
        <section className="flex flex-col items-center gap-6 pt-8 text-center sm:pt-14 md:grid md:grid-cols-2 md:items-center md:gap-14 md:text-left">
          <div className="order-2 md:order-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-copper-dim px-3 py-1 font-mono text-[11px] font-semibold text-copper sm:text-xs">
              ★ Artiste de la semaine
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:mt-5 sm:text-5xl sm:leading-[1.05]">
              {artisteVedette.stageName}
            </h1>
            <p className="mt-3 text-sm text-paper-dim sm:mt-5 sm:max-w-md sm:text-base">{texteVedette}</p>
            <div className="mt-5 flex justify-center gap-2.5 sm:mt-8 sm:justify-start sm:gap-3.5">
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
                <a href="/sons" className="rounded-lg bg-ember px-3.5 py-2 text-xs font-semibold sm:px-5 sm:py-2.5 sm:text-sm">
                  ▶ Voir ses sons
                </a>
              )}
              <a href={`/artistes/${artisteVedette.slug}`} className="rounded-lg border border-white/20 px-3.5 py-2 text-xs font-semibold sm:px-5 sm:py-2.5 sm:text-sm">
                Voir le profil
              </a>
            </div>
          </div>
          <div className="order-1 flex justify-center md:order-2">
            <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-ink-softer font-display text-4xl text-white/15 sm:h-56 sm:w-56 sm:text-5xl md:h-72 md:w-72 md:text-6xl">
              {photoVedette ? (
                <img src={photoVedette} alt="" className="h-full w-full object-cover" />
              ) : (
                initialesVedette
              )}
            </div>
          </div>
        </section>
      )}

      {news.length > 0 && (
        <section className="mt-12 sm:mt-24">
          <div className="mb-4 sm:mb-7">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-ash sm:mb-2 sm:text-xs">
              Actualités
            </span>
            <h2 className="font-display text-lg font-semibold sm:text-2xl">Quoi de neuf</h2>
          </div>
          <div className="flex flex-col gap-3 sm:gap-4">
            {news.map((n) => (
              <div key={n.id} className="flex gap-4 rounded-2xl border border-white/10 bg-ink-soft p-4 sm:p-5">
                {n.imageUrl && (
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-softer sm:h-20 sm:w-20">
                    <img src={n.imageUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold sm:text-lg">{n.title}</p>
                  <p className="mt-1 text-sm text-paper-dim">{n.content}</p>
                  <p className="mt-2 text-xs text-ash">
                    {n.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {sortiesDeLaSemaine.length > 0 && (
        <RangeeHorizontale eyebrow="À ne pas manquer" titre="Sortie de la semaine" lienVoirTout="/sons">
          {sortiesDeLaSemaine.map((son) => (
            <div key={son.id} className="w-32 shrink-0 sm:w-auto">
              <SonCard {...son} queueContext={construireQueue(sortiesDeLaSemaine)} />
            </div>
          ))}
        </RangeeHorizontale>
      )}

      {meilleurDemarrage.length > 0 && (
        <section className="mt-12 sm:mt-24">
          <div className="mb-4 sm:mb-7">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-ash sm:mb-2 sm:text-xs">
              Ça monte fort
            </span>
            <h2 className="font-display text-lg font-semibold sm:text-2xl">Meilleur démarrage</h2>
          </div>
          <Podium sons={meilleurDemarrage} queueContext={construireQueue(meilleurDemarrage)} />
        </section>
      )}

      {plusEcoutes.length > 0 && (
        <section className="mt-12 sm:mt-24">
          <div className="mb-4 sm:mb-7">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-ash sm:mb-2 sm:text-xs">
              Le classement permanent
            </span>
            <h2 className="font-display text-lg font-semibold sm:text-2xl">Les plus écoutés</h2>
          </div>
          <Podium sons={plusEcoutes} queueContext={construireQueue(plusEcoutes)} />
        </section>
      )}

      {mieuxNotes.length > 0 && (
        <RangeeHorizontale eyebrow="Le classement" titre="Top artistes" lienVoirTout="/artistes">
          {mieuxNotes.map((a) => (
            <div key={a.slug} className="w-32 shrink-0 sm:w-auto">
              <ArtistCard {...a} />
            </div>
          ))}
        </RangeeHorizontale>
      )}

      {catalogue.length > 0 && (
        <RangeeHorizontale eyebrow="Tout le catalogue" titre="Notre catalogue" lienVoirTout="/sons">
          {catalogue.map((son) => (
            <div key={son.id} className="w-32 shrink-0 sm:w-auto">
              <SonCard {...son} queueContext={construireQueue(catalogue)} />
            </div>
          ))}
        </RangeeHorizontale>
      )}

      {clipsRecents.length > 0 && (
        <RangeeHorizontale eyebrow="Playlist YouTube" titre="Nos clips" lienVoirTout="/clips" derniere>
          {clipsRecents.map((clip) => (
            <div key={clip.id} className="w-40 shrink-0 sm:w-auto">
              <ClipCard {...clip} />
            </div>
          ))}
        </RangeeHorizontale>
      )}
    </main>
  );
}

function RangeeHorizontale({
  eyebrow,
  titre,
  lienVoirTout,
  derniere = false,
  children,
}: {
  eyebrow: string;
  titre: string;
  lienVoirTout: string;
  derniere?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`mt-12 sm:mt-24 ${derniere ? "pb-16 sm:pb-24" : ""}`}>
      <div className="mb-4 flex items-baseline justify-between sm:mb-7">
        <div>
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-ash sm:mb-2 sm:text-xs">
            {eyebrow}
          </span>
          <h2 className="font-display text-lg font-semibold sm:text-2xl">{titre}</h2>
        </div>
        <a href={lienVoirTout} className="text-xs font-semibold text-copper sm:text-sm">
          Tout voir →
        </a>
      </div>
      <div className="flex gap-3.5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-4 sm:gap-5 sm:overflow-visible [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
  );
}
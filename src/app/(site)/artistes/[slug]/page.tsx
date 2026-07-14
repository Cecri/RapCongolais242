/**
 * FICHIER : src/app/(site)/artistes/[slug]/page.tsx
 * RÔLE : Profil public d'un artiste.
 * - Bascule 2 colonnes repoussée à lg: (1024px) au lieu de md: (768px)
 *   — plus de marge de sécurité contre les téléphones Android qui
 *   perçoivent une largeur d'écran plus grande que la réalité.
 * - Bio affichée directement sous le nom de l'artiste, en simple texte,
 *   sans le titre "À propos".
 */
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { estUtilisateurPremium } from "@/lib/premium";
import { notFound } from "next/navigation";
import RatingStars from "@/components/RatingStars";
import SonListItem from "@/components/SonListItem";
import type { PlayerTrack } from "@/context/PlayerContext";
import { recupererClipsPlaylist } from "@/lib/youtube";
import ClipCard from "@/components/ClipCard";

const LABELS_TYPE: Record<string, string> = {
  ALBUM: "Album",
  EP: "EP",
  MIXTAPE: "Mixtape",
  SINGLE: "Single",
};

export default async function ArtisteProfil({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const artiste = await prisma.artist.findUnique({
    where: { slug },
    include: {
      tracks: { orderBy: { releaseDate: "desc" }, include: { artist: true, featuring: true, album: true } },
      featuringTracks: { orderBy: { releaseDate: "desc" }, include: { artist: true, featuring: true, album: true } },
      ratings: true,
    },
  });

  if (!artiste) notFound();
  const artisteId = artiste.id;

  const session = await auth();
  const estPremium = session?.user?.id ? await estUtilisateurPremium(session.user.id) : false;
  const estConnecte = !!session?.user;

  const note = artiste.ratings.length > 0
    ? artiste.ratings.reduce((somme, r) => somme + r.score, 0) / artiste.ratings.length
    : null;

  const initiales = artiste.stageName.split(" ").map((m) => m[0]).slice(0, 2).join("").toUpperCase();

  const reseaux = [
    { label: "Instagram", url: artiste.instagram },
    { label: "YouTube", url: artiste.youtube },
    { label: "TikTok", url: artiste.tiktok },
    { label: "X", url: artiste.x },
  ].filter((r) => r.url);

  const aDesInfosContact = artiste.contactEmail || artiste.contactPhone;

  const tousLesMorceaux = [...artiste.tracks, ...artiste.featuringTracks]
    .filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i)
    .sort((a, b) => b.releaseDate.getTime() - a.releaseDate.getTime());

  function preparerSon(track: (typeof tousLesMorceaux)[number]) {
    const verrouille = track.isExclusive && !estPremium;
    const autresArtistes = [track.artist, ...track.featuring].filter((a) => a.id !== artisteId);
    const nomAffiche = autresArtistes.length > 0
      ? `${track.artist.stageName} ft. ${[track.artist, ...track.featuring].filter((a) => a.id !== track.artistId).map((a) => a.stageName).join(", ")}`
      : track.artist.stageName;

    return {
      id: track.id,
      title: track.title,
      coverUrl: track.coverUrl,
      isExclusive: track.isExclusive,
      artistName: nomAffiche,
      audioUrl: verrouille ? null : track.audioUrl,
      externalUrl: track.externalUrl,
      verrouille,
      estConnecte,
    };
  }

  const sons = tousLesMorceaux.map(preparerSon);

  const queueContext: PlayerTrack[] = sons
    .filter((son) => !!son.audioUrl)
    .map((son) => ({ id: son.id, title: son.title, artistName: son.artistName, audioUrl: son.audioUrl!, coverUrl: son.coverUrl }));

  type GroupeAlbum = {
    id: string; title: string; type: string; releaseDate: Date; coverUrl: string | null;
    morceaux: typeof tousLesMorceaux;
  };

  const groupesParAlbum = new Map<string, GroupeAlbum>();
  const singles: typeof tousLesMorceaux = [];

  for (const track of tousLesMorceaux) {
    if (track.album) {
      const existant = groupesParAlbum.get(track.album.id);
      if (existant) {
        existant.morceaux.push(track);
      } else {
        groupesParAlbum.set(track.album.id, {
          id: track.album.id,
          title: track.album.title,
          type: track.album.type,
          releaseDate: track.album.releaseDate,
          coverUrl: track.album.coverUrl,
          morceaux: [track],
        });
      }
    } else {
      singles.push(track);
    }
  }

  const albumsTries = Array.from(groupesParAlbum.values()).sort(
    (a, b) => b.releaseDate.getTime() - a.releaseDate.getTime()
  );

  for (const album of albumsTries) {
    album.morceaux.sort((a, b) => {
      const numA = a.trackNumber ?? 999;
      const numB = b.trackNumber ?? 999;
      return numA - numB;
    });
  }

  type ElementDiscographie =
    | { type: "album"; data: GroupeAlbum }
    | { type: "single"; data: (typeof tousLesMorceaux)[number] };

  const elements: ElementDiscographie[] = [
    ...albumsTries.map((a) => ({ type: "album" as const, data: a })),
    ...singles.map((s) => ({ type: "single" as const, data: s })),
  ].sort((a, b) => b.data.releaseDate.getTime() - a.data.releaseDate.getTime());

  const collaborateurs = tousLesMorceaux
    .flatMap((track) => [track.artist, ...track.featuring])
    .filter((a) => a.id !== artisteId)
    .filter((a, i, arr) => arr.findIndex((x) => x.id === a.id) === i);

  const tousLesClips = await recupererClipsPlaylist();
  const clipsDeLArtiste = tousLesClips.filter((clip) =>
    clip.title.toLowerCase().includes(artiste.stageName.toLowerCase())
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-8">
      <header className="flex flex-col gap-6 pt-10 sm:gap-8 sm:pt-14 lg:flex-row lg:items-end">
        <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-ink-softer font-display text-3xl sm:h-40 sm:w-40 sm:text-4xl">
          {artiste.photoUrl ? (
            <img src={artiste.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : initiales}
        </div>
        <div className="min-w-0 flex-1">
          {note !== null && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-copper-dim px-3 py-1 font-mono text-xs font-semibold text-copper">★ {note.toFixed(1)} / 5 ({artiste.ratings.length} avis)</span>
          )}
          <h1 className="mt-3 font-display text-2xl font-bold sm:mt-3.5 sm:text-4xl">{artiste.stageName}</h1>
          {artiste.bio && (
            <p className="mt-2 max-w-xl text-sm text-paper-dim sm:text-base">{artiste.bio}</p>
          )}
          <p className="mt-1.5 text-sm text-paper-dim sm:text-base">{artiste.country} · {artiste.genre ?? "—"} · {sons.length} titre{sons.length !== 1 ? "s" : ""}</p>
          <div className="mt-3">
            <RatingStars artistId={artiste.id} slug={artiste.slug} estConnecte={estConnecte} />
          </div>
        </div>
      </header>

      <div className="mt-10 grid min-w-0 gap-10 sm:mt-14 sm:gap-12 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold sm:text-xl">Discographie</h2>

          {elements.length === 0 && <p className="mt-5 text-sm text-ash">Aucun titre pour l&apos;instant.</p>}

          <div className="mt-5 flex flex-col gap-8">
            {elements.map((el) =>
              el.type === "album" ? (
                <div key={`album-${el.data.id}`}>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-softer sm:h-20 sm:w-20">
                      {el.data.coverUrl ? (
                        <img src={el.data.coverUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center font-display text-xl text-white/15">♪</div>
                      )}
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wide text-ash">{LABELS_TYPE[el.data.type]} · {el.data.releaseDate.getFullYear()}</span>
                      <p className="font-display text-base font-bold sm:text-lg">{el.data.title}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col gap-3">
                    {el.data.morceaux.map((track, i) => (
                      <SonListItem key={track.id} {...preparerSon(track)} numero={i + 1} queueContext={queueContext} />
                    ))}
                  </div>
                </div>
              ) : (
                <div key={`single-${el.data.id}`}>
                  <span className="font-mono text-[10px] uppercase tracking-wide text-ash">Single</span>
                  <div className="mt-2">
                    <SonListItem {...preparerSon(el.data)} queueContext={queueContext} />
                  </div>
                </div>
              )
            )}
          </div>

          {collaborateurs.length > 0 && (
            <>
              <h2 className="mt-12 font-display text-lg font-semibold sm:mt-14 sm:text-xl">Collaborations</h2>
              <div className="mt-5 flex flex-wrap gap-4">
                {collaborateurs.map((collab) => {
                  const initialesCollab = collab.stageName.split(" ").map((m) => m[0]).slice(0, 2).join("").toUpperCase();
                  return (
                    <Link key={collab.id} href={`/artistes/${collab.slug}`} className="flex w-20 flex-col items-center gap-2 text-center">
                      <div className="h-16 w-16 overflow-hidden rounded-full border border-white/10 bg-ink-softer font-display text-sm text-white/20 transition-transform hover:scale-105">
                        <div className="flex h-full w-full items-center justify-center">
                          {collab.photoUrl ? (
                            <img src={collab.photoUrl} alt="" className="h-full w-full object-cover" />
                          ) : initialesCollab}
                        </div>
                      </div>
                      <p className="w-full truncate text-xs text-paper-dim">{collab.stageName}</p>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {clipsDeLArtiste.length > 0 && (
            <>
              <h2 className="mt-12 font-display text-lg font-semibold sm:mt-14 sm:text-xl">Clips</h2>
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {clipsDeLArtiste.map((clip) => (<ClipCard key={clip.id} {...clip} />))}
              </div>
            </>
          )}
        </div>

        <aside className="h-fit min-w-0 rounded-2xl border border-white/10 bg-ink-soft p-6">
          <h3 className="font-semibold">Informations</h3>
          <dl className="mt-4 flex flex-col gap-3 text-sm">
            <div className="flex justify-between border-b border-white/10 pb-3"><dt className="text-ash">Pays</dt><dd>{artiste.country}</dd></div>
            <div className="flex justify-between border-b border-white/10 pb-3"><dt className="text-ash">Style</dt><dd>{artiste.genre ?? "—"}</dd></div>
            {note !== null && <div className="flex justify-between"><dt className="text-ash">Note moyenne</dt><dd>{note.toFixed(1)} / 5</dd></div>}
          </dl>

          {reseaux.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-5">
              {reseaux.map((r) => (<a key={r.label} href={r.url!} target="_blank" rel="noopener noreferrer" className="text-sm text-copper hover:text-copper/80">{r.label}</a>))}
            </div>
          )}

          {aDesInfosContact && (
            <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-5 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-ash">Contact</p>
              {artiste.contactEmail && <a href={`mailto:${artiste.contactEmail}`} className="text-paper-dim hover:text-paper">{artiste.contactEmail}</a>}
              {artiste.contactPhone && <a href={`tel:${artiste.contactPhone}`} className="text-paper-dim hover:text-paper">{artiste.contactPhone}</a>}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
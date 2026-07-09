/**
 * FICHIER : src/app/(site)/mes-playlists/[id]/page.tsx
 * RÔLE : Détail d'une playlist. Chaque son utilise PlaylistTrackRow
 * (bouton lecture au survol), plus "Tout écouter" en haut pour démarrer
 * depuis le premier.
 */
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import PlaylistTrackRow from "./PlaylistTrackRow";
import BoutonToutEcouter from "./BoutonToutEcouter";

export default async function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) notFound();

  const playlist = await prisma.playlist.findFirst({
    where: { id, userId: session.user.id },
    include: {
      tracks: {
        orderBy: { addedAt: "desc" },
        include: { track: { include: { artist: { select: { stageName: true } } } } },
      },
    },
  });

  if (!playlist) notFound();

  const sonsPourLecteur = playlist.tracks
    .filter(({ track }) => !!track.audioUrl)
    .map(({ track }) => ({
      id: track.id,
      title: track.title,
      artistName: track.artist.stageName,
      audioUrl: track.audioUrl!,
      coverUrl: track.coverUrl,
    }));

  return (
    <main className="mx-auto max-w-2xl px-8 pb-24 pt-14">
      <div className="flex items-end justify-between">
        <div>
          <span className="block font-mono text-xs uppercase tracking-wider text-ash">Playlist</span>
          <h1 className="mt-2.5 font-display text-3xl font-bold">{playlist.name}</h1>
        </div>
        {sonsPourLecteur.length > 0 && <BoutonToutEcouter sons={sonsPourLecteur} />}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {playlist.tracks.length === 0 && (
          <p className="text-ash">Aucun son pour l&apos;instant — ajoute-en depuis les pages Sons ou Accueil.</p>
        )}
        {sonsPourLecteur.map((son, i) => (
          <PlaylistTrackRow
            key={son.id}
            track={son}
            index={i}
            toutesLesPistes={sonsPourLecteur}
            playlistId={playlist.id}
            numero={i + 1}
          />
        ))}
      </div>
    </main>
  );
}
/**
 * FICHIER : src/app/(site)/clips/page.tsx
 * RÔLE : Page Clips. Bouton en bas qui renvoie vers la vraie playlist YouTube.
 */
import { recupererClipsPlaylist } from "@/lib/youtube";
import ClipCard from "@/components/ClipCard";

const URL_PLAYLIST_YOUTUBE = `https://www.youtube.com/playlist?list=${process.env.YOUTUBE_PLAYLIST_ID}`;

export default async function ClipsPage() {
  const clips = await recupererClipsPlaylist();

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-8">
      <header className="pt-14">
        <span className="block font-mono text-xs uppercase tracking-wider text-ash">Playlist YouTube</span>
        <h1 className="mt-2.5 font-display text-4xl font-bold">Tous les clips</h1>
        <p className="mt-2 text-paper-dim">Du plus récent au plus ancien, directement depuis notre chaîne YouTube.</p>
      </header>

      {clips.length > 0 ? (
        <>
          <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
            {clips.map((clip) => (<ClipCard key={clip.id} {...clip} />))}
          </div>
          <div className="mt-10 flex justify-center">
            <a href={URL_PLAYLIST_YOUTUBE} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-white/20 px-6 py-2.5 text-sm font-semibold hover:bg-ink-soft">Voir toute la playlist sur YouTube →</a>
          </div>
        </>
      ) : (
        <p className="mt-16 text-center text-ash">Aucun clip trouvé pour le moment.</p>
      )}
    </main>
  );
}
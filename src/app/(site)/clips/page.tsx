/**
 * FICHIER : src/app/(site)/clips/page.tsx
 * RÔLE : Page publique listant les clips vidéo de la chaîne YouTube
 * RapCongolais242 (playlist configurée via YOUTUBE_PLAYLIST_ID dans .env).
 * URL : /clips
 *
 * Différence avec /sons : ici, contenu vidéo hébergé et lu sur YouTube
 * (jamais copié chez nous). /sons, lui, héberge les vrais fichiers audio
 * (Cloudflare R2) que les artistes nous confient directement.
 */
import { recupererClipsPlaylist } from "@/lib/youtube";
import ClipCard from "@/components/ClipCard";

export default async function ClipsPage() {
  const clips = await recupererClipsPlaylist();

  return (
    <main className="mx-auto max-w-6xl px-8 pb-24">
      <header className="pt-14">
        <span className="block font-mono text-xs uppercase tracking-wider text-ash">
          Playlist YouTube
        </span>
        <h1 className="mt-2.5 font-display text-4xl font-bold">
          Tous les clips
        </h1>
        <p className="mt-2 text-paper-dim">
          Du plus récent au plus ancien, directement depuis notre chaîne YouTube.
        </p>
      </header>

      {clips.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
          {clips.map((clip) => (
            <ClipCard key={clip.id} {...clip} />
          ))}
        </div>
      ) : (
        <p className="mt-16 text-center text-ash">
          Aucun clip trouvé pour le moment. Vérifie la configuration de la
          playlist YouTube dans .env.
        </p>
      )}
    </main>
  );
}
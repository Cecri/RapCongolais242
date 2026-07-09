/**
 * FICHIER : src/lib/youtube.ts
 * RÔLE : Récupère les vidéos de la playlist YouTube RapCongolais242 via
 * l'API officielle YouTube Data v3. Utilisée par src/app/(site)/clips/page.tsx.
 *
 * On ne récupère QUE des métadonnées publiques (titre, miniature, date,
 * lien) — jamais l'audio/vidéo elle-même, ce qui reste toujours hébergé
 * et lu directement sur YouTube (voir ClipCard.tsx, qui pointe vers la
 * vraie vidéo YouTube, pas une copie).
 */
export type Clip = {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  videoUrl: string;
};

export async function recupererClipsPlaylist(): Promise<Clip[]> {
  const cle = process.env.YOUTUBE_API_KEY;
  const playlistId = process.env.YOUTUBE_PLAYLIST_ID;

  if (!cle || !playlistId) {
    console.log("[youtube] Clé API ou ID de playlist manquant dans .env");
    return [];
  }

  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${cle}`;

  try {
    const reponse = await fetch(url, { next: { revalidate: 3600 } });

    if (!reponse.ok) {
      const erreur = await reponse.text();
      console.log("[youtube] Erreur API :", reponse.status, erreur);
      return [];
    }

    const data = await reponse.json();

    const clips: Clip[] = data.items
      .filter((item: { snippet?: { title?: string } }) => item.snippet?.title !== "Private video" && item.snippet?.title !== "Deleted video")
      .map((item: {
        snippet: {
          title: string;
          publishedAt: string;
          resourceId: { videoId: string };
          thumbnails: { maxres?: { url: string }; high?: { url: string }; medium?: { url: string } };
        };
      }) => {
        const videoId = item.snippet.resourceId.videoId;
        const miniature =
          item.snippet.thumbnails.maxres?.url ||
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.medium?.url;

        return {
          id: videoId,
          title: item.snippet.title,
          thumbnailUrl: miniature,
          publishedAt: item.snippet.publishedAt,
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        };
      });

    // Plus récent en premier (l'API renvoie parfois dans l'ordre d'ajout à la playlist)
    return clips.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  } catch (erreur) {
    console.log("[youtube] Erreur lors de la récupération :", erreur);
    return [];
  }
}
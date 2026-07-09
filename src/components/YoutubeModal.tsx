/**
 * FICHIER : src/components/YoutubeModal.tsx
 * RÔLE : Fenêtre modale affichant le lecteur YouTube officiel (iframe),
 * utilisée par SonCard.tsx pour les sons qui n'ont qu'un lien externe
 * (pas de fichier audio hébergé chez nous). Toujours le contenu YouTube
 * réel, jamais copié ni retéléchargé.
 */
"use client";

export default function YoutubeModal({
  videoId,
  onClose,
}: {
  videoId: string;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/80 p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="aspect-video w-full max-w-2xl overflow-hidden rounded-xl"
      >
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title="Lecteur YouTube"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
      <button
        onClick={onClose}
        aria-label="Fermer"
        className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-paper hover:bg-white/20"
      >
        ✕
      </button>
    </div>
  );
}
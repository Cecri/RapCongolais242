/**
 * FICHIER : src/components/ClipCard.tsx
 * RÔLE : Carte d'un clip vidéo. Contrairement à SonCard (lecture sur
 * notre site), cliquer ouvre la vidéo directement sur YouTube dans un
 * nouvel onglet — on ne rejoue jamais le contenu vidéo nous-mêmes.
 */
type ClipCardProps = {
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  videoUrl: string;
};

function formaterDate(dateIso: string) {
  return new Date(dateIso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ClipCard({ title, publishedAt, thumbnailUrl, videoUrl }: ClipCardProps) {
  return (
    <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="group block">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-ink-softer">
        <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
          <span className="flex h-11 w-11 items-center justify-center rounded-full text-2xl text-paper opacity-0 transition-opacity group-hover:opacity-100">
            ▶
          </span>
        </div>
      </div>
      <p className="mt-2.5 line-clamp-2 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-ash">{formaterDate(publishedAt)}</p>
    </a>
  );
}
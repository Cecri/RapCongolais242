/**
 * FICHIER : src/components/ClipCard.tsx
 * RÔLE : Carte d'un clip. Icône SVG au lieu du caractère "▶".
 */
import { IconPlaySmall } from "@/components/PlayPauseIcon";

type ClipCardProps = {
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  videoUrl: string;
};

function formaterDate(dateIso: string) {
  return new Date(dateIso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function ClipCard({ title, publishedAt, thumbnailUrl, videoUrl }: ClipCardProps) {
  return (
    <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="group block">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-ink-softer">
        <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors sm:group-hover:bg-black/40">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-paper opacity-100 transition-opacity sm:h-11 sm:w-11 sm:bg-transparent sm:opacity-0 sm:group-hover:opacity-100">
            <IconPlaySmall className="sm:scale-125" />
          </span>
        </div>
      </div>
      <p className="mt-2.5 line-clamp-2 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-ash">{formaterDate(publishedAt)}</p>
    </a>
  );
}
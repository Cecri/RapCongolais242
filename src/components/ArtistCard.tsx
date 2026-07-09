/**
 * FICHIER : src/components/ArtistCard.tsx
 * RÔLE : Carte d'un artiste. Affiche la vraie photo (photoUrl, uploadée
 * via l'admin) si disponible, sinon des initiales calculées à partir du
 * nom. Affiche la note moyenne si l'artiste a déjà été noté au moins
 * une fois (voir table Rating), sinon rien (pas de "0/5" trompeur).
 *
 * Composant sans état interne, utilisable aussi bien dans un Server
 * qu'un Client Component parent — pas besoin de "use client" ici.
 */
import Link from "next/link";

type ArtistCardProps = {
  slug: string;
  name: string;
  country: string;
  genre: string | null;
  photoUrl: string | null;
  note: number | null;
  nbSons: number;
};

function calculerInitiales(nom: string) {
  return nom
    .split(" ")
    .map((mot) => mot[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ArtistCard({ slug, name, country, genre, photoUrl, note, nbSons }: ArtistCardProps) {
  return (
    <Link href={`/artistes/${slug}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-ink-soft transition-colors hover:border-white/20">
      <div className="relative aspect-square overflow-hidden bg-ink-softer">
        {photoUrl ? (
          <img src={photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-3xl text-white/15">
            {calculerInitiales(name)}
          </div>
        )}
        {note !== null && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-copper-dim px-2.5 py-1 font-mono text-[10px] font-semibold text-copper">
            ★ {note.toFixed(1)}
          </span>
        )}
      </div>
      <div className="px-4 py-3.5">
        <p className="text-sm font-semibold">{name}</p>
        <p className="text-xs text-ash">{country} · {genre ?? "—"} · {nbSons} titre{nbSons !== 1 ? "s" : ""}</p>
      </div>
    </Link>
  );
}
/**
 * FICHIER : src/app/admin/artistes/[id]/page.tsx
 * RÔLE : Page centrale de gestion d'un artiste — vue d'ensemble, tous
 * ses sons avec modification/suppression, lien pour en ajouter un
 * nouveau, lien pour modifier le profil de l'artiste, bouton pour le
 * définir comme artiste de la semaine, et suppression complète.
 * URL : /admin/artistes/[id]
 */
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import BoutonSupprimerArtiste from "./BoutonSupprimerArtiste";
import BoutonSupprimerSon from "./BoutonSupprimerSon";

export default async function GestionArtistePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const artiste = await prisma.artist.findUnique({
    where: { id },
    include: { tracks: { orderBy: { publishedAt: "desc" } }, ratings: true },
  });

  if (!artiste) notFound();

  const note = artiste.ratings.length > 0
    ? artiste.ratings.reduce((s, r) => s + r.score, 0) / artiste.ratings.length
    : null;

  return (
    <main className="mx-auto max-w-4xl px-8 pb-24 pt-14">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ink-softer">
            {artiste.photoUrl && <img src={artiste.photoUrl} alt="" className="h-full w-full object-cover" />}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{artiste.stageName}</h1>
            <p className="text-sm text-ash">
              {artiste.country} · {artiste.genre ?? "—"} · {artiste.tracks.length} son{artiste.tracks.length !== 1 ? "s" : ""}
              {note !== null && ` · ★ ${note.toFixed(1)}`}
              {artiste.isFeatured && " · ★ Artiste de la semaine"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/artistes/${id}/modifier`} className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-ink-soft">Modifier</Link>
          <BoutonSupprimerArtiste artistId={id} />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Ses sons</h2>
        <Link href={`/admin/sons/nouveau?artistId=${id}`} className="rounded-lg bg-ember px-4 py-2 text-sm font-semibold">+ Ajouter un son</Link>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {artiste.tracks.length === 0 && <p className="text-sm text-ash">Aucun son pour l&apos;instant.</p>}
        {artiste.tracks.map((track) => (
          <div key={track.id} className="flex items-center gap-4 rounded-xl border border-white/10 bg-ink-soft px-5 py-4">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-ink-softer">
              {track.coverUrl && <img src={track.coverUrl} alt="" className="h-full w-full scale-140 object-cover" />}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{track.title}{track.isExclusive && <span className="ml-2 text-[10px] font-mono uppercase text-copper">Exclusif</span>}</p>
              <p className="text-xs text-ash">{track.audioUrl ? "Fichier hébergé" : "Lien externe uniquement"}</p>
            </div>
            <Link href={`/admin/sons/${track.id}/modifier`} className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-ink-softer">Modifier</Link>
            <BoutonSupprimerSon trackId={track.id} />
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-white/10 bg-ink-soft px-5 py-4">
        <p className="text-sm text-paper-dim">Pour définir cet artiste comme artiste de la semaine (avec photo/son/texte spéciaux), rends-toi sur :</p>
        <Link href="/admin/artiste-semaine" className="mt-2 inline-block text-sm text-copper">/admin/artiste-semaine →</Link>
      </div>
    </main>
  );
}
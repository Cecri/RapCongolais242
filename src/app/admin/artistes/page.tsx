/**
 * FICHIER : src/app/admin/artistes/page.tsx
 * RÔLE : Liste des artistes. Chaque ligne mène maintenant à sa page de
 * gestion complète (/admin/artistes/[id]).
 */
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminArtistesPage() {
  const artistes = await prisma.artist.findMany({
    orderBy: { createdAt: "desc" },
    include: { tracks: true },
  });

  return (
    <main className="mx-auto max-w-6xl px-8 pb-24 pt-14">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Artistes</h1>
        <Link href="/admin/artistes/nouveau" className="rounded-lg bg-ember px-5 py-2.5 text-sm font-semibold">+ Ajouter un artiste</Link>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {artistes.length === 0 && <p className="text-ash">Aucun artiste pour l&apos;instant.</p>}
        {artistes.map((a) => (
          <Link key={a.id} href={`/admin/artistes/${a.id}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-soft px-5 py-4 hover:border-white/20">
            <div>
              <p className="font-semibold">{a.stageName}</p>
              <p className="text-xs text-ash">{a.country} · {a.genre || "—"} · {a.tracks.length} son(s)</p>
            </div>
            {a.isFeatured && <span className="rounded-full bg-copper-dim px-3 py-1 text-xs font-semibold text-copper">★ En avant</span>}
          </Link>
        ))}
      </div>
    </main>
  );
}
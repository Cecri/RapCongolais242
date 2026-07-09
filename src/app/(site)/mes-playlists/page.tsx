/**
 * FICHIER : src/app/(site)/mes-playlists/page.tsx
 * RÔLE : Liste les playlists. Le bandeau "besoinCreation" a été retiré
 * (redondant avec le NB déjà affiché quand la liste est vide) — seul
 * ce NB reste, discret, dans la zone de liste.
 */
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import FormulaireNouvellePlaylist from "./FormulaireNouvellePlaylist";
import BoutonSupprimerPlaylist from "./BoutonSupprimerPlaylist";

export default async function MesPlaylistsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main className="mx-auto max-w-lg px-8 py-24 text-center">
        <p className="text-paper-dim">Connecte-toi pour voir tes playlists.</p>
        <a href="/connexion" className="mt-4 inline-block rounded-lg bg-ember px-5 py-2.5 text-sm font-semibold">Se connecter</a>
      </main>
    );
  }

  const playlists = await prisma.playlist.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { tracks: true },
  });

  return (
    <main className="mx-auto max-w-3xl px-8 pb-24 pt-14">
      <header>
        <span className="block font-mono text-xs uppercase tracking-wider text-ash">Tes créations</span>
        <h1 className="mt-2.5 font-display text-4xl font-bold">Mes playlists</h1>
      </header>

      <FormulaireNouvellePlaylist />

      <div className="mt-8 flex flex-col gap-3">
        {playlists.length === 0 && (
          <p className="text-sm text-ash">
            <strong>NB :</strong> aucune playlist n&apos;existe encore — crée-en une ci-dessus avant de pouvoir y ajouter des sons.
          </p>
        )}
        {playlists.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-soft px-5 py-4 hover:border-white/20">
            <Link href={`/mes-playlists/${p.id}`} className="flex-1">
              <p className="text-sm font-semibold">{p.name}</p>
              <p className="text-xs text-ash">{p.tracks.length} son{p.tracks.length !== 1 ? "s" : ""}</p>
            </Link>
            <BoutonSupprimerPlaylist playlistId={p.id} />
          </div>
        ))}
      </div>
    </main>
  );
}
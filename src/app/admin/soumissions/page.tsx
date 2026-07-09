/**
 * FICHIER : src/app/admin/soumissions/page.tsx
 * RÔLE : Page admin listant toutes les soumissions d'artistes proposées
 * par les auditeurs Premium (table ArtistRecommendation). URL : /admin/soumissions
 */
import { prisma } from "@/lib/prisma";

export default async function AdminSoumissionsPage() {
  const soumissions = await prisma.artistRecommendation.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <main className="mx-auto max-w-4xl px-8 pb-24 pt-14">
      <h1 className="font-display text-3xl font-bold">Artistes proposés</h1>

      <div className="mt-8 flex flex-col gap-3">
        {soumissions.length === 0 && <p className="text-ash">Aucune soumission pour l'instant.</p>}
        {soumissions.map((s) => (
          <div key={s.id} className="rounded-xl border border-white/10 bg-ink-soft px-5 py-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{s.artistName}</p>
              <span className="text-xs text-ash">{s.createdAt.toLocaleDateString("fr-FR")}</span>
            </div>
            {s.links && <p className="mt-1 text-sm text-copper">{s.links}</p>}
            {s.message && <p className="mt-2 text-sm text-paper-dim">{s.message}</p>}
            <p className="mt-2 text-xs text-ash">Proposé par {s.user?.name || s.user?.email || "Utilisateur supprimé"}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
/**
 * FICHIER : src/app/admin/collaborations/page.tsx
 * RÔLE : Liste les demandes de collaboration artiste.
 * URL : /admin/collaborations
 */
import { prisma } from "@/lib/prisma";
import LigneCollaboration from "./LigneCollaboration";

export default async function AdminCollaborationsPage() {
  const demandes = await prisma.collaborationRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-4xl px-8 pb-24 pt-14">
      <h1 className="font-display text-3xl font-bold">Demandes de collaboration</h1>

      <div className="mt-8 flex flex-col gap-3">
        {demandes.length === 0 && <p className="text-ash">Aucune demande pour l&apos;instant.</p>}
        {demandes.map((d) => (<LigneCollaboration key={d.id} demande={d} />))}
      </div>
    </main>
  );
}
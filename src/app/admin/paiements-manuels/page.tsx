/**
 * FICHIER : src/app/admin/paiements-manuels/page.tsx
 * RÔLE : Liste les demandes de paiement manuel (Mobile Money/Wave) en
 * attente, avec preuve et référence, pour validation/rejet.
 * URL : /admin/paiements-manuels
 */
import { prisma } from "@/lib/prisma";
import LigneDemande from "./LigneDemande";

export default async function PaiementsManuelsPage() {
  const demandes = await prisma.manualPaymentRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <main className="mx-auto max-w-4xl px-8 pb-24 pt-14">
      <h1 className="font-display text-3xl font-bold">Paiements manuels en attente</h1>

      <div className="mt-8 flex flex-col gap-4">
        {demandes.length === 0 && <p className="text-ash">Aucune demande en attente.</p>}
        {demandes.map((d) => (
          <LigneDemande
            key={d.id}
            id={d.id}
            nomUtilisateur={d.user.name || d.user.email || "Utilisateur"}
            provider={d.provider}
            plan={d.plan}
            phoneUsed={d.phoneUsed}
            reference={d.reference}
            screenshotUrl={d.screenshotUrl}
            createdAt={d.createdAt.toLocaleString("fr-FR")}
          />
        ))}
      </div>
    </main>
  );
}
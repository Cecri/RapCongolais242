/**
 * FICHIER : src/app/admin/page.tsx
 * RÔLE : Tableau de bord admin — vue d'ensemble chiffrée du site
 * (contenus, audience, argent) et raccourcis vers ce qui nécessite une
 * action (demandes en attente). URL : /admin
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await auth();

  const [
    nbArtistes,
    nbSons,
    nbAlbums,
    totalEcoutes,
    nbPremium,
    nbAuditeurs,
    paiementsEnAttente,
    collaborationsEnAttente,
    soumissionsRecentes,
    messagesRecents,
  ] = await Promise.all([
    prisma.artist.count(),
    prisma.track.count(),
    prisma.album.count(),
    prisma.track.aggregate({ _sum: { playsCount: true } }),
    prisma.premiumSubscription.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.manualPaymentRequest.count({ where: { status: "PENDING" } }),
    prisma.collaborationRequest.count({ where: { status: "PENDING" } }),
    prisma.artistRecommendation.count(),
    prisma.contactMessage.count(),
  ]);

  const totalEcoutesNombre = totalEcoutes._sum.playsCount ?? 0;
  const totalDemandesEnAttente = paiementsEnAttente + collaborationsEnAttente;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-8">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">
        Bienvenue, {session?.user?.name || session?.user?.email}
      </h1>
      <p className="mt-1.5 text-sm text-paper-dim">Vue d&apos;ensemble de RapCongolais242.</p>

      {totalDemandesEnAttente > 0 && (
        <div className="mt-6 rounded-2xl border border-ember/30 bg-ember/10 px-5 py-4">
          <p className="text-sm font-semibold text-ember">
            {totalDemandesEnAttente} demande{totalDemandesEnAttente > 1 ? "s" : ""} en attente de traitement
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            {paiementsEnAttente > 0 && (
              <Link href="/admin/paiements-manuels" className="rounded-lg border border-white/20 px-3 py-1.5 font-semibold hover:bg-ink-softer">
                {paiementsEnAttente} paiement{paiementsEnAttente > 1 ? "s" : ""} →
              </Link>
            )}
            {collaborationsEnAttente > 0 && (
              <Link href="/admin/collaborations" className="rounded-lg border border-white/20 px-3 py-1.5 font-semibold hover:bg-ink-softer">
                {collaborationsEnAttente} collaboration{collaborationsEnAttente > 1 ? "s" : ""} →
              </Link>
            )}
          </div>
        </div>
      )}

      <h2 className="mt-10 font-mono text-xs uppercase tracking-wider text-ash">Contenu</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <CarteStat titre="Artistes" valeur={nbArtistes} lien="/admin/artistes" />
        <CarteStat titre="Sons" valeur={nbSons} lien="/admin/artistes" />
        <CarteStat titre="Albums / EP / Mixtapes" valeur={nbAlbums} />
      </div>

      <h2 className="mt-8 font-mono text-xs uppercase tracking-wider text-ash">Audience</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <CarteStat titre="Écoutes totales" valeur={totalEcoutesNombre} accent />
        <CarteStat titre="Comptes auditeurs" valeur={nbAuditeurs} />
        <CarteStat titre="Abonnés Premium actifs" valeur={nbPremium} accent lien="/abonnez-vous" />
      </div>

      <h2 className="mt-8 font-mono text-xs uppercase tracking-wider text-ash">Retours de la communauté</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <CarteStat titre="Artistes/sons proposés" valeur={soumissionsRecentes} lien="/admin/soumissions" />
        <CarteStat titre="Messages de contact" valeur={messagesRecents} lien="/admin/messages" />
      </div>

      <h2 className="mt-10 font-mono text-xs uppercase tracking-wider text-ash">Actions rapides</h2>
      <div className="mt-3 flex flex-wrap gap-3">
        <Link href="/admin/artistes/nouveau" className="rounded-lg bg-ember px-4 py-2.5 text-sm font-semibold">+ Ajouter un artiste</Link>
        <Link href="/admin/sons/nouveau" className="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold hover:bg-ink-soft">+ Ajouter un son</Link>
        <Link href="/admin/news/nouveau" className="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold hover:bg-ink-soft">+ Nouvelle actualité</Link>
        <Link href="/admin/artiste-semaine" className="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold hover:bg-ink-soft">Artiste de la semaine</Link>
      </div>
    </main>
  );
}

function CarteStat({
  titre,
  valeur,
  lien,
  accent = false,
}: {
  titre: string;
  valeur: number;
  lien?: string;
  accent?: boolean;
}) {
  const contenu = (
    <div className={`rounded-2xl border p-5 transition-colors ${accent ? "border-copper/30 bg-copper-dim" : "border-white/10 bg-ink-soft"} ${lien ? "hover:border-white/30" : ""}`}>
      <p className={`font-display text-2xl font-bold sm:text-3xl ${accent ? "text-copper" : ""}`}>
        {valeur.toLocaleString("fr-FR")}
      </p>
      <p className="mt-1 text-xs text-ash sm:text-sm">{titre}</p>
    </div>
  );

  if (lien) {
    return <Link href={lien}>{contenu}</Link>;
  }
  return contenu;
}
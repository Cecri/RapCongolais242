/**
 * FICHIER : src/app/(site)/abonnez-vous/page.tsx
 * RÔLE : Page publique expliquant la mission Premium et les 3 paliers
 * tarifaires. URL : /abonnez-vous
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BoutonAbonnement from "./BoutonAbonnement";

export default async function AbonnezVousPage() {
  const session = await auth();

  let estDejaPremium = false;
  if (session?.user?.id) {
    const abonnement = await prisma.premiumSubscription.findUnique({ where: { userId: session.user.id } });
    estDejaPremium = abonnement?.status === "ACTIVE";
  }

  return (
    <main className="mx-auto max-w-3xl px-8 pb-24 pt-14">
      <span className="block font-mono text-xs uppercase tracking-wider text-ash">Rejoindre le mouvement</span>
      <h1 className="mt-2.5 font-display text-4xl font-bold">Abonne-toi, fais avancer la culture.</h1>
      <p className="mt-4 max-w-xl text-paper-dim">
        RapCongolais242 est un tremplin, pas une simple plateforme d&apos;écoute. Ton abonnement finance directement les artistes qu&apos;on met en avant : reversement des revenus, organisation de jeux-concours, financement de festivals, et prise en charge de frais de studio pour ceux qui n&apos;ont pas les moyens d&apos;enregistrer leur musique.
      </p>

      <div className="mt-10">
        <BoutonAbonnement estConnecte={!!session?.user} estDejaPremium={estDejaPremium} />
      </div>

      {!estDejaPremium && (
        <p className="mt-4 text-xs text-ash">Sans engagement — annulable à tout moment depuis cette page.</p>
      )}

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-ink-soft p-6">
          <div className="text-2xl">🎧</div>
          <h3 className="mt-3 font-semibold">Sons exclusifs</h3>
          <p className="mt-1.5 text-sm text-paper-dim">Accède aux morceaux disponibles nulle part ailleurs, uploadés directement par nos soins.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-ink-soft p-6">
          <div className="text-2xl">⬇</div>
          <h3 className="mt-3 font-semibold">Écoute hors-ligne</h3>
          <p className="mt-1.5 text-sm text-paper-dim">Bientôt disponible avec notre future application mobile.</p>
        </div>

        <Link href="/soumettre-artiste" className="rounded-2xl border border-white/10 bg-ink-soft p-6 transition-colors hover:border-white/20">
          <div className="text-2xl">🌍</div>
          <h3 className="mt-3 font-semibold">Fais découvrir un talent</h3>
          <p className="mt-1.5 text-sm text-paper-dim">Soumets un artiste underground que tu aimes et aide-le à rejoindre la plateforme.</p>
        </Link>
      </div>

      <p className="mt-14 text-center text-xs text-ash">Paiement sécurisé — Mobile Money, carte bancaire et Wave bientôt disponibles.</p>
    </main>
  );
}
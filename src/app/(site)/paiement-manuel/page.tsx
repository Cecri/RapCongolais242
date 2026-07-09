/**
 * FICHIER : src/app/(site)/paiement-manuel/page.tsx
 * RÔLE : Page publique de paiement Mobile Money/Wave. Lit la config des
 * numéros (MOYENS_PAIEMENT_MANUEL) côté serveur, et la transmet en
 * props au formulaire client — les numéros ne passent jamais par une
 * variable d'environnement publique.
 */
import { auth } from "@/lib/auth";
import { MOYENS_PAIEMENT_MANUEL, PRIX_XOF_PAR_PLAN } from "@/lib/manualPaymentConfig";
import FormulairePaiementManuel from "./FormulairePaiementManuel";

export default async function PaiementManuelPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  const session = await auth();

  const planValide = ["MONTHLY", "SEMESTRIAL", "YEARLY"].includes(plan || "")
    ? (plan as "MONTHLY" | "SEMESTRIAL" | "YEARLY")
    : "MONTHLY";

  if (!session?.user) {
    return (
      <main className="mx-auto max-w-lg px-8 py-24 text-center">
        <p className="text-paper-dim">Connecte-toi d&apos;abord pour effectuer ce paiement.</p>
        <a href="/connexion" className="mt-4 inline-block rounded-lg bg-ember px-5 py-2.5 text-sm font-semibold">Se connecter</a>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-8 pb-24 pt-14">
      <span className="block font-mono text-xs uppercase tracking-wider text-ash">Paiement</span>
      <h1 className="mt-2.5 font-display text-3xl font-bold">Mobile Money / Wave</h1>
      <p className="mt-3 text-paper-dim">Envoie le paiement depuis ton téléphone, puis déclare-le ci-dessous. On valide généralement sous 24h.</p>

      <FormulairePaiementManuel
        planInitial={planValide}
        moyens={MOYENS_PAIEMENT_MANUEL}
        prix={PRIX_XOF_PAR_PLAN}
      />
    </main>
  );
}
/**
 * FICHIER : src/app/(site)/soumettre-artiste/page.tsx
 * RÔLE : Page où un auditeur Premium propose un artiste OU un titre
 * méconnu à ajouter/enrichir sur la plateforme. URL : /soumettre-artiste
 */
import { auth } from "@/lib/auth";
import { estUtilisateurPremium } from "@/lib/premium";
import Link from "next/link";
import FormulaireSoumission from "./FormulaireSoumission";

export default async function SoumettreArtistePage() {
  const session = await auth();
  const estPremium = session?.user?.id ? await estUtilisateurPremium(session.user.id) : false;

  return (
    <main className="mx-auto max-w-xl px-8 pb-24 pt-14">
      <span className="block font-mono text-xs uppercase tracking-wider text-ash">Fais découvrir un talent</span>
      <h1 className="mt-2.5 font-display text-3xl font-bold">Soumettre un artiste ou un titre méconnu</h1>
      <p className="mt-3 text-paper-dim">Un artiste underground ou juste un son que tu adores et que personne ne connaît ? Propose-le nous — si l&apos;artiste existe déjà chez nous, ça enrichira simplement son catalogue.</p>

      {estPremium ? (
        <FormulaireSoumission />
      ) : (
        <div className="mt-8 rounded-2xl border border-copper/30 bg-copper-dim px-6 py-8 text-center">
          <p className="font-semibold text-copper">Fonctionnalité réservée aux abonnés Premium</p>
          <p className="mt-2 text-sm text-paper-dim">Abonne-toi pour proposer des artistes et soutenir la culture congolaise.</p>
          <Link href="/abonnez-vous" className="mt-4 inline-block rounded-lg bg-ember px-5 py-2.5 text-sm font-semibold">Devenir Premium</Link>
        </div>
      )}
    </main>
  );
}
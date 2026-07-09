/**
 * FICHIER : src/app/(site)/contact/page.tsx
 * RÔLE : Page publique de contact. URL : /contact
 * Pré-remplit le nom/email si l'utilisateur est connecté.
 */
import { auth } from "@/lib/auth";
import FormulaireContact from "./FormulaireContact";

export default async function ContactPage() {
  const session = await auth();

  return (
    <main className="mx-auto max-w-lg px-8 pb-24 pt-14">
      <span className="block font-mono text-xs uppercase tracking-wider text-ash">Une question ?</span>
      <h1 className="mt-2.5 font-display text-3xl font-bold">Nous contacter</h1>
      <p className="mt-3 text-paper-dim">Une question sur un abonnement, une suggestion, un problème technique ? Écris-nous.</p>

      <FormulaireContact
        nomInitial={session?.user?.name || ""}
        emailInitial={session?.user?.email || ""}
      />
    </main>
  );
}
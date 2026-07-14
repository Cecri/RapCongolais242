/**
 * FICHIER : src/components/Footer.tsx
 * RÔLE : Pied de page. Vrais liens Instagram/TikTok mis à jour.
 */
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Footer() {
  const session = await auth();

  let estPremium = false;
  if (session?.user?.id) {
    const abonnement = await prisma.premiumSubscription.findUnique({ where: { userId: session.user.id } });
    estPremium = abonnement?.status === "ACTIVE";
  }

  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-8 py-14">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-copper/30 bg-copper-dim px-8 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-display text-lg font-bold">Suis RapCongolais242 partout</p>
            <p className="mt-1 text-sm text-paper-dim">Nouveaux sons, artiste de la semaine, coulisses.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="https://www.instagram.com/rap_congolais_242?igsh=MWo1aWVjaTA1M2JibA==" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold hover:bg-ink-soft">Instagram</a>
            <a href="https://youtube.com/@rapcongolais242" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold hover:bg-ink-soft">YouTube</a>
            <a href="https://www.tiktok.com/@rap.congolais.242?_r=1&_t=ZN-981QrpcDnpW" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold hover:bg-ink-soft">TikTok</a>
            <Link href="/abonnez-vous" className="rounded-lg bg-ember px-4 py-2.5 text-sm font-semibold text-paper hover:bg-ember/90">
              {estPremium ? "Mon abonnement" : "Devenir Premium"}
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 text-sm text-ash sm:flex-row sm:justify-between">
          <p>© 2026 RapCongolais242 — Le tremplin du rap congolais et de sa diaspora.</p>
          <div className="flex gap-6">
            <Link href="/artistes" className="hover:text-paper">Artistes</Link>
            <Link href="/sons" className="hover:text-paper">Sons</Link>
            <Link href="/clips" className="hover:text-paper">Clips</Link>
            <Link href="/contact" className="hover:text-paper">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
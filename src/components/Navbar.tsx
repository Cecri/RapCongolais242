/**
 * FICHIER : src/components/Navbar.tsx
 * RÔLE : Barre de navigation. Logo et texte réduits davantage sur
 * mobile (moins encombrant). Transmet estPremium au menu burger pour
 * qu'il masque "Abonnez-vous" si déjà Premium.
 */
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NavbarUserMenu from "./NavbarUserMenu";
import NavbarMobileMenu from "./NavbarMobileMenu";

export default async function Navbar() {
  const session = await auth();

  let estPremium = false;
  if (session?.user?.id) {
    const abonnement = await prisma.premiumSubscription.findUnique({ where: { userId: session.user.id } });
    estPremium = abonnement?.status === "ACTIVE";
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-ink/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-3 sm:h-19 sm:px-8">
        <div className="flex items-center gap-0.5 sm:gap-1">
          <NavbarMobileMenu estPremium={estPremium} />
          <Link href="/" className="flex items-center gap-1.5 font-display text-sm font-bold sm:gap-3.5 sm:text-lg">
            <img src="/logo.png" alt="" className="-ml-0.5 h-6 w-auto object-contain sm:-ml-3 sm:h-11" />
            <span className="whitespace-nowrap">RapCongolais<span className="text-copper">242</span></span>
          </Link>
        </div>

        <div className="hidden gap-9 text-sm text-paper-dim md:flex">
          <Link href="/" className="hover:text-paper">Accueil</Link>
          <Link href="/artistes" className="hover:text-paper">Artistes</Link>
          <Link href="/sons" className="hover:text-paper">Sons</Link>
          <Link href="/clips" className="hover:text-paper">Clips</Link>
          <Link href="/collaboration" className="hover:text-paper">Collaboration</Link>
        </div>

        <NavbarUserMenu estConnecte={!!session?.user} nom={session?.user?.name || session?.user?.email || ""} estPremium={estPremium} />
      </div>
    </nav>
  );
}
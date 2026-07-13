/**
 * FICHIER : src/components/Navbar.tsx
 * RÔLE : Barre de navigation. Les tailles (logo, texte, espacements)
 * basculent maintenant à md: (768px) au lieu de sm: (640px) — aligné
 * avec le seuil où le menu desktop complet apparaît, pour éviter tout
 * chevauchement en mode paysage mobile (largeur ~650-750px, zone
 * auparavant "coincée" entre les deux anciens seuils).
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
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-3 md:h-19 md:px-8">
        <div className="flex min-w-0 items-center gap-0.5 md:gap-1">
          <NavbarMobileMenu estPremium={estPremium} />
          <Link href="/" className="flex min-w-0 items-center gap-1.5 font-display text-sm font-bold md:gap-3.5 md:text-lg">
            <img src="/logo.png" alt="" className="-ml-0.5 h-6 w-auto shrink-0 object-contain md:-ml-3 md:h-11" />
            <span className="truncate whitespace-nowrap">RapCongolais<span className="text-copper">242</span></span>
          </Link>
        </div>

        <div className="hidden gap-9 text-sm text-paper-dim md:flex">
          <Link href="/" className="hover:text-paper">Accueil</Link>
          <Link href="/artistes" className="hover:text-paper">Artistes</Link>
          <Link href="/sons" className="hover:text-paper">Sons</Link>
          <Link href="/clips" className="hover:text-paper">Clips</Link>
        </div>

        <NavbarUserMenu estConnecte={!!session?.user} nom={session?.user?.name || session?.user?.email || ""} estPremium={estPremium} />
      </div>
    </nav>
  );
}
/**
 * FICHIER : src/components/Navbar.tsx
 * RÔLE : Barre de navigation principale. Logo agrandi (h-11 au lieu de
 * h-9), décalé davantage vers la gauche (-ml-3), avec plus d'espace
 * avant le texte "RapCongolais242" (gap-3.5 au lieu de gap-2).
 */
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NavbarUserMenu from "./NavbarUserMenu";

export default async function Navbar() {
  const session = await auth();

  let estPremium = false;
  if (session?.user?.id) {
    const abonnement = await prisma.premiumSubscription.findUnique({ where: { userId: session.user.id } });
    estPremium = abonnement?.status === "ACTIVE";
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-ink/90 backdrop-blur-sm">
      <div className="mx-auto flex h-19 max-w-6xl items-center justify-between px-8">
        <Link href="/" className="flex items-center gap-3.5 font-display text-lg font-bold">
          <img src="/logo.png" alt="RapCongolais242" className="-ml-3 h-11 w-auto object-contain" />
          RapCongolais<span className="text-copper">242</span>
        </Link>

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
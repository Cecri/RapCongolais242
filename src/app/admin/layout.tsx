import { auth } from "@/lib/auth";
import Link from "next/link";
import DeconnexionBouton from "@/components/DeconnexionBouton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div>
      {session && (
        <div className="border-b border-white/10 bg-ink-soft">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
            <nav className="flex gap-6 text-sm">
              <Link href="/admin" className="font-semibold text-copper">
                Tableau de bord
              </Link>
              <Link href="/admin/artistes" className="text-paper-dim hover:text-paper">
                Artistes
              </Link><Link href="/admin/artiste-semaine" className="text-paper-dim hover:text-paper">Artiste de la semaine</Link>
              <Link href="/admin/sons/nouveau" className="text-paper-dim hover:text-paper">
                + Ajouter un son
              </Link><Link href="/admin/soumissions" className="text-paper-dim hover:text-paper">Soumissions</Link><Link href="/admin/paiements-manuels" className="text-paper-dim hover:text-paper">Paiements manuels</Link><Link href="/admin/messages" className="text-paper-dim hover:text-paper">Messages</Link><Link href="/admin/news" className="text-paper-dim hover:text-paper">News</Link><Link href="/admin/collaborations" className="text-paper-dim hover:text-paper">Collaborations</Link>
            </nav>
            <div className="flex items-center gap-4">
              <span className="text-sm text-ash">
                {session.user?.name || session.user?.email}
              </span>
              <DeconnexionBouton />
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
/**
 * FICHIER : src/app/(site)/layout.tsx
 * RÔLE : Layout du site PUBLIC uniquement (pas l'admin). Le dossier
 * (site) est un "groupe de routes" Next.js — les parenthèses signifient
 * qu'il n'apparaît jamais dans l'URL (ex: (site)/sons/page.tsx correspond
 * bien à l'URL /sons, pas /site/sons).
 *
 * Contient la Navbar publique, le Footer, et le PlayerBar — posés ici
 * et non plus dans le layout racine, pour qu'ils n'apparaissent JAMAIS
 * sur les pages /admin (qui a son propre layout séparé et sa propre
 * barre avec nom/déconnexion : src/app/admin/layout.tsx).
 */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PlayerBar from "@/components/PlayerBar";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <PlayerBar />
    </>
  );
}
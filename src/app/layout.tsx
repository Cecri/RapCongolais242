/**
 * FICHIER : src/app/layout.tsx
 * RÔLE : Layout RACINE, appliqué à absolument toutes les pages du site
 * (public ET admin). Contient uniquement ce qui doit être strictement
 * partout : la structure HTML, les polices, et les Providers globaux
 * (session NextAuth + lecteur audio).
 *
 * Ne contient PLUS Navbar/Footer/PlayerBar (déplacés dans
 * src/app/(site)/layout.tsx) pour éviter qu'ils s'affichent aussi
 * sur les pages /admin, qui a son propre layout indépendant.
 */
import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "RapCongolais242",
  description: "Le tremplin du rap congolais et de sa diaspora",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=Work+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased pb-21">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
/**
 * FICHIER : src/app/layout.tsx
 * RÔLE : Layout RACINE. Ajout explicite de la config "viewport" —
 * certains téléphones Android (dont OnePlus) ont des réglages d'affichage
 * qui peuvent fausser la largeur d'écran perçue sans cette déclaration
 * explicite, causant des mises en page "bureau" affichées à tort sur
 * un téléphone.
 */
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "RapCongolais242",
  description: "Le tremplin du rap congolais et de sa diaspora",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="overflow-x-hidden">
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
      <body className="w-full overflow-x-hidden font-body antialiased pb-21">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
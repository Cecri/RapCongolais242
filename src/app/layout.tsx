/**
 * FICHIER : src/app/layout.tsx
 * RÔLE : Layout RACINE. overflow-x-hidden appliqué à la fois sur <html>
 * ET <body> — un seul des deux suffit rarement à bloquer un débordement
 * causé par un élément en position:fixed (comme le lecteur), qui se
 * positionne par rapport au viewport et peut l'ignorer si seul le body
 * est contraint.
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
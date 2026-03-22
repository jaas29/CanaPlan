import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CanaPlan - Gestion de Fertilizacion",
  description: "Plataforma de gestion de nutricion y fertilizacion de cana de azucar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body className="min-h-full bg-[var(--color-surface)]">
        {children}
      </body>
    </html>
  );
}

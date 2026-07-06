import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Senado Press",
  description: "Red social de periodistas del Modelo de Senado BIMUN 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
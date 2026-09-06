import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Mesa – Digitalize seu restaurante",
  description:
    "Mesa é a plataforma SaaS que digitaliza restaurantes: cardápios digitais com IA, pedidos via QR, reservas, delivery e analytics avançado.",
  keywords: [
    "Mesa",
    "cardápio digital",
    "QR restaurante",
    "autosserviço",
    "reservas",
    "delivery",
    "analytics restaurante",
  ],
  authors: [{ name: "Mesa" }],
  openGraph: {
    title: "Mesa – Digitalize seu restaurante",
    description:
      "Cardápios digitais com IA, pedidos via QR, reservas e mais. O futuro da gastronomia.",
    siteName: "Mesa",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground min-h-screen">
        {children}
        <Toaster />
        <SonnerToaster position="top-right" />
      </body>
    </html>
  );
}

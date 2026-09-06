import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Brito — Peça comida dos melhores restaurantes",
  description:
    "Brito é o marketplace de delivery onde qualquer restaurante cria sua loja e você pede em segundos. Cardápios completos, pagamento via Pix, cartão ou na entrega.",
  keywords: [
    "Brito",
    "delivery",
    "restaurantes",
    "pedir comida",
    "pizza",
    "hambúrguer",
    "japonês",
    "marketplace gastronômico",
  ],
  authors: [{ name: "Brito" }],
  openGraph: {
    title: "Brito — Peça comida dos melhores restaurantes",
    description: "Cardápios completos, Pix, cartão ou na entrega. Peça já.",
    siteName: "Brito",
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

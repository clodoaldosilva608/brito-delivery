import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Cluvi – Digitaliza tu restaurante",
  description:
    "Cluvi es la plataforma SaaS que digitaliza restaurantes: menús digitales con IA, pedidos por QR, reservas, domicilios y analítica avanzada.",
  keywords: [
    "Cluvi",
    "menú digital",
    "QR restaurante",
    "autoservicio",
    "reservas",
    "domicilios",
    "analítica restaurante",
  ],
  authors: [{ name: "Cluvi" }],
  openGraph: {
    title: "Cluvi – Digitaliza tu restaurante",
    description:
      "Menús digitales con IA, pedidos por QR, reservas y más. El futuro de la gastronomía.",
    siteName: "Cluvi",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground min-h-screen">
        {children}
        <Toaster />
        <SonnerToaster position="top-right" />
      </body>
    </html>
  );
}

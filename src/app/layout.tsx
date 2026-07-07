import { site } from "@/lib/config";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Reservas y facturación para belleza y bienestar`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "reservas online",
    "software peluquería",
    "gestión citas estética",
    "VeriFactu 2027",
    "facturación autónomos",
    "no-show depósito",
    "agenda profesional belleza",
  ],
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: site.url,
    title: `${site.name} — Tu agenda y tus facturas, listas para 2027`,
    description: site.description,
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen bg-white font-sans">{children}</body>
    </html>
  );
}

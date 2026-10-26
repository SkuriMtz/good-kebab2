import type { Metadata, Viewport } from "next";
import { inter } from "@/lib/fonts";
import { ViewTransitions } from "next-view-transitions";
import { ThemeScript } from "@/components/theme/theme-script";
import { PageTransitions } from "@/components/motion/page-transitions";
import { SITE_URL } from "@/lib/env";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Atendel — Que ningún cliente se quede sin respuesta",
    template: "%s · Atendel",
  },
  description:
    "Agentes de IA para negocios que atienden personas: contestan tu WhatsApp, agendan citas, ordenan tu correo y traen de regreso a tus clientes. Lo importante nunca sale sin tu visto bueno.",
  openGraph: {
    title: "Atendel",
    description: "Que ningún cliente se quede sin respuesta.",
    locale: "es_MX",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransitions>
      <html
        lang="es-MX"
        data-theme="dark"
        className={inter.variable}
        suppressHydrationWarning
      >
        <head>
          <ThemeScript />
        </head>
        <body>
          <PageTransitions />
          {children}
        </body>
      </html>
    </ViewTransitions>
  );
}

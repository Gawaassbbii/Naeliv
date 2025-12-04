import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConditionalNavigation } from "./components/ConditionalNavigation";
import { Providers } from "./components/Providers";
import { Toaster } from "./components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Naeliv (BETA) — L'Email, en toute clarté.",
  description: "L'antithèse de Gmail. Une boîte mail qui ne vous dérange pas, qui se nettoie toute seule et qui vous apprend des choses. Zen Mode, Smart Paywall, Immersion Linguistique. Version BETA - En développement actif.",
  keywords: ["email", "boîte mail", "privacy", "productivity", "apprentissage", "anglais", "allemand", "beta"],
  authors: [{ name: "Naeliv Inc." }],
  openGraph: {
    title: "Naeliv (BETA) — L'Email, en toute clarté.",
    description: "L'antithèse de Gmail. Zen Mode, Smart Paywall, Immersion Linguistique. Version BETA.",
    type: "website",
    locale: "fr_BE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ConditionalNavigation />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

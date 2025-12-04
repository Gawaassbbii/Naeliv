"use client";

import { ThemeProvider } from "@/app/contexts/ThemeContext";

export default function MailLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      {children}
      {/* Pas de Navigation ni Footer sur cette page */}
    </ThemeProvider>
  );
}


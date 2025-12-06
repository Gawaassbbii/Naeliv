import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boîte mail NAELIV",
  description: "Votre boîte mail NAELIV",
};

export default function MailLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      {/* Pas de Navigation ni Footer sur cette page */}
    </>
  );
}


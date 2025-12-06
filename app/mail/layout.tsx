import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boîte mail — KLAR",
  description: "Votre boîte mail KLAR",
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


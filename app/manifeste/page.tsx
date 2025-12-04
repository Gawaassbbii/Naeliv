import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, EyeOff, FileCode, CheckCircle2 } from 'lucide-react';

export default function Securite() {
  return (
    <main className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black">
      
      {/* GRILLE DE FOND FIXE (Pour l'effet architectural) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute left-10 top-0 bottom-0 w-px bg-white/20"></div>
        <div className="absolute right-10 top-0 bottom-0 w-px bg-white/20"></div>
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10"></div>
      </div>

      {/* NAV FLOTTANTE */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-10 py-6 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 group">
          <ArrowLeft size={16} className="text-white group-hover:-translate-x-1 transition-transform"/>
          <span className="text-xs font-bold uppercase tracking-[0.2em] group-hover:underline decoration-1 underline-offset-4">Retour</span>
        </Link>
        <div className="text-xs font-bold tracking-[0.2em] animate-pulse text-green-500">
            STATUS: SECURE
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative z-10 pt-40 pb-20 px-10 border-b border-white/20">
        <div className="max-w-6xl mx-auto">
            <span className="block text-xs text-gray-500 mb-4 tracking-[0.2em]">PROTOCOLE DE DÉFENSE v1.0</span>
            <h1 className="text-6xl md:text-9xl font-bold tracking-tighter uppercase leading-none mb-8">
                Archi<br/>
                tecture<span className="text-gray-700">.</span>
            </h1>
            <p className="max-w-xl text-lg text-gray-400 font-sans leading-relaxed border-l-2 border-white pl-6">
                Nous avons construit Naeliv comme un bunker numérique. 
                Pas de marketing, juste des mathématiques. 
                Voici comment nous protégeons vos données.
            </p>
        </div>
      </header>

      {/* SECTION DES 4 PILIERS (Style "Tableau Technique", pas de cartes) */}
      <section className="relative z-10">
        
        {/* LIGNE 1 : CHIFFREMENT */}
        <div className="group grid grid-cols-1 md:grid-cols-12 border-b border-white/20 hover:bg-white hover:text-black transition-colors duration-300">
            <div className="md:col-span-3 p-10 border-r border-white/20 flex items-center justify-center">
                <Lock strokeWidth={1} size={60} className="group-hover:scale-110 transition-transform"/>
            </div>
            <div className="md:col-span-9 p-10 flex flex-col justify-center">
                <span className="text-xs font-bold tracking-[0.2em] opacity-50 mb-2">01 — ENCRYPTION</span>
                <h3 className="text-4xl font-bold uppercase mb-4 tracking-tight">Zero Knowledge</h3>
                <p className="font-sans text-lg opacity-80 max-w-2xl">
                    Le chiffrement se fait sur votre appareil. Nous stockons des données chiffrées dont nous ne possédons pas la clé. Mathématiquement impossible à lire pour nous.
                </p>
            </div>
        </div>

        {/* LIGNE 2 : SUISSE */}
        <div className="group grid grid-cols-1 md:grid-cols-12 border-b border-white/20 hover:bg-white hover:text-black transition-colors duration-300">
            <div className="md:col-span-3 p-10 border-r border-white/20 flex items-center justify-center">
                <Shield strokeWidth={1} size={60} className="group-hover:scale-110 transition-transform"/>
            </div>
            <div className="md:col-span-9 p-10 flex flex-col justify-center">
                <span className="text-xs font-bold tracking-[0.2em] opacity-50 mb-2">02 — JURIDICTION</span>
                <h3 className="text-4xl font-bold uppercase mb-4 tracking-tight">Bunker Suisse 🇨🇭</h3>
                <p className="font-sans text-lg opacity-80 max-w-2xl">
                    Données hébergées physiquement à Genève. Protégées par les lois suisses sur la confidentialité, les plus strictes au monde (LPD). Hors de portée des USA.
                </p>
            </div>
        </div>

        {/* LIGNE 3 : NO LOGS */}
        <div className="group grid grid-cols-1 md:grid-cols-12 border-b border-white/20 hover:bg-white hover:text-black transition-colors duration-300">
            <div className="md:col-span-3 p-10 border-r border-white/20 flex items-center justify-center">
                <EyeOff strokeWidth={1} size={60} className="group-hover:scale-110 transition-transform"/>
            </div>
            <div className="md:col-span-9 p-10 flex flex-col justify-center">
                <span className="text-xs font-bold tracking-[0.2em] opacity-50 mb-2">03 — METADATA</span>
                <h3 className="text-4xl font-bold uppercase mb-4 tracking-tight">Politique No-Logs</h3>
                <p className="font-sans text-lg opacity-80 max-w-2xl">
                    Nous ne savons pas qui vous êtes. Nous ne stockons pas votre IP. Nous ne savons pas à qui vous écrivez. Votre activité n'existe pas sur nos disques.
                </p>
            </div>
        </div>

        {/* LIGNE 4 : OPEN SOURCE */}
        <div className="group grid grid-cols-1 md:grid-cols-12 border-b border-white/20 hover:bg-white hover:text-black transition-colors duration-300">
            <div className="md:col-span-3 p-10 border-r border-white/20 flex items-center justify-center">
                <FileCode strokeWidth={1} size={60} className="group-hover:scale-110 transition-transform"/>
            </div>
            <div className="md:col-span-9 p-10 flex flex-col justify-center">
                <span className="text-xs font-bold tracking-[0.2em] opacity-50 mb-2">04 — TRANSPARENCE</span>
                <h3 className="text-4xl font-bold uppercase mb-4 tracking-tight">Code Auditable</h3>
                <p className="font-sans text-lg opacity-80 max-w-2xl">
                    La confiance ne se demande pas, elle se vérifie. Notre code de cryptographie est Open Source. Vérifiez-le vous-même sur GitHub.
                </p>
            </div>
        </div>

      </section>

      {/* FOOTER TECHNIQUE */}
      <footer className="px-10 py-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-xs font-mono text-gray-600">
        <div>
            <h4 className="text-white mb-4 uppercase tracking-widest">Encryption</h4>
            <ul className="space-y-2">
                <li>AES-256</li>
                <li>RSA-4096</li>
                <li>TLS 1.3</li>
            </ul>
        </div>
        <div>
            <h4 className="text-white mb-4 uppercase tracking-widest">Compliance</h4>
            <ul className="space-y-2">
                <li>GDPR Compliant</li>
                <li>Swiss FADP</li>
                <li>ISO 27001</li>
            </ul>
        </div>
        <div>
            <h4 className="text-white mb-4 uppercase tracking-widest">Audit</h4>
            <ul className="space-y-2">
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500"/> Q3 2024 Passed</li>
                <li>Securitum Audit</li>
            </ul>
        </div>
        <div className="text-right">
            NAELIV SECURITY DIVISION<br/>
            GENEVA, CH.
        </div>
      </footer>

    </main>
  );
}
'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Lock, Server, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Securite() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-[#1a1a1a] font-sans selection:bg-black selection:text-white overflow-x-hidden">
      
      {/* BACKGROUND : Animé avec blob */}
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-blue-100 rounded-full blur-[120px] mix-blend-multiply animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] bg-gray-200 rounded-full blur-[120px] mix-blend-multiply animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] bg-purple-100 rounded-full blur-[100px] mix-blend-multiply animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      {/* NAVIGATION */}
      <nav className="relative z-50 flex justify-between items-center px-6 py-6 max-w-6xl mx-auto animate-fade-in-up">
        <div className="flex items-center">
          <Link href="/">
            <div className="animate-float">
              <h1 className="text-[48px] leading-none tracking-tighter text-black font-medium">Naeliv</h1>
            </div>
          </Link>
        </div>
        <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600 items-center">
          <Link href="/manifeste" className="hover:text-black transition">Manifeste</Link>
          <Link href="/pourquoi-ch" className="hover:text-black transition flex items-center gap-1">
            Pourquoi .ch ? <span>🇨🇭</span>
          </Link>
          <Link href="/tarifs" className="hover:text-black transition">Tarifs</Link>
          <Link href="/securite" className="bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 transition flex items-center gap-2 font-medium text-sm border border-gray-800">
            <ShieldCheck size={16} />
            Securite
          </Link>
          <button className="bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 transition">
            Accès Anticipé
          </button>
        </div>
        <button className="md:hidden"><Menu /></button>
      </nav>

      {/* HEADER avec effet */}
      <div className="relative z-10 pt-24 pb-32 px-6 max-w-6xl mx-auto">
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">
            Vos données.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500">
              Dans un coffre-fort.
            </span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            Nous ne vendons pas vos données, car nous ne pouvons même pas les lire.
            Naeliv est construit sur une architecture Zero-Knowledge.
          </p>
        </div>
      </div>

      {/* CONTENU PRINCIPAL avec effets visuels */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-32">
        
        {/* Section 1: Chiffrement - Carte flottante avec effet */}
        <section className="relative mb-32 md:mb-40 animate-fade-in-up group" style={{ animationDelay: '0.3s' }}>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-10 md:p-12 border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
            {/* Effet de gradient animé en arrière-plan */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-start gap-6 mb-6">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 p-4 rounded-2xl">
                      <Lock className="w-10 h-10 md:w-12 md:h-12 text-black" />
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="inline-block mb-3 px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full">
                    01
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                    Chiffrement de bout en bout
                  </h2>
                </div>
              </div>
              <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                <p>
                  Vos emails sont chiffrés sur votre appareil avant même d'être envoyés. 
                  Même si nous le voulions, nous ne pourrions pas lire vos messages.
                </p>
                <p className="text-base text-gray-500 italic font-medium">
                  Vous seul possédez la clé.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Serveurs Suisse - Carte avec effet différent */}
        <section className="relative mb-32 md:mb-40 animate-fade-in-up group" style={{ animationDelay: '0.4s' }}>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-10 md:p-12 border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
            {/* Effet de gradient animé */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-start gap-6 mb-6">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-400 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-green-100 to-blue-100 p-4 rounded-2xl">
                      <Server className="w-10 h-10 md:w-12 md:h-12 text-black" />
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="inline-block mb-3 px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full">
                    02
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                    Serveurs en Suisse 🇨🇭
                  </h2>
                </div>
              </div>
              <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                <p>
                  Toutes nos infrastructures sont situées physiquement à Genève, protégées par les lois de confidentialité les plus strictes au monde.
                </p>
                <p className="text-base text-gray-500 font-medium">
                  Hors de portée des juridictions US/EU.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: No-Logs - Carte avec effet */}
        <section className="relative mb-32 md:mb-40 animate-fade-in-up group" style={{ animationDelay: '0.5s' }}>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-10 md:p-12 border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
            {/* Effet de gradient animé */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-start gap-6 mb-6">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-2xl">
                      <EyeOff className="w-10 h-10 md:w-12 md:h-12 text-black" />
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="inline-block mb-3 px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full">
                    03
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                    Politique No-Logs
                  </h2>
                </div>
              </div>
              <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                <p>
                  Nous ne gardons aucune trace de votre adresse IP, de vos métadonnées ou de vos habitudes de navigation.
                </p>
                <p className="text-base text-gray-500 italic font-medium">
                  Votre activité n'existe que pour vous.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Open Source - Carte avec effet */}
        <section className="relative mb-32 md:mb-40 animate-fade-in-up group" style={{ animationDelay: '0.6s' }}>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-10 md:p-12 border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
            {/* Effet de gradient animé */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-transparent to-yellow-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-start gap-6 mb-6">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-yellow-400 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-amber-100 to-yellow-100 p-4 rounded-2xl">
                      <ShieldCheck className="w-10 h-10 md:w-12 md:h-12 text-black" />
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="inline-block mb-3 px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full">
                    04
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                    Open Source
                  </h2>
                </div>
              </div>
              <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                <p>
                  La confiance, ça ne se demande pas, ça se prouve. Notre code de chiffrement est public et audité par la communauté.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section Technique - Style avec effets */}
        <section className="mt-40 md:mt-48 pt-16 border-t border-gray-200 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <div className="max-w-4xl mx-auto">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-12 text-center">
              Spécifications Techniques
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-xs uppercase tracking-widest text-gray-400 mb-3">Encryption Standard</div>
                <div className="text-2xl font-bold">AES-256 & RSA-4096</div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-xs uppercase tracking-widest text-gray-400 mb-3">Protocol</div>
                <div className="text-2xl font-bold">TLS 1.3</div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-xs uppercase tracking-widest text-gray-400 mb-3">2FA</div>
                <div className="text-2xl font-bold">Hardware Key</div>
                <div className="text-sm text-gray-500 mt-1">(YubiKey) Support</div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-xs uppercase tracking-widest text-gray-400 mb-3">Audited</div>
                <div className="text-2xl font-bold text-green-600">Yes (2024)</div>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="relative z-10 text-center py-16 border-t border-gray-200/50">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition font-medium">
            <ArrowRight size={16} className="rotate-180" />
            <span>Retour à l'accueil</span>
          </Link>
        </div>
        <p className="text-gray-400 text-sm">
          © 2024 Naeliv Inc. — Designed in Brussels.
        </p>
      </footer>

    </main>
  );
}

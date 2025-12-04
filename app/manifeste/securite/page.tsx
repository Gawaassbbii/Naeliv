import React from 'react';
import Link from 'next/link';
import { Menu, Lock, Server, EyeOff, ShieldCheck } from 'lucide-react';



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
          <button className="bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 transition">
            Accès Anticipé
          </button>
        </div>
        <button className="md:hidden"><Menu /></button>
      </nav>



      {/* HEADER */}
      <div className="relative z-10 pt-40 pb-20 px-6 max-w-4xl mx-auto text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-tight">
          Vos données.<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500">
            Dans un coffre-fort.
          </span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Nous ne vendons pas vos données, car nous ne pouvons même pas les lire.
          Naeliv est construit sur une architecture Zero-Knowledge.
        </p>
      </div>



      {/* GRID DE SÉCURITÉ */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          

          {/* Feature 1 */}
          <div className="p-8 rounded-3xl border border-gray-200/50 shadow-sm hover:shadow-xl transition-all duration-300 bg-white animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Lock className="w-10 h-10 text-black mb-6"/>
            <h3 className="text-2xl font-bold mb-3 text-black">Chiffrement de bout en bout</h3>
            <p className="text-gray-500 leading-relaxed">

              Vos emails sont chiffrés sur votre appareil avant même d'être envoyés. 

              Même si nous le voulions, nous ne pourrions pas lire vos messages. Vous seul possédez la clé.

            </p>

          </div>



          {/* Feature 2 */}
          <div className="p-8 rounded-3xl border border-gray-200/50 shadow-sm hover:shadow-xl transition-all duration-300 bg-white animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Server className="w-10 h-10 text-black mb-6"/>
            <h3 className="text-2xl font-bold mb-3 text-black">Serveurs en Suisse 🇨🇭</h3>
            <p className="text-gray-500 leading-relaxed">

              Toutes nos infrastructures sont situées physiquement à Genève, protégées par les lois de confidentialité les plus strictes au monde.

              Hors de portée des juridictions US/EU.

            </p>

          </div>



          {/* Feature 3 */}
          <div className="p-8 rounded-3xl border border-gray-200/50 shadow-sm hover:shadow-xl transition-all duration-300 bg-white animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <EyeOff className="w-10 h-10 text-black mb-6"/>
            <h3 className="text-2xl font-bold mb-3 text-black">Politique No-Logs</h3>
            <p className="text-gray-500 leading-relaxed">

              Nous ne gardons aucune trace de votre adresse IP, de vos métadonnées ou de vos habitudes de navigation.

              Votre activité n'existe que pour vous.

            </p>

          </div>



          {/* Feature 4 */}
          <div className="p-8 rounded-3xl border border-gray-200/50 shadow-sm hover:shadow-xl transition-all duration-300 bg-white animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <ShieldCheck className="w-10 h-10 text-black mb-6"/>
            <h3 className="text-2xl font-bold mb-3 text-black">Open Source</h3>
            <p className="text-gray-500 leading-relaxed">

              La confiance, ça ne se demande pas, ça se prouve. Notre code de chiffrement est public et audité par la communauté.

            </p>

          </div>



        </div>



        {/* TABLEAU TECHNIQUE */}
        <div className="mt-8 p-8 rounded-3xl border border-gray-200/50 shadow-sm bg-white animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <h4 className="text-gray-500 uppercase tracking-widest text-xs mb-6 font-sans">Spécifications Techniques</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 text-gray-600 font-sans">
                <div className="flex justify-between border-b border-gray-200 pb-2"><span>Encryption Standard</span> <span className="text-black font-semibold">AES-256 & RSA-4096</span></div>
                <div className="flex justify-between border-b border-gray-200 pb-2"><span>Protocol</span> <span className="text-black font-semibold">TLS 1.3</span></div>
                <div className="flex justify-between border-b border-gray-200 pb-2"><span>2FA</span> <span className="text-black font-semibold">Hardware Key (YubiKey) Support</span></div>
                <div className="flex justify-between border-b border-gray-200 pb-2"><span>Audited</span> <span className="text-green-600 font-semibold">Yes (2024)</span></div>
            </div>
        </div>



      </div>



    </main>

  );

}

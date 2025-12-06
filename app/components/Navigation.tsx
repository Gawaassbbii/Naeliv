"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { X } from 'lucide-react';

const ADMIN_EMAIL = 'gabi@naeliv.com';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const { data } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'maintenance_mode')
          .single();
        
        setIsMaintenance((data as { value: string } | null)?.value === 'true');
      } catch (error) {
        console.error('Error checking maintenance:', error);
      }
    };

    checkMaintenance();

    // Écouter les changements en temps réel
    const channel = supabase
      .channel('maintenance-mode-nav')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_settings',
          filter: 'key=eq.maintenance_mode',
        },
        (payload) => {
          const newValue = (payload.new as { value: string } | null)?.value;
          setIsMaintenance(newValue === 'true');
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);


  // Si en maintenance, afficher uniquement le bouton Admin
  if (isMaintenance) {
    return (
      <>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-300 backdrop-blur-lg bg-opacity-95">
          <div className="max-w-5xl mx-auto px-6 py-2 flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <motion.div 
                className="flex items-center gap-2 cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-[24px] font-sans font-bold tracking-tight text-black">Naeliv</span>
                <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-semibold rounded uppercase tracking-wide">
                  BETA
                </span>
              </motion.div>
            </Link>

            {/* Bouton Admin uniquement */}
            <motion.button
              onClick={() => setShowAdminModal(true)}
              className="px-6 py-2 bg-purple-600 text-white rounded-full text-[14px] font-medium flex items-center gap-2 shadow-lg hover:bg-purple-700 hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shield size={16} />
              Admin
            </motion.button>
          </div>
        </nav>

        {/* Modal de connexion Admin */}
        {showAdminModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 relative"
            >
              <button
                onClick={() => {
                  setShowAdminModal(false);
                  setAdminError('');
                  setAdminEmail('');
                  setAdminPassword('');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-6">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield size={32} className="text-white" />
                </div>
                <h2 className="text-[28px] font-bold text-center text-black mb-2">
                  Connexion Admin
                </h2>
                <p className="text-[14px] text-gray-600 text-center">
                  Accès réservé aux administrateurs
                </p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@naeliv.com"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-[14px] focus:outline-none focus:border-purple-600 transition-colors"
                    required
                    disabled={adminLoading}
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-[14px] focus:outline-none focus:border-purple-600 transition-colors"
                    required
                    disabled={adminLoading}
                  />
                </div>

                {adminError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[14px] text-red-600">
                    {adminError}
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl text-[14px] font-medium hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: adminLoading ? 1 : 1.02 }}
                  whileTap={{ scale: adminLoading ? 1 : 0.98 }}
                >
                  {adminLoading ? 'Connexion...' : 'Se connecter'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </>
    );
  }

  // Navigation normale si pas en maintenance
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-300 backdrop-blur-lg bg-opacity-95">
      <div className="max-w-5xl mx-auto px-6 py-2 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <motion.div 
            className="flex items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-[24px] font-sans font-bold tracking-tight text-black">Naeliv</span>
            <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-semibold rounded uppercase tracking-wide">
              BETA
            </span>
          </motion.div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/">
            <button 
              className={`text-[14px] ${pathname === '/' ? 'text-black font-semibold' : 'text-gray-700 hover:text-black'} transition-colors`}
            >
              Accueil
            </button>
          </Link>
          <div className="relative group">
            <button className="text-[14px] text-gray-700 hover:text-black transition-colors">
              Produit
            </button>
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all min-w-[200px]">
              <Link href="/zen-mode"><button className="block w-full text-left px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50 first:rounded-t-xl">Zen Mode</button></Link>
              <Link href="/premium-shield"><button className="block w-full text-left px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50">Monétisation de l'Attention</button></Link>
              <Link href="/immersion-linguistique"><button className="block w-full text-left px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50">Immersion Linguistique</button></Link>
              <Link href="/detox-digitale"><button className="block w-full text-left px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50">Détox Digitale</button></Link>
              <Link href="/rewind"><button className="block w-full text-left px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50">Rewind</button></Link>
              <Link href="/naeliv-intelligence"><button className="block w-full text-left px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50 last:rounded-b-xl">Naeliv Intelligence</button></Link>
            </div>
          </div>
          <Link href="/a-propos"><button className={`text-[14px] ${pathname === '/a-propos' ? 'text-black font-semibold' : 'text-gray-700 hover:text-black'} transition-colors`}>À propos</button></Link>
          <Link href="/contact"><button className={`text-[14px] ${pathname === '/contact' ? 'text-black font-semibold' : 'text-gray-700 hover:text-black'} transition-colors`}>Contact</button></Link>
        </div>

        {/* Prix & CTA */}
        <div className="flex items-center gap-3">
          <Link href="/PricingPage">
            <motion.button
              className={`px-6 py-2 rounded-full text-[14px] font-medium transition-colors ${
                pathname === '/PricingPage' 
                  ? 'bg-purple-600 text-white' 
                  : 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Tarifs
            </motion.button>
          </Link>
          <motion.button
            className="px-6 py-2 border border-black text-black rounded-full text-[14px] hover:bg-gray-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/connexion'}
          >
            Connexion
          </motion.button>
          <motion.button
            className="px-6 py-2 bg-black text-white rounded-full text-[14px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/inscription'}
          >
            Commencer
          </motion.button>
        </div>
      </div>
    </nav>
  );
}

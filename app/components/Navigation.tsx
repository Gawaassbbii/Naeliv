"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAIL = 'gabi@naeliv.com';

export function Navigation() {
  const pathname = usePathname();
  // Navigation normale
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

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EmailMockup } from './EmailMockup';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface HeroProps {
  onNavigate: (page: string) => void;
}

export function Hero({ onNavigate }: HeroProps) {
  const [emailName, setEmailName] = useState('');

  return (
    <header className="min-h-screen flex flex-col items-center justify-center px-6 py-8 border-b border-gray-300 relative overflow-hidden bg-white">
      {/* Animated background shapes */}
      <motion.div 
        className="absolute top-20 right-20 w-64 h-64 rounded-full bg-blue-500 opacity-10"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0]
        }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-40 left-10 w-96 h-96 rounded-full bg-green-500 opacity-10"
        animate={{ 
          scale: [1, 1.3, 1],
          rotate: [0, -90, 0]
        }}
        transition={{ 
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="max-w-7xl w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div>
            {/* Logo */}
            <motion.div 
              className="mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Image
                src="/logo.png"
                alt="Naeliv Logo"
                width={220}
                height={80}
                priority
              />
            </motion.div>

            {/* Slogan */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-[48px] leading-tight font-sans font-bold tracking-tight text-black">
                L'Email, en toute clarté.
              </h1>
            </motion.div>

            {/* Description */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <p className="text-[20px] leading-relaxed text-gray-700">
                L'antithèse de Gmail. Silence, sécurité et intelligence.
              </p>
            </motion.div>

            {/* Email Creation CTA - HERO ELEMENT */}
            <motion.div
              className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl border-2 border-black shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              whileHover={{ scale: 1.02, boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}
            >
              <p className="text-[14px] uppercase tracking-wide mb-3 text-gray-600">
                Créez votre adresse premium
              </p>
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="text"
                  value={emailName}
                  onChange={(e) => setEmailName(e.target.value)}
                  className="flex-1 px-4 py-3 text-[24px] border-2 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
                  placeholder="votre_nom"
                />
                <span className="text-[24px] text-gray-600">@naeliv.com</span>
              </div>
              <motion.button
                className="w-full bg-black text-white py-4 rounded-xl flex items-center justify-center gap-3 text-[18px] group"
                whileHover={{ scale: 1.03, backgroundColor: "#1f2937" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.location.href = '/inscription'}
              >
                Créer mon adresse
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight size={24} />
                </motion.div>
              </motion.button>
              <p className="text-[12px] text-center mt-3 text-gray-500">
                Gratuit • Sans engagement • En 30 secondes
              </p>
            </motion.div>

            {/* Main CTA */}
            <motion.div 
              className="flex flex-wrap gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.button 
                className="px-8 py-4 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/inscription'}
              >
                Commencer
                <ArrowRight size={20} />
              </motion.button>
            </motion.div>

            {/* Signature */}
            <motion.div 
              className="text-[14px] tracking-wide text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              DESIGNED IN BRUSSELS
            </motion.div>
          </div>

          {/* Right: Visual Mockup */}
          <div className="relative">
            <EmailMockup />
          </div>
        </div>
      </div>
    </header>
  );
}

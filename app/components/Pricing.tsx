"use client";

import React from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface PricingProps {
  onNavigate?: (page: string) => void;
}

const pricingData = [
  {
    name: 'NAELIV ESSENTIAL',
    price: 'Gratuit',
    target: 'Étudiants, Curieux',
    features: [
      { name: 'Apprentissage', value: 'Basique (ENG seulement, vocabulaire limité)', available: true },
      { name: 'Zen Mode', value: 'Fixe (09h00 & 17h00)', available: true },
      { name: 'Smart Paywall', value: 'Gagnez des crédits à chaque email reçu', available: true },
      { name: 'Adresse', value: 'pseudo123@naeliv.com', available: true },
      { name: 'Rewind', value: '10 secondes pour annuler', available: true },
      { name: 'Signature', value: '"Envoyé avec Naeliv"', available: true }
    ],
    cta: 'Commencer',
    highlight: false
  },
  {
    name: 'NAELIV PRO',
    price: '5€/mois',
    target: 'Freelances, Pros, Apprenants',
    features: [
      { name: 'Apprentissage', value: 'Illimité (ENG + DE, Grammaire, Vocabulaire riche)', available: true },
      { name: 'Zen Mode', value: 'Personnalisable (Choisis tes heures)', available: true },
      { name: 'Smart Paywall', value: 'Gagnez des crédits + Prix personnalisable', available: true },
      { name: 'Adresse', value: 'Alias Premium (prenom@naeliv.com)', available: true },
      { name: 'Rewind', value: 'Illimité (Édition post-envoi)', available: true },
      { name: 'Signature', value: 'Signature Pro sans pub', available: true },
      { name: 'Naeliv Intelligence', value: 'TL;DR, Ghostwriter, Coach, Smart Sorter, Réponse PRO', available: true }
    ],
    cta: 'Passer à PRO',
    highlight: true
  }
];

export function Pricing({ onNavigate }: PricingProps) {
  return (
    <section className="py-24 px-6 border-b border-gray-300 relative overflow-hidden bg-gray-50">
      {/* Animated background */}
      <motion.div 
        className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-purple-500 opacity-10"
        animate={{ 
          scale: [1, 1.3, 1],
          x: [-50, 50, -50]
        }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[64px] leading-none font-sans font-bold tracking-tight mb-4 text-black">Tarification</h2>
          <p className="text-[20px] text-gray-700 max-w-2xl">
            Le modèle est Freemium. On attire avec le gratuit, on convertit avec le Pro.
          </p>
        </motion.div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {pricingData.map((plan, index) => (
            <motion.div 
              key={index}
              className={`border-2 p-8 rounded-3xl transition-all ${
                plan.highlight 
                  ? 'border-black bg-black text-white shadow-2xl' 
                  : 'border-gray-300 bg-white text-black hover:shadow-xl hover:border-gray-400'
              }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                y: -10
              }}
            >
              {/* Header */}
              <div className="mb-8 pb-6 border-b" style={{ borderColor: plan.highlight ? 'white' : '#d1d5db' }}>
                <h3 className="text-[32px] leading-none tracking-tight mb-2">
                  {plan.name}
                </h3>
                <p className={`text-[14px] uppercase tracking-wide mb-4 ${plan.highlight ? 'opacity-70' : 'text-gray-500'}`}>
                  {plan.target}
                </p>
                <motion.p 
                  className="text-[48px] leading-none tracking-tight"
                  initial={{ scale: 0.8 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {plan.price}
                </motion.p>
              </div>

              {/* Features */}
              <div className="mb-8 space-y-6">
                {plan.features.map((feature, fIndex) => (
                  <motion.div 
                    key={fIndex} 
                    className="grid grid-cols-[1fr_auto] gap-4 items-start"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: fIndex * 0.05 }}
                  >
                    <div>
                      <p className={`text-[14px] uppercase tracking-wide mb-1 ${plan.highlight ? 'opacity-70' : 'text-gray-500'}`}>
                        {feature.name}
                      </p>
                      <p className="text-[16px]">
                        {feature.value}
                      </p>
                    </div>
                    <motion.div 
                      className="pt-1"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: fIndex * 0.05 + 0.2 }}
                    >
                      {feature.available && (
                        <Check size={20} strokeWidth={2} />
                      )}
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <motion.button 
                className={`w-full py-4 text-[16px] tracking-wide uppercase transition-all rounded-full ${
                  plan.highlight 
                    ? 'bg-white text-black hover:bg-gray-100' 
                    : 'border-2 border-black text-black hover:bg-black hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/inscription'}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import React from 'react';
import { Clock, Shield, Brain, Trash2, RotateCcw, Coins, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface FeaturesProps {
  onNavigate: (page: string) => void;
}

const features = [
  {
    icon: Clock,
    number: '01',
    title: 'Zen Mode',
    subtitle: 'Facteur 2x / jour',
    description: 'Fini les notifications incessantes. Les emails sont livrés par lots, uniquement à 09h00 et 17h00.',
    benefit: 'Retrouvez votre concentration profonde.',
    color: '#0066FF',
    page: 'zen-mode'
  },
  {
    icon: Coins,
    number: '02',
    title: 'Smart Paywall',
    subtitle: 'Votre attention a un prix',
    description: 'Fixez le prix du timbre (de 0,10€ à 100€). Les inconnus paient pour vous parler. Vous touchez une commission sur chaque email reçu.',
    benefit: 'Gagnez des crédits tout en éliminant le spam.',
    color: '#00CC88',
    page: 'premium-shield'
  },
  {
    icon: Brain,
    number: '03',
    title: 'Immersion Linguistique',
    subtitle: 'Apprentissage Passif',
    description: 'L\'interface remplace intelligemment des mots du quotidien par leur traduction. Priorité Anglais (EN), puis Allemand (DE).',
    benefit: 'Apprendre sans effort, juste en lisant ses mails.',
    color: '#FF6B00',
    page: 'immersion-linguistique'
  },
  {
    icon: Trash2,
    number: '04',
    title: 'Détox Digitale',
    subtitle: 'Auto-Delete',
    description: 'Tout email non "Épinglé" est supprimé définitivement après 30 jours.',
    benefit: 'Une Inbox Zero automatique. Réduction de l\'empreinte carbone.',
    color: '#DD0000',
    page: 'detox-digitale'
  },
  {
    icon: RotateCcw,
    number: '05',
    title: 'Rewind',
    subtitle: 'Droit à l\'erreur',
    description: 'Possibilité de modifier ou supprimer un email après l\'envoi (via un lien sécurisé).',
    benefit: 'Contrôle total de son image professionnelle.',
    color: '#9900FF',
    page: 'rewind'
  },
  {
    icon: Sparkles,
    number: '06',
    title: 'Naeliv Intelligence',
    subtitle: 'IA Premium',
    description: 'TL;DR pour résumer vos emails, Ghostwriter pour rédiger des réponses professionnelles, Coach pour corriger vos fautes et Smart Sorter pour catégoriser automatiquement vos messages.',
    benefit: 'Boostez votre productivité avec l\'intelligence artificielle.',
    color: '#EC4899',
    page: 'naeliv-intelligence'
  }
];

export function Features({ onNavigate }: FeaturesProps) {
  return (
    <section className="py-24 px-6 border-b border-gray-300 relative overflow-hidden bg-white">
      {/* Animated background gradient */}
      <motion.div 
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #FF6B00 0%, transparent 70%)' }}
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -50, 0]
        }}
        transition={{ 
          duration: 15,
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
          <h2 className="text-[64px] leading-none font-sans font-bold tracking-tight mb-4 text-black">Les 6 Piliers</h2>
          <p className="text-[20px] text-gray-700 max-w-2xl">
            Une boîte mail qui ne vous dérange pas, qui se nettoie toute seule et qui vous apprend des choses.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-12">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 pb-12 border-b border-gray-300 last:border-b-0 group"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Left: Number & Icon */}
              <div className="flex flex-col gap-4">
                <motion.div 
                  className="text-[80px] leading-none tracking-tighter opacity-20 text-black"
                  whileHover={{ opacity: 0.4, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  {feature.number}
                </motion.div>
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon 
                    size={48} 
                    strokeWidth={1.5}
                    style={{ color: feature.color }}
                  />
                </motion.div>
              </div>

              {/* Right: Content */}
              <div>
                <div className="mb-2">
                  <h3 className="text-[40px] leading-none font-sans font-bold tracking-tight mb-1 text-black">
                    {feature.title}
                  </h3>
                  <p className="text-[16px] text-gray-500 tracking-wide uppercase">
                    {feature.subtitle}
                  </p>
                </div>
                
                <div className="mb-4 max-w-2xl">
                  <p className="text-[18px] leading-relaxed text-gray-700">
                    {feature.description}
                  </p>
                </div>

                <motion.div 
                  className="inline-block px-6 py-3 text-white rounded-full cursor-pointer"
                  style={{ backgroundColor: feature.color }}
                  whileHover={{ scale: 1.05, boxShadow: `0 10px 30px ${feature.color}40` }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => window.location.href = `/${feature.page}`}
                >
                  <p className="text-[16px]">
                    → {feature.benefit}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

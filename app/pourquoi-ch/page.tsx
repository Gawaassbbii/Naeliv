"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Lock, Server, ArrowRight, Flag } from 'lucide-react';
import { Navigation } from '../components/Navigation';

// ============================================================================
// CONSTANTS
// ============================================================================

const ANIMATION_DURATION = {
  fast: 0.3,
  normal: 0.6,
  slow: 0.8,
  verySlow: 1.0,
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function PourquoiCh() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 border-b border-gray-300 relative overflow-hidden">
        <BackgroundShapes />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: ANIMATION_DURATION.slow }}
          >
            <motion.div
              className="inline-flex items-center gap-3 mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: ANIMATION_DURATION.normal, delay: 0.2 }}
            >
              <Flag size={32} className="text-[#FF0000]" />
              <span className="text-[18px] text-gray-600 font-medium">🇨🇭 SUISSE</span>
            </motion.div>
            
            <h1 className="text-[80px] md:text-[120px] font-bold tracking-tighter mb-6 leading-none">
              Pourquoi{' '}
              <span className="text-[#FF0000]">.ch</span> ?
            </h1>
            <p className="text-[24px] md:text-[32px] text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Votre email mérite la protection la plus stricte au monde.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Arguments Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Argument 1: Neutralité */}
            <ArgumentCard
              icon={Shield}
              title="Neutralité"
              description="La Suisse n'est ni dans l'UE ni aux États-Unis. Aucun Patriot Act, aucune juridiction extraterritoriale."
              benefit="Vos données échappent aux lois de surveillance américaines et européennes."
              color="#FF0000"
              delay={0.1}
            />

            {/* Argument 2: Loi LPD */}
            <ArgumentCard
              icon={Lock}
              title="Loi LPD"
              description="La Loi sur la Protection des Données suisse est la plus stricte au monde. Vos données sont protégées par des standards inégalés."
              benefit="Conformité totale avec la législation suisse sur la protection des données."
              color="#FF0000"
              delay={0.2}
            />

            {/* Argument 3: Infrastructure */}
            <ArgumentCard
              icon={Server}
              title="Infrastructure"
              description="Nos serveurs sont physiquement situés en Suisse, dans des bunkers sécurisés. Vos données ne quittent jamais le territoire suisse."
              benefit="Hébergement 100% suisse, souveraineté des données garantie."
              color="#FF0000"
              delay={0.3}
            />
          </div>

          {/* Additional Info Section */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: ANIMATION_DURATION.normal }}
          >
            <InfoCard
              title="Souveraineté des données"
              description="En choisissant un domaine .ch, vous optez pour une protection maximale. La Suisse est reconnue mondialement pour sa neutralité et son respect de la vie privée."
            />
            <InfoCard
              title="Conformité légale"
              description="Notre infrastructure respecte strictement la Loi fédérale sur la protection des données (LPD), garantissant un niveau de protection supérieur à celui de l'UE ou des États-Unis."
            />
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: ANIMATION_DURATION.normal }}
          >
            <Link href="/">
              <motion.button
                className="px-8 py-4 bg-black text-white rounded-full text-[16px] font-medium flex items-center gap-2 mx-auto hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Retour à l'accueil
                <ArrowRight size={20} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function BackgroundShapes() {
  return (
    <>
      <motion.div 
        className="absolute top-20 right-20 w-64 h-64 rounded-full bg-red-500 opacity-5"
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
        className="absolute bottom-40 left-10 w-96 h-96 rounded-full bg-red-500 opacity-5"
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
    </>
  );
}

interface ArgumentCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  benefit: string;
  color: string;
  delay: number;
}

function ArgumentCard({ icon: Icon, title, description, benefit, color, delay }: ArgumentCardProps) {
  return (
    <motion.div
      className="bg-white border-2 border-gray-300 rounded-2xl p-8 hover:border-gray-400 transition-all"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: ANIMATION_DURATION.normal, delay }}
      whileHover={{ y: -5, borderColor: color }}
    >
      <div className="mb-6">
        <div 
          className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={32} className="text-[#FF0000]" />
        </div>
        <h2 className="text-[32px] font-bold tracking-tight mb-3">
          {title}
        </h2>
      </div>
      <p className="text-[16px] text-gray-700 leading-relaxed mb-6">
        {description}
      </p>
      <div className="pt-6 border-t border-gray-200">
        <p className="text-[14px] text-gray-600 font-medium">
          {benefit}
        </p>
      </div>
    </motion.div>
  );
}

interface InfoCardProps {
  title: string;
  description: string;
}

function InfoCard({ title, description }: InfoCardProps) {
  return (
    <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-8">
      <h3 className="text-[28px] font-bold tracking-tight mb-4">{title}</h3>
      <p className="text-[16px] text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}


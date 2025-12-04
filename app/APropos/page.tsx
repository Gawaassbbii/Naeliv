"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Heart, Globe, Zap } from 'lucide-react';

export default function APropos() {
  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-[80px] leading-none tracking-tighter mb-6">À propos de Naeliv</h1>
          <p className="text-[24px] text-gray-700 max-w-3xl mx-auto">
            Nous croyons que l'email ne devrait pas être une source de stress, mais un outil de communication clair et efficace.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          className="mb-16 p-8 bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl border-2 border-black"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[48px] leading-none tracking-tight mb-4">Notre Mission</h2>
          <p className="text-[20px] text-gray-700 leading-relaxed">
            Naeliv est né à Bruxelles avec une vision simple : redonner le contrôle de leur boîte mail aux utilisateurs. 
            Nous refusons le modèle de surveillance publicitaire et proposons une alternative qui respecte votre temps, 
            votre vie privée et votre intelligence.
          </p>
        </motion.div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {[
            {
              icon: Target,
              title: 'Clarté',
              description: 'Design minimaliste et fonctionnalités qui ont du sens. Pas de features inutiles.',
              color: '#0066FF'
            },
            {
              icon: Heart,
              title: 'Respect',
              description: 'Vos données vous appartiennent. Nous ne vendons rien, nous ne trackons pas.',
              color: '#00CC88'
            },
            {
              icon: Globe,
              title: 'Éducation',
              description: 'Apprendre passivement de nouvelles langues tout en gérant vos emails.',
              color: '#FF6B00'
            },
            {
              icon: Zap,
              title: 'Efficacité',
              description: 'Moins de distractions, plus de concentration. C\'est ça, le vrai pouvoir.',
              color: '#9900FF'
            }
          ].map((value, index) => (
            <motion.div
              key={index}
              className="p-6 bg-white border-2 border-gray-300 rounded-2xl hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
            >
              <value.icon size={40} strokeWidth={1.5} style={{ color: value.color }} className="mb-4" />
              <h3 className="text-[32px] leading-none tracking-tight mb-2">{value.title}</h3>
              <p className="text-[16px] text-gray-700">{value.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Story */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[48px] leading-none tracking-tight mb-6">L'Histoire</h2>
          <div className="space-y-4 text-[18px] text-gray-700 leading-relaxed">
            <p>
              Naeliv a été créé en 2025 à Bruxelles, au cœur de l'Europe. Notre équipe multilingue 
              (français, néerlandais, allemand) a constaté un problème universel : l'email est devenu 
              une source de stress permanent.
            </p>
            <p>
              Plutôt que d'ajouter encore une couche de complexité, nous avons décidé de revenir 
              à l'essentiel. Naeliv évoque une "Nouvelle Vie Numérique" - une vision qui guide 
              notre mission de redonner le contrôle aux utilisateurs.
            </p>
            <p>
              Aujourd'hui, nous construisons l'avenir de l'email avec une vision claire : une boîte mail 
              propre, sécurisée et intelligente accessible à tous.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center p-8 bg-black text-white rounded-3xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-[40px] leading-none tracking-tight mb-4">Rejoignez la révolution</h3>
          <p className="text-[18px] text-gray-300 mb-6">
            Rejoignez la communauté Naeliv et reprenez le contrôle de votre inbox.
          </p>
          <motion.button
            className="px-8 py-4 bg-white text-black rounded-full text-[16px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Commencer gratuitement
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}


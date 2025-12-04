"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Globe, BookOpen, TrendingUp, CheckCircle, Zap, Lightbulb } from 'lucide-react';

interface ImmersionLinguistiqueProps {
  onNavigate?: (page: string) => void;
}

export default function ImmersionLinguistique({ onNavigate }: ImmersionLinguistiqueProps) {
  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-8"
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Brain size={48} className="text-orange-600" />
          </motion.div>
          <h1 className="text-[80px] leading-none tracking-tighter mb-6">Immersion Linguistique</h1>
          <p className="text-[32px] text-gray-700 max-w-3xl mx-auto">
            Apprentissage Passif
          </p>
          <p className="text-[20px] text-gray-600 max-w-2xl mx-auto mt-4">
            Apprenez l'Anglais et l'Allemand en lisant simplement vos emails. Pas d'effort, juste de la répétition naturelle. Plus de langues à venir.
          </p>
        </motion.div>

        {/* Live Example */}
        <motion.div
          className="mb-16 p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl border-2 border-orange-300"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[48px] leading-none tracking-tight mb-6 text-center">Exemple en direct</h2>
          <div className="bg-white p-6 rounded-2xl border-2 border-black">
            <p className="text-[24px] leading-relaxed mb-4">
              Salut ! Ton <span className="bg-yellow-200 px-2 py-1 rounded">rapport</span> est disponible <span className="bg-yellow-200 px-2 py-1 rounded">maintenant</span>.
            </p>
            <div className="text-[14px] text-gray-600 mb-4">↓ Devient progressivement ↓</div>
            <p className="text-[24px] leading-relaxed">
              Salut ! Ton <span className="bg-orange-200 px-2 py-1 rounded font-semibold">report</span> est disponible <span className="bg-orange-200 px-2 py-1 rounded font-semibold">now</span>.
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <p className="text-[14px] text-gray-700">
                📚 <strong>report</strong> (ENG) = rapport • 
                <strong className="ml-2">now</strong> (ENG) = maintenant
              </p>
            </div>
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[48px] leading-none tracking-tight mb-8 text-center">La méthode scientifique</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Contexte',
                description: 'Les mots sont remplacés uniquement quand le contexte est clair.',
                icon: Globe
              },
              {
                step: '2',
                title: 'Répétition espacée',
                description: 'Les mêmes mots reviennent avec une fréquence optimisée.',
                icon: Brain
              },
              {
                step: '3',
                title: 'Progression',
                description: 'De 1-2 mots par email à des phrases complètes au fil du temps.',
                icon: BookOpen
              },
              {
                step: '4',
                title: 'Mémorisation',
                description: 'Votre cerveau apprend sans effort, par exposition naturelle.',
                icon: Lightbulb
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="p-6 bg-white border-2 border-gray-300 rounded-2xl text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, borderColor: '#FF6B00' }}
              >
                <item.icon size={48} className="mx-auto mb-3 text-orange-600" />
                <div className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center text-[20px] mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="text-[24px] tracking-tight mb-2">{item.title}</h3>
                <p className="text-[16px] text-gray-700">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Languages */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[48px] leading-none tracking-tight mb-8 text-center">Langues disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-orange-50 border-2 border-orange-300 rounded-3xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center text-[24px]">
                  ENG
                </div>
                <div>
                  <h3 className="text-[32px] tracking-tight">Anglais</h3>
                  <p className="text-[16px] text-gray-600">Priorité principale</p>
                </div>
              </div>
              <div className="space-y-3 text-[16px] text-gray-700">
                <p>✓ Vocabulaire quotidien (1000+ mots)</p>
                <p>✓ Expressions idiomatiques</p>
                <p>✓ Grammaire progressive</p>
                <p className="text-orange-600">Objectif : B1 en 6 mois</p>
              </div>
            </div>

            <div className="p-8 bg-blue-50 border-2 border-blue-300 rounded-3xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center text-[24px]">
                  DE
                </div>
                <div>
                  <h3 className="text-[32px] tracking-tight">Allemand</h3>
                  <p className="text-[16px] text-gray-600">Deuxième priorité</p>
                </div>
              </div>
              <div className="space-y-3 text-[16px] text-gray-700">
                <p>✓ Vocabulaire professionnel</p>
                <p>✓ Grammaire adaptative</p>
                <p>✓ Déclinaisons progressives</p>
                <p className="text-blue-600">Objectif : B1 en 8 mois</p>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-[18px] text-gray-600">Plus de langues à venir</p>
          </div>
        </motion.div>

        {/* Versions */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[48px] leading-none tracking-tight mb-8 text-center">Gratuit vs PRO</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-gray-50 border-2 border-gray-300 rounded-3xl">
              <h3 className="text-[32px] tracking-tight mb-6">Naeliv Essential</h3>
              <ul className="space-y-3 text-[16px] text-gray-700">
                <li>📚 Anglais uniquement</li>
                <li>📖 Vocabulaire de base (~300 mots)</li>
                <li>🔢 1-2 mots par email</li>
                <li>❌ Pas de personnalisation</li>
              </ul>
            </div>

            <div className="p-8 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-black rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[32px] tracking-tight">Naeliv PRO</h3>
                <div className="px-3 py-1 bg-black text-white rounded-full text-[12px]">5€/mois</div>
              </div>
              <ul className="space-y-3 text-[16px] text-gray-700">
                <li>🌍 ENG + DE (+ autres à venir)</li>
                <li>📚 Vocabulaire illimité (5000+ mots)</li>
                <li>⚙️ Intensité réglable (1-10 mots/email)</li>
                <li>📖 Grammaire & conjugaisons</li>
                <li>🎯 Thèmes personnalisés (business, voyage, etc.)</li>
                <li>📊 Suivi de progression détaillé</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Science */}
        <motion.div
          className="mb-16 p-8 bg-black text-white rounded-3xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[40px] leading-none tracking-tight mb-6 text-center">Pourquoi ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Lightbulb,
                title: 'Apprentissage contextuel',
                description: 'Le cerveau retient 5x mieux dans un contexte réel vs flashcards.'
              },
              {
                icon: BookOpen,
                title: 'Exposition quotidienne',
                description: '20-30 emails/jour = 20-60 mots appris passivement.'
              },
              {
                icon: Globe,
                title: 'Immersion naturelle',
                description: 'Comme vivre à l\'étranger, mais depuis votre inbox.'
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <item.icon size={40} className="mx-auto mb-3 text-orange-400" />
                <h3 className="text-[24px] tracking-tight mb-2">{item.title}</h3>
                <p className="text-[16px] text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl border-2 border-black"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-[40px] leading-none tracking-tight mb-4">Commencez à apprendre</h3>
          <p className="text-[18px] text-gray-700 mb-6 max-w-2xl mx-auto">
            Activez l'immersion linguistique dès maintenant. Gratuit pour l'Anglais de base.
          </p>
          <motion.button
            className="px-8 py-4 bg-black text-white rounded-full text-[16px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/inscription'}
          >
            Activer l'immersion
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

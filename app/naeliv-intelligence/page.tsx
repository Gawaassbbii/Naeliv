"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Wand2, GraduationCap, FileText, Zap, Brain, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function NaelivIntelligence() {
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
            className="inline-flex items-center justify-center w-24 h-24 bg-pink-100 rounded-full mb-8"
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles size={48} className="text-pink-600" />
          </motion.div>
          <h1 className="text-[80px] leading-none tracking-tighter mb-6">Naeliv Intelligence</h1>
          <p className="text-[32px] text-gray-700 max-w-3xl mx-auto">
            IA Premium
          </p>
          <p className="text-[20px] text-gray-600 max-w-2xl mx-auto mt-4">
            Boostez votre productivité avec l'intelligence artificielle. TL;DR, Ghostwriter, Coach et Smart Sorter à votre service.
          </p>
        </motion.div>

        {/* Problem vs Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div
            className="p-8 bg-red-50 border-2 border-red-300 rounded-3xl"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <FileText size={40} className="text-red-600 mb-4" />
            <h2 className="text-[40px] leading-none tracking-tight mb-4 text-red-900">Sans IA</h2>
            <ul className="space-y-3 text-[18px] text-gray-700">
              <li>⏰ Des heures à lire et résumer vos emails</li>
              <li>✍️ Difficulté à trouver les bons mots professionnels</li>
              <li>📝 Fautes de grammaire et d'orthographe</li>
              <li>📊 Boîte mail désorganisée, difficile à naviguer</li>
              <li>💼 Réponses peu professionnelles</li>
            </ul>
          </motion.div>

          <motion.div
            className="p-8 bg-pink-50 border-2 border-pink-300 rounded-3xl"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles size={40} className="text-pink-600 mb-4" />
            <h2 className="text-[40px] leading-none tracking-tight mb-4 text-pink-900">Avec Naeliv Intelligence</h2>
            <ul className="space-y-3 text-[18px] text-gray-700">
              <li>✨ Résumé instantané en 3 points clés</li>
              <li>✍️ Réponses professionnelles générées en un clic</li>
              <li>🎓 Correction automatique avec explications</li>
              <li>📊 Catégorisation intelligente de vos emails</li>
              <li>💼 Réponses PRO personnalisées et efficaces</li>
            </ul>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[48px] leading-none tracking-tight mb-12 text-center">Les 4 outils IA</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: FileText,
                title: 'TL;DR',
                subtitle: 'Résumé express',
                description: 'Transformez vos longs emails en 3 points clés. Gagnez du temps et ne manquez jamais l\'essentiel.',
                color: '#EC4899',
                features: [
                  'Résumé automatique en 3 bullet points',
                  'Idéal pour les emails longs',
                  'Disponible en un clic'
                ]
              },
              {
                icon: Wand2,
                title: 'Ghostwriter',
                subtitle: 'Rédaction IA',
                description: 'Générez des réponses professionnelles en fonction de votre intention : réponse positive, refus poli, demande de détails, ou amélioration du texte existant.',
                color: '#EC4899',
                features: [
                  '4 intentions prédéfinies',
                  'Option "Rendre PRO" pour améliorer votre texte',
                  'Génération en quelques secondes'
                ]
              },
              {
                icon: GraduationCap,
                title: 'Coach',
                subtitle: 'Correction intelligente',
                description: 'Corrigez vos fautes de grammaire, d\'orthographe et de style. Disponible en français, anglais et allemand.',
                color: '#EC4899',
                features: [
                  'Correction multilingue (FR, EN, DE)',
                  'Retour uniquement du texte corrigé',
                  'Parfait pour les emails importants'
                ]
              },
              {
                icon: Zap,
                title: 'Smart Sorter',
                subtitle: 'Catégorisation automatique',
                description: 'Vos emails sont automatiquement catégorisés : Finance, Updates, Personal, Spam, ou Work. Plus jamais de désorganisation.',
                color: '#EC4899',
                features: [
                  'Catégorisation en temps réel',
                  '5 catégories intelligentes',
                  'Organisation automatique de votre inbox'
                ]
              }
            ].map((tool, index) => (
              <motion.div
                key={index}
                className="p-8 bg-white border-2 border-gray-300 rounded-3xl hover:shadow-xl transition-all"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, borderColor: tool.color }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${tool.color}20` }}
                  >
                    <tool.icon size={32} style={{ color: tool.color }} />
                  </div>
                  <div>
                    <h3 className="text-[32px] leading-none tracking-tight mb-1">{tool.title}</h3>
                    <p className="text-[14px] text-gray-500 uppercase tracking-wide">{tool.subtitle}</p>
                  </div>
                </div>
                <p className="text-[16px] text-gray-700 mb-6 leading-relaxed">
                  {tool.description}
                </p>
                <ul className="space-y-2">
                  {tool.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2 text-[14px] text-gray-600">
                      <CheckCircle size={16} style={{ color: tool.color }} className="flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Réponse PRO Generator */}
        <motion.div
          className="mb-16 p-8 bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl border-2 border-pink-300"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-4 mb-6">
            <Sparkles size={48} className="text-pink-600" />
            <div>
              <h2 className="text-[40px] leading-none tracking-tight mb-2">Générateur de Réponse PRO</h2>
              <p className="text-[18px] text-gray-700">
                Nouveau panneau dédié dans votre boîte de rédaction
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border-2 border-gray-200">
              <h3 className="text-[24px] tracking-tight mb-3">Comment ça marche ?</h3>
              <ol className="space-y-3 text-[16px] text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-pink-600">1.</span>
                  <span>Ouvrez la fenêtre "Nouveau message"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-pink-600">2.</span>
                  <span>Le panneau "Générateur PRO" apparaît à droite</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-pink-600">3.</span>
                  <span>Collez le texte auquel vous voulez répondre</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-pink-600">4.</span>
                  <span>Cliquez sur "Générer réponse PRO"</span>
                </li>
              </ol>
            </div>
            <div className="bg-white p-6 rounded-2xl border-2 border-gray-200">
              <h3 className="text-[24px] tracking-tight mb-3">Placeholders intelligents</h3>
              <p className="text-[16px] text-gray-700 mb-3">
                Pour les informations personnalisées manquantes, l'IA utilise des placeholders entre crochets :
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <code className="text-[14px] text-pink-600">Dans [combien de jours ?] jours</code>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <code className="text-[14px] text-pink-600">Je serai disponible le [date]</code>
                </div>
                <p className="text-[14px] text-gray-600 mt-3">
                  Vous remplacez ensuite ces placeholders par vos informations réelles.
                </p>
              </div>
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
          <h2 className="text-[48px] leading-none tracking-tight mb-8 text-center">Intégration parfaite</h2>
          <div className="space-y-6">
            {[
              {
                step: '1',
                title: 'Dans la lecture d\'email',
                description: 'Le bouton "✨ Résumer" apparaît en haut à droite. Un clic et vous avez un résumé instantané.',
                icon: FileText,
                color: '#EC4899'
              },
              {
                step: '2',
                title: 'Dans la rédaction',
                description: 'Les boutons "✨ IA Magic" et "🎓 Corriger" sont toujours à portée de main dans la barre d\'outils.',
                icon: Wand2,
                color: '#EC4899'
              },
              {
                step: '3',
                title: 'Smart Sorter automatique',
                description: 'Dès la réception, vos emails PRO sont catégorisés automatiquement. Aucune action requise.',
                icon: Zap,
                color: '#EC4899'
              },
              {
                step: '4',
                title: 'Réponse PRO personnalisée',
                description: 'Le panneau dédié vous permet de générer des réponses professionnelles à partir de n\'importe quel texte.',
                icon: Sparkles,
                color: '#EC4899'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-4 p-6 bg-white border-2 border-gray-300 rounded-2xl"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, borderColor: item.color }}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[24px] flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                >
                  {item.step}
                </div>
                <div className="flex-1 flex items-center gap-4">
                  <item.icon size={32} style={{ color: item.color }} className="flex-shrink-0" />
                  <div>
                    <h3 className="text-[24px] tracking-tight mb-2">{item.title}</h3>
                    <p className="text-[16px] text-gray-700">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mb-16 p-8 bg-black text-white rounded-3xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[40px] leading-none tracking-tight mb-8 text-center">Impact mesurable</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-[64px] text-pink-400 mb-2">-75%</p>
              <p className="text-[18px] text-gray-300">Temps passé sur les emails</p>
            </div>
            <div>
              <p className="text-[64px] text-pink-400 mb-2">+90%</p>
              <p className="text-[18px] text-gray-300">Qualité des réponses</p>
            </div>
            <div>
              <p className="text-[64px] text-pink-400 mb-2">0</p>
              <p className="text-[18px] text-gray-300">Fautes dans vos emails</p>
            </div>
            <div>
              <p className="text-[64px] text-pink-400 mb-2">100%</p>
              <p className="text-[18px] text-gray-300">Emails organisés</p>
            </div>
          </div>
        </motion.div>

        {/* PRO Only */}
        <motion.div
          className="mb-16 p-8 bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl border-2 border-pink-400"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-[40px] leading-none tracking-tight mb-2">Fonctionnalité PRO uniquement</h2>
              <p className="text-[18px] text-gray-700">
                Naeliv Intelligence est réservé aux membres Naeliv PRO. Débloquez toute la puissance de l'IA pour votre boîte mail.
              </p>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full text-[14px] uppercase tracking-wide text-white">
              PRO
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border-2 border-pink-200">
              <h3 className="text-[24px] tracking-tight mb-3">Pourquoi PRO ?</h3>
              <ul className="space-y-2 text-[16px] text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-pink-600 flex-shrink-0" />
                  Coûts d'infrastructure IA élevés
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-pink-600 flex-shrink-0" />
                  Technologie de pointe (GPT-4o-mini)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-pink-600 flex-shrink-0" />
                  Traitement en temps réel
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl border-2 border-pink-200">
              <h3 className="text-[24px] tracking-tight mb-3">Avantages PRO</h3>
              <ul className="space-y-2 text-[16px] text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-pink-600 flex-shrink-0" />
                  Accès illimité à tous les outils IA
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-pink-600 flex-shrink-0" />
                  Réponses plus rapides et précises
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-pink-600 flex-shrink-0" />
                  Support prioritaire
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center p-8 bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl border-2 border-black"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-[40px] leading-none tracking-tight mb-4">Passez au niveau supérieur</h3>
          <p className="text-[18px] text-gray-700 mb-6 max-w-2xl mx-auto">
            Rejoignez Naeliv PRO et transformez votre façon de gérer vos emails avec l'intelligence artificielle.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/inscription">
              <motion.button
                className="px-8 py-4 bg-black text-white rounded-full text-[16px]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Rejoindre Naeliv PRO
              </motion.button>
            </Link>
            <Link href="/PricingPage">
              <motion.button
                className="px-8 py-4 bg-white text-black border-2 border-black rounded-full text-[16px]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Voir les tarifs
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


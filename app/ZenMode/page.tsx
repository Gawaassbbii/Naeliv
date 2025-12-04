"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Bell, BellOff, Brain, Zap } from 'lucide-react';
import Link from 'next/link';

export default function ZenMode() {
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
            className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-8"
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Clock size={48} className="text-blue-600" />
          </motion.div>
          <h1 className="text-[80px] leading-none tracking-tighter mb-6">Zen Mode</h1>
          <p className="text-[32px] text-gray-700 max-w-3xl mx-auto">
            Facteur 2x / jour
          </p>
          <p className="text-[20px] text-gray-600 max-w-2xl mx-auto mt-4">
            Fini les notifications incessantes. Vos emails arrivent par lots, uniquement à 09h00 et 17h00.
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
            <Bell size={40} className="text-red-600 mb-4" />
            <h2 className="text-[40px] leading-none tracking-tight mb-4 text-red-900">Le problème</h2>
            <ul className="space-y-3 text-[18px] text-gray-700">
              <li>📱 47 notifications par jour en moyenne</li>
              <li>⏰ Interruptions toutes les 6 minutes</li>
              <li>🧠 Perte de concentration profonde</li>
              <li>😰 Stress et anxiété permanents</li>
              <li>⚡ Impossibilité de se déconnecter</li>
            </ul>
          </motion.div>

          <motion.div
            className="p-8 bg-green-50 border-2 border-green-300 rounded-3xl"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <BellOff size={40} className="text-green-600 mb-4" />
            <h2 className="text-[40px] leading-none tracking-tight mb-4 text-green-900">La solution Naeliv</h2>
            <ul className="space-y-3 text-[18px] text-gray-700">
              <li>✅ 2 livraisons quotidiennes (09h & 17h)</li>
              <li>🎯 4-6 heures de concentration ininterrompue</li>
              <li>🧘 Réduction du stress de 68%</li>
              <li>💡 Meilleure créativité et productivité</li>
              <li>⚖️ Équilibre vie pro/perso retrouvé</li>
            </ul>
          </motion.div>
        </div>

        {/* How it works */}
        <motion.div
          className="mb-16 p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl border-2 border-blue-300"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[48px] leading-none tracking-tight mb-8 text-center">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock size={40} className="text-orange-600" />
              </div>
              <h3 className="text-[28px] tracking-tight mb-2">09h00</h3>
              <p className="text-[16px] text-gray-700">
                Premier lot de la journée. Tous les emails reçus depuis 17h la veille.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock size={40} className="text-purple-600" />
              </div>
              <h3 className="text-[28px] tracking-tight mb-2">17h00</h3>
              <p className="text-[16px] text-gray-700">
                Deuxième et dernier lot. Tous les emails reçus depuis 09h ce matin.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                <BellOff size={40} className="text-indigo-600" />
              </div>
              <h3 className="text-[28px] tracking-tight mb-2">Soirée</h3>
              <p className="text-[16px] text-gray-700">
                Zéro notification. Votre esprit peut se reposer jusqu'à demain matin.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Science */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[48px] leading-none tracking-tight mb-8 text-center">La science derrière</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Brain,
                title: 'Deep Work',
                stat: '23 minutes',
                description: 'C\'est le temps qu\'il faut pour retrouver sa concentration après une interruption (étude UC Irvine).'
              },
              {
                icon: Zap,
                title: 'Productivité',
                stat: '+40%',
                description: 'Amélioration de la productivité avec seulement 2-3 vérifications d\'email par jour (Harvard Business Review).'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="p-6 bg-white border-2 border-gray-300 rounded-2xl hover:shadow-xl transition-all"
                whileHover={{ scale: 1.03 }}
              >
                <item.icon size={40} className="text-blue-600 mb-3" />
                <h3 className="text-[32px] leading-none tracking-tight mb-2">{item.title}</h3>
                <p className="text-[48px] text-blue-600 mb-2">{item.stat}</p>
                <p className="text-[16px] text-gray-700">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Customization (PRO) */}
        <motion.div
          className="mb-16 p-8 bg-black text-white rounded-3xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-[40px] leading-none tracking-tight mb-2">Personnalisable avec PRO</h2>
              <p className="text-[18px] text-gray-300">
                Avec NAELIV PRO, choisissez vos propres horaires de livraison.
              </p>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-full text-[14px] uppercase tracking-wide">
              PRO
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-800 rounded-xl">
              <p className="text-[14px] text-gray-400 mb-1">Option 1</p>
              <p className="text-[18px]">08h00 & 16h00</p>
            </div>
            <div className="p-4 bg-gray-800 rounded-xl">
              <p className="text-[14px] text-gray-400 mb-1">Option 2</p>
              <p className="text-[18px]">10h00 & 18h00</p>
            </div>
            <div className="p-4 bg-gray-800 rounded-xl">
              <p className="text-[14px] text-gray-400 mb-1">Option 3</p>
              <p className="text-[18px]">Personnalisé</p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center p-8 bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl border-2 border-black"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-[40px] leading-none tracking-tight mb-4">Retrouvez votre concentration</h3>
          <p className="text-[18px] text-gray-700 mb-6 max-w-2xl mx-auto">
            Commencez gratuitement avec le Zen Mode à 09h & 17h.
          </p>
          <Link href="/inscription">
            <motion.button
              className="px-8 py-4 bg-black text-white rounded-full text-[16px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Activer le Zen Mode
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Ban, CheckCircle, DollarSign, Users, TrendingUp, Mail, Edit3, Trash2, Clock, Coins, Sliders } from 'lucide-react';
import Link from 'next/link';

export default function PremiumShield() {
  const [activeTab, setActiveTab] = useState('concept');
  const [priceValue, setPriceValue] = useState(0.50);

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
            className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-8"
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Coins size={48} className="text-green-600" />
          </motion.div>
          <h1 className="text-[80px] leading-none tracking-tighter mb-6">Smart Paywall</h1>
          <p className="text-[32px] text-gray-700 max-w-3xl mx-auto">
            Votre attention a un prix
          </p>
          <p className="text-[20px] text-gray-600 max-w-2xl mx-auto mt-4">
            Vous êtes important. Fixez le prix que les inconnus doivent payer pour vous parler.
          </p>
        </motion.div>

        {/* Concept */}
        <motion.div
          className="mb-16 p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl border-2 border-green-300"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[48px] leading-none tracking-tight mb-6">Monétisation de l'attention</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-[28px] tracking-tight mb-4">🔓 Contacts connus</h3>
              <p className="text-[18px] text-gray-700 leading-relaxed">
                Les personnes dans votre carnet d'adresses ou avec qui vous avez déjà échangé 
                peuvent vous écrire gratuitement. Zéro friction.
              </p>
            </div>
            <div>
              <h3 className="text-[28px] tracking-tight mb-4">💰 Nouveaux contacts</h3>
              <p className="text-[18px] text-gray-700 leading-relaxed">
                Fixez le prix du timbre (de 0,10€ à 100€). Les inconnus paient pour vous parler.
                Vous touchez 1% de commission sur chaque email reçu.
              </p>
            </div>
          </div>

          {/* Price Simulator */}
          <div className="bg-white rounded-2xl p-6 border-2 border-green-400">
            <div className="flex items-center gap-3 mb-6">
              <Sliders size={24} className="text-green-600" />
              <h3 className="text-[24px] tracking-tight">Simulateur de prix</h3>
            </div>
            
            <div className="mb-6">
              <label className="block text-[16px] mb-3 text-gray-700">
                Prix du timbre : <span className="text-[24px] text-green-600">{priceValue.toFixed(2)}€</span>
              </label>
              <input
                type="range"
                min="0.10"
                max="100"
                step="0.10"
                value={priceValue}
                onChange={(e) => setPriceValue(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-green-600"
              />
              <div className="flex justify-between text-[12px] text-gray-500 mt-1">
                <span>0,10€</span>
                <span>100€</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-xl">
                <p className="text-[12px] text-gray-600 mb-1">Si 10 personnes vous écrivent :</p>
                <p className="text-[24px] text-green-600">+{(priceValue * 10 * 0.01).toFixed(2)}€</p>
                <p className="text-[11px] text-gray-500">Commission 1%</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <p className="text-[12px] text-gray-600 mb-1">Par mois (30 emails) :</p>
                <p className="text-[24px] text-green-600">+{(priceValue * 30 * 0.01).toFixed(2)}€</p>
                <p className="text-[11px] text-gray-500">Revenu passif</p>
              </div>
            </div>

            <p className="text-[13px] text-gray-600 mt-4 text-center">
              💡 Plus le prix est élevé, moins vous recevez d'emails indésirables, mais plus vous gagnez par contact.
            </p>
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[48px] leading-none tracking-tight mb-8 text-center">Comment ça fonctionne ?</h2>
          <div className="space-y-6">
            {[
              {
                step: '1',
                title: 'Réception d\'un email inconnu',
                description: 'Un email arrive d\'une personne hors de vos contacts.',
                color: '#00CC88'
              },
              {
                step: '2',
                title: 'Notification de timbre',
                description: 'L\'expéditeur reçoit un message automatique : "Cette personne utilise Premium Shield. Pour garantir que votre message est légitime, un timbre de 0,10€ est requis."',
                color: '#00CC88'
              },
              {
                step: '3',
                title: 'Paiement sécurisé',
                description: 'L\'expéditeur paie via Stripe. Rapide, sécurisé, international.',
                color: '#00CC88'
              },
              {
                step: '4',
                title: 'Email livré',
                description: 'Votre email arrive dans l\'inbox. L\'expéditeur est automatiquement ajouté à vos contacts approuvés.',
                color: '#00CC88'
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
                <div className="flex-1">
                  <h3 className="text-[24px] tracking-tight mb-2">{item.title}</h3>
                  <p className="text-[16px] text-gray-700">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[48px] leading-none tracking-tight mb-8 text-center">Pourquoi c'est génial ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Ban,
                title: '0% Spam',
                description: 'Les robots n\'ont pas de carte bancaire. Le spam disparaît instantanément.',
                color: '#DD0000'
              },
              {
                icon: Shield,
                title: 'Protection garantie',
                description: 'Barrière économique infaillible. Seuls les humains légitimes passent.',
                color: '#00CC88'
              },
              {
                icon: TrendingUp,
                title: 'Qualité maximale',
                description: 'Seuls les messages vraiment importants arrivent. Vos contacts sont qualifiés.',
                color: '#0066FF'
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                className="p-6 bg-white border-2 border-gray-300 rounded-2xl hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05, borderColor: benefit.color }}
              >
                <benefit.icon size={40} style={{ color: benefit.color }} className="mb-4" />
                <h3 className="text-[28px] tracking-tight mb-2">{benefit.title}</h3>
                <p className="text-[16px] text-gray-700">{benefit.description}</p>
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
          <h2 className="text-[40px] leading-none tracking-tight mb-8 text-center">Impact réel</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-[64px] text-green-400 mb-2">100%</p>
              <p className="text-[18px] text-gray-300">Réduction du spam</p>
            </div>
            <div>
              <p className="text-[64px] text-green-400 mb-2">2h</p>
              <p className="text-[18px] text-gray-300">Économisées par semaine</p>
            </div>
            <div>
              <p className="text-[64px] text-green-400 mb-2">€€€</p>
              <p className="text-[18px] text-gray-300">Revenu passif généré</p>
            </div>
          </div>
        </motion.div>

        {/* Problem Scenarios */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[48px] leading-none tracking-tight mb-8 text-center">On a tous vécu ça...</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Ban,
                scenario: 'Envoyé au mauvais destinataire',
                example: 'Email confidentiel envoyé à toute l\'équipe au lieu du boss.'
              },
              {
                icon: Edit3,
                scenario: 'Faute d\'orthographe énorme',
                example: 'Vous avez écrit "Cordialement" mais votre clavier a dit autre chose...'
              },
              {
                icon: Trash2,
                scenario: 'Oublié la pièce jointe',
                example: '"Ci-joint le rapport" mais vous n\'avez rien attaché.'
              },
              {
                icon: Clock,
                scenario: 'Ton trop agressif',
                example: 'Email écrit dans la colère qu\'il aurait fallu relire à froid.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="p-6 bg-red-50 border-2 border-red-300 rounded-2xl"
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
              >
                <item.icon size={40} className="text-red-600 mb-3" />
                <h3 className="text-[24px] tracking-tight mb-2">{item.scenario}</h3>
                <p className="text-[16px] text-gray-700">{item.example}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[48px] leading-none tracking-tight mb-8 text-center">Questions fréquentes</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Et si un ami essaie de me contacter pour la première fois ?',
                a: 'Il peut soit payer 0,10€ (que vous recevez), soit vous demander de l\'ajouter à vos contacts via un autre canal (SMS, réseaux sociaux).'
              },
              {
                q: 'C\'est légal ?',
                a: 'Absolument. Vous avez le droit de filtrer qui peut vous contacter. C\'est comme un videur à l\'entrée d\'une boîte de nuit.'
              },
              {
                q: 'Qu\'arrive-t-il si je ne veux pas garder l\'argent ?',
                a: 'Option de reverser vos gains à une association caritative directement depuis les paramètres.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="p-6 bg-gray-50 border-2 border-gray-300 rounded-2xl"
                whileHover={{ borderColor: '#00CC88' }}
              >
                <h3 className="text-[20px] tracking-tight mb-2">{faq.q}</h3>
                <p className="text-[16px] text-gray-700">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl border-2 border-black"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-[40px] leading-none tracking-tight mb-4">Activez votre bouclier</h3>
          <p className="text-[18px] text-gray-700 mb-6 max-w-2xl mx-auto">
            Disponible pour tous les utilisateurs Naeliv. Gratuit ou PRO.
          </p>
          <Link href="/inscription">
            <motion.button
              className="px-8 py-4 bg-black text-white rounded-full text-[16px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Activer Premium Shield
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

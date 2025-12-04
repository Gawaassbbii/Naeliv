"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Pin, Leaf, Database, TrendingDown, Clock, Archive } from 'lucide-react';

interface DetoxDigitaleProps {
  onNavigate?: (page: string) => void;
}

export default function DetoxDigitale({ onNavigate }: DetoxDigitaleProps) {
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
            className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-8"
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Trash2 size={48} className="text-red-600" />
          </motion.div>
          <h1 className="text-[80px] leading-none tracking-tighter mb-6">Détox Digitale</h1>
          <p className="text-[32px] text-gray-700 max-w-3xl mx-auto">
            Auto-Delete après 30 jours
          </p>
          <p className="text-[20px] text-gray-600 max-w-2xl mx-auto mt-4">
            Inbox Zero automatique. Libérez votre esprit et réduisez votre empreinte carbone.
          </p>
        </motion.div>

        {/* Problem */}
        <motion.div
          className="mb-16 p-8 bg-gradient-to-br from-red-50 to-red-100 rounded-3xl border-2 border-red-300"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[48px] leading-none tracking-tight mb-6">Le problème de l'accumulation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-[28px] tracking-tight mb-4">Chiffres chocs</h3>
              <ul className="space-y-3 text-[18px] text-gray-700">
                <li>• L'utilisateur moyen a <strong>8 347 emails non lus</strong></li>
                <li>• Dont <strong>78% ne seront jamais réouverts</strong></li>
                <li>• 1 email stocké 1 an = <strong>10g de CO2</strong></li>
                <li>• Anxiété liée à la "dette numérique"</li>
              </ul>
            </div>
            <div>
              <h3 className="text-[28px] tracking-tight mb-4">La réalité</h3>
              <p className="text-[18px] text-gray-700 leading-relaxed">
                Nous gardons 99% de nos emails "au cas où". Mais statistiquement, 
                si vous n'avez pas ouvert un email en 30 jours, vous ne l'ouvrirez jamais. 
                C'est du stockage inutile qui pollue votre esprit et la planète.
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
          <h2 className="text-[48px] leading-none tracking-tight mb-8 text-center">Le système Naeliv</h2>
          <div className="space-y-4">
            <div className="p-6 bg-white border-2 border-gray-300 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center text-[20px] flex-shrink-0">
                  <Pin size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[28px] tracking-tight mb-2">Emails épinglés = Gardés</h3>
                  <p className="text-[16px] text-gray-700">
                    Vous voulez garder un email important ? Épinglez-le. Simple. Il ne sera jamais supprimé.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-2 border-gray-300 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center text-[20px] flex-shrink-0">
                  ⏰
                </div>
                <div className="flex-1">
                  <h3 className="text-[28px] tracking-tight mb-2">Après 30 jours</h3>
                  <p className="text-[16px] text-gray-700">
                    Tout email non épinglé reçu il y a plus de 30 jours est automatiquement supprimé. 
                    Vous recevez un rappel 7 jours avant.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-2 border-gray-300 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center text-[20px] flex-shrink-0">
                  <Trash2 size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[28px] tracking-tight mb-2">Suppression définitive</h3>
                  <p className="text-[16px] text-gray-700">
                    Les emails sont définitivement supprimés (pas d'archive cachée). 
                    Libération d'espace serveur réel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[48px] leading-none tracking-tight mb-8 text-center">Les bénéfices</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Leaf,
                title: 'Impact écologique',
                description: '-80% d\'empreinte carbone vs Gmail. Chaque email supprimé = CO2 économisé.',
                color: '#00CC88'
              },
              {
                icon: Archive,
                title: 'Clarté mentale',
                description: 'Moins de clutter = moins de stress. Psychologie du minimalisme.',
                color: '#0066FF'
              },
              {
                icon: Database,
                title: 'Efficacité',
                description: 'Gestion optimisée de votre espace de stockage. Plus de temps pour ce qui compte.',
                color: '#FFD700'
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

        {/* Environmental Impact */}
        <motion.div
          className="mb-16 p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl border-2 border-green-300"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[40px] leading-none tracking-tight mb-6 text-center">Impact environnemental</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <p className="text-[64px] text-green-600 mb-2">4 kg</p>
              <p className="text-[18px] text-gray-700">
                CO2 économisé par utilisateur par an
              </p>
              <p className="text-[14px] text-gray-600 mt-2">
                équivalent à 20 km en voiture
              </p>
            </div>
            <div className="text-center">
              <p className="text-[64px] text-green-600 mb-2">-92%</p>
              <p className="text-[18px] text-gray-700">
                Espace serveur utilisé vs Gmail
              </p>
              <p className="text-[14px] text-gray-600 mt-2">
                Moins de datacenters = moins d'énergie
              </p>
            </div>
          </div>
          <div className="mt-8 p-4 bg-white rounded-xl text-center">
            <p className="text-[16px] text-gray-700">
              <strong>Exemple :</strong> Avec 10 000 utilisateurs, Naeliv permettrait d'économiser 40 tonnes de CO2 par an
            </p>
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
                q: 'Et si j\'ai besoin d\'un email après 30 jours ?',
                a: 'Épinglez-le ! C\'est fait pour ça. Les emails épinglés ne sont jamais supprimés. Factures, contrats, souvenirs : épinglez tout ce qui compte.'
              },
              {
                q: 'Je peux désactiver l\'auto-delete ?',
                a: 'Oui, c\'est une option activable/désactivable. Mais on vous encourage à essayer 30 jours. La plupart des utilisateurs adorent et ne reviennent jamais en arrière.'
              },
              {
                q: 'Qu\'arrive-t-il aux pièces jointes ?',
                a: 'Elles sont également supprimées après 30 jours (sauf si l\'email est épinglé). Pensez à télécharger les fichiers importants localement ou sur votre cloud.'
              },
              {
                q: 'C\'est vraiment bon pour l\'environnement ?',
                a: 'Oui ! Les datacenters consomment 1% de l\'électricité mondiale. Moins de stockage = moins d\'énergie = impact réel. Naeliv est certifié neutre en carbone.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="p-6 bg-gray-50 border-2 border-gray-300 rounded-2xl"
                whileHover={{ borderColor: '#DD0000' }}
              >
                <h3 className="text-[20px] tracking-tight mb-2">{faq.q}</h3>
                <p className="text-[16px] text-gray-700">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center p-8 bg-gradient-to-br from-red-50 to-red-100 rounded-3xl border-2 border-black"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-[40px] leading-none tracking-tight mb-4">Libérez-vous</h3>
          <p className="text-[18px] text-gray-700 mb-6 max-w-2xl mx-auto">
            Activez la Détox Digitale et retrouvez une inbox sereine. Pour vous et pour la planète.
          </p>
          <motion.button
            className="px-8 py-4 bg-black text-white rounded-full text-[16px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/inscription'}
          >
            Activer la Détox
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

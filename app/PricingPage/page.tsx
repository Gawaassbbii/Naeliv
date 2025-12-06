"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, ArrowLeft, Shield, Globe, RotateCcw, Moon, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-50 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <div className="flex items-center gap-3">
              <span className="text-[24px] tracking-tighter text-black font-medium">Naeliv</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-[48px] mb-4">Choisissez votre plan</h1>
          <p className="text-[18px] text-gray-600">
            L'email en toute clarté, pour tous
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Essential Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="border-2 border-gray-300 rounded-3xl p-8 bg-white"
          >
            <div className="mb-6">
              <h2 className="text-[32px] mb-2">Naeliv Essential</h2>
              <p className="text-gray-600 text-[16px]">Pour commencer en douceur</p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-[56px]">0€</span>
                <span className="text-gray-600 text-[18px]">/mois</span>
              </div>
              <p className="text-[14px] text-green-600 mt-1">Gratuit pour toujours</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check size={20} className="text-green-600 mt-1 flex-shrink-0" />
                <span className="text-[16px]">pseudo123@naeliv.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={20} className="text-green-600 mt-1 flex-shrink-0" />
                <span className="text-[16px]">5 Go de stockage</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={20} className="text-green-600 mt-1 flex-shrink-0" />
                <span className="text-[16px]">Zen Mode fixe (09h00 & 17h00)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={20} className="text-green-600 mt-1 flex-shrink-0" />
                <span className="text-[16px]">Smart Paywall (0,10€ par défaut)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={20} className="text-green-600 mt-1 flex-shrink-0" />
                <span className="text-[16px]">Immersion Linguistique (Anglais)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={20} className="text-green-600 mt-1 flex-shrink-0" />
                <span className="text-[16px]">Rewind Digital (annulation 10 secondes)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={20} className="text-green-600 mt-1 flex-shrink-0" />
                <span className="text-[16px]">Détox Digitale (conservation des emails)</span>
              </li>
              <li className="flex items-start gap-3 opacity-50">
                <Check size={20} className="text-gray-400 mt-1 flex-shrink-0" />
                <span className="text-[16px] line-through text-gray-400">Naeliv Intelligence</span>
              </li>
            </ul>

            <motion.button
              className="w-full px-8 py-4 border-2 border-black text-black rounded-full hover:bg-gray-50 transition-colors text-[16px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/inscription')}
            >
              Commencer gratuitement
            </motion.button>
          </motion.div>

          {/* PRO Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="border-2 border-purple-600 rounded-3xl p-8 bg-gradient-to-br from-purple-50 to-blue-50 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-[12px] flex items-center gap-1">
              <Zap size={14} />
              POPULAIRE
            </div>

            <div className="mb-6">
              <h2 className="text-[32px] mb-2">Naeliv PRO</h2>
              <p className="text-gray-700 text-[16px]">La puissance complète de Naeliv</p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-[56px]">5€</span>
                <span className="text-gray-700 text-[18px]">/mois</span>
              </div>
              <p className="text-[14px] text-purple-600 mt-1">Sans engagement</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check size={20} className="text-purple-600 mt-1 flex-shrink-0" />
                <span className="text-[16px]">Tout de Naeliv Essential, plus :</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={20} className="text-purple-600 mt-1 flex-shrink-0" />
                <span className="text-[16px]"><strong>Stockage illimité</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <Moon size={20} className="text-purple-600 mt-1 flex-shrink-0" />
                <span className="text-[16px]"><strong>Zen Mode illimité</strong> • Recevez vos emails par lots</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield size={20} className="text-green-600 mt-1 flex-shrink-0" />
                <span className="text-[16px]"><strong>Smart Paywall</strong> • Gagnez de l'argent sur vos emails</span>
              </li>
              <li className="flex items-start gap-3">
                <Globe size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-[16px]"><strong>Immersion Linguistique</strong> • Traduction automatique</span>
              </li>
              <li className="flex items-start gap-3">
                <RotateCcw size={20} className="text-orange-600 mt-1 flex-shrink-0" />
                <span className="text-[16px]"><strong>Rewind illimité</strong> • Annulez vos envois</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap size={20} className="text-purple-600 mt-1 flex-shrink-0" />
                <span className="text-[16px]"><strong>Détox Digitale</strong> • Priorisez vos contacts</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles size={20} className="text-purple-600 mt-1 flex-shrink-0" />
                <span className="text-[16px]"><strong>Naeliv Intelligence</strong> • TL;DR, Ghostwriter, Coach, Smart Sorter</span>
              </li>
            </ul>

            <motion.button
              className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:opacity-90 transition-opacity text-[16px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/inscription')}
            >
              Passer à Naeliv PRO
            </motion.button>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-[32px] mb-8 text-center">Questions fréquentes</h2>
          
          <div className="space-y-6">
            <div className="border border-gray-300 rounded-2xl p-6">
              <h3 className="text-[18px] mb-2">Puis-je changer de plan à tout moment ?</h3>
              <p className="text-[14px] text-gray-600">
                Oui, vous pouvez passer de Naeliv Essential à Naeliv PRO ou résilier votre abonnement PRO à tout moment.
              </p>
            </div>

            <div className="border border-gray-300 rounded-2xl p-6">
              <h3 className="text-[18px] mb-2">Comment fonctionne le Smart Paywall ?</h3>
              <p className="text-[14px] text-gray-600">
                Fixez un prix (0,10€ à 100€) que les expéditeurs inconnus doivent payer pour vous contacter. Vous touchez 1% de commission sur chaque email reçu.
              </p>
            </div>

            <div className="border border-gray-300 rounded-2xl p-6">
              <h3 className="text-[18px] mb-2">Qu'est-ce que le Zen Mode ?</h3>
              <p className="text-[14px] text-gray-600">
                Le Zen Mode regroupe vos emails et les distribue à des heures fixes que vous choisissez (par exemple 9h et 17h), pour éviter les interruptions constantes.
              </p>
            </div>

            <div className="border border-gray-300 rounded-2xl p-6">
              <h3 className="text-[18px] mb-2">Naeliv Essential est-il vraiment gratuit ?</h3>
              <p className="text-[14px] text-gray-600">
                Oui, Naeliv Essential est 100% gratuit pour toujours, avec 5 Go de stockage et accès au Zen Mode limité.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-[16px] text-gray-600 mb-4">
            Encore des questions ?
          </p>
          <motion.button
            className="px-8 py-3 border border-black text-black rounded-full hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/contact')}
          >
            Contactez-nous
          </motion.button>
        </div>
      </div>
    </div>
  );
}


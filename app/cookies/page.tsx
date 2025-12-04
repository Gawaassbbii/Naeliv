"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Cookie, Check, X } from 'lucide-react';

export default function Cookies() {
  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <Cookie size={60} className="text-gray-700" />
            <h1 className="text-[80px] leading-none tracking-tighter">Politique Cookies</h1>
          </div>
          <p className="text-[20px] text-gray-700">
            Dernière mise à jour : 1er décembre 2024
          </p>
        </motion.div>

        {/* Intro */}
        <motion.div
          className="mb-12 p-8 bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl border-2 border-black"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[32px] leading-none tracking-tight mb-4">TL;DR - La version courte</h2>
          <p className="text-[18px] text-gray-700 leading-relaxed">
            Naeliv utilise le strict minimum de cookies nécessaires au fonctionnement. 
            <strong> Zéro cookie de tracking publicitaire.</strong> Vous avez notre parole.
          </p>
        </motion.div>

        {/* What are cookies */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[40px] leading-none tracking-tight mb-4">C'est quoi, un cookie ?</h2>
          <div className="text-[18px] text-gray-700 leading-relaxed space-y-4">
            <p>
              Un cookie est un petit fichier texte stocké sur votre navigateur. 
              Il permet de vous reconnaître lors de vos prochaines visites et de sauvegarder 
              vos préférences.
            </p>
          </div>
        </motion.section>

        {/* Cookie types */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[40px] leading-none tracking-tight mb-6">Les cookies que nous utilisons</h2>
          
          <div className="space-y-6">
            {/* Essential */}
            <div className="p-6 bg-green-50 border-2 border-green-500 rounded-2xl">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-[28px] leading-tight tracking-tight">Cookies essentiels</h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-full text-[12px]">
                  <Check size={14} />
                  <span>ACTIFS</span>
                </div>
              </div>
              <p className="text-[16px] text-gray-700 mb-4">
                Ces cookies sont indispensables au fonctionnement de Naeliv. Sans eux, vous ne pourriez pas vous connecter.
              </p>
              <ul className="space-y-2 text-[16px] text-gray-700">
                <li>• <strong>naeliv_session</strong> - Gère votre connexion (7 jours)</li>
                <li>• <strong>naeliv_lang</strong> - Sauvegarde votre langue préférée (1 an)</li>
                <li>• <strong>naeliv_csrf</strong> - Protection contre les attaques (session)</li>
              </ul>
            </div>

            {/* Analytics */}
            <div className="p-6 bg-gray-50 border-2 border-gray-300 rounded-2xl">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-[28px] leading-tight tracking-tight">Cookies analytiques</h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full text-[12px]">
                  <Check size={14} />
                  <span>OPTIONNELS</span>
                </div>
              </div>
              <p className="text-[16px] text-gray-700 mb-4">
                Nous utilisons une version anonymisée de analytics pour comprendre comment améliorer Naeliv. 
                Aucune donnée personnelle n'est collectée.
              </p>
              <ul className="space-y-2 text-[16px] text-gray-700">
                <li>• <strong>_naeliv_analytics</strong> - Stats anonymes d'utilisation (90 jours)</li>
              </ul>
              <p className="text-[14px] text-gray-600 mt-4">
                Vous pouvez refuser ces cookies dans vos paramètres.
              </p>
            </div>

            {/* Advertising - NONE */}
            <div className="p-6 bg-red-50 border-2 border-red-500 rounded-2xl">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-[28px] leading-tight tracking-tight">Cookies publicitaires</h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-full text-[12px]">
                  <X size={14} />
                  <span>AUCUN</span>
                </div>
              </div>
              <p className="text-[16px] text-gray-700">
                Nous n'utilisons <strong>AUCUN</strong> cookie de tracking publicitaire. 
                Pas de Google Ads, pas de Facebook Pixel, pas de remarketing. Jamais.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Third parties */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[40px] leading-none tracking-tight mb-4">Services tiers</h2>
          <div className="text-[18px] text-gray-700 leading-relaxed space-y-4">
            <p>
              Naeliv utilise certains services externes qui peuvent déposer leurs propres cookies :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Stripe</strong> - Paiements sécurisés (cookies de session)</li>
              <li><strong>AWS CloudFront</strong> - Délivrance rapide du contenu (cookies techniques)</li>
            </ul>
            <p>
              Ces services respectent le RGPD et ne collectent que les données nécessaires à leur fonctionnement.
            </p>
          </div>
        </motion.section>

        {/* Control */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[40px] leading-none tracking-tight mb-4">Gérer vos cookies</h2>
          <div className="text-[18px] text-gray-700 leading-relaxed space-y-4">
            <p><strong>Via Naeliv :</strong></p>
            <p>
              Vous pouvez gérer vos préférences cookies directement depuis vos paramètres de compte.
            </p>
            
            <p><strong>Via votre navigateur :</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Chrome : Paramètres → Confidentialité et sécurité → Cookies</li>
              <li>Firefox : Options → Vie privée et sécurité → Cookies</li>
              <li>Safari : Préférences → Confidentialité → Cookies</li>
            </ul>
            
            <p className="text-gray-600 text-[16px]">
              ⚠️ Attention : Bloquer les cookies essentiels empêchera Naeliv de fonctionner correctement.
            </p>
          </div>
        </motion.section>

        {/* Contact */}
        <motion.div
          className="mt-16 p-8 bg-black text-white rounded-3xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-[32px] leading-none tracking-tight mb-4">Questions sur les cookies ?</h3>
          <p className="text-[18px] text-gray-300 mb-6">
            Notre équipe est là pour vous éclairer.
          </p>
          <a 
            href="mailto:privacy@naeliv.com"
            className="inline-block px-6 py-3 bg-white text-black rounded-full text-[16px]"
          >
            privacy@naeliv.com
          </a>
        </motion.div>
      </div>
    </div>
  );
}


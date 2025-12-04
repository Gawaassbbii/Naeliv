"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Trash2 } from 'lucide-react';

export default function Confidentialite() {
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
          <h1 className="text-[80px] leading-none tracking-tighter mb-6">Politique de Confidentialité</h1>
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
          <h2 className="text-[32px] leading-none tracking-tight mb-4">Notre engagement</h2>
          <p className="text-[18px] text-gray-700 leading-relaxed">
            Chez Naeliv, votre vie privée n'est pas négociable. Contrairement aux géants de la tech, 
            nous ne vendons pas vos données, nous ne les analysons pas pour de la publicité, et nous 
            ne créons pas de profils comportementaux. Simple et clair.
          </p>
        </motion.div>

        {/* Principles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {[
            {
              icon: Shield,
              title: 'Chiffrement de bout en bout',
              description: 'Tous vos emails sont chiffrés. Même nous ne pouvons pas les lire.',
              color: '#0066FF'
            },
            {
              icon: Lock,
              title: 'Zero tracking',
              description: 'Aucun pixel de suivi, aucune analyse comportementale, aucune publicité.',
              color: '#00CC88'
            },
            {
              icon: Eye,
              title: 'Transparence totale',
              description: 'Vous savez exactement ce que nous collectons et pourquoi.',
              color: '#FF6B00'
            },
            {
              icon: Trash2,
              title: 'Suppression facile',
              description: 'Exportez ou supprimez toutes vos données en un clic.',
              color: '#9900FF'
            }
          ].map((principle, index) => (
            <motion.div
              key={index}
              className="p-6 border-2 border-gray-300 rounded-2xl hover:shadow-xl transition-all"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
            >
              <principle.icon size={40} strokeWidth={1.5} style={{ color: principle.color }} className="mb-3" />
              <h3 className="text-[24px] leading-tight tracking-tight mb-2">{principle.title}</h3>
              <p className="text-[16px] text-gray-700">{principle.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[40px] leading-none tracking-tight mb-4">1. Données collectées</h2>
            <div className="text-[18px] text-gray-700 leading-relaxed space-y-4">
              <p>
                <strong>Données d'inscription :</strong> Votre nom, adresse email, mot de passe (hashé), 
                préférences linguistiques.
              </p>
              <p>
                <strong>Données d'utilisation :</strong> Métadonnées techniques (non le contenu) : 
                nombre d'emails envoyés/reçus, timestamp, taille des pièces jointes.
              </p>
              <p>
                <strong>Données de paiement :</strong> Traitées par Stripe. Nous ne stockons jamais 
                vos informations bancaires.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[40px] leading-none tracking-tight mb-4">2. Utilisation des données</h2>
            <div className="text-[18px] text-gray-700 leading-relaxed space-y-4">
              <p>Nous utilisons vos données uniquement pour :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Faire fonctionner le service Naeliv</li>
                <li>Améliorer la sécurité et la performance</li>
                <li>Vous contacter pour des mises à jour importantes</li>
                <li>Respecter nos obligations légales</li>
              </ul>
              <p className="text-red-600">
                ❌ Nous n'utilisons JAMAIS vos données pour de la publicité ciblée ou de la revente.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[40px] leading-none tracking-tight mb-4">3. Partage des données</h2>
            <div className="text-[18px] text-gray-700 leading-relaxed space-y-4">
              <p>
                Vos données ne sont <strong>jamais vendues ni partagées</strong> avec des tiers, 
                sauf dans ces cas très limités :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Stripe pour le traitement des paiements (RGPD compliant)</li>
                <li>Infrastructure cloud sécurisée (AWS Europe, chiffrement actif)</li>
                <li>Obligation légale sur demande d'une autorité compétente</li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[40px] leading-none tracking-tight mb-4">4. Vos droits (RGPD)</h2>
            <div className="text-[18px] text-gray-700 leading-relaxed space-y-4">
              <p>Conformément au RGPD, vous avez le droit de :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Accès :</strong> Télécharger toutes vos données</li>
                <li><strong>Rectification :</strong> Corriger vos informations</li>
                <li><strong>Suppression :</strong> Supprimer votre compte et toutes vos données</li>
                <li><strong>Portabilité :</strong> Exporter vos emails au format standard</li>
                <li><strong>Opposition :</strong> Refuser certains traitements</li>
              </ul>
              <p>
                Pour exercer vos droits : <a href="mailto:privacy@naeliv.com" className="underline text-blue-600">privacy@naeliv.com</a>
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[40px] leading-none tracking-tight mb-4">5. Cookies</h2>
            <div className="text-[18px] text-gray-700 leading-relaxed space-y-4">
              <p>
                Naeliv utilise des cookies strictement nécessaires au fonctionnement (authentification, préférences). 
                Aucun cookie de tracking publicitaire.
              </p>
            </div>
          </motion.section>
        </div>

        {/* Contact */}
        <motion.div
          className="mt-16 p-8 bg-black text-white rounded-3xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-[32px] leading-none tracking-tight mb-4">Questions ?</h3>
          <p className="text-[18px] text-gray-300 mb-6">
            Pour toute question sur cette politique de confidentialité, contactez notre DPO.
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


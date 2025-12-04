"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function Conditions() {
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
          <h1 className="text-[80px] leading-none tracking-tighter mb-6">Conditions Générales d'Utilisation</h1>
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
          <p className="text-[18px] text-gray-700 leading-relaxed">
            Bienvenue sur Naeliv. En utilisant nos services, vous acceptez ces conditions. 
            Nous avons fait de notre mieux pour les rendre claires et compréhensibles. 
            Pas de jargon juridique inutile.
          </p>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-12">
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[40px] leading-none tracking-tight mb-4">1. Acceptation des conditions</h2>
            <div className="text-[18px] text-gray-700 leading-relaxed space-y-4">
              <p>
                En créant un compte Naeliv, vous acceptez ces conditions ainsi que notre 
                Politique de Confidentialité. Si vous n'êtes pas d'accord, n'utilisez pas Naeliv.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[40px] leading-none tracking-tight mb-4">2. Description du service</h2>
            <div className="text-[18px] text-gray-700 leading-relaxed space-y-4">
              <p>
                Naeliv est un service d'email qui propose :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Zen Mode : Livraison d'emails en 2 lots quotidiens</li>
                <li>Premium Shield : Protection anti-spam par timbre payant</li>
                <li>Immersion Linguistique : Apprentissage passif de langues</li>
                <li>Détox Digitale : Suppression automatique après 30 jours</li>
                <li>Rewind : Modification/suppression post-envoi</li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[40px] leading-none tracking-tight mb-4">3. Comptes utilisateur</h2>
            <div className="text-[18px] text-gray-700 leading-relaxed space-y-4">
              <p><strong>3.1 Création de compte</strong></p>
              <p>Vous devez avoir au moins 16 ans pour créer un compte Naeliv.</p>
              
              <p><strong>3.2 Sécurité</strong></p>
              <p>
                Vous êtes responsable de la confidentialité de votre mot de passe. 
                Utilisez un mot de passe fort et unique.
              </p>
              
              <p><strong>3.3 Véracité des informations</strong></p>
              <p>Les informations fournies doivent être exactes et à jour.</p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[40px] leading-none tracking-tight mb-4">4. Tarifs et paiements</h2>
            <div className="text-[18px] text-gray-700 leading-relaxed space-y-4">
              <p><strong>4.1 Naeliv Essential (Gratuit)</strong></p>
              <p>Accès gratuit avec fonctionnalités de base. Aucune carte bancaire requise.</p>
              
              <p><strong>4.2 Naeliv PRO (5€/mois)</strong></p>
              <p>
                Abonnement mensuel renouvelable. Facturation via Stripe. 
                Annulation possible à tout moment depuis les paramètres.
              </p>
              
              <p><strong>4.3 Remboursements</strong></p>
              <p>
                Politique de remboursement de 30 jours pour tout nouvel abonnement PRO. 
                Contactez support@naeliv.com.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[40px] leading-none tracking-tight mb-4">5. Utilisation acceptable</h2>
            <div className="text-[18px] text-gray-700 leading-relaxed space-y-4">
              <p>Vous vous engagez à ne PAS :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Envoyer du spam ou des emails non sollicités en masse</li>
                <li>Diffuser du contenu illégal, haineux ou nuisible</li>
                <li>Violer les droits d'autrui (vie privée, propriété intellectuelle)</li>
                <li>Tenter de compromettre la sécurité de Naeliv</li>
                <li>Utiliser Naeliv pour du phishing ou de l'arnaque</li>
              </ul>
              <p className="text-red-600">
                ⚠️ Toute violation entraînera la suspension immédiate du compte.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[40px] leading-none tracking-tight mb-4">6. Propriété intellectuelle</h2>
            <div className="text-[18px] text-gray-700 leading-relaxed space-y-4">
              <p>
                Le contenu de Naeliv (logo, design, code) est protégé. Vous ne pouvez pas le copier, 
                modifier ou distribuer sans autorisation écrite.
              </p>
              <p>
                Vous conservez tous les droits sur vos emails et pièces jointes.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[40px] leading-none tracking-tight mb-4">7. Limitation de responsabilité</h2>
            <div className="text-[18px] text-gray-700 leading-relaxed space-y-4">
              <p>
                Naeliv est fourni "tel quel". Nous faisons de notre mieux pour garantir un service 
                fiable, mais nous ne garantissons pas une disponibilité 100%.
              </p>
              <p>
                Nous ne sommes pas responsables des dommages indirects liés à l'utilisation 
                (perte de données, interruption d'activité, etc.).
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[40px] leading-none tracking-tight mb-4">8. Résiliation</h2>
            <div className="text-[18px] text-gray-700 leading-relaxed space-y-4">
              <p><strong>8.1 Par vous</strong></p>
              <p>Vous pouvez supprimer votre compte à tout moment depuis les paramètres.</p>
              
              <p><strong>8.2 Par nous</strong></p>
              <p>
                Nous pouvons suspendre ou supprimer votre compte en cas de violation 
                de ces conditions, avec ou sans préavis.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[40px] leading-none tracking-tight mb-4">9. Modifications</h2>
            <div className="text-[18px] text-gray-700 leading-relaxed space-y-4">
              <p>
                Nous pouvons modifier ces conditions à tout moment. Les changements importants 
                vous seront notifiés par email. Continuer à utiliser Naeliv après modification 
                signifie que vous acceptez les nouvelles conditions.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[40px] leading-none tracking-tight mb-4">10. Droit applicable</h2>
            <div className="text-[18px] text-gray-700 leading-relaxed space-y-4">
              <p>
                Ces conditions sont régies par le droit belge. Tout litige sera soumis aux 
                tribunaux de Bruxelles, Belgique.
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
          <h3 className="text-[32px] leading-none tracking-tight mb-4">Questions sur les CGU ?</h3>
          <p className="text-[18px] text-gray-300 mb-6">
            Notre équipe juridique est là pour vous aider.
          </p>
          <a 
            href="mailto:legal@naeliv.com"
            className="inline-block px-6 py-3 bg-white text-black rounded-full text-[16px]"
          >
            legal@naeliv.com
          </a>
        </motion.div>
      </div>
    </div>
  );
}


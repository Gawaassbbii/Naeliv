"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Clock, Edit3, Trash2, CheckCircle, AlertCircle, Briefcase, Heart, BookOpen } from 'lucide-react';

interface RewindProps {
  onNavigate?: (page: string) => void;
}

export default function Rewind({ onNavigate }: RewindProps) {
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
            className="inline-flex items-center justify-center w-24 h-24 bg-purple-100 rounded-full mb-8"
            whileHover={{ scale: 1.1, rotate: -360 }}
            transition={{ duration: 0.6 }}
          >
            <RotateCcw size={48} className="text-purple-600" />
          </motion.div>
          <h1 className="text-[80px] leading-none tracking-tighter mb-6">Rewind</h1>
          <p className="text-[32px] text-gray-700 max-w-3xl mx-auto">
            Le droit à l'erreur
          </p>
          <p className="text-[20px] text-gray-600 max-w-2xl mx-auto mt-4">
            Modifiez ou supprimez un email après l'envoi. Contrôlez votre image professionnelle.
          </p>
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
                icon: AlertCircle,
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

        {/* How it works */}
        <motion.div
          className="mb-16 p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl border-2 border-purple-300"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[48px] leading-none tracking-tight mb-8 text-center">Comment ça marche ?</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-[20px] flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-[24px] tracking-tight mb-2">Vous envoyez un email</h3>
                <p className="text-[16px] text-gray-700">
                  L'email part normalement. Le destinataire le reçoit instantanément (ou au prochain Zen Mode).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-[20px] flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-[24px] tracking-tight mb-2">Fenêtre de Rewind</h3>
                <p className="text-[16px] text-gray-700">
                  <strong>Gratuit :</strong> 10 secondes pour annuler<br/>
                  <strong>PRO :</strong> Modification illimitée pendant 24h
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-[20px] flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-[24px] tracking-tight mb-2">Actions disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <div className="p-3 bg-purple-50 rounded-xl text-center">
                    <Edit3 size={24} className="mx-auto mb-2 text-purple-600" />
                    <p className="text-[14px]">Modifier le contenu</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl text-center">
                    <Trash2 size={24} className="mx-auto mb-2 text-purple-600" />
                    <p className="text-[14px]">Supprimer l'email</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl text-center">
                    <RotateCcw size={24} className="mx-auto mb-2 text-purple-600" />
                    <p className="text-[14px]">Rappeler & renvoyer</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-[20px] flex-shrink-0">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-[24px] tracking-tight mb-2">Mise à jour automatique</h3>
                <p className="text-[16px] text-gray-700">
                  Le destinataire voit la nouvelle version instantanément. Pas besoin de renvoyer manuellement.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Technical Magic */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[48px] leading-none tracking-tight mb-8 text-center">La magie technique</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-white border-2 border-gray-300 rounded-2xl">
              <CheckCircle size={40} className="text-purple-600 mb-4" />
              <h3 className="text-[28px] tracking-tight mb-2">Lien sécurisé unique</h3>
              <p className="text-[16px] text-gray-700 leading-relaxed">
                Chaque email envoyé contient un lien sécurisé (invisible pour le destinataire) 
                qui permet la modification. Le lien expire après la fenêtre de Rewind.
              </p>
            </div>

            <div className="p-6 bg-white border-2 border-gray-300 rounded-2xl">
              <Clock size={40} className="text-purple-600 mb-4" />
              <h3 className="text-[28px] tracking-tight mb-2">Synchronisation temps réel</h3>
              <p className="text-[16px] text-gray-700 leading-relaxed">
                Quand vous modifiez un email, le contenu est mis à jour instantanément chez 
                le destinataire. Il voit toujours la dernière version.
              </p>
            </div>
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
                <li>⏱️ 10 secondes pour annuler</li>
                <li>🚫 Suppression uniquement (pas de modification)</li>
                <li>✅ Parfait pour les gros doigts</li>
              </ul>
            </div>

            <div className="p-8 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-black rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[32px] tracking-tight">Naeliv PRO</h3>
                <div className="px-3 py-1 bg-black text-white rounded-full text-[12px]">5€/mois</div>
              </div>
              <ul className="space-y-3 text-[16px] text-gray-700">
                <li>🕐 Fenêtre de 24h</li>
                <li>✏️ Modification complète du contenu</li>
                <li>📎 Ajout/suppression de pièces jointes</li>
                <li>🎯 Changement de destinataires</li>
                <li>📊 Historique des versions</li>
                <li>♾️ Modifications illimitées</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Use Cases */}
        <motion.div
          className="mb-16 p-8 bg-black text-white rounded-3xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[40px] leading-none tracking-tight mb-6 text-center">Cas d'usage réels</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Briefcase,
                title: 'Business',
                description: 'Corrigez une proposition commerciale avant que le client ne la lise vraiment.'
              },
              {
                icon: BookOpen,
                title: 'Académique',
                description: 'Modifiez votre email au prof si vous avez oublié la politesse.'
              },
              {
                icon: Heart,
                title: 'Personnel',
                description: 'Adoucissez un message envoyé sous le coup de l\'émotion.'
              }
            ].map((useCase, index) => (
              <div key={index} className="text-center p-6 bg-gray-800 rounded-2xl">
                <useCase.icon size={48} className="mx-auto mb-3 text-purple-400" />
                <h3 className="text-[24px] tracking-tight mb-2">{useCase.title}</h3>
                <p className="text-[16px] text-gray-300">{useCase.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl border-2 border-black"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-[40px] leading-none tracking-tight mb-4">Contrôlez votre communication</h3>
          <p className="text-[18px] text-gray-700 mb-6 max-w-2xl mx-auto">
            Essayez Rewind dès maintenant. 10 secondes gratuites, 24h avec PRO.
          </p>
          <motion.button
            className="px-8 py-4 bg-black text-white rounded-full text-[16px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate && onNavigate('inscription')}
          >
            Activer Rewind
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

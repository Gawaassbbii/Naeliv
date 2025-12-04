"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, ArrowRight } from 'lucide-react';

const jobs = [
  {
    title: 'Développeur Full-Stack Senior',
    department: 'Engineering',
    location: 'Bruxelles / Remote',
    type: 'Temps plein',
    description: 'Nous recherchons un développeur passionné pour construire l\'avenir de Naeliv.',
    color: '#0066FF'
  },
  {
    title: 'Designer UX/UI',
    department: 'Design',
    location: 'Bruxelles',
    type: 'Temps plein',
    description: 'Créez des expériences utilisateur exceptionnelles avec notre équipe design.',
    color: '#00CC88'
  },
  {
    title: 'Marketing Manager',
    department: 'Marketing',
    location: 'Remote',
    type: 'Temps plein',
    description: 'Aidez-nous à faire connaître Naeliv auprès de millions d\'utilisateurs.',
    color: '#FF6B00'
  },
  {
    title: 'Customer Success Specialist',
    department: 'Support',
    location: 'Bruxelles',
    type: 'Temps partiel',
    description: 'Soyez le premier point de contact pour nos utilisateurs et partenaires.',
    color: '#9900FF'
  }
];

const perks = [
  {
    title: 'Salaire compétitif',
    description: 'Équité salariale et transparence totale'
  },
  {
    title: 'Remote flexible',
    description: 'Travaillez d\'où vous voulez, quand vous voulez'
  },
  {
    title: 'Congés illimités',
    description: 'Nous faisons confiance à notre équipe'
  },
  {
    title: 'Équipement premium',
    description: 'MacBook, écrans, casque, tout ce qu\'il faut'
  },
  {
    title: 'Formation continue',
    description: 'Budget dédié pour votre développement'
  },
  {
    title: 'Stock options',
    description: 'Participez à la réussite de Naeliv'
  }
];

export default function Carrieres() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-[80px] leading-none tracking-tighter mb-6">Rejoignez Naeliv</h1>
          <p className="text-[24px] text-gray-700 max-w-3xl mx-auto">
            Construisons ensemble l'avenir de l'email. Nous cherchons des talents passionnés pour révolutionner la communication.
          </p>
        </motion.div>

        {/* Culture */}
        <motion.div
          className="mb-16 p-8 bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl border-2 border-black"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[48px] leading-none tracking-tight mb-6">Notre Culture</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[18px] text-gray-700">
            <div>
              <h3 className="text-[24px] tracking-tight mb-2 text-black">🎯 Impact</h3>
              <p>Chaque membre de l'équipe a un impact direct sur le produit et les utilisateurs.</p>
            </div>
            <div>
              <h3 className="text-[24px] tracking-tight mb-2 text-black">🚀 Autonomie</h3>
              <p>Nous embauchons des adultes responsables, pas des exécutants.</p>
            </div>
            <div>
              <h3 className="text-[24px] tracking-tight mb-2 text-black">🌍 Diversité</h3>
              <p>Une équipe multilingue et multiculturelle au cœur de l'Europe.</p>
            </div>
          </div>
        </motion.div>

        {/* Jobs */}
        <div className="mb-16">
          <h2 className="text-[48px] leading-none tracking-tight mb-8">Postes ouverts</h2>
          <div className="space-y-4">
            {jobs.map((job, index) => (
              <motion.div
                key={index}
                className="bg-white border-2 border-gray-300 rounded-2xl p-6 hover:shadow-xl transition-all cursor-pointer group"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 10 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-[32px] leading-none tracking-tight">{job.title}</h3>
                      <span 
                        className="px-3 py-1 rounded-full text-white text-[12px] uppercase tracking-wide"
                        style={{ backgroundColor: job.color }}
                      >
                        {job.department}
                      </span>
                    </div>
                    <p className="text-[16px] text-gray-700 mb-3">{job.description}</p>
                    <div className="flex items-center gap-4 text-[14px] text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{job.type}</span>
                      </div>
                    </div>
                  </div>
                  <motion.div
                    className="flex items-center gap-2 text-[14px]"
                    style={{ color: job.color }}
                  >
                    <span>Postuler</span>
                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Perks */}
        <div className="mb-16">
          <h2 className="text-[48px] leading-none tracking-tight mb-8">Avantages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map((perk, index) => (
              <motion.div
                key={index}
                className="p-6 bg-white border-2 border-gray-300 rounded-2xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, borderColor: '#000' }}
              >
                <h3 className="text-[24px] leading-tight tracking-tight mb-2">{perk.title}</h3>
                <p className="text-[16px] text-gray-700">{perk.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          className="text-center p-8 bg-black text-white rounded-3xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-[40px] leading-none tracking-tight mb-4">Candidature spontanée</h3>
          <p className="text-[18px] text-gray-300 mb-6 max-w-2xl mx-auto">
            Vous ne voyez pas le poste idéal ? Envoyez-nous votre profil, on reste en contact.
          </p>
          <motion.button
            className="px-8 py-4 bg-white text-black rounded-full text-[16px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Envoyer mon CV
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}


"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Clock, HelpCircle } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-[80px] leading-none tracking-tighter mb-6">Contactez-nous</h1>
          <p className="text-[24px] text-gray-700 max-w-3xl mx-auto">
            Une question ? Une suggestion ? Notre équipe est là pour vous aider.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gray-50 p-8 rounded-3xl border-2 border-gray-300">
              <h2 className="text-[40px] leading-none tracking-tight mb-6">Envoyez-nous un message</h2>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-[14px] uppercase tracking-wide text-gray-600 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                    placeholder="Jean Dupont"
                  />
                </div>

                <div>
                  <label className="block text-[14px] uppercase tracking-wide text-gray-600 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                    placeholder="jean@exemple.com"
                  />
                </div>

                <div>
                  <label className="block text-[14px] uppercase tracking-wide text-gray-600 mb-2">
                    Sujet
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                    placeholder="Question sur NAELIV PRO"
                  />
                </div>

                <div>
                  <label className="block text-[14px] uppercase tracking-wide text-gray-600 mb-2">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors resize-none"
                    placeholder="Votre message..."
                  />
                </div>

                <motion.button
                  type="submit"
                  className="w-full py-4 bg-black text-white rounded-xl flex items-center justify-center gap-2 text-[16px]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Send size={20} />
                  Envoyer le message
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div>
              <h2 className="text-[40px] leading-none tracking-tight mb-6">Informations</h2>
              <p className="text-[18px] text-gray-700 leading-relaxed mb-8">
                Notre équipe répond généralement dans les 24 heures (jours ouvrables).
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4 mb-6">
              <motion.div
                className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-300"
                whileHover={{ scale: 1.03 }}
              >
                <Mail size={32} className="text-blue-600 mb-3" />
                <h3 className="text-[20px] tracking-tight mb-1">Email</h3>
                <p className="text-[16px] text-gray-700">contact@naeliv.com</p>
                <a 
                  href="mailto:contact@naeliv.com"
                  className="text-[14px] text-blue-600 hover:underline mt-2 inline-block"
                >
                  Envoyer un email →
                </a>
              </motion.div>

              <motion.div
                className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-300"
                whileHover={{ scale: 1.03 }}
              >
                <Clock size={32} className="text-purple-600 mb-3" />
                <h3 className="text-[20px] tracking-tight mb-1">Temps de réponse</h3>
                <p className="text-[16px] text-gray-700">
                  Lundi - Vendredi<br />
                  9h00 - 18h00 CET
                </p>
              </motion.div>
            </div>

            {/* FAQ Link */}
            <motion.div
              className="p-6 bg-black text-white rounded-2xl"
              whileHover={{ scale: 1.03 }}
              onClick={() => window.location.href = '/faq'}
              style={{ cursor: 'pointer' }}
            >
              <div className="flex items-start gap-3 mb-3">
                <HelpCircle size={24} className="text-white mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-[24px] tracking-tight mb-2">Questions fréquentes ?</h3>
                  <p className="text-[16px] text-gray-300 mb-4">
                    Consultez notre FAQ pour des réponses rapides.
                  </p>
                </div>
              </div>
              <button className="px-6 py-2 bg-white text-black rounded-full text-[14px] hover:bg-gray-100 transition-colors">
                Voir la FAQ
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


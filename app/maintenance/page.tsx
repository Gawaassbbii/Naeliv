"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Construction, Mail, Clock } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-6">
      <motion.div
        className="max-w-2xl w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <h1 className="text-5xl font-medium text-gray-900 mb-2">Naeliv</h1>
          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
            BETA
          </span>
        </motion.div>

        {/* Icon */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
            <Construction className="w-12 h-12 text-purple-600" />
          </div>
        </motion.div>

        {/* Message */}
        <motion.h2
          className="text-3xl font-bold text-gray-900 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Site en maintenance
        </motion.h2>

        <motion.p
          className="text-lg text-gray-600 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Nous travaillons actuellement sur l'amélioration de Naeliv.
          <br />
          Le site sera bientôt disponible !
        </motion.p>

        {/* Features */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <Mail className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Email sécurisé</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Bientôt disponible</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <Construction className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">En développement</p>
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          className="text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p>Pour toute question, contactez-nous à :</p>
          <a
            href="mailto:contact@naeliv.com"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            contact@naeliv.com
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}


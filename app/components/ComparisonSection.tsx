"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { X, Check } from 'lucide-react';

const comparisons = [
  { gmail: 'Notifications 24/7', naeliv: 'Livraisons à 09h & 17h' },
  { gmail: '100+ spams par semaine', naeliv: '0 spam garanti' },
  { gmail: 'Vos données vendues', naeliv: 'Vos données privées' },
  { gmail: 'Inbox saturée', naeliv: 'Auto-nettoyage 30 jours' },
  { gmail: 'Email impossible à modifier', naeliv: 'Rewind & édition post-envoi' },
];

export function ComparisonSection() {
  return (
    <section className="py-24 px-6 bg-gray-800 text-white relative overflow-hidden border-y border-gray-700">
      {/* Animated background */}
      <motion.div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-600 to-green-600 opacity-10"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[64px] leading-none font-sans font-bold tracking-tight mb-4 text-black">
            Gmail vs Naeliv
          </h2>
          <p className="text-[24px] text-gray-300">
            L'antithèse de ce que vous connaissez
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {/* Gmail Column */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-6">
              <h3 className="text-[32px] text-gray-400">Gmail</h3>
            </div>
            {comparisons.map((item, index) => (
              <motion.div
                key={index}
                className="bg-red-500 bg-opacity-10 border border-red-500 rounded-2xl p-4 flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <X size={20} className="text-red-500 flex-shrink-0" />
                <span className="text-[16px] text-gray-300">{item.gmail}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Naeliv Column */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-6">
              <h3 className="text-[32px]">Naeliv</h3>
            </div>
            {comparisons.map((item, index) => (
              <motion.div
                key={index}
                className="bg-green-500 bg-opacity-20 border-2 border-green-500 rounded-2xl p-4 flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, borderColor: '#00FF88' }}
              >
                <Check size={20} className="text-green-400 flex-shrink-0" />
                <span className="text-[16px]">{item.naeliv}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/inscription">
            <motion.button
              className="px-12 py-5 bg-white text-black rounded-full text-[18px] shadow-2xl"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(255,255,255,0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              Passer à Naeliv maintenant →
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

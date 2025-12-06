"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="py-16 px-6 relative overflow-hidden bg-gray-800">
      {/* Animated background */}
      <motion.div 
        className="absolute top-0 left-1/2 w-[800px] h-[400px] rounded-full bg-gradient-to-br from-blue-500 to-green-500 opacity-5"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 180, 0]
        }}
        transition={{ 
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/">
              <div className="flex items-center gap-3 mb-4 cursor-pointer">
              <motion.h3 
                className="text-[40px] leading-none font-sans font-bold tracking-tight text-white"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                Naeliv
              </motion.h3>
              </div>
            </Link>
            <p className="text-[14px] text-gray-300 mb-2">L'Email, en toute clarté.</p>
            <p className="text-[12px] tracking-wide text-gray-500">DESIGNED IN BRUSSELS</p>
          </motion.div>

          {/* Product */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-[16px] uppercase tracking-wide mb-4 text-gray-400">Produit</h4>
            <ul className="space-y-2 text-[14px]">
              {[
                { label: 'Zen Mode', page: 'zen-mode' },
                { label: 'Premium Shield', page: 'premium-shield' },
                { label: 'Immersion Linguistique', page: 'immersion-linguistique' },
                { label: 'Détox Digitale', page: 'detox-digitale' },
                { label: 'Rewind', page: 'rewind' }
              ].map((item, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href={`/${item.page}`}>
                    <button className="text-gray-300 hover:text-white transition-colors">
                      {item.label}
                    </button>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-[16px] uppercase tracking-wide mb-4 text-gray-400">Entreprise</h4>
            <ul className="space-y-2 text-[14px]">
              {[
                { label: 'À propos', page: 'a-propos' },
                { label: 'Contact', page: 'contact' },
                { label: 'FAQ', page: 'faq' }
              ].map((item, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href={`/${item.page}`}>
                    <button className="text-gray-300 hover:text-white transition-colors">
                      {item.label}
                    </button>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom */}
        <motion.div 
          className="pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-[12px] text-gray-500">
            © 2025 Naeliv. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-[12px]">
            {[
              { label: 'Confidentialité', page: '/confidentialite' },
              { label: 'Conditions', page: '/conditions' },
              { label: 'Cookies', page: '/cookies' }
            ].map((item, index) => (
              <Link key={index} href={item.page}>
                <motion.button
                  className="text-gray-300 hover:text-white transition-colors"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                </motion.button>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Shield, Brain, Trash2, RotateCcw, ArrowRight, Ban, CheckCircle2, DollarSign, Coins } from 'lucide-react';
import Link from 'next/link';

const visualFeatures = [
  {
    icon: Clock,
    title: 'Zen Mode',
    tagline: '2x par jour seulement',
    visual: 'focus',
    color: '#0066FF',
    stats: { before: '47 notifications/jour', after: '2 livraisons/jour' },
    hasSlider: false
  },
  {
    icon: Coins,
    title: 'Votre attention a un prix',
    tagline: 'Fixez votre tarif de 0,10€ à 100€',
    visual: 'shield',
    color: '#00CC88',
    stats: { before: '23 spams/jour', after: '+12,40€ ce mois' },
    hasSlider: true
  },
  {
    icon: Brain,
    title: 'Immersion Linguistique',
    tagline: 'Apprenez en lisant',
    visual: 'learn',
    color: '#FF6B00',
    stats: { before: 'Interface FR', after: 'FR + ENG + DE' },
    hasSlider: false
  }
];

export function VisualFeatures() {
  const [sliderValue, setSliderValue] = useState(12.50);

  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[64px] leading-none font-sans font-bold tracking-tight mb-4 text-black">
            Simple. Visuel. Efficace.
          </h2>
          <p className="text-[24px] text-gray-700">
            Comprenez en un coup d'œil ce qui change votre vie
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {visualFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="border-2 border-gray-300 rounded-3xl overflow-hidden bg-white hover:shadow-2xl transition-shadow hover:border-gray-400">
                {/* Visual Section */}
                <div className="relative h-64 flex flex-col items-center justify-center p-8" style={{ backgroundColor: `${feature.color}15` }}>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <feature.icon size={80} strokeWidth={1.5} style={{ color: feature.color }} />
                  </motion.div>

                  {/* Slider for Smart Paywall */}
                  {feature.hasSlider && (
                    <motion.div 
                      className="absolute bottom-8 left-6 right-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] text-gray-500">0,10€</span>
                          <span className="text-[16px] text-green-600">{sliderValue.toFixed(2)}€</span>
                          <span className="text-[10px] text-gray-500">100€</span>
                        </div>
                        <input
                          type="range"
                          min="0.10"
                          max="100"
                          step="0.10"
                          value={sliderValue}
                          onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-green-600"
                          style={{
                            background: `linear-gradient(to right, #00CC88 0%, #00CC88 ${((sliderValue - 0.10) / (100 - 0.10)) * 100}%, #e5e7eb ${((sliderValue - 0.10) / (100 - 0.10)) * 100}%, #e5e7eb 100%)`
                          }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Floating stats */}
                  {!feature.hasSlider && (
                    <>
                      <motion.div
                        className="absolute top-4 left-4 bg-white rounded-full px-3 py-1 text-[10px] border border-gray-300 shadow-lg text-gray-700"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Ban size={10} className="inline mr-1 text-red-500" />
                        {feature.stats.before}
                      </motion.div>
                      <motion.div
                        className="absolute bottom-4 right-4 text-white rounded-full px-3 py-1 text-[10px] shadow-lg"
                        style={{ backgroundColor: feature.color }}
                        animate={{ y: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      >
                        <CheckCircle2 size={10} className="inline mr-1" />
                        {feature.stats.after}
                      </motion.div>
                    </>
                  )}

                  {/* Stats for slider card */}
                  {feature.hasSlider && (
                    <>
                      <motion.div
                        className="absolute top-4 left-4 bg-white rounded-full px-3 py-1 text-[10px] border border-gray-300 shadow-lg text-gray-700"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Ban size={10} className="inline mr-1 text-red-500" />
                        {feature.stats.before}
                      </motion.div>
                      <motion.div
                        className="absolute top-4 right-4 text-white rounded-full px-3 py-1 text-[10px] shadow-lg"
                        style={{ backgroundColor: feature.color }}
                        animate={{ y: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      >
                        <CheckCircle2 size={10} className="inline mr-1" />
                        {feature.stats.after}
                      </motion.div>
                    </>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <h3 className="text-[32px] leading-none tracking-tight mb-2 text-black">
                    {feature.title}
                  </h3>
                  <p className="text-[16px] text-gray-600 mb-4">
                    {feature.tagline}
                  </p>
                  <Link href={index === 0 ? '/zen-mode' : index === 1 ? '/premium-shield' : '/immersion-linguistique'}>
                    <motion.button
                      className="flex items-center gap-2 text-[14px] group"
                      style={{ color: feature.color }}
                      whileHover={{ x: 5 }}
                    >
                      Découvrir
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

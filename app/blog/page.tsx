"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';

const blogPosts = [
  {
    title: 'Pourquoi nous avons créé Naeliv',
    excerpt: 'L\'histoire de la création de Naeliv et notre vision pour l\'avenir de l\'email.',
    date: '15 Nov 2024',
    author: 'Équipe Naeliv',
    category: 'Entreprise',
    color: '#0066FF'
  },
  {
    title: 'Le vrai coût du spam',
    excerpt: 'Une analyse détaillée de l\'impact du spam sur la productivité et la santé mentale.',
    date: '8 Nov 2024',
    author: 'Marie Dubois',
    category: 'Recherche',
    color: '#00CC88'
  },
  {
    title: 'Apprendre l\'anglais en gérant ses emails',
    excerpt: 'Comment l\'immersion linguistique passive peut transformer votre apprentissage.',
    date: '1 Nov 2024',
    author: 'Alex Bernard',
    category: 'Éducation',
    color: '#FF6B00'
  },
  {
    title: 'Zen Mode : La science derrière',
    excerpt: 'Les études qui prouvent l\'efficacité de la réduction des notifications.',
    date: '25 Oct 2024',
    author: 'Dr. Sophie Laurent',
    category: 'Science',
    color: '#9900FF'
  },
  {
    title: 'L\'impact écologique de l\'email',
    excerpt: 'Comment Naeliv réduit votre empreinte carbone numérique avec l\'auto-delete.',
    date: '18 Oct 2024',
    author: 'Thomas Green',
    category: 'Environnement',
    color: '#00CC88'
  },
  {
    title: 'Le modèle freemium expliqué',
    excerpt: 'Pourquoi nous croyons en un modèle transparent et respectueux.',
    date: '10 Oct 2024',
    author: 'Équipe Naeliv',
    category: 'Business',
    color: '#0066FF'
  }
];

export default function Blog() {
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
          <h1 className="text-[80px] leading-none tracking-tighter mb-6">Blog Naeliv</h1>
          <p className="text-[24px] text-gray-700 max-w-3xl mx-auto">
            Réflexions, analyses et actualités sur l'avenir de l'email et de la productivité.
          </p>
        </motion.div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.article
              key={index}
              className="bg-white border-2 border-gray-300 rounded-3xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              {/* Category Badge */}
              <div className="h-48 flex items-center justify-center relative" style={{ backgroundColor: `${post.color}15` }}>
                <div 
                  className="px-4 py-2 rounded-full text-white text-[14px] uppercase tracking-wide"
                  style={{ backgroundColor: post.color }}
                >
                  {post.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="text-[28px] leading-tight tracking-tight mb-3 group-hover:text-gray-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-[16px] text-gray-600 mb-4 leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-[12px] text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{post.author}</span>
                  </div>
                </div>

                {/* Read More */}
                <motion.div 
                  className="flex items-center gap-2 text-[14px] group-hover:gap-4 transition-all"
                  style={{ color: post.color }}
                >
                  <span>Lire l'article</span>
                  <ArrowRight size={16} />
                </motion.div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Newsletter */}
        <motion.div
          className="mt-16 p-8 bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl border-2 border-black text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-[40px] leading-none tracking-tight mb-4">Newsletter Naeliv</h3>
          <p className="text-[18px] text-gray-700 mb-6 max-w-2xl mx-auto">
            Recevez nos meilleurs articles et actualités directement dans votre inbox. Une fois par mois, pas de spam.
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="votre@email.com"
              className="flex-1 px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
            />
            <motion.button
              className="px-6 py-3 bg-black text-white rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              S'inscrire
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


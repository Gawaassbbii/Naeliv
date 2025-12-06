"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Key, X } from 'lucide-react';

export default function MaintenancePage() {
  const [showBetaModal, setShowBetaModal] = useState(false);
  const [betaCode, setBetaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/beta/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: betaCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Code incorrect ou expiré');
        setLoading(false);
        return;
      }

      // Créer le cookie naeliv_beta_access avec durée de 30 jours
      const expires = new Date();
      expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 jours
      document.cookie = `naeliv_beta_access=true; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

      // Recharger la page
      window.location.reload();
    } catch (err: any) {
      console.error('Erreur lors de la vérification du code:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full text-center space-y-8 bg-white rounded-2xl shadow-xl p-12"
        >
          {/* Icône */}
          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
            className="flex justify-center"
          >
            <Settings size={80} className="text-orange-500" />
          </motion.div>

          {/* Titre */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[48px] font-bold tracking-tight text-black"
          >
            Maintenance en cours
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-[18px] text-gray-700 leading-relaxed"
          >
            Le site est actuellement en maintenance. Nous serons de retour très bientôt.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-[16px] text-gray-600"
          >
            Nous effectuons des mises à jour pour améliorer votre expérience.
          </motion.p>

          {/* Message de contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="pt-6 border-t border-gray-200 mt-6"
          >
            <p className="text-[14px] text-gray-600 mb-2">
              Si vous avez des questions ou vous voulez tester la version bêta, écrivez-nous à l'adresse suivante :
            </p>
            <a 
              href="mailto:support@naeliv.com" 
              className="text-[14px] text-purple-600 hover:text-purple-700 hover:underline font-medium"
            >
              support@naeliv.com
            </a>
          </motion.div>

          {/* Bouton Code d'accès */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="pt-4"
          >
            <button
              onClick={() => setShowBetaModal(true)}
              className="px-6 py-2 text-[14px] text-gray-600 hover:text-black border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              J'ai un code d'accès
            </button>
          </motion.div>

          {/* Animation de pulsation */}
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="text-gray-500 text-[14px] mt-8"
          >
            Veuillez patienter...
          </motion.div>
        </motion.div>
      </div>

      {/* Modal de code bêta */}
      {showBetaModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 relative"
          >
            <button
              onClick={() => {
                setShowBetaModal(false);
                setBetaCode('');
                setError('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key size={32} className="text-purple-600" />
              </div>
              <h2 className="text-[28px] font-bold text-center text-black mb-2">
                Code d'accès Bêta
              </h2>
              <p className="text-[14px] text-gray-600 text-center">
                Entrez votre code d'accès privé
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-gray-700 mb-2">
                  Code
                </label>
                <input
                  type="text"
                  value={betaCode}
                  onChange={(e) => {
                    setBetaCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder="NAELIV-XXXX"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-[14px] font-mono uppercase focus:outline-none focus:border-purple-600 transition-colors"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[14px] text-red-600">
                  {error}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 text-white rounded-xl text-[14px] font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? 'Vérification...' : 'Entrer'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}
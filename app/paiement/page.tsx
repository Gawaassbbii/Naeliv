"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Check, CreditCard, Lock, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/app/contexts/ThemeContext";

export default function PaiementPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/connexion');
        return;
      }
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      // Mettre à jour le plan de l'utilisateur dans Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ plan: 'pro' })
        .eq('id', user.id);

      if (error) {
        console.error('Erreur lors de la mise à jour du plan:', error);
        alert('Erreur lors de la mise à jour. Veuillez réessayer.');
        setProcessing(false);
        return;
      }

      // Ici, vous intégreriez normalement un système de paiement réel (Stripe, etc.)
      // Pour l'instant, on simule juste la mise à jour du plan
      
      alert('Votre abonnement Naeliv PRO a été activé avec succès !');
      router.push('/mail');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="border-b border-gray-300 dark:border-gray-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft size={20} />
            <span className="text-[14px]">Retour</span>
          </motion.button>
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-gray-500 dark:text-gray-400" />
            <span className="text-[12px] text-gray-500 dark:text-gray-400">Paiement sécurisé</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-[40px] font-bold text-black dark:text-white mb-4">
            Passer à Naeliv PRO
          </h1>
          <p className="text-[18px] text-gray-600 dark:text-gray-400">
            Débloquez toutes les fonctionnalités premium
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Plan Details */}
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-8 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-[14px] font-medium flex items-center gap-2">
                  <Zap size={16} />
                  <span>Naeliv PRO</span>
                </div>
                <span className="px-3 py-1 bg-black dark:bg-white text-white dark:text-black rounded-full text-[12px] font-medium">
                  POPULAIRE
                </span>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-[48px] font-bold text-black dark:text-white">5€</span>
                  <span className="text-[18px] text-gray-600 dark:text-gray-400">/mois</span>
                </div>
                <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-2">
                  Facturé mensuellement, annulable à tout moment
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-[14px] text-gray-700 dark:text-gray-300">
                  Tout Naeliv Essential
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-[14px] text-gray-700 dark:text-gray-300">
                  Smart Paywall avec réglage du prix (0,10€ à 100€)
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-[14px] text-gray-700 dark:text-gray-300">
                  Immersion Linguistique (toutes les langues)
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-[14px] text-gray-700 dark:text-gray-300">
                  Rewind jusqu'à 60 secondes
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-[14px] text-gray-700 dark:text-gray-300">
                  Stockage illimité
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-[14px] text-gray-700 dark:text-gray-300">
                  Support prioritaire
                </span>
              </div>
            </div>
          </div>

          {/* Right: Payment Form */}
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-8 shadow-sm">
            <h2 className="text-[24px] font-bold text-black dark:text-white mb-6">
              Informations de paiement
            </h2>

            <div className="space-y-6">
              {/* Card Number */}
              <div>
                <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Numéro de carte
                </label>
                <div className="relative">
                  <CreditCard size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400"
                    maxLength={19}
                  />
                </div>
              </div>

              {/* Expiry and CVC */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date d'expiration
                  </label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CVC
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400"
                    maxLength={3}
                  />
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom sur la carte
                </label>
                <input
                  type="text"
                  placeholder="Jean Dupont"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400"
                />
              </div>

              {/* Billing Email */}
              <div>
                <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email de facturation
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-[14px] bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                />
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-gray-300 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[16px] font-medium text-gray-700 dark:text-gray-300">
                    Total
                  </span>
                  <span className="text-[24px] font-bold text-black dark:text-white">
                    5,00€
                  </span>
                </div>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 mb-6">
                  Facturé mensuellement. Vous pouvez annuler à tout moment.
                </p>
              </div>

              {/* Submit Button */}
              <motion.button
                onClick={handlePayment}
                disabled={processing}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-[16px] font-semibold hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={!processing ? { scale: 1.02 } : {}}
                whileTap={!processing ? { scale: 0.98 } : {}}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    <span>Confirmer et payer 5€/mois</span>
                  </>
                )}
              </motion.button>

              <p className="text-[12px] text-gray-500 dark:text-gray-400 text-center">
                En confirmant, vous acceptez nos{" "}
                <a href="/conditions" className="underline hover:text-black dark:hover:text-white">
                  conditions d'utilisation
                </a>{" "}
                et notre{" "}
                <a href="/confidentialite" className="underline hover:text-black dark:hover:text-white">
                  politique de confidentialité
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


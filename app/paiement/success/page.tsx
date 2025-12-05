"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Mail, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/app/contexts/ThemeContext";
import Link from "next/link";

// Forcer le rendu dynamique pour éviter les erreurs de pré-rendu
export const dynamic = 'force-dynamic';

function PaiementSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/connexion');
        return;
      }
      setUser(user);
      
      // Récupérer le session_id depuis l'URL
      const sessionIdParam = searchParams.get('session_id');
      setSessionId(sessionIdParam);
      
      setLoading(false);
    };
    checkUser();
  }, [router, searchParams]);

  const handleContinue = () => {
    router.push('/mail');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle size={48} className="text-green-600 dark:text-green-400" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", duration: 0.5 }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
            >
              <CheckCircle size={20} className="text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-[40px] font-bold text-black dark:text-white mb-4">
            Paiement réussi !
          </h1>
          <p className="text-[18px] text-gray-600 dark:text-gray-400 mb-2">
            Félicitations, votre abonnement Naeliv PRO est maintenant actif.
          </p>
          {sessionId && (
            <p className="text-[14px] text-gray-500 dark:text-gray-500">
              Référence : {sessionId.substring(0, 20)}...
            </p>
          )}
        </motion.div>

        {/* Features Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-[14px] font-medium flex items-center gap-2">
              <Zap size={16} />
              <span>Naeliv PRO</span>
            </div>
            <span className="px-3 py-1 bg-black dark:bg-white text-white dark:text-black rounded-full text-[12px] font-medium">
              ACTIF
            </span>
          </div>

          <h2 className="text-[24px] font-bold text-black dark:text-white mb-4">
            Vous avez maintenant accès à :
          </h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-[14px] text-gray-700 dark:text-gray-300">
                Smart Paywall avec réglage du prix (0,10€ à 100€)
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-[14px] text-gray-700 dark:text-gray-300">
                Immersion Linguistique (toutes les langues)
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-[14px] text-gray-700 dark:text-gray-300">
                Rewind jusqu'à 60 secondes
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-[14px] text-gray-700 dark:text-gray-300">
                Stockage illimité
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-[14px] text-gray-700 dark:text-gray-300">
                Support prioritaire
              </span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <motion.button
            onClick={handleContinue}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-6 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium text-[16px] flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            <Mail size={20} />
            <span>Accéder à ma boîte mail</span>
            <ArrowRight size={20} />
          </motion.button>

          <Link
            href="/"
            className="flex-1 px-6 py-4 border-2 border-gray-300 dark:border-gray-700 text-black dark:text-white rounded-full font-medium text-[16px] flex items-center justify-center gap-2 hover:border-black dark:hover:border-white transition-colors"
          >
            Retour à l'accueil
          </Link>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
        >
          <p className="text-[13px] text-blue-700 dark:text-blue-300 text-center">
            💡 <strong>Astuce :</strong> Un email de confirmation vous a été envoyé à{" "}
            <strong>{user?.email}</strong> avec tous les détails de votre abonnement.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaiementSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        </div>
      }
    >
      <PaiementSuccessContent />
    </Suspense>
  );
}


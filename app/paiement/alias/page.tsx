"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Check, CreditCard, Lock, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/app/contexts/ThemeContext";

export default function AliasPaymentPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string>('');
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
      
      // Récupérer le username depuis le profil
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();
      
      if (profile?.username) {
        setUsername(profile.username);
      }
      
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      // Récupérer le token d'authentification
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/connexion');
        return;
      }

      // Créer une session de checkout Stripe pour l'achat d'alias
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          productType: 'alias', // 'alias' pour l'achat d'alias
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la session de paiement');
      }

      // Rediriger vers Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout non disponible');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      alert(error.message || 'Une erreur est survenue. Veuillez réessayer.');
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
            Acheter votre adresse email
          </h1>
          <p className="text-[18px] text-gray-600 dark:text-gray-400">
            Obtenez votre adresse email unique à vie
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Alias Details */}
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-8 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="px-4 py-2 bg-black text-white rounded-lg text-[14px] font-medium flex items-center gap-2">
                  <Mail size={16} />
                  <span>Votre alias</span>
                </div>
                <span className="px-3 py-1 bg-green-500 text-white rounded-full text-[12px] font-medium">
                  À VIE
                </span>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-[48px] font-bold text-black dark:text-white">60,50€</span>
                </div>
                <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-2">
                  Paiement unique, valable à vie
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-[14px] text-gray-700 dark:text-gray-300">
                  Utilisez votre adresse <strong>{username}@naeliv.com</strong> avec ou sans abonnement PRO
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-[14px] text-gray-700 dark:text-gray-300">
                  Conservez votre adresse même si vous annulez PRO
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-[14px] text-gray-700 dark:text-gray-300">
                  Achat unique, valable à vie
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-[14px] text-gray-700 dark:text-gray-300">
                  Pas d'abonnement, pas de renouvellement
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-[14px] text-gray-700 dark:text-gray-300">
                  Votre adresse email personnalisée pour toujours
                </span>
              </div>
            </div>
          </div>

          {/* Right: Payment Info */}
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-8 shadow-sm">
            <h2 className="text-[24px] font-bold text-black dark:text-white mb-6">
              Paiement sécurisé
            </h2>

            <div className="space-y-6">
              {/* Security Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lock size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[14px] font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Paiement 100% sécurisé
                    </p>
                    <p className="text-[13px] text-blue-700 dark:text-blue-300">
                      Vos informations de paiement sont traitées par Stripe, leader mondial des paiements en ligne. 
                      Nous ne stockons jamais vos données bancaires.
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
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
                    60,50€
                  </span>
                </div>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 mb-6">
                  Paiement unique. Votre alias sera valable à vie.
                </p>
              </div>

              {/* Submit Button */}
              <motion.button
                onClick={handlePayment}
                disabled={processing}
                className="w-full px-6 py-4 bg-black text-white rounded-lg text-[16px] font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Redirection vers le paiement...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    <span>Payer avec Stripe</span>
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


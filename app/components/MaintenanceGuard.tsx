"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Settings, Key, X } from 'lucide-react';

const ADMIN_EMAIL = 'gabi@naeliv.com';

// Fonction helper pour vérifier le cookie bêta
const hasBetaAccess = (): boolean => {
  if (typeof document === 'undefined') return false;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'naeliv_beta_access' && value === 'true') {
      return true;
    }
  }
  return false;
};

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const [isMaintenance, setIsMaintenance] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [hasBeta, setHasBeta] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Éviter les redirections multiples
    if (redirecting) return;

    const checkMaintenance = async () => {
      try {
        // Vérifier le cookie bêta d'abord
        const betaAccess = hasBetaAccess();
        setHasBeta(betaAccess);

        // Vérifier l'utilisateur actuel - utiliser getSession d'abord pour une détection plus rapide
        const { data: { session } } = await supabase.auth.getSession();
        let userEmail = '';
        let userIsAdmin = false;
        
        if (session?.user) {
          userEmail = session.user.email?.toLowerCase() || '';
          userIsAdmin = userEmail === ADMIN_EMAIL.toLowerCase();
        } else {
          // Si pas de session, vérifier avec getUser
          const { data: { user } } = await supabase.auth.getUser();
          userEmail = user?.email?.toLowerCase() || '';
          userIsAdmin = userEmail === ADMIN_EMAIL.toLowerCase();
        }
        
        setIsAdmin(userIsAdmin);
        console.log('🔍 [MaintenanceGuard] Utilisateur:', userEmail, 'Admin:', userIsAdmin, 'Beta:', betaAccess);

        // Vérifier le mode maintenance depuis app_settings
        const { data, error } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'maintenance_mode')
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = not found
          console.error('❌ [MaintenanceGuard] Erreur lors de la récupération de maintenance:', error);
          // Si erreur autre que "not found", considérer que maintenance est désactivée
          setIsMaintenance(false);
          setLoading(false);
          return;
        }

        // Si pas de données (PGRST116 = not found), maintenance est désactivée
        if (!data) {
          console.log('🔍 [MaintenanceGuard] Aucune donnée de maintenance trouvée, maintenance désactivée');
          setIsMaintenance(false);
          setLoading(false);
          return;
        }

        const maintenanceActive = (data as { value: string } | null)?.value === 'true';
        setIsMaintenance(maintenanceActive);
        console.log('🔍 [MaintenanceGuard] Maintenance active:', maintenanceActive);
        console.log('🔍 [MaintenanceGuard] État complet - Maintenance:', maintenanceActive, 'Admin:', userIsAdmin, 'Beta:', betaAccess, 'Email:', userEmail);
        
        // Si maintenance activée et admin, permettre l'accès complet (pas de redirection)
        if (maintenanceActive && userIsAdmin) {
          console.log('✅ [MaintenanceGuard] Accès autorisé pour admin');
        }

        // Si maintenance activée et utilisateur a le cookie bêta, permettre l'accès
        if (maintenanceActive && betaAccess) {
          console.log('✅ [MaintenanceGuard] Accès autorisé pour utilisateur bêta');
        }

        // Écouter les changements en temps réel
        const channel = supabase
          .channel('maintenance-mode')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'app_settings',
              filter: 'key=eq.maintenance_mode',
            },
            async (payload) => {
              const newValue = (payload.new as { value: string } | null)?.value === 'true';
              setIsMaintenance(newValue);
              
              // Re-vérifier le cookie bêta
              const betaAccess = hasBetaAccess();
              setHasBeta(betaAccess);
              
              // Re-vérifier l'utilisateur en cas de changement de maintenance
              const { data: { session } } = await supabase.auth.getSession();
              let currentUserEmail = '';
              let currentUserIsAdmin = false;
              
              if (session?.user) {
                currentUserEmail = session.user.email?.toLowerCase() || '';
                currentUserIsAdmin = currentUserEmail === ADMIN_EMAIL.toLowerCase();
              } else {
                const { data: { user: currentUser } } = await supabase.auth.getUser();
                currentUserEmail = currentUser?.email?.toLowerCase() || '';
                currentUserIsAdmin = currentUserEmail === ADMIN_EMAIL.toLowerCase();
              }
              
              setIsAdmin(currentUserIsAdmin);
              console.log('🔄 [MaintenanceGuard] Changement maintenance:', newValue, 'Admin:', currentUserIsAdmin, 'Beta:', betaAccess);
            }
          )
          .subscribe();

        setLoading(false);

        return () => {
          channel.unsubscribe();
        };
      } catch (error) {
        console.error('❌ [MaintenanceGuard] Erreur:', error);
        setLoading(false);
      }
    };

    checkMaintenance();
  }, [router, pathname]);

  // Afficher un loader pendant la vérification
  // Si maintenance est null (en cours de chargement), afficher un loader
  // Sauf si on est sûr que l'utilisateur est admin (pour éviter de bloquer l'admin)
  if (loading || (isMaintenance === null && !isAdmin)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si maintenance activée et admin OU utilisateur avec cookie bêta, afficher une bannière et permettre l'accès complet
  if (isMaintenance === true && (isAdmin === true || hasBeta === true)) {
    console.log('✅ [MaintenanceGuard] Accès autorisé - Admin:', isAdmin, 'Beta:', hasBeta);
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-500 text-white px-4 py-2 text-center text-[14px] font-medium z-50 sticky top-0"
        >
          ⚠️ Mode Maintenance Actif - {isAdmin ? "Seul l'admin peut accéder au site" : "Accès Bêta activé"}
        </motion.div>
        {children}
      </>
    );
  }

  // Si maintenance activée et pas admin et pas de cookie bêta
  if (isMaintenance === true && isAdmin === false && hasBeta === false) {
    console.log('🚫 [MaintenanceGuard] Affichage de la page de maintenance - Maintenance:', isMaintenance, 'Admin:', isAdmin, 'Beta:', hasBeta);
    // Afficher directement la page de maintenance au lieu de rediriger
    // Cela évite les problèmes de timing et de boucles de redirection
    // TOUTES les pages (/, /inscription, /zen-mode, etc.) afficheront la page de maintenance
    // Ne pas afficher la navigation ni les children
    return <MaintenanceOverlay />;
  }

  // Debug: Si maintenance est null, on attend encore
  if (isMaintenance === null) {
    console.log('⏳ [MaintenanceGuard] En attente de la vérification de maintenance...');
  }

  // Sinon, afficher normalement
  return <>{children}</>;
}

// Composant de page de maintenance (copié de app/maintenance/page.tsx)
function MaintenanceOverlay() {
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

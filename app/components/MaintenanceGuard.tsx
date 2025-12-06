"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

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
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
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
          console.error('❌ [MaintenanceGuard] Erreur:', error);
          setLoading(false);
          return;
        }

        const maintenanceActive = (data as { value: string } | null)?.value === 'true';
        setIsMaintenance(maintenanceActive);
        console.log('🔍 [MaintenanceGuard] Maintenance active:', maintenanceActive);

        // NOUVELLE RÈGLE : Si maintenance activée ET pas admin ET pas de cookie bêta, rediriger vers /maintenance
        if (maintenanceActive && !userIsAdmin && !betaAccess && pathname !== '/maintenance') {
          console.log('🚫 [MaintenanceGuard] Redirection vers /maintenance (non-admin, pas de beta)');
          router.push('/maintenance');
        }

        // Si maintenance activée et admin est sur /maintenance, rediriger vers la page d'accueil
        if (maintenanceActive && userIsAdmin && pathname === '/maintenance') {
          console.log('✅ [MaintenanceGuard] Redirection vers / (admin sur maintenance)');
          router.push('/');
        }

        // Si maintenance activée et utilisateur a le cookie bêta, rediriger depuis /maintenance
        if (maintenanceActive && betaAccess && pathname === '/maintenance') {
          console.log('✅ [MaintenanceGuard] Redirection vers / (utilisateur avec accès bêta)');
          router.push('/');
        }
        
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
              
              // NOUVELLE RÈGLE : Si maintenance activée ET pas admin ET pas de cookie bêta, rediriger
              if (newValue && !currentUserIsAdmin && !betaAccess && pathname !== '/maintenance') {
                router.push('/maintenance');
              } else if (newValue && (currentUserIsAdmin || betaAccess) && pathname === '/maintenance') {
                router.push('/');
              }
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
  if (loading) {
    return null; // Ou un loader si vous préférez
  }

  // Si maintenance activée et admin OU utilisateur avec cookie bêta, afficher une bannière et permettre l'accès complet
  if (isMaintenance && (isAdmin || hasBeta)) {
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
  if (isMaintenance && !isAdmin && !hasBeta) {
    // Si on est sur /maintenance, afficher la page
    if (pathname === '/maintenance') {
      return <>{children}</>; // Afficher la page de maintenance
    }
    // Bloquer l'accès à toutes les autres pages et rediriger immédiatement
    // On ne rend rien ici, la redirection est gérée dans useEffect
    // Mais on affiche un loader pour éviter l'écran blanc
    if (pathname !== '/maintenance') {
      // Forcer la redirection immédiate
      if (typeof window !== 'undefined') {
        window.location.href = '/maintenance';
      }
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirection en cours...</p>
          </div>
        </div>
      );
    }
    return null;
  }

  // Sinon, afficher normalement
  return <>{children}</>;
}

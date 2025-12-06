"use client";

import { usePathname } from 'next/navigation';
import { Navigation } from './Navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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

export function ConditionalNavigation() {
  const pathname = usePathname();
  const [shouldHide, setShouldHide] = useState(false);
  
  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        // Vérifier le cookie bêta
        const betaAccess = hasBetaAccess();
        
        // Vérifier l'utilisateur
        const { data: { session } } = await supabase.auth.getSession();
        let userIsAdmin = false;
        
        if (session?.user) {
          userIsAdmin = session.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          userIsAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        }
        
        // Vérifier le mode maintenance
        const { data } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'maintenance_mode')
          .single();

        const maintenanceActive = (data as { value: string } | null)?.value === 'true';
        
        // Cacher la navigation si maintenance active ET pas admin ET pas bêta
        setShouldHide(maintenanceActive && !userIsAdmin && !betaAccess);
      } catch (error) {
        console.error('Error checking maintenance:', error);
      }
    };

    checkMaintenance();
  }, []);
  
  // Ne pas afficher la navigation sur la page de boîte mail
  if (pathname?.startsWith('/mail')) {
    return null;
  }
  
  // Ne pas afficher la navigation si maintenance active et pas admin/bêta
  if (shouldHide) {
    return null;
  }
  
  return <Navigation />;
}


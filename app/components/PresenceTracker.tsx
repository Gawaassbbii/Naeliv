"use client";

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export function PresenceTracker() {
  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const setupPresence = async () => {
      try {
        // Récupérer l'utilisateur actuel
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          return; // Pas d'utilisateur connecté, pas de tracking
        }

        // Créer le channel pour la présence
        channel = supabase.channel('online-users', {
          config: {
            presence: {
              key: user.id, // Utiliser l'ID utilisateur comme clé
            },
          },
        });

        // Écouter les événements de présence
        channel.on('presence', { event: 'sync' }, () => {
          // Synchronisé avec les autres utilisateurs
        });

        // S'abonner au channel D'ABORD
        channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED' && channel) {
            console.log('✅ [Presence] Abonné au channel online-users');
            
            // Ensuite, envoyer la présence après s'être abonné
            await channel.track({
              user_id: user.id,
              email: user.email,
              online_at: new Date().toISOString(),
              userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
              timestamp: Date.now(),
            });
            console.log('✅ [Presence] Présence envoyée pour:', user.email);
          }
        });
      } catch (error) {
        console.error('❌ [Presence] Erreur lors de la configuration:', error);
      }
    };

    setupPresence();

    // Cleanup: arrêter le tracking quand le composant se démonte
    return () => {
      if (channel) {
        channel.untrack();
        channel.unsubscribe();
        console.log('👋 [Presence] Déconnexion du channel');
      }
    };
  }, []);

  return null; // Ce composant ne rend rien
}

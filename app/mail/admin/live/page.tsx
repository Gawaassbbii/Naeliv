"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Globe, Clock, Monitor, ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LiveUsersPage() {
  const router = useRouter();
  const [onlineUsers, setOnlineUsers] = useState<Map<string, any>>(new Map());
  const [onlineCount, setOnlineCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userEmail = user?.email?.toLowerCase();
        if (userEmail !== 'gabi@naeliv.com') {
          router.push('/mail');
          return;
        }
        setIsAdmin(true);
      } catch (error) {
        console.error('Erreur vérification admin:', error);
        router.push('/mail');
      }
    };

    checkAdmin();
  }, [router]);

  useEffect(() => {
    if (!isAdmin) return;

    let channel: any = null;

    const setupPresence = async () => {
      try {
        setLoading(true);
        
        // Créer le channel pour écouter la présence
        channel = supabase.channel('admin-live-users', {
          config: {
            presence: {
              key: 'user_id',
            },
          },
        });

        // Écouter les changements de présence
        channel.on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const presenceMap = new Map<string, any>();
          let count = 0;

          for (const [key, presences] of Object.entries(state)) {
            if (Array.isArray(presences) && presences.length > 0) {
              presenceMap.set(key, presences[0]);
              count++;
            }
          }

          setOnlineUsers(presenceMap);
          setOnlineCount(count);
          setLoading(false);
        });

        channel.on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
          console.log('👤 [Live Users] Utilisateur connecté:', key);
          // Le sync event mettra à jour automatiquement
        });

        channel.on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
          console.log('👋 [Live Users] Utilisateur déconnecté:', key);
          // Le sync event mettra à jour automatiquement
        });

        // S'abonner au channel
        channel.subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ [Live Users] Abonné au channel admin-live-users');
          }
        });
      } catch (error) {
        console.error('❌ [Live Users] Erreur:', error);
        setLoading(false);
      }
    };

    setupPresence();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [isAdmin]);

  if (!isAdmin) {
    return null;
  }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'N/A';
    }
  };

  const getBrowserType = (userAgent: string | undefined) => {
    if (!userAgent) return 'Inconnu';
    if (userAgent.includes('Mobile')) return '📱 Mobile';
    if (userAgent.includes('Chrome')) return '🌐 Chrome';
    if (userAgent.includes('Firefox')) return '🦊 Firefox';
    if (userAgent.includes('Safari')) return '🧭 Safari';
    if (userAgent.includes('Edge')) return '🔷 Edge';
    return '🌐 Navigateur';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/mail">
              <motion.button
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeft size={20} className="text-gray-300" />
              </motion.button>
            </Link>
            <div className="flex items-center gap-3">
              <Users size={24} className="text-green-400" />
              <span className="text-[24px] tracking-tighter font-bold">Utilisateurs en Direct</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Compteur Principal */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 rounded-3xl p-8 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-4">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                <div className="relative w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                  <Wifi size={40} className="text-white" />
                </div>
              </motion.div>
              <div className="text-center">
                <p className="text-[14px] text-gray-300 mb-2">UTILISATEURS ACTIFS</p>
                <p className="text-[64px] font-bold text-green-400">
                  {loading ? '...' : onlineCount}
                </p>
                <p className="text-[16px] text-gray-400 mt-2">En temps réel</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Liste des Utilisateurs */}
        <div className="bg-black/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="p-4 border-b border-gray-800 bg-gray-900/50">
            <h2 className="text-[20px] font-semibold flex items-center gap-2">
              <Monitor size={20} className="text-green-400" />
              Sessions Actives
            </h2>
          </div>
          
          <div className="max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p>Chargement des utilisateurs...</p>
              </div>
            ) : onlineUsers.size === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <WifiOff size={64} className="mx-auto mb-4 text-gray-600" />
                <p className="text-[18px] mb-2">Aucun utilisateur en ligne</p>
                <p className="text-[14px]">Les utilisateurs apparaîtront ici lorsqu'ils se connecteront</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {Array.from(onlineUsers.entries()).map(([userId, presence]: [string, any], index: number) => (
                  <motion.div
                    key={userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-gray-900/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Avatar avec indicateur en ligne */}
                        <div className="relative">
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                            className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center relative"
                          >
                            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                            <Users size={24} className="text-white relative z-10" />
                          </motion.div>
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-black rounded-full"></div>
                        </div>

                        {/* Informations utilisateur */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="text-[16px] font-semibold text-white">
                              {presence.email || userId.substring(0, 8)}
                            </p>
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-[11px] font-medium">
                              EN LIGNE
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-[13px] text-gray-400">
                            <div className="flex items-center gap-1.5">
                              <Clock size={14} />
                              <span>Connecté: {formatTime(presence.online_at)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Monitor size={14} />
                              <span>{getBrowserType(presence.userAgent || navigator.userAgent)}</span>
                            </div>
                            {presence.country && (
                              <div className="flex items-center gap-1.5">
                                <Globe size={14} />
                                <span>{presence.country}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Indicateur de connexion */}
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{
                            opacity: [1, 0.5, 1],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                          }}
                          className="w-3 h-3 bg-green-500 rounded-full"
                        ></motion.div>
                        <span className="text-[12px] text-green-400 font-medium">LIVE</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center"
          >
            <p className="text-[12px] text-gray-400 mb-1">Total en ligne</p>
            <p className="text-[32px] font-bold text-green-400">{onlineCount}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center"
          >
            <p className="text-[12px] text-gray-400 mb-1">Dernière mise à jour</p>
            <p className="text-[16px] font-semibold text-white">{new Date().toLocaleTimeString('fr-FR')}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center"
          >
            <p className="text-[12px] text-gray-400 mb-1">Status du système</p>
            <p className="text-[16px] font-semibold text-green-400 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              OPÉRATIONNEL
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


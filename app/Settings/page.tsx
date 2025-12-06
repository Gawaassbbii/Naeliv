"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  User,
  Bell,
  Shield,
  Lock,
  CreditCard,
  Zap,
  Globe,
  RotateCcw,
  Moon,
  Sun,
  Check,
  Mail,
  LogOut,
  AlertTriangle,
  Settings as SettingsIcon,
  Users,
  Gem,
  Coins
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface SettingsProps {
  onNavigate?: (page: string) => void;
  userEmail?: string;
}

export default function Settings({ onNavigate, userEmail = 'test@naeliv.com' }: SettingsProps) {
  const router = useRouter();
  
  // Fonction de navigation qui utilise useRouter si onNavigate n'est pas fourni
  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      // Navigation via Next.js router
      if (page === 'mailbox' || page === 'mail') {
        router.push('/mail');
      } else if (page === 'home') {
        router.push('/');
      } else {
        router.push(`/${page}`);
      }
    }
  };
  // Default settings - replace with actual state management
  const defaultSettings = {
    fullName: '',
    emailSignature: '--\nCordialement,\nVotre nom',
    accountType: 'essential' as 'essential' | 'pro',
    zenModeEnabled: false,
    zenModeHours: ['09:00', '17:00'],
    premiumShieldEnabled: false,
    shieldPrice: '0.10',
    immersionEnabled: false,
    targetLanguage: 'en',
    rewindEnabled: false,
    rewindDelay: '30',
    notifications: {
      email: true,
      push: false,
      sound: true
    }
  };
  
  const [settings, setSettings] = useState(defaultSettings);
  
  // Vérifier si une section est spécifiée dans l'URL
  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const section = params.get('section');
      if (section) {
        return section;
      }
    }
    return 'account';
  });
  
  // Écouter les changements d'URL pour mettre à jour la section active
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handlePopState = () => {
        const params = new URLSearchParams(window.location.search);
        const section = params.get('section');
        if (section) {
          setActiveSection(section);
        }
      };
      
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [fullName, setFullName] = useState(settings.fullName);
  const [emailSignature, setEmailSignature] = useState(settings.emailSignature);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(true);
  
  // Récupérer l'email de l'utilisateur depuis Supabase
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        setLoadingEmail(true);
        // Essayer d'abord avec getSession pour être plus rapide
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          setCurrentUserEmail(session.user.email);
          console.log('✅ [Settings] Email défini depuis session:', session.user.email);
          setLoadingEmail(false);
          return;
        }
        
        // Si pas de session, utiliser getUser
        const { data: { user }, error } = await supabase.auth.getUser();
        console.log('🔍 [Settings] Récupération de l\'email utilisateur:', { user: user?.email, error });
        if (user?.email) {
          setCurrentUserEmail(user.email);
          console.log('✅ [Settings] Email défini depuis getUser:', user.email);
        } else {
          console.warn('⚠️ [Settings] Aucun email trouvé pour l\'utilisateur');
        }
      } catch (error) {
        console.error('❌ [Settings] Erreur lors de la récupération de l\'email utilisateur:', error);
      } finally {
        setLoadingEmail(false);
      }
    };
    
    fetchUserEmail();
  }, []);
  
  const updateSettings = (updates: Partial<typeof defaultSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };
  
  // Utiliser l'email récupéré, sinon celui passé en prop
  const contextUserEmail = currentUserEmail || userEmail;
  
  // Vérifier si l'utilisateur est admin
  const isAdmin = contextUserEmail?.toLowerCase().trim() === 'gabi@naeliv.com';

  const sections = useMemo(() => {
    const baseSections = [
      { id: 'account', label: 'Compte', icon: User },
      { id: 'features', label: 'Fonctionnalités', icon: Zap },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'security', label: 'Sécurité', icon: Lock },
      { id: 'billing', label: 'Abonnement', icon: CreditCard },
    ];
    
    // Ajouter les sections admin pour gabi@naeliv.com
    const checkIsAdmin = contextUserEmail?.toLowerCase().trim() === 'gabi@naeliv.com';
    if (checkIsAdmin) {
      return [
        ...baseSections,
        { id: 'maintenance', label: 'Maintenance', icon: SettingsIcon },
        { id: 'live-users', label: 'Live Users', icon: Users }
      ];
    }
    
    return baseSections;
  }, [contextUserEmail]);

  const handleLogout = () => {
    handleNavigate('home');
  };

  const handleSaveAccount = () => {
    updateSettings({
      fullName,
      emailSignature
    });
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  // Getter de langue lisible
  const getLanguageName = (code: string) => {
    const langs: Record<string, string> = {
      en: 'Anglais',
      es: 'Espagnol',
      de: 'Allemand',
      it: 'Italien',
      nl: 'Néerlandais'
    };
    return langs[code] || code;
  };

  // Composant pour la section Admin Maintenance
  function AdminMaintenanceSection({ userEmail }: { userEmail: string }) {
    const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    // Vérifier le statut actuel
    useEffect(() => {
      const checkStatus = async () => {
        try {
          const response = await fetch('/api/maintenance');
          const data = await response.json();
          setMaintenanceEnabled(data.enabled === true);
        } catch (error) {
          console.error('Erreur vérification maintenance:', error);
        } finally {
          setChecking(false);
        }
      };
      checkStatus();
    }, []);

    const toggleMaintenance = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          alert('Vous devez être connecté');
          return;
        }

        const response = await fetch('/api/maintenance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ enabled: !maintenanceEnabled })
        });

        const result = await response.json();

        if (response.ok) {
          setMaintenanceEnabled(result.enabled);
        } else {
          alert(result.error || 'Erreur lors de la mise à jour');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (checking) {
      return (
        <div className="p-6 border-2 border-orange-300 rounded-2xl bg-orange-50">
          <div className="animate-pulse text-gray-600">Chargement...</div>
        </div>
      );
    }

    return (
      <div className="p-6 border-2 border-orange-300 rounded-2xl bg-orange-50">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle size={24} className="text-orange-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-[20px] mb-1 font-semibold">Mode Maintenance (Admin)</h3>
            <p className="text-[14px] text-gray-700">
              Activez le mode maintenance pour bloquer toutes les connexions et inscriptions, sauf pour votre compte admin.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-[16px] font-medium mb-1">
              Statut: {maintenanceEnabled ? (
                <span className="text-orange-600">🟠 Activé</span>
              ) : (
                <span className="text-green-600">🟢 Désactivé</span>
              )}
            </p>
            <p className="text-[12px] text-gray-600">
              {maintenanceEnabled 
                ? 'Les utilisateurs voient un message de maintenance'
                : 'Le site est accessible à tous'
              }
            </p>
          </div>
          <motion.button
            onClick={toggleMaintenance}
            disabled={loading}
            className={`px-6 py-3 rounded-full text-[14px] font-medium transition-colors ${
              maintenanceEnabled
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            whileHover={loading ? {} : { scale: 1.05 }}
            whileTap={loading ? {} : { scale: 0.95 }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Chargement...</span>
              </span>
            ) : (
              maintenanceEnabled ? 'Désactiver' : 'Activer'
            )}
          </motion.button>
        </div>
      </div>
    );
  }

  // Composant pour la section Live Users (Admin uniquement)
  function LiveUsersSection({ userEmail }: { userEmail: string }) {
    const [onlineUsers, setOnlineUsers] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [presenceUsers, setPresenceUsers] = useState<Map<string, any>>(new Map());

    // Utiliser Supabase Presence pour tracker les utilisateurs en ligne
    useEffect(() => {
      let channel: any = null;

      const setupPresence = async () => {
        try {
          // Créer le channel pour écouter la présence
          channel = supabase.channel('admin-online-users', {
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

            // Compter les utilisateurs en ligne
            for (const [key, presences] of Object.entries(state)) {
              if (Array.isArray(presences) && presences.length > 0) {
                presenceMap.set(key, presences[0]);
                count++;
              }
            }

            setPresenceUsers(presenceMap);
            setOnlineUsers(count);
          });

          // S'abonner au channel
          channel.subscribe(async (status: string) => {
            if (status === 'SUBSCRIBED') {
              console.log('✅ [Live Users] Abonné au channel admin-online-users');
            }
          });
        } catch (err: any) {
          console.error('❌ [Live Users] Erreur Presence:', err);
        }
      };

      setupPresence();

      // Récupérer le total d'utilisateurs depuis l'API
      const fetchTotalUsers = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) {
            setError('Vous devez être connecté');
            return;
          }

          const response = await fetch('/api/admin/live-users', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });

          const result = await response.json();

          if (response.ok) {
            setTotalUsers(result.totalUsers || 0);
            setUsers(result.users || []);
            setError(null);
          } else {
            setError(result.error || 'Erreur lors de la récupération');
          }
        } catch (err: any) {
          console.error('Erreur:', err);
          setError('Une erreur est survenue');
        } finally {
          setLoading(false);
        }
      };

      fetchTotalUsers();

      // Cleanup
      return () => {
        if (channel) {
          channel.unsubscribe();
        }
      };
    }, []);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[32px]">Live Users</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-[14px]">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-2">
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
                <User size={24} className="text-white relative z-10" />
              </motion.div>
              <div>
                <p className="text-[14px] text-gray-600">Utilisateurs en ligne</p>
                <p className="text-[32px] font-bold text-black flex items-center gap-2">
                  <span className="text-green-500">🟢</span>
                  {loading ? '...' : onlineUsers}
                </p>
              </div>
            </div>
            <p className="text-[12px] text-gray-600 mt-2">En temps réel via Supabase Presence</p>
          </motion.div>

          <motion.div
            className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
              <div>
                <p className="text-[14px] text-gray-600">Total utilisateurs</p>
                <p className="text-[32px] font-bold text-black">{loading ? '...' : totalUsers}</p>
              </div>
            </div>
            <p className="text-[12px] text-gray-600 mt-2">Nombre total de comptes créés</p>
          </motion.div>
        </div>

        {/* Liste des utilisateurs en ligne */}
        {!loading && !error && (
          <div className="bg-white border-2 border-gray-300 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-300 bg-gray-50">
              <h2 className="text-[18px] font-semibold text-black">
                Utilisateurs connectés ({onlineUsers})
              </h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {presenceUsers.size > 0 ? (
                <div className="divide-y divide-gray-200">
                  {Array.from(presenceUsers.entries()).map(([userId, presence]: [string, any], index: number) => (
                    <motion.div
                      key={userId}
                      className="p-4 hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                            className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center relative"
                          >
                            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                            <User size={20} className="text-white relative z-10" />
                          </motion.div>
                          <div>
                            <p className="text-[16px] font-medium text-black">
                              {presence.email || userId}
                            </p>
                            <p className="text-[14px] text-gray-600">Connecté en temps réel</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[12px] text-green-600 font-medium">En ligne</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <User size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-[16px]">Aucun utilisateur en ligne</p>
                  <p className="text-[14px] mt-1">Les utilisateurs apparaîtront ici lorsqu'ils seront actifs</p>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-300 bg-white sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleNavigate('mailbox')}
              className="p-2 hover:bg-gray-50 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <div className="flex items-center gap-3">
              <span className="text-[24px] tracking-tighter text-black font-medium">Naeliv</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleNavigate('mailbox')}
              className="hidden md:flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors text-[14px]"
            >
              <Mail size={16} />
              Retour à la boîte
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-gray-50 rounded-full transition-colors"
            >
              <LogOut size={20} className="text-gray-700" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-300 bg-gray-50 overflow-y-auto">
          <div className="p-4">
            <div className="mb-6 px-2">
              <div className="text-[12px] text-gray-500 mb-1">Connecté en tant que</div>
              <div className="text-[14px] truncate font-medium">{contextUserEmail || 'Chargement...'}</div>
            </div>

            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeSection === section.id
                      ? 'bg-white border border-gray-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <section.icon size={20} />
                  <span className="flex-1 text-left">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-3xl mx-auto p-8">
            {/* Account Section */}
            {activeSection === 'account' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-[32px] mb-8">Informations du compte</h1>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[14px] text-gray-600 mb-2">Adresse email</label>
                    <input
                      type="text"
                      value={userEmail}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] text-gray-600 mb-2">Nom complet</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] text-gray-600 mb-2">Signature email</label>
                    <textarea
                      value={emailSignature}
                      onChange={(e) => setEmailSignature(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <motion.button
                    className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveAccount}
                  >
                    Enregistrer les modifications
                  </motion.button>

                  <AnimatePresence>
                    {showSaveSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 px-6 py-3 bg-green-500 text-white rounded-full"
                      >
                        Modifications enregistrées
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Features Section */}
            {activeSection === 'features' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-[32px] mb-8">Fonctionnalités NAELIV</h1>

                <div className="space-y-8">
                  {/* Zen Mode */}
                  <div className="p-6 border-2 border-gray-300 rounded-2xl">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <Zap size={24} className="text-purple-600 mt-1" />
                        <div>
                          <h3 className="text-[20px] mb-1">
                            Zen Mode
                            {settings.accountType === 'essential' && (
                              <span className="ml-2 text-[12px] px-2 py-1 bg-gray-200 text-gray-600 rounded-full">Limité</span>
                            )}
                          </h3>
                          <p className="text-[14px] text-gray-600">
                            Recevez vos emails par lots à heures fixes pour rester concentré
                          </p>
                          {settings.accountType === 'essential' && (
                            <p className="text-[12px] text-orange-600 mt-1">
                              ⏰ Heures fixes : 9h et 17h • Passez à PRO pour personnaliser
                            </p>
                          )}
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.zenModeEnabled}
                          onChange={(e) => updateSettings({ zenModeEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </label>
                    </div>
                    
                    {settings.zenModeEnabled && settings.accountType === 'pro' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 space-y-3"
                      >
                        <div>
                          <label className="block text-[14px] text-gray-600 mb-2">
                            Heures de distribution
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="time"
                              value={settings.zenModeHours[0]}
                              onChange={(e) => updateSettings({ zenModeHours: [e.target.value, settings.zenModeHours[1]] })}
                              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <input
                              type="time"
                              value={settings.zenModeHours[1]}
                              onChange={(e) => updateSettings({ zenModeHours: [settings.zenModeHours[0], e.target.value] })}
                              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {settings.zenModeEnabled && settings.accountType === 'essential' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 space-y-3"
                      >
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <p className="text-[14px] text-gray-600 mb-2">Heures de distribution fixes :</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="px-4 py-2 bg-gray-200 text-gray-500 rounded-xl text-center">09:00</div>
                            <div className="px-4 py-2 bg-gray-200 text-gray-500 rounded-xl text-center">17:00</div>
                          </div>
                          <p className="text-[12px] text-purple-600 mt-2 flex items-center gap-1.5">
                            <Gem size={14} className="flex-shrink-0" />
                            <span>Passez à NAELIV PRO pour personnaliser vos heures</span>
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Premium Shield */}
                  <div className="p-6 border-2 border-gray-300 rounded-2xl relative">
                    {settings.accountType === 'essential' && (
                      <div className="absolute inset-0 bg-gray-50 bg-opacity-90 rounded-2xl flex items-center justify-center backdrop-blur-sm z-10">
                        <div className="text-center p-6">
                          <Shield size={48} className="text-gray-400 mx-auto mb-3" />
                          <h4 className="text-[18px] mb-2">Fonctionnalité PRO</h4>
                          <p className="text-[14px] text-gray-600 mb-4">
                            Le Smart Paywall est réservé aux membres NAELIV PRO
                          </p>
                          <motion.button
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:opacity-90 transition-opacity"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleNavigate('pricing')}
                          >
                            Passer à PRO
                          </motion.button>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <Shield size={24} className="text-green-600 mt-1" />
                        <div>
                          <h3 className="text-[20px] mb-1">
                            Smart Paywall
                            {settings.accountType === 'essential' && (
                              <span className="ml-2 text-[12px] px-2 py-1 bg-purple-100 text-purple-600 rounded-full">PRO</span>
                            )}
                          </h3>
                          <p className="text-[14px] text-gray-600">
                            Fixez le prix que les inconnus doivent payer pour vous écrire (0,10€ à 100€)
                          </p>
                          <p className="text-[12px] text-green-600 mt-1 flex items-center gap-1.5">
                            <Coins size={14} className="flex-shrink-0" />
                            <span>Vous touchez 1% de commission sur chaque email reçu</span>
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.premiumShieldEnabled}
                          onChange={(e) => updateSettings({ premiumShieldEnabled: e.target.checked })}
                          disabled={settings.accountType === 'essential'}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black peer-disabled:opacity-50"></div>
                      </label>
                    </div>
                    
                    {settings.premiumShieldEnabled && settings.accountType === 'pro' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 space-y-3"
                      >
                        <label className="block text-[14px] text-gray-600 mb-2">
                          Prix du timbre (€)
                        </label>
                        <div className="space-y-2">
                          <input
                            type="range"
                            min="0.10"
                            max="100"
                            step="0.10"
                            value={parseFloat(settings.shieldPrice)}
                            onChange={(e) => updateSettings({ shieldPrice: e.target.value })}
                            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-green-600"
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-[12px] text-gray-500">0,10€</span>
                            <span className="text-[20px] text-green-600">{parseFloat(settings.shieldPrice).toFixed(2)}€</span>
                            <span className="text-[12px] text-gray-500">100€</span>
                          </div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-xl mt-3">
                          <p className="text-[12px] text-gray-600">Revenus estimés (30 emails/mois) :</p>
                          <p className="text-[18px] text-green-600">+{(parseFloat(settings.shieldPrice) * 30 * 0.01).toFixed(2)}€/mois</p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Immersion Linguistique */}
                  <div className="p-6 border-2 border-gray-300 rounded-2xl">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <Globe size={24} className="text-blue-600 mt-1" />
                        <div>
                          <h3 className="text-[20px] mb-1">
                            Immersion Linguistique
                            {settings.accountType === 'essential' && (
                              <span className="ml-2 text-[12px] px-2 py-1 bg-gray-200 text-gray-600 rounded-full">Basique</span>
                            )}
                          </h3>
                          <p className="text-[14px] text-gray-600">
                            Traduisez automatiquement vos emails entrants
                          </p>
                          {settings.accountType === 'essential' && (
                            <p className="text-[12px] text-orange-600 mt-1">
                              🇬🇧 EN uniquement • Vocabulaire limité • Passez à PRO pour toutes les langues
                            </p>
                          )}
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.immersionEnabled}
                          onChange={(e) => updateSettings({ immersionEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </label>
                    </div>
                    
                    {settings.immersionEnabled && settings.accountType === 'pro' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4"
                      >
                        <label className="block text-[14px] text-gray-600 mb-2">
                          Langue cible
                        </label>
                        <select
                          value={settings.targetLanguage}
                          onChange={(e) => updateSettings({ targetLanguage: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                        >
                          <option value="en">Anglais</option>
                          <option value="es">Espagnol</option>
                          <option value="de">Allemand</option>
                          <option value="it">Italien</option>
                          <option value="nl">Néerlandais</option>
                        </select>
                      </motion.div>
                    )}
                    
                    {settings.immersionEnabled && settings.accountType === 'essential' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4"
                      >
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <p className="text-[14px] text-gray-600 mb-2">Langue disponible :</p>
                          <div className="px-4 py-2 bg-gray-200 text-gray-500 rounded-xl text-center">
                            🇬🇧 Anglais uniquement
                          </div>
                          <p className="text-[12px] text-blue-600 mt-2 flex items-center gap-1.5">
                            <Gem size={14} className="flex-shrink-0" />
                            <span>Passez à NAELIV PRO pour accéder à toutes les langues</span>
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Rewind */}
                  <div className="p-6 border-2 border-gray-300 rounded-2xl">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <RotateCcw size={24} className="text-orange-600 mt-1" />
                        <div>
                          <h3 className="text-[20px] mb-1">
                            Rewind
                            {settings.accountType === 'essential' && (
                              <span className="ml-2 text-[12px] px-2 py-1 bg-gray-200 text-gray-600 rounded-full">Limité</span>
                            )}
                          </h3>
                          <p className="text-[14px] text-gray-600">
                            Annulez l'envoi d'un email dans les secondes suivantes
                          </p>
                          {settings.accountType === 'essential' && (
                            <p className="text-[12px] text-orange-600 mt-1">
                              ⏱️ 10 secondes uniquement • Passez à PRO pour jusqu'à 24 heures
                            </p>
                          )}
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.rewindEnabled}
                          onChange={(e) => updateSettings({ rewindEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </label>
                    </div>
                    
                    {settings.rewindEnabled && settings.accountType === 'pro' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4"
                      >
                        <label className="block text-[14px] text-gray-600 mb-2">
                          Délai d'annulation (secondes)
                        </label>
                        <select
                          value={settings.rewindDelay}
                          onChange={(e) => updateSettings({ rewindDelay: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                        >
                          <option value="10">10 secondes</option>
                          <option value="30">30 secondes</option>
                          <option value="60">60 secondes</option>
                        </select>
                      </motion.div>
                    )}
                    
                    {settings.rewindEnabled && settings.accountType === 'essential' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4"
                      >
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <p className="text-[14px] text-gray-600 mb-2">Délai d'annulation fixe :</p>
                          <div className="px-4 py-2 bg-gray-200 text-gray-500 rounded-xl text-center">
                            10 secondes
                          </div>
                          <p className="text-[12px] text-orange-600 mt-2 flex items-center gap-1.5">
                            <Gem size={14} className="flex-shrink-0" />
                            <span>Passez à NAELIV PRO pour jusqu'à 24 heures</span>
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-[32px] mb-8">Notifications</h1>

                <div className="space-y-4">
                  <div className="p-6 border-2 border-gray-300 rounded-2xl flex items-center justify-between">
                    <div>
                      <h3 className="text-[18px] mb-1">Notifications email</h3>
                      <p className="text-[14px] text-gray-600">
                        Recevoir des résumés par email
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.email}
                        onChange={(e) => updateSettings({ notifications: { ...settings.notifications, email: e.target.checked } })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>

                  <div className="p-6 border-2 border-gray-300 rounded-2xl flex items-center justify-between">
                    <div>
                      <h3 className="text-[18px] mb-1">Notifications push</h3>
                      <p className="text-[14px] text-gray-600">
                        Alertes instantanées sur votre appareil
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.push}
                        onChange={(e) => updateSettings({ notifications: { ...settings.notifications, push: e.target.checked } })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>

                  <div className="p-6 border-2 border-gray-300 rounded-2xl flex items-center justify-between">
                    <div>
                      <h3 className="text-[18px] mb-1">Sons de notification</h3>
                      <p className="text-[14px] text-gray-600">
                        Jouer un son lors de nouveaux emails
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.sound}
                        onChange={(e) => updateSettings({ notifications: { ...settings.notifications, sound: e.target.checked } })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-[32px] mb-8">Sécurité & Confidentialité</h1>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-[18px] mb-4">Changer le mot de passe</h3>
                    <div className="space-y-3">
                      <input
                        type="password"
                        placeholder="Mot de passe actuel"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <input
                        type="password"
                        placeholder="Nouveau mot de passe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <input
                        type="password"
                        placeholder="Confirmer le nouveau mot de passe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <motion.button
                      className="mt-4 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Mettre à jour le mot de passe
                    </motion.button>
                  </div>

                  <div className="pt-6 border-t border-gray-300">
                    <h3 className="text-[18px] mb-4">Sessions actives</h3>
                    <div className="p-4 border border-gray-300 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-[16px]">Cette session</p>
                        <p className="text-[14px] text-gray-600">Dernière activité : Maintenant</p>
                      </div>
                      <Check size={20} className="text-green-600" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-300">
                    <h3 className="text-[18px] mb-2 text-red-600">Zone de danger</h3>
                    <p className="text-[14px] text-gray-600 mb-4">
                      Actions irréversibles concernant votre compte
                    </p>
                    <motion.button
                      className="px-6 py-3 border-2 border-red-600 text-red-600 rounded-full hover:bg-red-50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Supprimer mon compte
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Billing Section */}
            {activeSection === 'billing' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-[32px] mb-8">Abonnement & Facturation</h1>

                <div className="space-y-6">
                  {/* Current Plan */}
                  <div className="bg-white rounded-2xl border border-gray-300 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-[20px] mb-1">Votre abonnement</h2>
                        <p className="text-[14px] text-gray-600">Gérez votre plan Naeliv</p>
                      </div>
                      {settings.accountType === 'pro' ? (
                        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full">
                          <Zap size={14} />
                          <span className="text-[12px]">NAELIV PRO</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-full">
                          <span className="text-[14px]">NAELIV Essential</span>
                        </div>
                      )}
                    </div>

                    {settings.accountType === 'pro' ? (
                      <>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-[24px] mb-1">NAELIV PRO</h3>
                            <p className="text-[16px] text-gray-600">Plan actuel</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[32px]">5€</p>
                            <p className="text-[14px] text-gray-600">/mois</p>
                          </div>
                        </div>
                        <ul className="space-y-2 mb-6">
                          <li className="flex items-center gap-2 text-[14px]">
                            <Check size={16} className="text-green-600" />
                            <span>Adresse @naeliv.com personnalisée</span>
                          </li>
                          <li className="flex items-center gap-2 text-[14px]">
                            <Check size={16} className="text-green-600" />
                            <span>Stockage illimité</span>
                          </li>
                          <li className="flex items-center gap-2 text-[14px]">
                            <Check size={16} className="text-green-600" />
                            <span>Zen Mode illimité</span>
                          </li>
                          <li className="flex items-center gap-2 text-[14px]">
                            <Check size={16} className="text-green-600" />
                            <span>Smart Paywall (Premium Shield)</span>
                          </li>
                          <li className="flex items-center gap-2 text-[14px]">
                            <Check size={16} className="text-green-600" />
                            <span>Immersion Linguistique</span>
                          </li>
                          <li className="flex items-center gap-2 text-[14px]">
                            <Check size={16} className="text-green-600" />
                            <span>Rewind illimité</span>
                          </li>
                          <li className="flex items-center gap-2 text-[14px]">
                            <Check size={16} className="text-green-600" />
                            <span>Détox Digitale</span>
                          </li>
                        </ul>
                        <motion.button
                          className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Gérer mon abonnement
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-[24px] mb-1">Naeliv Essential</h3>
                            <p className="text-[16px] text-gray-600">Plan actuel • Gratuit</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[32px]">0€</p>
                            <p className="text-[14px] text-gray-600">/mois</p>
                          </div>
                        </div>
                        <ul className="space-y-2 mb-6">
                          <li className="flex items-center gap-2 text-[14px]">
                            <Check size={16} className="text-green-600" />
                            <span>Adresse @naeliv.com</span>
                          </li>
                          <li className="flex items-center gap-2 text-[14px]">
                            <Check size={16} className="text-green-600" />
                            <span>5 Go de stockage</span>
                          </li>
                          <li className="flex items-center gap-2 text-[14px]">
                            <Check size={16} className="text-green-600" />
                            <span>Zen Mode limité</span>
                          </li>
                        </ul>
                        <motion.button
                          className="w-full px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleNavigate('pricing')}
                        >
                          Passer à Naeliv PRO
                        </motion.button>
                      </>
                    )}
                  </div>

                  {/* Premium Shield Revenue */}
                  {settings.premiumShieldEnabled && (
                    <div className="p-6 border-2 border-green-300 rounded-2xl bg-green-50">
                      <div className="flex items-center gap-3 mb-4">
                        <Shield size={24} className="text-green-600" />
                        <h3 className="text-[20px]">Revenus Premium Shield</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-[12px] text-gray-600">Ce mois</p>
                          <p className="text-[24px]">2,40€</p>
                        </div>
                        <div>
                          <p className="text-[12px] text-gray-600">Total</p>
                          <p className="text-[24px]">18,70€</p>
                        </div>
                        <div>
                          <p className="text-[12px] text-gray-600">Timbres</p>
                          <p className="text-[24px]">24</p>
                        </div>
                      </div>
                      <motion.button
                        className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Retirer mes gains
                      </motion.button>
                    </div>
                  )}

                  {/* Payment Method */}
                  <div>
                    <h3 className="text-[18px] mb-4">Moyen de paiement</h3>
                    <p className="text-[14px] text-gray-600 mb-4">
                      Aucune carte enregistrée
                    </p>
                    <motion.button
                      className="px-6 py-3 border border-black text-black rounded-full hover:bg-gray-50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Ajouter une carte
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Maintenance Section - Admin uniquement */}
            {activeSection === 'maintenance' && contextUserEmail?.toLowerCase() === 'gabi@naeliv.com' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-[32px] mb-8">Maintenance</h1>
                <AdminMaintenanceSection userEmail={contextUserEmail} />
              </motion.div>
            )}

            {/* Live Users Section - Admin uniquement */}
            {activeSection === 'live-users' && contextUserEmail?.toLowerCase() === 'gabi@naeliv.com' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <LiveUsersSection userEmail={contextUserEmail} />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

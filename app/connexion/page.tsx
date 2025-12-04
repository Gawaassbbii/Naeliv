"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Mail, Lock, Eye, EyeOff, ChevronLeft, User, X, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// Types
type ViewState = 'account-list' | 'email-input' | 'password-input';

interface SavedAccount {
  email: string;
  firstName: string;
  avatar?: string;
  lastLogin?: string;
}

// Fonction pour générer un avatar (initiales)
const generateAvatar = (firstName: string, email: string): string => {
  if (firstName) {
    return firstName.charAt(0).toUpperCase();
  }
  return email.charAt(0).toUpperCase();
};

// Fonction pour obtenir la couleur de l'avatar basée sur l'email
const getAvatarColor = (email: string): string => {
  const colors = [
    'bg-purple-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  const index = email.charCodeAt(0) % colors.length;
  return colors[index];
};

// Gestion du localStorage
const STORAGE_KEY = 'naeliv_saved_accounts';

const getSavedAccounts = (): SavedAccount[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveAccount = (account: SavedAccount): void => {
  if (typeof window === 'undefined') return;
  try {
    const accounts = getSavedAccounts();
    // Vérifier si le compte existe déjà
    const existingIndex = accounts.findIndex(acc => acc.email === account.email);
    if (existingIndex >= 0) {
      accounts[existingIndex] = { ...account, lastLogin: new Date().toISOString() };
    } else {
      accounts.push({ ...account, lastLogin: new Date().toISOString() });
    }
    // Trier par dernière connexion (plus récent en premier)
    accounts.sort((a, b) => {
      const aTime = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
      const bTime = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
      return bTime - aTime;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch (error) {
    console.error('Error saving account:', error);
  }
};

const removeAccount = (email: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const accounts = getSavedAccounts();
    const filtered = accounts.filter(acc => acc.email !== email);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing account:', error);
  }
};

export default function Connexion() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ViewState>('account-list');
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRemoveOption, setShowRemoveOption] = useState(false);

  // Charger les comptes sauvegardés au montage
  useEffect(() => {
    const accounts = getSavedAccounts();
    setSavedAccounts(accounts);
    if (accounts.length === 0) {
      setCurrentView('email-input');
    }
  }, []);

  // Fonction de connexion
  const handleLogin = async (loginEmail: string, loginPassword: string) => {
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (signInError) {
        const errorMessage = signInError.message.toLowerCase();
        const errorStatus = signInError.status;

        if (errorStatus === 400 || errorMessage.includes('email') || errorMessage.includes('confirm') || errorMessage.includes('not confirmed')) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password: loginPassword,
          });

          if (retryError) {
            if (retryError.message.toLowerCase().includes('invalid') || retryError.message.toLowerCase().includes('credentials')) {
              setError('Email ou mot de passe incorrect');
            } else {
              setError('Votre compte est en cours de configuration. Veuillez réessayer dans quelques secondes.');
            }
            setLoading(false);
            return;
          }
        } else if (errorStatus === 401 || errorMessage.includes('invalid') || errorMessage.includes('credentials')) {
          setError('Email ou mot de passe incorrect');
          setLoading(false);
          return;
        } else {
          setError(`Erreur de connexion : ${signInError.message}`);
          setLoading(false);
          return;
        }
      }

      // Connexion réussie - récupérer les infos du profil
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Récupérer le profil pour obtenir le prénom
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single();

        const firstName = profile?.first_name || loginEmail.split('@')[0];
        
        // Sauvegarder le compte
        saveAccount({
          email: loginEmail,
          firstName: firstName,
        });

        // Mettre à jour la liste des comptes
        setSavedAccounts(getSavedAccounts());
      }

      // Redirection
      router.push('/mail');
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error('Login error:', err);
      setLoading(false);
    }
  };

  // Gestion des vues
  const handleAccountSelect = (accountEmail: string) => {
    setSelectedEmail(accountEmail);
    setCurrentView('password-input');
  };

  const handleUseAnotherAccount = () => {
    setEmail('');
    setSelectedEmail('');
    setCurrentView('email-input');
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setSelectedEmail(email);
    setCurrentView('password-input');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(selectedEmail, password);
  };

  const handleBackToEmail = () => {
    setPassword('');
    setError('');
    setCurrentView('email-input');
  };

  const handleBackToAccountList = () => {
    setPassword('');
    setSelectedEmail('');
    setError('');
    setCurrentView('account-list');
  };

  const handleRemoveAccount = (accountEmail: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeAccount(accountEmail);
    setSavedAccounts(getSavedAccounts());
    if (savedAccounts.length === 1) {
      setCurrentView('email-input');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo Naeliv */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-[32px] tracking-tighter text-black font-medium mb-2">Naeliv</h1>
          <p className="text-[14px] text-gray-600">Connectez-vous pour continuer</p>
        </motion.div>

        {/* Conteneur principal */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <AnimatePresence mode="wait">
            {/* Vue 1: Liste des comptes */}
            {currentView === 'account-list' && (
              <motion.div
                key="account-list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-[24px] font-semibold text-black mb-6">Choisissez un compte</h2>
                
                <div className="space-y-2 mb-6">
                  {savedAccounts.map((account) => {
                    const avatarColor = getAvatarColor(account.email);
                    const avatarText = generateAvatar(account.firstName, account.email);
                    
                    return (
                      <motion.div
                        key={account.email}
                        className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-purple-500 hover:bg-purple-50 cursor-pointer transition-all group"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAccountSelect(account.email)}
                      >
                        <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-[18px] flex-shrink-0`}>
                          {avatarText}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[16px] font-medium text-black truncate">{account.firstName || account.email.split('@')[0]}</p>
                          <p className="text-[14px] text-gray-600 truncate">{account.email}</p>
                        </div>
                        {showRemoveOption && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={(e) => handleRemoveAccount(account.email, e)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  <motion.button
                    onClick={handleUseAnotherAccount}
                    className="w-full py-3 px-4 border border-gray-300 rounded-xl text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <User size={18} />
                    Utiliser un autre compte
                  </motion.button>

                  <button
                    onClick={() => setShowRemoveOption(!showRemoveOption)}
                    className="w-full py-2 text-[12px] text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showRemoveOption ? 'Annuler' : 'Retirer un compte'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Vue 2: Saisir l'email */}
            {currentView === 'email-input' && (
              <motion.div
                key="email-input"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {savedAccounts.length > 0 && (
                  <button
                    onClick={handleBackToAccountList}
                    className="mb-4 flex items-center gap-2 text-[14px] text-gray-600 hover:text-black transition-colors"
                  >
                    <ChevronLeft size={18} />
                    Retour
                  </button>
                )}

                <h2 className="text-[24px] font-semibold text-black mb-6">Connectez-vous</h2>

                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block mb-2 text-[14px] font-medium text-gray-700">
                      Adresse email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="vous@naeliv.com"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[14px]"
                        autoFocus
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-[14px]"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-medium text-[14px] flex items-center justify-center gap-2 hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!email}
                  >
                    Continuer
                    <ArrowRight size={18} />
                  </motion.button>
                </form>

                <div className="mt-6 text-center">
                  <Link href="/inscription" className="text-[14px] text-purple-600 hover:text-purple-700 font-medium">
                    Créer un compte
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Vue 3: Saisir le mot de passe */}
            {currentView === 'password-input' && (
              <motion.div
                key="password-input"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={handleBackToEmail}
                  className="mb-4 flex items-center gap-2 text-[14px] text-gray-600 hover:text-black transition-colors"
                >
                  <ChevronLeft size={18} />
                  Retour
                </button>

                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    {(() => {
                      const account = savedAccounts.find(acc => acc.email === selectedEmail);
                      const avatarColor = account ? getAvatarColor(account.email) : getAvatarColor(selectedEmail);
                      const avatarText = account ? generateAvatar(account.firstName, account.email) : generateAvatar('', selectedEmail);
                      
                      return (
                        <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-[16px] flex-shrink-0`}>
                          {avatarText}
                        </div>
                      );
                    })()}
                    <div className="flex-1 min-w-0">
                      <p className="text-[16px] font-medium text-black truncate">
                        {savedAccounts.find(acc => acc.email === selectedEmail)?.firstName || selectedEmail.split('@')[0]}
                      </p>
                      <p className="text-[14px] text-gray-600 truncate">{selectedEmail}</p>
                    </div>
                    <button
                      onClick={handleBackToEmail}
                      className="text-[12px] text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Modifier
                    </button>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="password" className="block mb-2 text-[14px] font-medium text-gray-700">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Entrez votre mot de passe"
                        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[14px]"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-[14px]"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading || !password}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-medium text-[14px] flex items-center justify-center gap-2 hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                    whileHover={loading ? {} : { scale: 1.02 }}
                    whileTap={loading ? {} : { scale: 0.98 }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Connexion...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>Se connecter</span>
                        <ArrowRight size={18} />
                      </span>
                    )}
                  </motion.button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    className="text-[12px] text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-8 text-center text-[12px] text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p>Connexion sécurisée • Vos données sont protégées</p>
        </motion.div>
      </div>
    </div>
  );
}

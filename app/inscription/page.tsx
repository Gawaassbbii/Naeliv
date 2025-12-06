"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Mail, User, Lock, CreditCard, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { signupSchema, RESERVED_USERNAMES } from '@/lib/validations/auth';

export default function Inscription() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<'essential' | 'pro'>('essential');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [emailExistsError, setEmailExistsError] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  
  // Fonction pour calculer la force du mot de passe
  const calculatePasswordStrength = (password: string): { strength: 'faible' | 'puissant' | 'très puissant', score: number } => {
    if (!password) {
      return { strength: 'faible', score: 0 };
    }
    
    let score = 0;
    
    // Longueur
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    // Types de caractères
    if (/[a-z]/.test(password)) score += 1; // minuscules
    if (/[A-Z]/.test(password)) score += 1; // majuscules
    if (/[0-9]/.test(password)) score += 1; // chiffres
    if (/[^a-zA-Z0-9]/.test(password)) score += 1; // caractères spéciaux
    
    if (score <= 2) {
      return { strength: 'faible', score };
    } else if (score <= 4) {
      return { strength: 'puissant', score };
    } else {
      return { strength: 'très puissant', score };
    }
  };
  
  const passwordStrength = calculatePasswordStrength(formData.password);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔵 [INSCRIPTION] handleSubmit appelé, step:', step);
    
    if (step === 1) {
      // Step 1: Plan selection - just move to next step
      console.log('🔵 [INSCRIPTION] Passage à l\'étape 2');
      setStep(2);
      return;
    } else if (step === 2) {
      // Step 2: Personal info and password
      console.log('🔵 [INSCRIPTION] Traitement de l\'étape 2');
      setValidationError('');
      setEmailExistsError(false);

      // Validation avec Zod
      const validationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        plan: selectedPlan,
      };

      const result = signupSchema.safeParse(validationData);
      console.log('🔵 [INSCRIPTION] Résultat validation:', result.success, result.error?.issues);

      if (!result.success) {
        console.log('❌ [INSCRIPTION] Erreurs de validation:', result.error.issues);
        // Chercher d'abord une erreur de nom réservé (message unique)
        const reservedError = result.error.issues.find(
          (err) => err.message.includes('réservé')
        );
        
        if (reservedError) {
          setValidationError(reservedError.message);
        } else {
          // Afficher la première erreur trouvée
          const firstError = result.error.issues[0];
          if (firstError) {
            setValidationError(firstError.message);
          } else {
            setValidationError('Une erreur de validation est survenue');
          }
        }
        return;
      }

      console.log('✅ [INSCRIPTION] Validation réussie');
      
      // Réinitialiser l'erreur de validation si la validation réussit
      setValidationError('');

      try {
        // Vérifier si l'email existe déjà avant de créer le compte
        const email = `${formData.username}@naeliv.com`;
        setIsCheckingEmail(true);
        setEmailExistsError(false);

        // Vérifier dans la table profiles (méthode la plus fiable)
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', email)
          .maybeSingle();

        if (existingProfile) {
          setEmailExistsError(true);
          setIsCheckingEmail(false);
        return;
      }

        setIsCheckingEmail(false);

        // Création du compte avec Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              username: formData.username,
              plan: selectedPlan,
            }
          }
        });

        if (error) {
          // Vérifier si l'erreur indique que l'email existe déjà
          const errorMessage = error.message.toLowerCase();
          if (errorMessage.includes('already registered') || 
              errorMessage.includes('user already exists') ||
              errorMessage.includes('email already')) {
            setEmailExistsError(true);
            setIsCheckingEmail(false);
            return;
          }
          alert(`Erreur lors de la création du compte : ${error.message}`);
          setIsCheckingEmail(false);
          return;
        }

        if (!data.user) {
          alert('Erreur : Utilisateur non créé');
          setIsCheckingEmail(false);
          return;
        }

        // Le trigger SQL devrait créer le profil automatiquement
        // On attend un peu pour laisser le temps au trigger de s'exécuter
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Vérifier que le profil a été créé par le trigger
        let profileCreated = false;
        let attempts = 0;
        const maxAttempts = 3;

        while (!profileCreated && attempts < maxAttempts) {
          attempts++;

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, email, username')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profile && !profileError) {
            profileCreated = true;
            console.log('✅ Profil créé avec succès par le trigger SQL');
            break;
          }

          // Attendre un peu plus entre chaque tentative
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        // Si le profil n'a pas été créé, ce n'est pas grave
        // Le trigger SQL devrait le créer lors de la prochaine connexion
        // ou l'utilisateur pourra se reconnecter
        if (!profileCreated) {
          console.warn('⚠️ Le profil n\'a pas été créé immédiatement. Il sera créé automatiquement lors de la prochaine connexion.');
        }

        // Vérifier si l'email est confirmé
        // Attendre un peu pour que le trigger SQL confirme l'email si nécessaire
        if (!data.user.email_confirmed_at) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Redirection vers la page de connexion
        router.push('/connexion');
      } catch (err: any) {
        console.error('Signup error:', err);
        // Vérifier si l'erreur indique que l'email existe déjà
        if (err?.message?.toLowerCase().includes('already') || 
            err?.message?.toLowerCase().includes('exists')) {
          setEmailExistsError(true);
        } else {
        alert('Une erreur est survenue lors de la création du compte');
        }
        setIsCheckingEmail(false);
      }
    }
  };

  // Afficher le message de maintenance si activé
  if (checkingMaintenance) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-24">
      <div className="max-w-2xl mx-auto">
        {/* Progress Steps */}
        <div className="flex justify-center items-center gap-4 mb-12">
          {[1, 2].map((num) => (
            <React.Fragment key={num}>
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                  step >= num
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-400 border-gray-300'
                }`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: num * 0.1 }}
              >
                {step > num ? <Check size={20} /> : num}
              </motion.div>
              {num < 2 && (
                <div
                  className={`w-16 h-1 ${
                    step > num ? 'bg-black' : 'bg-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Titles */}
        <motion.div
          className="text-center mb-12"
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-[56px] mb-4">
            {step === 1 && 'Choisissez votre plan'}
            {step === 2 && 'Créez votre compte'}
          </h1>
          <p className="text-[18px] text-gray-600">
            {step === 1 && 'Commencez gratuitement, évoluez quand vous voulez'}
            {step === 2 && 'Dernière étape avant la clarté'}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Plan Selection */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div
                className={`border-2 rounded-2xl p-8 cursor-pointer transition-all ${
                  selectedPlan === 'essential'
                    ? 'border-black bg-gray-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setSelectedPlan('essential')}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-[32px] mb-2">Naeliv Essential</h3>
                    <p className="text-[24px]">Gratuit</p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === 'essential'
                        ? 'border-black bg-black'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedPlan === 'essential' && (
                      <Check size={16} className="text-white" />
                    )}
                  </div>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-black" />
                    Zen Mode (2 livraisons/jour)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-black" />
                    Détox Digitale (auto-delete 30j)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-black" />
                    Interface minimaliste
                  </li>
                </ul>
              </div>

              <div
                className={`border-2 rounded-2xl p-8 cursor-pointer transition-all relative overflow-hidden ${
                  selectedPlan === 'pro'
                    ? 'border-black bg-gray-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setSelectedPlan('pro')}
              >
                <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded-full text-[12px]">
                  POPULAIRE
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-[32px] mb-2">Naeliv PRO</h3>
                    <p className="text-[24px]">5€ / mois</p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === 'pro'
                        ? 'border-black bg-black'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedPlan === 'pro' && (
                      <Check size={16} className="text-white" />
                    )}
                  </div>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-black" />
                    Tout Naeliv Essential
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-black" />
                    Premium Shield activé
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-black" />
                    Immersion Linguistique (EN + DE)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-black" />
                    Rewind (modification post-envoi)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-black" />
                    Support prioritaire
                  </li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Step 2: Personal Info and Password */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-[14px] mb-2 text-gray-600">
                  <User size={16} className="inline mr-2" />
                  Prénom
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-black focus:outline-none transition-colors"
                  placeholder="Jean"
                  required
                />
              </div>

              <div>
                <label className="block text-[14px] mb-2 text-gray-600">
                  <User size={16} className="inline mr-2" />
                  Nom
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-black focus:outline-none transition-colors"
                  placeholder="Dupont"
                  required
                />
              </div>

              <div>
                <label className="block text-[14px] mb-2 text-gray-600">
                  <Mail size={16} className="inline mr-2" />
                  Votre adresse Naeliv
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        username: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '')
                      });
                      // Réinitialiser les erreurs si l'utilisateur modifie le nom d'utilisateur
                      if (emailExistsError) {
                        setEmailExistsError(false);
                      }
                      if (validationError) {
                        setValidationError('');
                    }
                    }}
                    className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-black focus:outline-none transition-colors"
                    placeholder="votre_nom"
                    pattern="[a-z0-9._-]+"
                    required
                  />
                  <span className="text-[18px] text-gray-600">@naeliv.com</span>
                </div>
                <p className="text-[12px] text-gray-500 mt-2">
                  Lettres minuscules, chiffres, points, tirets et underscores uniquement
                </p>
                <AnimatePresence>
                  {validationError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-3 bg-red-50 border-2 border-red-200 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-[14px] font-medium text-red-900">
                            {validationError}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {emailExistsError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-3 bg-blue-50 border-2 border-blue-200 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-[14px] font-medium text-blue-900 mb-1">
                            Cette adresse email existe déjà
                          </p>
                          <p className="text-[13px] text-blue-700 mb-3">
                            L'adresse <strong>{formData.username}@naeliv.com</strong> est déjà utilisée. 
                            Voulez-vous vous connecter à la place ?
                          </p>
                          <Link
                            href="/connexion"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-colors"
                          >
                            <ArrowRight size={16} />
                            Aller à la connexion
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="block text-[14px] mb-2 text-gray-600">
                  <Lock size={16} className="inline mr-2" />
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    // Réinitialiser l'erreur de validation si l'utilisateur modifie le mot de passe
                    if (validationError) {
                      setValidationError('');
                  }
                  }}
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-black focus:outline-none transition-colors"
                  placeholder="••••••••"
                  minLength={8}
                  required
                />
                
                {/* Barre de force du mot de passe */}
                {formData.password && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ 
                            width: passwordStrength.strength === 'faible' ? '33%' : 
                                   passwordStrength.strength === 'puissant' ? '66%' : '100%'
                          }}
                          transition={{ duration: 0.3 }}
                          className={`h-full rounded-full ${
                            passwordStrength.strength === 'faible' ? 'bg-red-500' :
                            passwordStrength.strength === 'puissant' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                        />
                      </div>
                      <span className={`text-[12px] font-medium ${
                        passwordStrength.strength === 'faible' ? 'text-red-600' :
                        passwordStrength.strength === 'puissant' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {passwordStrength.strength === 'faible' && 'Faible'}
                        {passwordStrength.strength === 'puissant' && 'Puissant'}
                        {passwordStrength.strength === 'très puissant' && 'Très puissant'}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-500">
                      Minimum 8 caractères
                    </p>
                  </div>
                )}
                
                {!formData.password && (
                <p className="text-[12px] text-gray-500 mt-2">
                  Minimum 8 caractères
                </p>
                )}
              </div>

              <div>
                <label className="block text-[14px] mb-2 text-gray-600">
                  <Lock size={16} className="inline mr-2" />
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    // Réinitialiser l'erreur de validation si l'utilisateur modifie la confirmation
                    if (validationError) {
                      setValidationError('');
                  }
                  }}
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-black focus:outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              {selectedPlan === 'pro' && (
                <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6">
                  <h4 className="text-[18px] mb-4 flex items-center gap-2">
                    <CreditCard size={20} />
                    Informations de paiement
                  </h4>
                  <p className="text-[14px] text-gray-600 mb-4">
                    Vous serez redirigé vers notre page de paiement sécurisée après la création de votre compte.
                  </p>
                  <div className="bg-white border border-gray-300 rounded-lg p-4 text-[12px] text-gray-500">
                    💳 Premier mois offert · Annulation à tout moment · Paiement sécurisé
                  </div>
                </div>
              )}

              <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6">
                <h4 className="text-[18px] mb-2">Récapitulatif</h4>
                <div className="space-y-2 text-[14px]">
                  <p>
                    <span className="text-gray-600">Nom complet :</span>{' '}
                    <strong>{formData.firstName} {formData.lastName}</strong>
                  </p>
                  <p>
                    <span className="text-gray-600">Adresse email :</span>{' '}
                    <strong>{formData.username}@naeliv.com</strong>
                  </p>
                  <p>
                    <span className="text-gray-600">Plan :</span>{' '}
                    <strong>Naeliv {selectedPlan === 'pro' ? 'PRO (5€/mois)' : 'Essential (Gratuit)'}</strong>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-row gap-4 w-full mt-6">
            {step > 1 && (
              <motion.button
                type="button"
                onClick={() => setStep(step - 1)}
                className="h-12 w-full flex-1 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 flex items-center justify-center transition-colors"
                whileHover={{}}
                whileTap={{}}
              >
                <span>Retour</span>
              </motion.button>
            )}
            <motion.button
              type="submit"
              disabled={isCheckingEmail || emailExistsError || !!validationError}
              className="h-12 w-full flex-1 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              whileHover={{}}
              whileTap={{}}
            >
              {isCheckingEmail ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Vérification...</span>
                </span>
              ) : (
                <>
                  <span>
              {step === 1 && 'Continuer'}
              {step === 2 && 'Créer mon compte'}
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </div>
        </form>

        {/* Trust Indicators */}
        <div className="mt-12 pt-8 border-t border-gray-300 text-center text-[12px] text-gray-500">
          <p>
            🔒 Connexion sécurisée · 🇪🇺 Données hébergées en Europe · 🚫 Aucune publicité
          </p>
        </div>
      </div>
    </div>
  );
}


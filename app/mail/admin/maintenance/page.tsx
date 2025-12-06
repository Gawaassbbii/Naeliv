"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Power, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MaintenancePage() {
  const router = useRouter();
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    const checkMaintenance = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'maintenance_mode')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erreur:', error);
          setError('Erreur lors de la récupération du statut');
          return;
        }

        setMaintenanceEnabled(data?.value === 'true');
        
        // Écouter les changements en temps réel
        const channel = supabase
          .channel('maintenance-mode-admin')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'app_settings',
              filter: 'key=eq.maintenance_mode',
            },
            (payload) => {
              const newValue = payload.new?.value === 'true';
              setMaintenanceEnabled(newValue);
            }
          )
          .subscribe();

        setLoading(false);

        return () => {
          channel.unsubscribe();
        };
      } catch (error: any) {
        console.error('Erreur:', error);
        setError(error.message || 'Erreur lors de la récupération');
        setLoading(false);
      }
    };

    checkMaintenance();
  }, [isAdmin]);

  const toggleMaintenance = async () => {
    if (saving) return;

    const newValue = !maintenanceEnabled;
    const confirmMessage = newValue
      ? '⚠️ ATTENTION : Activer le mode maintenance bloquera tous les utilisateurs non-admin.\n\nÊtes-vous sûr de vouloir continuer ?'
      : 'Désactiver le mode maintenance permettra à tous les utilisateurs d\'accéder au site.\n\nContinuer ?';

    if (!confirm(confirmMessage)) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Session expirée');
      }

      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ enabled: newValue })
      });

      const result = await response.json();

      if (response.ok) {
        setMaintenanceEnabled(result.enabled);
      } else {
        throw new Error(result.error || 'Erreur lors de la mise à jour');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      setError(error.message || 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-300 bg-white sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/mail">
              <motion.button
                className="p-2 hover:bg-gray-50 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeft size={20} className="text-gray-700" />
              </motion.button>
            </Link>
            <div className="flex items-center gap-3">
              <Shield size={24} className="text-orange-600" />
              <span className="text-[24px] tracking-tighter text-black font-medium">Mode Maintenance</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        {/* Alerte d'avertissement */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-6"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-orange-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-[18px] font-semibold text-orange-900 mb-2">
                ⚠️ Zone de Contrôle Critique
              </h3>
              <p className="text-[14px] text-orange-800">
                Le mode maintenance bloque l'accès de tous les utilisateurs au site, à l'exception de votre compte admin (gabi@naeliv.com). 
                Utilisez cette fonctionnalité uniquement en cas d'urgence ou de maintenance planifiée.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Carte d'État du Système */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`border-2 rounded-3xl p-8 ${
            maintenanceEnabled
              ? 'bg-red-50 border-red-500'
              : 'bg-green-50 border-green-500'
          }`}
        >
          <div className="text-center mb-8">
            <motion.div
              animate={maintenanceEnabled ? {
                rotate: [0, 10, -10, 0],
              } : {}}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4"
            >
              {maintenanceEnabled ? (
                <XCircle size={64} className="text-red-600 mx-auto" />
              ) : (
                <CheckCircle size={64} className="text-green-600 mx-auto" />
              )}
            </motion.div>
            
            <h2 className="text-[32px] font-bold mb-2">
              {maintenanceEnabled ? (
                <span className="text-red-600">MAINTENANCE ACTIVE</span>
              ) : (
                <span className="text-green-600">Système Opérationnel</span>
              )}
            </h2>
            
            <p className="text-[16px] text-gray-700 mt-2">
              {maintenanceEnabled
                ? 'Seuls les administrateurs ont accès au site. Tous les autres utilisateurs sont redirigés vers la page de maintenance.'
                : 'Tout le monde peut accéder au site normalement.'}
            </p>
          </div>

          {/* Interrupteur Principal */}
          <div className="flex items-center justify-center">
            <motion.button
              onClick={toggleMaintenance}
              disabled={loading || saving}
              className={`relative inline-flex h-16 w-32 items-center rounded-full transition-colors ${
                maintenanceEnabled ? 'bg-red-600' : 'bg-green-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              whileHover={!loading && !saving ? { scale: 1.05 } : {}}
              whileTap={!loading && !saving ? { scale: 0.95 } : {}}
            >
              <span
                className={`inline-block h-14 w-14 transform rounded-full bg-white shadow-lg transition-transform ${
                  maintenanceEnabled ? 'translate-x-16' : 'translate-x-1'
                }`}
              />
              <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                <Power
                  size={20}
                  className={`transition-opacity ${
                    maintenanceEnabled ? 'opacity-0' : 'opacity-100'
                  } text-white`}
                />
                <Power
                  size={20}
                  className={`transition-opacity ${
                    maintenanceEnabled ? 'opacity-100' : 'opacity-0'
                  } text-white`}
                />
              </div>
            </motion.button>
          </div>

          {/* Texte du statut */}
          <div className="text-center mt-6">
            <p className="text-[18px] font-semibold">
              {loading ? (
                <span className="text-gray-500">Chargement...</span>
              ) : saving ? (
                <span className="text-gray-500">Mise à jour en cours...</span>
              ) : maintenanceEnabled ? (
                <span className="text-red-600">Mode Maintenance ACTIF</span>
              ) : (
                <span className="text-green-600">Mode Maintenance INACTIF</span>
              )}
            </p>
          </div>
        </motion.div>

        {/* Message d'erreur */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-300 rounded-xl p-4"
          >
            <p className="text-red-600 text-[14px]">{error}</p>
          </motion.div>
        )}

        {/* Informations supplémentaires */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 border border-gray-300 rounded-2xl p-6"
        >
          <h3 className="text-[18px] font-semibold mb-4">📋 Informations importantes</h3>
          <ul className="space-y-2 text-[14px] text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">•</span>
              <span>En mode maintenance, seuls les comptes admin (gabi@naeliv.com) peuvent accéder au site.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">•</span>
              <span>Tous les autres utilisateurs verront automatiquement la page de maintenance.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">•</span>
              <span>Le mode maintenance est géré en temps réel et prend effet immédiatement.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">•</span>
              <span>Vous pouvez désactiver le mode maintenance à tout moment depuis cette page.</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}


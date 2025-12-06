"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Key, Plus, Trash2, Power, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const ADMIN_EMAIL = 'gabi@naeliv.com';

interface BetaCode {
  id: string;
  code: string;
  note: string | null;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export default function AdminBetaPage() {
  const router = useRouter();
  const [betaCodes, setBetaCodes] = useState<BetaCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [newCodeNote, setNewCodeNote] = useState('');

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email?.toLowerCase() !== ADMIN_EMAIL) {
          router.replace('/mail');
          return;
        }
        setIsAdmin(true);
        fetchBetaCodes();
      } catch (error) {
        console.error('Erreur vérification admin:', error);
        router.replace('/mail');
      }
    };

    checkAdmin();
  }, [router]);

  const fetchBetaCodes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('beta_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des codes:', error);
        setError('Erreur lors du chargement des codes');
        return;
      }

      setBetaCodes(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Erreur:', err);
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    // Générer un code aléatoire au format NAELIV-XXXX
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'NAELIV-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleGenerateCode = async () => {
    if (!newCodeNote.trim()) {
      toast.error('Veuillez entrer une note pour le code');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Utilisateur non connecté');
        return;
      }

      const newCode = generateCode();
      
      // Préparer les données à insérer
      const insertData: any = {
        code: newCode,
        note: newCodeNote.trim(),
        is_active: true,
        usage_count: 0
      };

      // Essayer d'abord avec created_by, puis sans si la colonne n'existe pas
      let data, error;
      
      try {
        const result = await supabase
          .from('beta_codes')
          .insert({
            ...insertData,
            created_by: user.id
          })
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      } catch (err: any) {
        // Si l'erreur concerne created_by, réessayer sans
        if (err.message && err.message.includes('created_by')) {
          const result = await supabase
            .from('beta_codes')
            .insert(insertData)
            .select()
            .single();
          
          data = result.data;
          error = result.error;
        } else {
          throw err;
        }
      }

      if (error) {
        // Si l'erreur concerne created_by, réessayer sans cette colonne
        if (error.message && error.message.includes('created_by')) {
          const result = await supabase
            .from('beta_codes')
            .insert(insertData)
            .select()
            .single();
          
          if (result.error) {
            console.error('Erreur lors de la création du code:', result.error);
            toast.error('Erreur lors de la création du code');
            return;
          }
          
          toast.success(`Code ${newCode} créé avec succès`);
          setNewCodeNote('');
          setShowGenerateModal(false);
          fetchBetaCodes();
          return;
        }
        
        console.error('Erreur lors de la création du code:', error);
        toast.error('Erreur lors de la création du code');
        return;
      }

      toast.success(`Code ${newCode} créé avec succès`);
      setNewCodeNote('');
      setShowGenerateModal(false);
      fetchBetaCodes();

      if (error) {
        console.error('Erreur lors de la création du code:', error);
        toast.error('Erreur lors de la création du code');
        return;
      }

      toast.success(`Code ${newCode} créé avec succès`);
      setNewCodeNote('');
      setShowGenerateModal(false);
      fetchBetaCodes();
    } catch (err: any) {
      console.error('Erreur:', err);
      toast.error('Une erreur est survenue');
    }
  };

  const handleToggleActive = async (codeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('beta_codes')
        .update({ is_active: !currentStatus })
        .eq('id', codeId);

      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        toast.error('Erreur lors de la mise à jour');
        return;
      }

      toast.success(`Code ${currentStatus ? 'désactivé' : 'activé'} avec succès`);
      fetchBetaCodes();
    } catch (err: any) {
      console.error('Erreur:', err);
      toast.error('Une erreur est survenue');
    }
  };

  const handleDeleteCode = async (codeId: string, code: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le code ${code} ?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('beta_codes')
        .delete()
        .eq('id', codeId);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression');
        return;
      }

      toast.success('Code supprimé avec succès');
      fetchBetaCodes();
    } catch (err: any) {
      console.error('Erreur:', err);
      toast.error('Une erreur est survenue');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Chargement de la page Bêta Access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/mail')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-[40px] font-bold tracking-tight flex items-center gap-4 text-black">
                <Key size={40} className="text-purple-600" />
                Gestion Bêta
              </h1>
              <p className="text-[16px] text-gray-600 mt-2">
                Gérez les codes d'accès privés pour l'accès bêta
              </p>
            </div>
          </div>
          <motion.button
            onClick={() => setShowGenerateModal(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl text-[14px] font-medium flex items-center gap-2 hover:bg-purple-700 transition-colors shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
            Générer un Code
          </motion.button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <XCircle size={20} className="text-red-500" />
            <p className="text-red-700 text-[14px]">{error}</p>
          </div>
        )}

        {/* Tableau des codes */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-[14px] font-semibold text-gray-700">Code</th>
                  <th className="px-6 py-4 text-left text-[14px] font-semibold text-gray-700">Note</th>
                  <th className="px-6 py-4 text-center text-[14px] font-semibold text-gray-700">Statut</th>
                  <th className="px-6 py-4 text-center text-[14px] font-semibold text-gray-700">Utilisations</th>
                  <th className="px-6 py-4 text-center text-[14px] font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {betaCodes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <Key size={48} className="mx-auto mb-3 text-gray-300" />
                      <p className="text-[16px]">Aucun code généré</p>
                      <p className="text-[14px] mt-1">Générez votre premier code d'accès bêta</p>
                    </td>
                  </tr>
                ) : (
                  betaCodes.map((code) => (
                    <motion.tr
                      key={code.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-[16px] font-mono font-semibold text-black">
                          {code.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14px] text-gray-700">
                          {code.note || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {code.is_active ? (
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[12px] font-medium">
                            <CheckCircle size={14} />
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[12px] font-medium">
                            <XCircle size={14} />
                            Inactif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[14px] font-medium text-gray-700">
                          {code.usage_count}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <motion.button
                            onClick={() => handleToggleActive(code.id, code.is_active)}
                            className={`p-2 rounded-lg transition-colors ${
                              code.is_active
                                ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title={code.is_active ? 'Désactiver' : 'Activer'}
                          >
                            <Power size={18} />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDeleteCode(code.id, code.code)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de génération */}
        {showGenerateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 relative"
            >
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  setNewCodeNote('');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle size={24} />
              </button>

              <div className="mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key size={32} className="text-purple-600" />
                </div>
                <h2 className="text-[28px] font-bold text-center text-black mb-2">
                  Générer un Code Bêta
                </h2>
                <p className="text-[14px] text-gray-600 text-center">
                  Créez un nouveau code d'accès privé
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-2">
                    Note (optionnel)
                  </label>
                  <input
                    type="text"
                    value={newCodeNote}
                    onChange={(e) => setNewCodeNote(e.target.value)}
                    placeholder="Ex: Pour Maman"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-[14px] focus:outline-none focus:border-purple-600 transition-colors"
                    autoFocus
                  />
                </div>

                <motion.button
                  onClick={handleGenerateCode}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl text-[14px] font-medium hover:bg-purple-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Générer le Code
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}


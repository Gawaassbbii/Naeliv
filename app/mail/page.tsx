"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Search, Settings, LogOut, Inbox, Archive, Trash2, Star, Send, Shield, Globe, RotateCcw, Zap, Bell, Moon, Sun, Languages, ArrowLeft, User, Lock, CreditCard, ChevronRight, AlertTriangle, CheckCircle, Trash, Check, X, Reply, Eye, Plus, Users, UserPlus, Sparkles, Wand2, GraduationCap, Key, Hand, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useTheme, ThemeProvider } from '@/app/contexts/ThemeContext';
import { translations } from '@/app/translations/mail';
import { Switch } from '@/app/components/ui/switch';
import { EMAIL_PROVIDERS, ALL_BLOCKED_DOMAINS_FLAT } from '@/lib/email-providers';

// ============================================================================
// CONSTANTS
// ============================================================================

const ANIMATION_DURATION = {
  fast: 0.3,
  normal: 0.6,
  slow: 0.8,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Helper: Générer les initiales à partir d'un nom
const getInitials = (name: string | null | undefined): string => {
  if (!name) return '';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Helper: Générer une couleur de fond à partir d'un nom (pour l'avatar)
const getAvatarColor = (name: string | null | undefined): string => {
  if (!name) return '#6B7280'; // Gris par défaut
  
  // Liste de couleurs prédéfinies
  const colors = [
    '#EF4444', // Rouge
    '#F59E0B', // Orange
    '#10B981', // Vert
    '#3B82F6', // Bleu
    '#8B5CF6', // Violet
    '#EC4899', // Rose
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ];
  
  // Générer un index basé sur le nom
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Helper: Extraire le tag du sujet (ex: "[SECURITY]" -> "SECURITY")
const extractTagFromSubject = (subject: string | null | undefined): { tag: string | null; cleanSubject: string } => {
  if (!subject) return { tag: null, cleanSubject: subject || '' };
  
  const match = subject.match(/^\[([A-Z]+)\]\s*(.*)$/);
  if (match) {
    return {
      tag: match[1],
      cleanSubject: match[2] || subject
    };
  }
  
  return { tag: null, cleanSubject: subject };
};

// Helper: Obtenir les classes CSS pour un tag système
const getEmailTagColor = (tag: string | null): { bg: string; text: string; border: string } => {
  if (!tag) {
    return {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700'
    };
  }
  
  const tagUpper = tag.toUpperCase();
  
  // Tags rouges (urgents/sécurité)
  if (['SECURITY', 'ABUSE', 'ALERT', 'POSTMASTER', 'WEBMASTER', 'HOSTMASTER', 'ADMIN', 'ADMINISTRATOR', 'NOC'].includes(tagUpper)) {
    return {
      bg: 'bg-red-100 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800'
    };
  }
  
  // Tags bleus (support)
  if (['SUPPORT', 'HELP', 'CONTACT', 'INFO', 'HELLO', 'TEAM'].includes(tagUpper)) {
    return {
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800'
    };
  }
  
  // Tags verts (business)
  if (['BILLING', 'SALES', 'INVOICE'].includes(tagUpper)) {
    return {
      bg: 'bg-emerald-100 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800'
    };
  }
  
  // Tags gris (info/noreply)
  if (['NOREPLY', 'NO-REPLY', 'NOTIFICATIONS', 'WELCOME', 'LEGAL', 'PRIVACY', 'COMPLIANCE', 'PRESS', 'MEDIA', 'JOBS', 'CAREERS'].includes(tagUpper)) {
    return {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700'
    };
  }
  
  // Par défaut : gris
  return {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700'
  };
};

// Helper: Vérifier si un email est un email système (contient un tag)
const isSystemEmail = (subject: string | null | undefined): boolean => {
  if (!subject) return false;
  return /^\[[A-Z]+\]/.test(subject);
};

// ============================================================================
// COMPONENT
// ============================================================================

function MailPageContent() {
  const router = useRouter();
  const { theme, language, setTheme, setLanguage } = useTheme();
  const t = translations[language];
  // Récupérer l'état du zen mode depuis localStorage et Supabase
  const [zenModeActive, setZenModeActive] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [zenWindows, setZenWindows] = useState<string[]>(['09:00', '17:00']);
  const [pendingEmailsCount, setPendingEmailsCount] = useState(0);
  const [nextDeliveryTime, setNextDeliveryTime] = useState<string>('');
  
  // Charger depuis localStorage et Supabase après le montage
  React.useEffect(() => {
    setIsMounted(true);
    const loadZenMode = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const response = await fetch('/api/zen-mode', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setZenModeActive(data.enabled || false);
          setZenWindows(data.windows || ['09:00', '17:00']);
          if (typeof window !== 'undefined') {
            localStorage.setItem('zenModeActive', (data.enabled || false).toString());
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du Zen Mode:', error);
        // Fallback sur localStorage
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('zenModeActive');
          if (saved === 'true') {
            setZenModeActive(true);
          }
        }
      }
    };
    loadZenMode();
  }, []);
  
  // Fonction wrapper pour mettre à jour le Zen Mode et libérer les emails si désactivation
  const handleZenModeChange = async (active: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('Pas de session');
        return;
      }

      const response = await fetch('/api/zen-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ enabled: active, windows: zenWindows })
      });

      if (response.ok) {
        setZenModeActive(active);
        if (typeof window !== 'undefined') {
          localStorage.setItem('zenModeActive', active.toString());
        }
      } else {
        console.error('Erreur lors de la mise à jour du Zen Mode');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du Zen Mode:', error);
    }
  };

  
  // Force dark mode styles with inline styles
  React.useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.style.backgroundColor = '#111827';
      root.style.color = '#f3f4f6';
      body.style.backgroundColor = '#111827';
      body.style.color = '#f3f4f6';
    } else {
      root.style.backgroundColor = '';
      root.style.color = '';
      body.style.backgroundColor = '';
      body.style.color = '';
    }
  }, [theme]);
  
  const [user, setUser] = useState<any>(null);
  const [userPlan, setUserPlan] = useState<'essential' | 'pro'>('essential');
  const [aliasPurchased, setAliasPurchased] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSystemTag, setActiveSystemTag] = useState<string | null>(null);
  const [showContacts, setShowContacts] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'starred' | 'archived' | 'trash' | 'sent' | 'replied'>('inbox');
  const [isLoading, setIsLoading] = useState(true);
  const [emails, setEmails] = useState<any[]>([]);

  // Charger le nombre d'emails en attente si Zen Mode actif
  React.useEffect(() => {
    if (!zenModeActive || !user?.id) {
      setPendingEmailsCount(0);
      setNextDeliveryTime('');
      return;
    }

    const loadPendingEmails = async () => {
      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('emails')
          .select('visible_at', { count: 'exact', head: false })
          .eq('user_id', user.id)
          .gt('visible_at', now)
          .eq('deleted', false)
          .eq('archived', false);

        if (!error && data) {
          setPendingEmailsCount(data.length || 0);
          
          // Trouver la prochaine heure de livraison
          if (data.length > 0) {
            const nextVisible = data
              .map((e: any) => new Date(e.visible_at).getTime())
              .sort((a, b) => a - b)[0];
            const nextDate = new Date(nextVisible);
            setNextDeliveryTime(nextDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des emails en attente:', error);
      }
    };

    loadPendingEmails();
    // Rafraîchir toutes les minutes
    const interval = setInterval(loadPendingEmails, 60000);
    return () => clearInterval(interval);
  }, [zenModeActive, user?.id]);
  const [folderCounts, setFolderCounts] = useState({
    inbox: 0,
    starred: 0,
    archived: 0,
    trash: 0,
    sent: 0,
    replied: 0,
  });
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showComposeAIMenu, setShowComposeAIMenu] = useState(false);
  const [isGeneratingComposeDraft, setIsGeneratingComposeDraft] = useState(false);
  const [isFixingComposeText, setIsFixingComposeText] = useState(false);
  const [showProGenerator, setShowProGenerator] = useState(false);
  const [proGeneratorText, setProGeneratorText] = useState('');
  const [isGeneratingProResponse, setIsGeneratingProResponse] = useState(false);
  
  // Préférences de visibilité des compteurs (localStorage)
  const [countVisibility, setCountVisibility] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('naeliv_count_visibility');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // Si erreur de parsing, utiliser les valeurs par défaut
        }
      }
    }
    // Par défaut, tous les compteurs sont visibles
    return {
      inbox: true,
      starred: true,
      sent: true,
      replied: true,
      archived: true,
      trash: true,
    };
  });
  
  // Sauvegarder les préférences dans localStorage quand elles changent
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('naeliv_count_visibility', JSON.stringify(countVisibility));
    }
  }, [countVisibility]);

  useEffect(() => {
    checkUser();
  }, []);

  // Recharger les emails quand le Zen Mode est désactivé
  useEffect(() => {
    if (!zenModeActive && user?.id && activeFolder) {
      // Attendre un peu pour laisser le temps à l'API de libérer les emails
      const timer = setTimeout(() => {
        loadEmails(activeFolder);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [zenModeActive]); // Seulement quand zenModeActive change

  // Recharger les emails quand l'utilisateur change (après reconnexion)
  useEffect(() => {
    if (user) {
      loadEmails(activeFolder);
      loadFolderCounts();
      if (!isAdmin) {
        loadContacts();
      }
      
      // Tracker l'activité utilisateur (pour le compteur "Live users")
      const updateUserActivity = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            await fetch('/api/user-activity', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
              }
            });
          }
        } catch (error) {
          // Ignorer les erreurs silencieusement (ne pas bloquer l'expérience utilisateur)
          console.debug('Could not update user activity:', error);
        }
      };
      
      updateUserActivity();
      // Mettre à jour l'activité toutes les 2 minutes
      const activityInterval = setInterval(updateUserActivity, 2 * 60 * 1000);
      return () => clearInterval(activityInterval);
    }
  }, [user, isAdmin]);

  // Recharger les emails quand le dossier actif change
  useEffect(() => {
    if (user) {
      loadEmails(activeFolder);
      // Réinitialiser le filtre de tag système lors du changement de dossier
      setActiveSystemTag(null);
    }
  }, [activeFolder]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/connexion');
    } else {
      setUser(user);
      
      // Récupérer le plan et l'état d'achat d'alias depuis Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, is_pro, alias_purchased')
        .eq('id', user.id)
        .single();
      
      // Déterminer le plan : PRO si is_pro est true OU si plan est 'pro'
      if (profile?.is_pro === true || profile?.plan === 'pro') {
        setUserPlan('pro');
      } else {
        setUserPlan('essential');
      }
      
      if (profile?.alias_purchased) {
        setAliasPurchased(profile.alias_purchased);
      }
      
      // Vérifier si l'utilisateur est admin (gabi@naeliv.com)
      setIsAdmin(user.email?.toLowerCase() === 'gabi@naeliv.com');
    }
  };

  // Load emails from Supabase with server-side filtering
  const loadEmails = async (folder: 'inbox' | 'starred' | 'archived' | 'trash' | 'sent' | 'replied' = 'inbox') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Set loading state but DON'T clear emails immediately (keep old list visible)
    setIsLoading(true);
    // Don't clear emails here - keep them visible during loading
    setSelectedEmail(null);

    // Les emails d'exemple ne sont plus créés automatiquement
    // Les nouveaux utilisateurs commencent avec une boîte mail vide

    // Build query with server-side filtering based on folder
    let query = supabase
      .from('emails')
      .select('*')
      .eq('user_id', user.id);

    // Apply folder-specific filters
    switch (folder) {
      case 'inbox':
        // Inbox: not archived, not deleted, and folder is NOT 'sent' (to exclude sent emails)
        query = query.eq('archived', false).eq('deleted', false).neq('folder', 'sent');
        // Smart Paywall: Exclude emails in quarantine (status = 'quarantine')
        // Support rétrocompatibilité : emails sans status ou avec status = 'inbox'
        query = query.or('status.neq.quarantine,status.is.null');
        // Zen Mode: Only show emails whose visible_at is <= now (emails that should be visible)
        query = query.lte('visible_at', new Date().toISOString());
        break;
      case 'starred':
        query = query.eq('starred', true).eq('archived', false).eq('deleted', false);
        // Zen Mode: Only show emails whose visible_at is <= now
        query = query.lte('visible_at', new Date().toISOString());
        break;
      case 'archived':
        query = query.eq('archived', true).eq('deleted', false);
        // Zen Mode: Only show emails whose visible_at is <= now
        query = query.lte('visible_at', new Date().toISOString());
        break;
      case 'trash':
        query = query.eq('deleted', true);
        // Zen Mode: Show all deleted emails regardless of visible_at
        break;
      case 'sent':
        // For sent emails, filter by folder='sent' and no in_reply_to (not replies)
        // Note: folder column must exist in Supabase (run add_email_sending_columns.sql)
        // Sent emails are always visible (user sent them, not subject to Zen Mode)
        query = query.eq('folder', 'sent').eq('deleted', false).is('in_reply_to', null);
        break;
      case 'replied':
        // For replied emails, filter by folder='sent' and has in_reply_to (is a reply)
        // We'll filter client-side since Supabase .not('is', null) syntax is tricky
        // Note: folder column must exist in Supabase (run add_email_sending_columns.sql)
        // Sent emails are always visible (user sent them, not subject to Zen Mode)
        query = query.eq('folder', 'sent').eq('deleted', false);
        break;
      default:
        query = query.eq('archived', false).eq('deleted', false);
        // Zen Mode: Only show emails whose visible_at is <= now
        query = query.lte('visible_at', new Date().toISOString());
    }
    
    // Order by received_at or created_at (for sent emails)
    query = query.order('received_at', { ascending: false, nullsFirst: false })
                 .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('❌ [MAIL PAGE] Error loading emails:', error);
      setIsLoading(false);
      return;
    }

    // Filter replied emails client-side if needed (fallback for 'replied' folder)
    let filteredData = data || [];
    if (folder === 'replied' && filteredData.length > 0) {
      filteredData = filteredData.filter((email: any) => email.in_reply_to !== null && email.in_reply_to !== undefined);
    }

    if (filteredData && filteredData.length > 0) {
      // Transform Supabase data to match our email format
      const transformedEmails = filteredData.map((email: any) => {
        // Map body: try body first, then text_content, then null
        const body = (email.body !== null && email.body !== undefined && email.body !== '') 
          ? email.body 
          : ((email.text_content !== null && email.text_content !== undefined && email.text_content !== '') 
              ? email.text_content 
              : null);
        
        // Map body_html: try body_html first, then html_content, then null
        const body_html = (email.body_html !== null && email.body_html !== undefined && email.body_html !== '') 
          ? email.body_html 
          : ((email.html_content !== null && email.html_content !== undefined && email.html_content !== '') 
              ? email.html_content 
              : null);
        
        return {
          id: email.id,
          from: email.from_name || email.from_email,
          from_name: email.from_name || null,
          from_email: email.from_email || null,
          subject: email.subject,
          preview: email.preview || body?.substring(0, 100) || '',
          time: new Date(email.received_at || email.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          date: formatDate(new Date(email.received_at || email.created_at)),
          daysAgo: Math.floor((Date.now() - new Date(email.received_at || email.created_at).getTime()) / (1000 * 60 * 60 * 24)),
          read: !!email.read_at, // IMPORTANT: Utiliser read_at pour déterminer si l'email est lu
          starred: email.starred || false,
          archived: email.archived || false,
          deleted: email.deleted || false,
          hasPaidStamp: email.has_paid_stamp || false,
          dbId: email.id, // Store Supabase ID for updates
          folder: email.folder || 'inbox', // Store folder
          in_reply_to: email.in_reply_to || null, // Store in_reply_to for filtering
          message_id: email.message_id || null, // Store message_id
          received_at: email.received_at || email.created_at, // Store received_at or created_at
          body: body, // Store body content
          body_html: body_html, // Store HTML content
        };
      });
      setEmails(transformedEmails);
    } else {
      setEmails([]);
    }

    setIsLoading(false);
  };

  // Load contacts from Supabase
  const loadContacts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setIsLoadingContacts(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true, nullsFirst: false })
        .order('email', { ascending: true });

      if (error) {
        console.error('❌ [CONTACTS] Error loading contacts:', error);
        return;
      }

      setContacts(data || []);
    } catch (error) {
      console.error('❌ [CONTACTS] Unexpected error:', error);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  // Load folder counts from Supabase (all folders at once)
  const loadFolderCounts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Fetch all counts in parallel
      const [inboxResult, starredResult, archivedResult, trashResult, sentResult, repliedResult] = await Promise.all([
        // Inbox: not archived, not deleted, and folder is NOT 'sent' (to exclude sent emails)
        supabase
          .from('emails')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('archived', false)
          .eq('deleted', false)
          .neq('folder', 'sent'),
        
        // Starred: starred, not archived, not deleted
        supabase
          .from('emails')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('starred', true)
          .eq('archived', false)
          .eq('deleted', false),
        
        // Archived: archived, not deleted
        supabase
          .from('emails')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('archived', true)
          .eq('deleted', false),
        
        // Trash: deleted
        supabase
          .from('emails')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('deleted', true),
        
        // Sent: folder='sent' and no in_reply_to (not replies)
        supabase
          .from('emails')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('folder', 'sent')
          .eq('deleted', false)
          .is('in_reply_to', null),
        
        // Replied: folder='sent' and has in_reply_to (is a reply)
        supabase
          .from('emails')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('folder', 'sent')
          .eq('deleted', false)
          .not('in_reply_to', 'is', null),
      ]);

      setFolderCounts({
        inbox: inboxResult.count || 0,
        starred: starredResult.count || 0,
        archived: archivedResult.count || 0,
        trash: trashResult.count || 0,
        sent: sentResult.count || 0,
        replied: repliedResult.count || 0,
      });
    } catch (error) {
      console.error('Error loading folder counts:', error);
    }
  };

  // Format date helper
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  // Mark email as read
  const markAsRead = async (email: any) => {
    if (!email || email.read) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update local state IMMÉDIATEMENT (avant la requête Supabase)
    setEmails(prevEmails => 
      prevEmails.map(e => {
        // Comparer par dbId si disponible, sinon par id
        const matches = email.dbId 
          ? e.dbId === email.dbId 
          : e.id === email.id;
        return matches ? { ...e, read: true } : e;
      })
    );

    // Update in Supabase (ATTENDRE la réponse pour confirmer)
    if (email.dbId) {
      const { error } = await supabase
        .from('emails')
        .update({ read_at: new Date().toISOString() })
        .eq('id', email.dbId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error updating read status:', error);
        // Revert l'état local en cas d'erreur
        setEmails(prevEmails => 
          prevEmails.map(e => {
            const matches = email.dbId 
              ? e.dbId === email.dbId 
              : e.id === email.id;
            return matches ? { ...e, read: false } : e;
          })
        );
      } else {
        console.log('Email marked as read in Supabase:', email.dbId);
      }
    } else {
      // Si l'email n'a pas de dbId (email mocké), on ne peut pas le sauvegarder
      console.warn('Email has no dbId, cannot persist read status:', email);
    }
  };

  // Handle email selection
  const handleSelectEmail = (index: number) => {
    const filteredEmails = getFilteredEmails();
    const email = filteredEmails[index];
    if (email) {
      setSelectedEmail(index);
      // Marquer comme lu immédiatement
      markAsRead(email);
    }
  };

  // Filter emails based on active folder and search
  const getFilteredEmails = () => {
    let filtered = emails;

    // Filter by folder
    switch (activeFolder) {
      case 'starred':
        filtered = filtered.filter(e => e.starred && !e.archived && !e.deleted);
        break;
      case 'archived':
        filtered = filtered.filter(e => e.archived && !e.deleted);
        break;
      case 'trash':
        filtered = filtered.filter(e => e.deleted);
        break;
      case 'sent':
        // Filter sent emails (not replies)
        filtered = filtered.filter(e => e.folder === 'sent' && !e.in_reply_to && !e.deleted);
        break;
      case 'replied':
        // Filter replied emails (sent emails with in_reply_to)
        filtered = filtered.filter(e => e.folder === 'sent' && e.in_reply_to && !e.deleted);
        break;
      default: // inbox
        filtered = filtered.filter(e => !e.archived && !e.deleted);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        (e.from_name?.toLowerCase().includes(query) || false) ||
        (e.from_email?.toLowerCase().includes(query) || false) ||
        e.from.toLowerCase().includes(query) ||
        e.subject.toLowerCase().includes(query) ||
        e.preview.toLowerCase().includes(query)
      );
    }

    // Filter by system tag (admin only)
    if (activeSystemTag) {
      filtered = filtered.filter(e => {
        const { tag } = extractTagFromSubject(e.subject);
        return tag?.toUpperCase() === activeSystemTag.toUpperCase();
      });
    }

    return filtered;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Archive email with optimistic update
  const handleArchive = async (emailIndex: number) => {
    const filteredEmails = getFilteredEmails();
    const email = filteredEmails[emailIndex];
    if (!email || !email.dbId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Optimistic Update: Retire immédiatement l'email de la liste
    setEmails(prevEmails => 
      prevEmails.map(e => {
        const matches = email.dbId ? e.dbId === email.dbId : e.id === email.id;
        return matches ? { ...e, archived: true } : e;
      })
    );
    
    // Fermer l'email viewer
    setSelectedEmail(null);

    // Update in Supabase
    const { error } = await supabase
      .from('emails')
      .update({ archived: true })
      .eq('id', email.dbId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error archiving email:', error);
      // Revert optimistic update en cas d'erreur
      setEmails(prevEmails => 
        prevEmails.map(e => {
          const matches = email.dbId ? e.dbId === email.dbId : e.id === email.id;
          return matches ? { ...e, archived: false } : e;
        })
      );
      // Toast d'erreur (on utilisera console pour l'instant, sonner sera ajouté après)
      toast.error('Erreur lors de l\'archivage de l\'email');
    } else {
      toast.success('Email archivé avec succès');
    }

    // Recharger les emails pour synchroniser
    loadEmails(activeFolder);
    // Recharger les compteurs
    loadFolderCounts();
  };

  // Toggle star with optimistic update
  const handleToggleStar = async (emailIndex: number, e?: React.MouseEvent) => {
    // Empêcher l'ouverture de l'email quand on clique sur l'étoile
    if (e) {
      e.stopPropagation();
    }

    const filteredEmails = getFilteredEmails();
    const email = filteredEmails[emailIndex];
    if (!email || !email.dbId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newStarredValue = !email.starred;

    // Optimistic Update: Met à jour immédiatement l'état
    setEmails(prevEmails => 
      prevEmails.map(e => {
        const matches = email.dbId ? e.dbId === email.dbId : e.id === email.id;
        return matches ? { ...e, starred: newStarredValue } : e;
      })
    );

    // Update in Supabase
    const { error } = await supabase
      .from('emails')
      .update({ starred: newStarredValue })
      .eq('id', email.dbId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error toggling star:', error);
      // Revert optimistic update en cas d'erreur
      setEmails(prevEmails => 
        prevEmails.map(e => {
          const matches = email.dbId ? e.dbId === email.dbId : e.id === email.id;
          return matches ? { ...e, starred: !newStarredValue } : e;
        })
      );
      toast.error('Erreur lors de la mise à jour du favori');
    } else {
      toast.success(newStarredValue ? 'Ajouté aux favoris' : 'Retiré des favoris');
    }

    // Recharger les compteurs
    loadFolderCounts();
  };

  // Delete email with optimistic update
  const handleDelete = async (emailIndex: number) => {
    const filteredEmails = getFilteredEmails();
    const email = filteredEmails[emailIndex];
    if (!email || !email.dbId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Optimistic Update: Retire immédiatement l'email de la liste
    setEmails(prevEmails => 
      prevEmails.map(e => {
        const matches = email.dbId ? e.dbId === email.dbId : e.id === email.id;
        return matches ? { ...e, deleted: true, deleted_at: new Date().toISOString() } : e;
      })
    );
    
    // Fermer l'email viewer
    setSelectedEmail(null);

    // Update in Supabase
    const { error } = await supabase
      .from('emails')
      .update({ deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', email.dbId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting email:', error);
      // Revert optimistic update en cas d'erreur
      setEmails(prevEmails => 
        prevEmails.map(e => {
          const matches = email.dbId ? e.dbId === email.dbId : e.id === email.id;
          return matches ? { ...e, deleted: false, deleted_at: null } : e;
        })
      );
      toast.error('Erreur lors de la suppression de l\'email');
    } else {
      toast.success('Email déplacé dans la corbeille');
    }

    // Recharger les emails pour synchroniser
    loadEmails(activeFolder);
    // Recharger les compteurs
    loadFolderCounts();
  };

  // Reply to email - Set reply mode
  const handleReply = (email: any) => {
    // Cette fonction sera gérée dans EmailViewer avec un état local
    // Après l'envoi, recharger les emails
    loadEmails(activeFolder);
    if (activeFolder !== 'sent') {
      // Si on n'est pas dans "Envoyés", recharger aussi ce dossier
      loadEmails('sent');
    }
    loadFolderCounts();
  };

  // Forward email - Set forward mode
  const handleForward = (email: any) => {
    // Cette fonction sera gérée dans EmailViewer avec un état local
    // Après l'envoi, recharger les emails
    loadEmails(activeFolder);
    if (activeFolder !== 'sent') {
      // Si on n'est pas dans "Envoyés", recharger aussi ce dossier
      loadEmails('sent');
    }
    loadFolderCounts();
  };

  // Handle compose new message
  const handleComposeNew = (toEmail?: string) => {
    setIsComposeOpen(true);
    setComposeTo(toEmail || '');
    setComposeSubject('');
    setComposeBody('');
    setShowComposeAIMenu(false);
    setShowProGenerator(true); // Afficher le générateur PRO par défaut pour les membres PRO
    setProGeneratorText('');
  };

  // Fonction pour générer une réponse avec l'IA dans le modal de composition
  const handleGenerateComposeDraft = async (intention: string) => {
    if (userPlan !== 'pro') {
      toast.error('Fonctionnalité réservée aux membres Naeliv PRO.');
      return;
    }

    // Pour "Rendre PRO", vérifier qu'il y a du texte
    if (intention === 'Rendre PRO' && !composeBody.trim()) {
      toast.error('Écrivez d\'abord votre message avant de le rendre plus professionnel.');
      return;
    }

    setIsGeneratingComposeDraft(true);
    setShowComposeAIMenu(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      // Pour "Rendre PRO", utiliser le texte existant dans composeBody
      const textToImprove = intention === 'Rendre PRO' ? composeBody.trim() : '';

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: 'draft',
          data: { 
            originalEmail: intention === 'Rendre PRO' ? '' : '',
            intention,
            existingText: textToImprove // Passer le texte existant pour "Rendre PRO"
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      // Insérer le texte généré dans le champ de composition
      setComposeBody(data.text);
      toast.success(intention === 'Rendre PRO' ? 'Texte rendu plus professionnel' : 'Message généré avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la génération:', error);
      toast.error(error.message || 'Erreur lors de la génération');
    } finally {
      setIsGeneratingComposeDraft(false);
    }
  };

  // Fonction pour corriger le texte dans le modal de composition
  const handleFixComposeText = async () => {
    if (userPlan !== 'pro') {
      toast.error('Fonctionnalité réservée aux membres Naeliv PRO.');
      return;
    }

    if (!composeBody.trim()) {
      toast.error('Aucun texte à corriger');
      return;
    }

    setIsFixingComposeText(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: 'fix',
          data: { text: composeBody }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la correction');
      }

      // Utiliser directement le texte corrigé (sans extraire d'explications)
      const correctedText = data.text.trim();

      // Remplacer le texte
      setComposeBody(correctedText);

      toast.success('Correction effectuée');
    } catch (error: any) {
      console.error('Erreur lors de la correction:', error);
      toast.error(error.message || 'Erreur lors de la correction');
    } finally {
      setIsFixingComposeText(false);
    }
  };

  // Fonction pour générer une réponse PRO à partir d'un texte collé
  const handleGenerateProResponse = async () => {
    if (userPlan !== 'pro') {
      toast.error('Fonctionnalité réservée aux membres Naeliv PRO.');
      return;
    }

    if (!proGeneratorText.trim()) {
      toast.error('Collez d\'abord le texte pour lequel vous voulez générer une réponse.');
      return;
    }

    setIsGeneratingProResponse(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: 'draft',
          data: { 
            originalEmail: proGeneratorText.trim(),
            intention: 'Réponse PRO personnalisée',
            isProResponse: true // Flag pour indiquer que c'est une réponse PRO
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      // Insérer le texte généré dans le champ de composition
      setComposeBody(data.text);
      toast.success('Réponse PRO générée avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la génération:', error);
      toast.error(error.message || 'Erreur lors de la génération');
    } finally {
      setIsGeneratingProResponse(false);
    }
  };

  const handleSendNewMessage = async () => {
    if (!composeTo || !composeSubject || !composeBody.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsSending(true);
    try {
      // Récupérer le token d'authentification
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        setIsSending(false);
        return;
      }

      // Envoyer l'email via l'API
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          to: composeTo,
          subject: composeSubject,
          text: composeBody,
          html: `<p>${composeBody.replace(/\n/g, '<br>')}</p>`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      toast.success('Email envoyé avec succès');
      
      // Fermer la modale et réinitialiser
      setIsComposeOpen(false);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      
      // Recharger les emails pour voir le message dans "Envoyés"
      loadEmails('sent');
      loadFolderCounts();
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsSending(false);
    }
  };

  // Force dark mode styles with inline styles and useEffect
  React.useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.style.backgroundColor = '#111827';
      root.style.color = '#f3f4f6';
      body.style.backgroundColor = '#111827';
      body.style.color = '#f3f4f6';
    } else {
      root.style.backgroundColor = '';
      root.style.color = '';
      body.style.backgroundColor = '';
      body.style.color = '';
    }
  }, [theme]);
  
  // Calculer la hauteur disponible en tenant compte de la bannière de maintenance
  const [availableHeight, setAvailableHeight] = useState('100vh');
  
  useEffect(() => {
    const updateHeight = () => {
      // Vérifier si la bannière de maintenance est présente
      const maintenanceBanner = document.querySelector('[class*="bg-orange-500"][class*="sticky"]');
      if (maintenanceBanner) {
        const bannerHeight = maintenanceBanner.getBoundingClientRect().height;
        setAvailableHeight(`calc(100vh - ${bannerHeight}px)`);
      } else {
        setAvailableHeight('100vh');
      }
    };
    
    // Mettre à jour immédiatement
    updateHeight();
    
    // Réécouter les changements de taille de la bannière
    const resizeObserver = new ResizeObserver(updateHeight);
    const banner = document.querySelector('[class*="bg-orange-500"][class*="sticky"]');
    if (banner) {
      resizeObserver.observe(banner);
    }
    
    // Écouter aussi les changements de taille de la fenêtre
    window.addEventListener('resize', updateHeight);
    
    // Vérifier périodiquement au cas où la bannière apparaîtrait après le montage
    const interval = setInterval(updateHeight, 500);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeight);
      clearInterval(interval);
    };
  }, []);

  // Ajouter l'attribut data-mail-page au body pour le CSS
  useEffect(() => {
    document.body.setAttribute('data-mail-page', 'true');
    return () => {
      document.body.removeAttribute('data-mail-page');
    };
  }, []);

  return (
    <div 
      data-mail-page="true"
      className="overflow-hidden overflow-x-hidden flex flex-col transition-colors max-w-full"
      style={{
        backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
        color: theme === 'dark' ? '#f3f4f6' : '#111827',
        height: availableHeight,
        width: '100vw',
        maxWidth: '100vw'
      }}
    >
      {/* Top Header */}
      <Header 
        onSignOut={handleSignOut} 
        zenModeActive={zenModeActive} 
        setZenModeActive={handleZenModeChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        countVisibility={countVisibility}
        setCountVisibility={setCountVisibility}
        user={user}
        userPlan={userPlan}
        aliasPurchased={aliasPurchased}
      />

      {/* Zen Mode Banner */}
      {zenModeActive && (
        <motion.div
          className="w-full bg-black text-white px-6 py-3 flex items-center justify-center gap-2 flex-shrink-0"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Zap size={16} className="text-white" />
          <span className="text-[14px] font-medium">
            Zen Mode activé
            {pendingEmailsCount > 0 && (
              <> • <span className="text-yellow-300 flex items-center gap-1"><Moon size={14} /> {pendingEmailsCount} email{pendingEmailsCount > 1 ? 's' : ''} en attente</span> ({nextDeliveryTime || zenWindows[0] || '09:00'})</>
            )}
            {pendingEmailsCount === 0 && nextDeliveryTime && (
              <> • Prochaine distribution à {nextDeliveryTime}</>
            )}
            {pendingEmailsCount === 0 && !nextDeliveryTime && zenWindows.length > 0 && (
              <> • Prochaine distribution à {zenWindows[0]}</>
            )}
          </span>
        </motion.div>
      )}

      {/* Main Content Area - Fixed height, no scroll */}
      <div className="flex-1 flex h-full overflow-hidden overflow-x-hidden max-w-full">
        {/* Sidebar - Fixed height, scrollable */}
        <Sidebar 
          user={user}
          userPlan={userPlan}
          activeFolder={activeFolder}
          setActiveFolder={setActiveFolder}
          folderCounts={folderCounts}
          countVisibility={countVisibility}
          onComposeNew={handleComposeNew}
        />

        {/* Email List and Viewer - Takes remaining space */}
        <div className="flex-1 flex h-full overflow-hidden overflow-x-hidden max-w-full min-w-0">
          {/* Email List - Scrollable */}
          <EmailList 
            emails={getFilteredEmails()}
            selectedEmail={selectedEmail}
            onSelectEmail={handleSelectEmail}
            activeFolder={activeFolder}
            isLoading={isLoading}
            folderCounts={folderCounts}
          />

          {/* Email Viewer - Scrollable (réduit si System Monitor est affiché) */}
          <div className={isAdmin ? "flex-1" : "flex-1"}>
            <EmailViewer 
              email={selectedEmail !== null ? getFilteredEmails()[selectedEmail] : null}
              emailIndex={selectedEmail}
              activeFolder={activeFolder}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onReply={handleReply}
              onForward={handleForward}
              loadEmails={loadEmails}
              loadFolderCounts={loadFolderCounts}
            />
          </div>
          
          {/* System Monitor - Colonne de droite pour l'admin */}
          {isAdmin && (
            <SystemMonitor
              emails={emails}
              activeSystemTag={activeSystemTag}
              onTagSelect={setActiveSystemTag}
            />
          )}

          {/* Contacts Panel - Colonne de droite pour les utilisateurs non-admin */}
          {!isAdmin && showContacts && (
            <ContactsPanel
              contacts={contacts}
              isLoading={isLoadingContacts}
              onClose={() => setShowContacts(false)}
              onComposeNew={handleComposeNew}
              onContactAdded={loadContacts}
            />
          )}

          {/* Bouton pour ouvrir les contacts (non-admin uniquement) */}
          {!isAdmin && !showContacts && (
            <div className="w-16 flex-shrink-0 h-full flex items-center justify-center border-l border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <motion.button
                onClick={() => {
                  setShowContacts(true);
                  if (contacts.length === 0) {
                    loadContacts();
                  }
                }}
                className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Afficher les contacts"
              >
                <Users size={20} className="text-gray-600 dark:text-gray-400" />
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="flex h-full overflow-hidden">
              {/* Panneau gauche : Nouveau message */}
              <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-[20px] font-semibold text-black dark:text-white">Nouveau message</h2>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                  À
                </label>
                <input
                  type="email"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="destinataire@example.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-[14px] bg-white dark:bg-gray-800 text-black dark:text-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Objet
                </label>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Sujet de l'email"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-[14px] bg-white dark:bg-gray-800 text-black dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300">
                    Message
                  </label>
                  {userPlan === 'pro' && (
                    <div className="flex items-center gap-2">
                      <div className="relative ai-menu-container">
                        <motion.button
                          onClick={() => setShowComposeAIMenu(!showComposeAIMenu)}
                          disabled={isGeneratingComposeDraft}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-700/50 rounded-full text-purple-700 dark:text-purple-300 text-[13px] font-medium hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/40 dark:hover:to-pink-900/30 hover:border-purple-300 dark:hover:border-purple-600 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Wand2 size={15} className="text-purple-600 dark:text-purple-400" />
                          <span>IA Magic</span>
                        </motion.button>
                        {showComposeAIMenu && (
                          <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-xl z-50 min-w-[180px]">
                            <button
                              onClick={() => handleGenerateComposeDraft('Réponse positive')}
                              className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-xl"
                            >
                              Réponse positive
                            </button>
                            <button
                              onClick={() => handleGenerateComposeDraft('Refus poli')}
                              className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              Refus poli
                            </button>
                            <button
                              onClick={() => handleGenerateComposeDraft('Demander détails')}
                              className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              Demander détails
                            </button>
                            <button
                              onClick={() => handleGenerateComposeDraft('Rendre PRO')}
                              className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-gray-700 last:rounded-b-xl"
                            >
                              Rendre PRO
                            </button>
                          </div>
                        )}
                      </div>
                      <motion.button
                        onClick={handleFixComposeText}
                        disabled={isFixingComposeText || !composeBody.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-full text-blue-700 dark:text-blue-300 text-[13px] font-medium hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/40 dark:hover:to-indigo-900/30 hover:border-blue-300 dark:hover:border-blue-600 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <GraduationCap size={15} className="text-blue-600 dark:text-blue-400" />
                        <span className="flex items-center gap-1">
                          <GraduationCap size={14} />
                          <span>Corriger</span>
                        </span>
                      </motion.button>
                    </div>
                  )}
                </div>
                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  onBlur={() => {
                    // Ajouter la signature automatiquement si Essential et si elle n'est pas déjà présente
                    if (userPlan === 'essential' && composeBody.trim() && !composeBody.includes('Envoyé depuis naeliv')) {
                      const signature = '\n\n--\nEnvoyé depuis naeliv';
                      setComposeBody(prev => prev + signature);
                    }
                  }}
                  placeholder="Écrivez votre message ici..."
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-[14px] bg-white dark:bg-gray-800 text-black dark:text-white resize-none"
                />
                {userPlan === 'essential' && (
                  <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1">
                    La signature "Envoyé depuis naeliv" sera ajoutée automatiquement. Vous pouvez la supprimer si vous le souhaitez.
                  </p>
                )}
              </div>
            </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                  <motion.button
                    onClick={() => setIsComposeOpen(false)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-[14px] hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSending}
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    onClick={handleSendNewMessage}
                    disabled={isSending || !composeTo || !composeSubject || !composeBody.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-[14px] font-medium hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    whileHover={{ scale: isSending ? 1 : 1.02 }}
                    whileTap={{ scale: isSending ? 1 : 0.98 }}
                  >
                    {isSending ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Envoyer
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Panneau droit : Générateur PRO */}
              {userPlan === 'pro' && (
                <div className="w-96 flex-shrink-0 flex flex-col border-l border-gray-200 dark:border-gray-700">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-[16px] font-semibold text-black dark:text-white">Introduisez le texte pour générer une réponse PRO</h2>
                    <button
                      onClick={() => setShowProGenerator(!showProGenerator)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showProGenerator ? <X size={20} /> : <Plus size={20} />}
                    </button>
                  </div>

                  {showProGenerator && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Textarea */}
                      <div className="flex-1 p-6 overflow-y-auto">
                        <textarea
                          value={proGeneratorText}
                          onChange={(e) => setProGeneratorText(e.target.value)}
                          placeholder="Collez ici le texte pour lequel vous souhaitez générer une réponse PRO..."
                          className="w-full h-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-[14px] bg-white dark:bg-gray-800 text-black dark:text-white resize-none"
                          rows={15}
                        />
                      </div>

                      {/* Footer */}
                      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                        <motion.button
                          onClick={handleGenerateProResponse}
                          disabled={isGeneratingProResponse || !proGeneratorText.trim()}
                          className="w-full h-10 min-h-[40px] max-h-[40px] px-4 bg-purple-600 text-white rounded-xl text-[14px] font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                          whileHover={{ scale: isGeneratingProResponse ? 1 : 1.02 }}
                          whileTap={{ scale: isGeneratingProResponse ? 1 : 0.98 }}
                          animate={isGeneratingProResponse ? { opacity: [1, 0.7, 1] } : {}}
                          transition={isGeneratingProResponse ? { duration: 1.5, repeat: Infinity } : {}}
                        >
                          <Sparkles size={16} className="flex-shrink-0" />
                          <span className="text-[14px]">Générer réponse PRO</span>
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface HeaderProps {
  onSignOut: () => void;
  zenModeActive: boolean;
  setZenModeActive: (active: boolean) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  countVisibility: Record<string, boolean>;
  setCountVisibility: (visibility: Record<string, boolean>) => void;
  user: any;
  userPlan: 'essential' | 'pro';
  aliasPurchased: boolean;
}

// Memoize Header to prevent unnecessary re-renders
const Header = React.memo(function Header({ onSignOut, zenModeActive, setZenModeActive, searchQuery, setSearchQuery, countVisibility, setCountVisibility, user, userPlan, aliasPurchased }: HeaderProps) {
  const { theme, language, setTheme, setLanguage } = useTheme();
  const t = translations[language];
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
    <header
      className="h-16 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 px-6 flex items-center justify-between transition-colors"
    >
      {/* Logo - Text only */}
      <Link href="/">
        <div className="cursor-pointer flex items-center gap-2">
          <span className="text-[20px] tracking-tighter text-black dark:text-white font-medium">Naeliv</span>
          <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-semibold rounded uppercase tracking-wide">
            BETA
          </span>
        </div>
      </Link>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl mx-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-gray-50 dark:bg-gray-900 dark:text-white transition-colors"
          />
        </div>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-4">
        <motion.button
          onClick={async () => {
            const result = setZenModeActive(!zenModeActive);
            if (result instanceof Promise) {
              result.catch((err) => {
                console.error('Erreur lors du changement du Zen Mode:', err);
              });
            }
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-full text-[14px] transition-colors relative overflow-hidden ${
            zenModeActive
              ? 'border-2 border-black bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              : 'border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Animation pulse - seulement si actif */}
          {zenModeActive && (
            <motion.div
              className="absolute inset-0 bg-black opacity-20 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.1, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
          <motion.div
            animate={zenModeActive ? {
              rotate: [0, 360],
            } : {}}
            transition={zenModeActive ? {
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            } : {}}
          >
            <Zap 
              size={16} 
              className={`relative z-10 ${zenModeActive ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'}`} 
            />
          </motion.div>
          <span className={`relative z-10 ${zenModeActive ? 'text-black dark:text-white font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
            {t.zenMode}
          </span>
        </motion.button>
        <motion.button
          onClick={() => setSettingsOpen(true)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Settings size={20} className="text-gray-600 dark:text-gray-400" />
        </motion.button>
        <motion.button
          onClick={onSignOut}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <LogOut size={20} className="text-gray-600 dark:text-gray-400" />
        </motion.button>
      </div>
    </header>

    {/* Settings Panel */}
    <SettingsPanel 
      open={settingsOpen} 
      onOpenChange={setSettingsOpen}
      zenModeActive={zenModeActive}
      onZenModeChange={setZenModeActive}
      theme={theme}
      language={language}
      setTheme={setTheme}
      setLanguage={setLanguage}
      countVisibility={countVisibility}
      setCountVisibility={setCountVisibility}
      user={user}
      userPlan={userPlan}
      aliasPurchased={aliasPurchased}
    />
    </>
  );
});

interface SidebarProps {
  user: any;
  userPlan?: 'essential' | 'pro';
  activeFolder: 'inbox' | 'starred' | 'archived' | 'trash' | 'sent' | 'replied';
  setActiveFolder: (folder: 'inbox' | 'starred' | 'archived' | 'trash' | 'sent' | 'replied') => void;
  folderCounts: {
    inbox: number;
    starred: number;
    archived: number;
    trash: number;
    sent: number;
    replied: number;
  };
  countVisibility: Record<string, boolean>;
  onComposeNew: (email?: string) => void;
}

// Composant Admin Nav Item avec compteur en temps réel
const AdminNavItem = React.memo(function AdminNavItem({ 
  icon: Icon, 
  label, 
  router,
  onlineCount 
}: { 
  icon: React.ComponentType<{ size?: number; className?: string }>; 
  label: string; 
  router: any;
  onlineCount?: number;
}) {
  const handleClick = () => {
    if (label === 'Live Users') {
      router.push('/mail/admin/live');
    } else if (label === 'Maintenance') {
      router.push('/mail/admin/maintenance');
    } else if (label === 'Bêta Access') {
      router.push('/mail/admin/beta');
    }
  };

  const isLiveUsers = label === 'Live Users';
  const isMaintenance = label === 'Maintenance';
  const isBetaAccess = label === 'Bêta Access';

  return (
    <motion.button
      onClick={handleClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${
        isLiveUsers
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 hover:shadow-lg'
          : isMaintenance
          ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600 hover:shadow-lg'
          : isBetaAccess
          ? 'bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-lg'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      whileHover={{ scale: 1.02, x: 2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Effet de brillance au survol */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full"></div>
      
      <div className="flex items-center gap-3 flex-1 relative z-10">
        <motion.div
          animate={isLiveUsers && onlineCount !== undefined && onlineCount > 0 ? {
            scale: [1, 1.15, 1],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className={`p-2 rounded-lg ${
            isLiveUsers
              ? 'bg-green-100 dark:bg-green-900/40'
              : isMaintenance
              ? 'bg-orange-100 dark:bg-orange-900/40'
              : isBetaAccess
              ? 'bg-purple-100 dark:bg-purple-900/40'
              : 'bg-gray-100 dark:bg-gray-700'
          }`}
        >
          <Icon 
            size={20} 
            className={
              isLiveUsers
                ? 'text-green-600 dark:text-green-400'
                : isMaintenance
                ? 'text-orange-600 dark:text-orange-400'
                : isBetaAccess
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-gray-600 dark:text-gray-400'
            } 
          />
        </motion.div>
        <span className={`text-[14px] font-medium ${
          isLiveUsers
            ? 'text-green-900 dark:text-green-200'
            : isMaintenance
            ? 'text-orange-900 dark:text-orange-200'
            : isBetaAccess
            ? 'text-purple-900 dark:text-purple-200'
            : 'text-gray-700 dark:text-gray-300'
        }`}>
          {label}
        </span>
      </div>
      
      {isLiveUsers && onlineCount !== undefined && onlineCount > 0 && (
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-[11px] font-semibold shadow-md relative z-10"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>{onlineCount}</span>
        </motion.div>
      )}
      
      {isMaintenance && (
        <div className="relative z-10">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
            className="text-orange-500"
          >
            <AlertTriangle size={16} />
          </motion.div>
        </div>
      )}
    </motion.button>
  );
});

// Memoize Sidebar to prevent unnecessary re-renders
const Sidebar = React.memo(function Sidebar({ user, userPlan, activeFolder, setActiveFolder, folderCounts, countVisibility, onComposeNew }: SidebarProps) {
  const { language } = useTheme();
  const t = translations[language];
  const router = useRouter();
  const [onlineUsersCount, setOnlineUsersCount] = useState(0);
  
  // Track les utilisateurs en ligne pour le badge (admin uniquement)
  useEffect(() => {
    if (user?.email?.toLowerCase() !== 'gabi@naeliv.com') {
      return;
    }

    let channel: any = null;

    const setupPresence = async () => {
      try {
        channel = supabase.channel('sidebar-online-users', {
          config: {
            presence: {
              key: 'user_id',
            },
          },
        });

        channel.on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          let count = 0;

          for (const [key, presences] of Object.entries(state)) {
            if (Array.isArray(presences) && presences.length > 0) {
              count++;
            }
          }

          setOnlineUsersCount(count);
        });

        channel.subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ [Sidebar] Abonné au channel sidebar-online-users');
          }
        });
      } catch (err: any) {
        console.error('❌ [Sidebar] Erreur Presence:', err);
      }
    };

    setupPresence();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [user?.email]);
  
  // Valeurs par défaut pour folderCounts si undefined
  const safeFolderCounts = folderCounts || {
    inbox: 0,
    starred: 0,
    archived: 0,
    trash: 0,
    sent: 0,
    replied: 0,
  };
  
  return (
    <aside
      className="w-64 flex-shrink-0 h-full border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col transition-colors overflow-y-auto overflow-x-hidden"
    >
      {/* User Info */}
      <div className="p-4 border-b border-gray-300 dark:border-gray-700">
        <p className="text-[12px] text-gray-500 dark:text-gray-400 mb-1">Connecté en tant que</p>
        <p className="text-[14px] font-medium text-black dark:text-white truncate">
          {user?.email || 'Chargement...'}
        </p>
        {/* PRO Badge or Upgrade Button */}
        {userPlan === 'pro' ? (
          <div className="mt-3 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-[12px] font-medium flex items-center gap-2">
            <Zap size={14} className="text-white" />
            <span>NAELIV PRO</span>
          </div>
        ) : (
          <motion.button
            onClick={() => window.location.href = '/paiement'}
            className="mt-3 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-[12px] font-medium hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Zap size={14} className="text-white" />
            <span>Passer à PRO</span>
          </motion.button>
        )}
      </div>

      {/* Compose Button */}
      <div className="p-4">
        <motion.button
          onClick={() => onComposeNew()}
          className="w-full px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {t.newMessage}
        </motion.button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <NavItem 
          icon={Inbox} 
          label={t.inbox} 
          active={activeFolder === 'inbox'} 
          count={countVisibility?.inbox ? safeFolderCounts.inbox : undefined}
          onClick={() => setActiveFolder('inbox')}
        />
        <NavItem 
          icon={Star} 
          label={t.starred} 
          active={activeFolder === 'starred'}
          count={countVisibility?.starred ? safeFolderCounts.starred : undefined}
          onClick={() => setActiveFolder('starred')}
        />
        <NavItem 
          icon={Send} 
          label={t.sent}
          active={activeFolder === 'sent'}
          count={countVisibility?.sent ? safeFolderCounts.sent : undefined}
          onClick={() => setActiveFolder('sent')}
        />
        <NavItem 
          icon={Reply} 
          label={t.replied} 
          active={activeFolder === 'replied'}
          count={countVisibility?.replied ? safeFolderCounts.replied : undefined}
          onClick={() => setActiveFolder('replied')}
        />
        <NavItem 
          icon={Archive} 
          label={t.archived} 
          active={activeFolder === 'archived'}
          count={countVisibility?.archived ? safeFolderCounts.archived : undefined}
          onClick={() => setActiveFolder('archived')}
        />
        <NavItem 
          icon={Trash2} 
          label={t.trash} 
          active={activeFolder === 'trash'}
          count={countVisibility?.trash ? safeFolderCounts.trash : undefined}
          onClick={() => setActiveFolder('trash')}
        />

        {/* Admin Section */}
        {user?.email?.toLowerCase() === 'gabi@naeliv.com' && (
          <>
            <div className="my-4 border-t border-gray-300 dark:border-gray-700"></div>
            <div className="mb-2">
              <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2 px-4">ZONE ADMIN</p>
              <AdminNavItem 
                icon={Users} 
                label="Live Users" 
                router={router}
                onlineCount={onlineUsersCount}
              />
              <AdminNavItem 
                icon={AlertTriangle} 
                label="Maintenance" 
                router={router}
              />
              <AdminNavItem 
                icon={Key} 
                label="Bêta Access" 
                router={router}
              />
            </div>
          </>
        )}
      </nav>
    </aside>
  );
});

interface NavItemProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
}

function NavItem({ icon: Icon, label, active = false, count, onClick }: NavItemProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full px-4 py-3 rounded-lg text-left text-[15px] flex items-center justify-between transition-colors ${
        active 
          ? 'bg-gray-100 dark:bg-gray-700 text-black dark:text-white' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
      whileHover={{ scale: active ? 1 : 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className={active ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'} />
        <span>{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black text-[12px] font-medium flex items-center justify-center">
          {count}
        </span>
      )}
    </motion.button>
  );
}

interface EmailListProps {
  emails: any[];
  selectedEmail: number | null;
  onSelectEmail: (index: number) => void;
  activeFolder: string;
  isLoading?: boolean;
  folderCounts: {
    inbox: number;
    starred: number;
    archived: number;
    trash: number;
    sent: number;
    replied: number;
  };
  onToggleStar?: (index: number, e?: React.MouseEvent) => void;
}

function EmailList({ emails, selectedEmail, onSelectEmail, activeFolder, isLoading = false, folderCounts, onToggleStar }: EmailListProps) {
  const [hoveredEmailIndex, setHoveredEmailIndex] = useState<number | null>(null);
  const { language } = useTheme();
  const t = translations[language];
  const [showSkeleton, setShowSkeleton] = useState(false);
  
  const folderLabels: Record<string, string> = {
    inbox: t.inbox,
    starred: t.starred,
    sent: t.sent,
    archived: t.archived,
    trash: t.trash,
  };

  // Delayed skeleton display: only show after 300ms
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowSkeleton(true);
      }, 300);

      return () => {
        clearTimeout(timer);
        setShowSkeleton(false);
      };
    } else {
      // Reset when loading is done
      setShowSkeleton(false);
    }
  }, [isLoading]);

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="divide-y divide-gray-200 dark:divide-gray-700 overflow-x-hidden">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              </div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  
  return (
    <div
      className="w-96 h-full overflow-y-auto overflow-x-hidden border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors"
      style={{ overflowX: 'hidden' }}
    >
      <div className="p-4 border-b border-gray-300 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10" style={{ minHeight: '72px', willChange: 'auto' }}>
        <h2 className="text-[18px] font-bold mb-1 text-black dark:text-white">{folderLabels[activeFolder] || t.inbox}</h2>
        <div className="h-4 flex items-center" style={{ minHeight: '16px' }}>
          <p className="text-[12px] text-gray-500 dark:text-gray-400 flex items-baseline gap-1">
            <span className="inline-block text-right tabular-nums" style={{ minWidth: '32px' }}>
              {folderCounts[activeFolder as keyof typeof folderCounts] || 0}
            </span>
            <span>message{(folderCounts[activeFolder as keyof typeof folderCounts] || 0) !== 1 ? 's' : ''}</span>
          </p>
        </div>
      </div>

      {isLoading && showSkeleton ? (
        <SkeletonLoader />
      ) : (
      <div 
        className="divide-y divide-gray-200 dark:divide-gray-700 overflow-x-hidden"
      >
        {emails.map((email, index) => {
          // Calculate days remaining (30 days auto-delete)
          const daysRemaining = email.daysAgo !== undefined && email.daysAgo >= 25 && email.daysAgo < 30 
            ? 30 - email.daysAgo 
            : null;
          
          // Format date display
          const getDateDisplay = () => {
            if (daysRemaining !== null) {
              return null; // Will be shown as badge below
            }
            return email.time || email.date;
          };

          return (
            <div
              key={email.id}
              className={`p-4 cursor-pointer transition-colors relative group ${
                selectedEmail === index 
                  ? 'bg-blue-50 dark:bg-blue-900/20' 
                  : !email.read
                  ? 'bg-blue-50/50 dark:bg-blue-900/10'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => onSelectEmail(index)}
              onMouseEnter={() => setHoveredEmailIndex(index)}
              onMouseLeave={() => setHoveredEmailIndex(null)}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-center justify-between mb-1 min-w-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                      {!email.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                      {email.hasPaidStamp && (
                        <Shield size={14} className="text-blue-600 flex-shrink-0" strokeWidth={2.5} />
                      )}
                      {/* Avatar avec initiales */}
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[14px] font-semibold flex-shrink-0"
                        style={{ backgroundColor: getAvatarColor(email.from_name || email.from_email) }}
                      >
                        {getInitials(email.from_name || email.from_email)}
                      </div>
                      {/* Nom et email */}
                      <div className="flex-1 min-w-0">
                        {email.from_name ? (
                          <>
                            <p className={`text-[14px] truncate min-w-0 ${!email.read ? 'font-bold text-black dark:text-white' : 'font-semibold text-black dark:text-white'}`}>
                              {email.from_name}
                            </p>
                            <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate min-w-0">
                              {email.from_email}
                            </p>
                          </>
                        ) : (
                          <p className={`text-[14px] truncate min-w-0 ${!email.read ? 'font-bold text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                            {email.from_email || email.from}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {/* Bouton étoile - visible au survol ou si déjà favori */}
                      {(hoveredEmailIndex === index || email.starred) && onToggleStar && (
                        <motion.button
                          onClick={(e) => onToggleStar(index, e)}
                          className={`p-1 rounded transition-colors ${
                            email.starred 
                              ? 'text-yellow-500 hover:text-yellow-600' 
                              : 'text-gray-400 hover:text-yellow-500'
                          }`}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          title={email.starred ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        >
                          <Star 
                            size={16} 
                            className={email.starred ? 'fill-yellow-500' : ''} 
                            strokeWidth={email.starred ? 0 : 2}
                          />
                        </motion.button>
                      )}
                      {getDateDisplay() && (
                        <span className="text-[12px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {getDateDisplay()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1 min-w-0">
                    {(() => {
                      const { tag, cleanSubject } = extractTagFromSubject(email.subject);
                      const tagColors = getEmailTagColor(tag);
                      return (
                        <>
                          {tag && (
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border flex-shrink-0 ${tagColors.bg} ${tagColors.text} ${tagColors.border}`}>
                              {tag}
                            </span>
                          )}
                          <p className={`text-[14px] truncate flex-1 min-w-0 ${!email.read ? 'font-semibold text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                            {cleanSubject}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                  <p className="text-[12px] text-gray-500 dark:text-gray-400 line-clamp-2 mb-1 min-w-0 break-words">{email.preview}</p>
                  
                  {/* Days remaining badge */}
                  {daysRemaining !== null && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <AlertTriangle size={12} className="text-red-500 flex-shrink-0" />
                      <span className="text-[11px] font-medium text-red-600 dark:text-red-400">
                        {daysRemaining} jours restants
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}

interface EmailViewerProps {
  email: any;
  emailIndex?: number | null;
  activeFolder: 'inbox' | 'starred' | 'archived' | 'trash' | 'sent' | 'replied';
  onArchive: (index: number) => void;
  onDelete: (index: number) => void;
  onReply: (email: any) => void;
  onForward: (email: any) => void;
  loadEmails: (folder: 'inbox' | 'starred' | 'archived' | 'trash' | 'sent' | 'replied') => void;
  loadFolderCounts: () => void;
}

function EmailViewer({ email, activeFolder, onArchive, onDelete, onReply, onForward, loadEmails, loadFolderCounts }: EmailViewerProps) {
  const { language } = useTheme();
  const t = translations[language];
  const [emailIndex, setEmailIndex] = useState<number | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [isForwarding, setIsForwarding] = useState(false);
  const [replyTo, setReplyTo] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [forwardTo, setForwardTo] = useState('');
  const [forwardSubject, setForwardSubject] = useState('');
  const [forwardBody, setForwardBody] = useState('');
  const [emailSummary, setEmailSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isFixingText, setIsFixingText] = useState(false);
  const [userPlan, setUserPlan] = useState<'essential' | 'pro'>('essential');
  
  // Récupérer le plan de l'utilisateur
  useEffect(() => {
    const fetchUserPlan = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_pro, plan')
          .eq('id', user.id)
          .single();
        if (profile) {
          // Déterminer le plan : PRO si is_pro est true OU si plan est 'pro'
          if (profile.is_pro === true || profile.plan === 'pro') {
            setUserPlan('pro');
          } else {
            setUserPlan('essential');
          }
        }
      }
    };
    fetchUserPlan();
  }, []);
  
  useEffect(() => {
    if (email) {
      // Find email index in filtered list - this will be handled by parent
      setEmailIndex(0); // Temporary, will be fixed
    }
  }, [email]);

  // Reset reply/forward state when email changes
  useEffect(() => {
    setIsReplying(false);
    setIsForwarding(false);
    setReplyTo('');
    setReplySubject('');
    setReplyBody('');
    setForwardTo('');
    setForwardSubject('');
    setForwardBody('');
    setEmailSummary(null);
    setShowAIMenu(false);
  }, [email?.id]);

  // Fermer le menu IA quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.ai-menu-container')) {
        setShowAIMenu(false);
      }
    };
    if (showAIMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAIMenu]);

  const handleReplyClick = () => {
    if (!email) return;
    setIsReplying(true);
    setIsForwarding(false);
    setReplyTo(email.from);
    setReplySubject(`Re: ${email.subject}`);
    setReplyBody('');
  };

  const handleForwardClick = () => {
    if (!email) return;
    setIsForwarding(true);
    setIsReplying(false);
    setForwardTo('');
    setForwardSubject(`Fwd: ${email.subject}`);
    // Pré-remplir avec le contenu original
    setForwardBody(`\n\n---------- Message transféré ----------\nDe: ${email.from}\nDate: ${email.date} ${email.time || ''}\nSujet: ${email.subject}\n\n${email.preview}`);
  };

  const handleSendReply = async () => {
    if (!replyTo || !replySubject || !replyBody.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      // Récupérer le token d'authentification
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      // Récupérer le plan de l'utilisateur
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user?.id)
        .single();

      // Préparer le texte et HTML (la signature sera ajoutée automatiquement par l'API pour les Essential)
      let replyText = replyBody;
      let replyHtml = `<p>${replyBody.replace(/\n/g, '<br>')}</p>`;

      // Préparer les headers pour la réponse (fil de discussion)
      const inReplyTo = email.message_id || email.id?.toString();
      const references = email.email_references || inReplyTo;

      // Envoyer l'email via l'API
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          to: replyTo,
          subject: replySubject,
          text: replyText,
          html: replyHtml,
          inReplyTo: inReplyTo || undefined,
          references: references || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ [SEND REPLY] Erreur API:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          details: data.details,
          fullData: data
        });
        const errorMessage = data.error || data.details?.message || `Erreur lors de l'envoi (${response.status})`;
        throw new Error(errorMessage);
      }

      toast.success('Email envoyé avec succès');
      
      // Réinitialiser le formulaire
      setIsReplying(false);
      setReplyTo('');
      setReplySubject('');
      setReplyBody('');
      
      // Appeler le callback parent pour recharger les emails
      if (onReply) {
        onReply(email);
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'email');
    }
  };

  const handleSendForward = async () => {
    if (!forwardTo || !forwardSubject || !forwardBody.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      // Récupérer le token d'authentification
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      // Préparer le texte et HTML (la signature sera ajoutée automatiquement par l'API pour les Essential)
      let forwardText = forwardBody;
      let forwardHtml = `<p>${forwardBody.replace(/\n/g, '<br>')}</p>`;

      // Envoyer l'email via l'API
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          to: forwardTo,
          subject: forwardSubject,
          text: forwardText,
          html: forwardHtml,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      toast.success('Email transféré avec succès');
      
      // Réinitialiser le formulaire
      setIsForwarding(false);
      setForwardTo('');
      setForwardSubject('');
      setForwardBody('');
      
      // Appeler le callback parent pour recharger les emails
      if (onForward) {
        onForward(email);
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'email');
    }
  };

  const handleCancelCompose = () => {
    setIsReplying(false);
    setIsForwarding(false);
    setReplyTo('');
    setReplySubject('');
    setReplyBody('');
    setForwardTo('');
    setForwardSubject('');
    setForwardBody('');
  };

  // Fonction pour générer le résumé TL;DR
  const handleGenerateSummary = async () => {
    if (!email) return;
    
    if (userPlan !== 'pro') {
      toast.error('Fonctionnalité réservée aux membres Naeliv PRO.');
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      const emailBody = email.body || email.body_html || email.preview || '';
      if (!emailBody) {
        toast.error('Aucun contenu à résumer');
        return;
      }

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: 'summary',
          data: { emailBody: emailBody.replace(/<[^>]*>/g, '') } // Enlever le HTML
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération du résumé');
      }

      setEmailSummary(data.text);
      toast.success('Résumé généré avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la génération du résumé:', error);
      toast.error(error.message || 'Erreur lors de la génération du résumé');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Fonction pour générer une réponse avec l'IA
  const handleGenerateDraft = async (intention: string) => {
    if (userPlan !== 'pro') {
      toast.error('Fonctionnalité réservée aux membres Naeliv PRO.');
      return;
    }

    // Pour "Rendre PRO", vérifier qu'il y a du texte
    const currentText = isReplying ? replyBody : isForwarding ? forwardBody : '';
    if (intention === 'Rendre PRO' && !currentText.trim()) {
      toast.error('Écrivez d\'abord votre message avant de le rendre plus professionnel.');
      return;
    }

    setIsGeneratingDraft(true);
    setShowAIMenu(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      const originalEmail = email ? `${email.subject}\n\n${email.body || email.preview || ''}` : '';
      // Pour "Rendre PRO", utiliser le texte existant dans replyBody ou forwardBody
      const textToImprove = intention === 'Rendre PRO' ? currentText.trim() : '';
      
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: 'draft',
          data: { 
            originalEmail: intention === 'Rendre PRO' ? '' : originalEmail.replace(/<[^>]*>/g, ''),
            intention,
            existingText: textToImprove // Passer le texte existant pour "Rendre PRO"
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      // Insérer le texte généré dans le champ de réponse
      if (isReplying) {
        setReplyBody(data.text);
      } else if (isForwarding) {
        setForwardBody(data.text);
      }
      toast.success(intention === 'Rendre PRO' ? 'Texte rendu plus professionnel' : 'Réponse générée avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la génération:', error);
      toast.error(error.message || 'Erreur lors de la génération');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  // Fonction pour corriger le texte
  const handleFixText = async () => {
    if (userPlan !== 'pro') {
      toast.error('Fonctionnalité réservée aux membres Naeliv PRO.');
      return;
    }

    const currentText = isReplying ? replyBody : isForwarding ? forwardBody : '';
    if (!currentText.trim()) {
      toast.error('Aucun texte à corriger');
      return;
    }

    setIsFixingText(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: 'fix',
          data: { text: currentText }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la correction');
      }

      // Utiliser directement le texte corrigé (sans extraire d'explications)
      const correctedText = data.text.trim();

      // Remplacer le texte
      if (isReplying) {
        setReplyBody(correctedText);
      } else if (isForwarding) {
        setForwardBody(correctedText);
      }

      toast.success('Correction effectuée');
    } catch (error: any) {
      console.error('Erreur lors de la correction:', error);
      toast.error(error.message || 'Erreur lors de la correction');
    } finally {
      setIsFixingText(false);
    }
  };

  if (!email) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="text-center">
          <Mail size={64} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-[18px] text-gray-500 dark:text-gray-400">{t.selectEmail}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 h-full overflow-y-auto overflow-x-hidden bg-white dark:bg-gray-900 transition-colors"
    >
      <div className="max-w-4xl mx-auto p-8 w-full">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {(() => {
              const { tag, cleanSubject } = extractTagFromSubject(email.subject);
              const tagColors = getEmailTagColor(tag);
              return (
                <>
                  {tag && (
                    <span className={`px-3 py-1 rounded-full text-[12px] font-semibold border flex-shrink-0 ${tagColors.bg} ${tagColors.text} ${tagColors.border}`}>
                      {tag}
                    </span>
                  )}
                  <h1 className="text-[32px] font-bold text-black dark:text-white">{cleanSubject}</h1>
                </>
              );
            })()}
          </div>
          <div className="flex items-center gap-4 text-[14px]">
            <div className="flex items-center gap-3 flex-1">
              {/* Avatar avec initiales */}
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-[18px] font-semibold flex-shrink-0"
                style={{ backgroundColor: getAvatarColor(email.from_name || email.from_email) }}
              >
                {getInitials(email.from_name || email.from_email)}
              </div>
              {/* Nom et email */}
              <div className="flex-1 min-w-0">
                {email.from_name ? (
                  <>
                    <p className="font-bold text-black dark:text-white text-[16px]">
                      {email.from_name}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-[14px]">
                      {email.from_email}
                    </p>
                  </>
                ) : (
                  <p className="font-bold text-black dark:text-white text-[16px]">
                    {email.from_email || email.from}
                  </p>
                )}
              </div>
            </div>
            <div className="ml-auto text-gray-500 dark:text-gray-400 text-[14px] whitespace-nowrap">
              {email.date} {email.time && `à ${email.time}`}
            </div>
          </div>
        </div>

        {/* Bouton TL;DR */}
        {userPlan === 'pro' && (
          <div className="mb-4 flex justify-end">
            <motion.button
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-full text-purple-700 dark:text-purple-300 text-[14px] hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles size={16} />
              {isGeneratingSummary ? 'Génération...' : 'Résumer'}
            </motion.button>
          </div>
        )}

        {/* Résumé généré */}
        {emailSummary && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-[14px] font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                <Sparkles size={16} />
                Résumé
              </h3>
              <button
                onClick={() => setEmailSummary(null)}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
              >
                <X size={16} />
              </button>
            </div>
            <div className="text-[14px] text-purple-800 dark:text-purple-200 whitespace-pre-line">
              {emailSummary}
            </div>
          </motion.div>
        )}

        <div className="prose max-w-none">
          {email.body_html ? (
            <div 
              className="text-[16px] leading-relaxed text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: email.body_html }}
            />
          ) : email.body ? (
            <p className="text-[16px] leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {email.body}
            </p>
          ) : email.preview ? (
            <p className="text-[16px] leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {email.preview}
            </p>
          ) : (
            <p className="text-[16px] leading-relaxed text-gray-500 dark:text-gray-400 italic">
              Aucun contenu disponible
            </p>
          )}
        </div>

        {/* Zone de composition pour Répondre */}
        {isReplying && (
          <motion.div
            className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-700"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                  À
                </label>
                <input
                  type="text"
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-black dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sujet
                </label>
                <input
                  type="text"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-black dark:text-white"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300">
                    Message
                  </label>
                  {userPlan === 'pro' && (
                    <div className="flex items-center gap-2">
                      <div className="relative ai-menu-container">
                        <motion.button
                          onClick={() => setShowAIMenu(!showAIMenu)}
                          disabled={isGeneratingDraft}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-full text-purple-700 dark:text-purple-300 text-[12px] hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-50"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Wand2 size={14} />
                          <span className="ml-1">IA Magic</span>
                        </motion.button>
                        {showAIMenu && (
                          <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-xl z-50 min-w-[180px]">
                            <button
                              onClick={() => handleGenerateDraft('Réponse positive')}
                              className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-xl"
                            >
                              Réponse positive
                            </button>
                            <button
                              onClick={() => handleGenerateDraft('Refus poli')}
                              className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              Refus poli
                            </button>
                            <button
                              onClick={() => handleGenerateDraft('Demander détails')}
                              className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              Demander détails
                            </button>
                            <button
                              onClick={() => handleGenerateDraft('Rendre PRO')}
                              className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-gray-700 last:rounded-b-xl"
                            >
                              Rendre PRO
                            </button>
                          </div>
                        )}
                      </div>
                      <motion.button
                        onClick={handleFixText}
                        disabled={isFixingText || !replyBody.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-full text-blue-700 dark:text-blue-300 text-[13px] font-medium hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/40 dark:hover:to-indigo-900/30 hover:border-blue-300 dark:hover:border-blue-600 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <GraduationCap size={15} className="text-blue-600 dark:text-blue-400" />
                        <span className="flex items-center gap-1">
                          <GraduationCap size={14} />
                          <span>Corriger</span>
                        </span>
                      </motion.button>
                    </div>
                  )}
                </div>
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-black dark:text-white resize-y"
                  placeholder="Tapez votre réponse..."
                />
              </div>
              <div className="flex gap-3">
                <motion.button
                  onClick={handleSendReply}
                  className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Send size={16} />
                  Envoyer
                </motion.button>
                <motion.button
                  onClick={handleCancelCompose}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-full text-[14px] hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Annuler
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Zone de composition pour Transférer */}
        {isForwarding && (
          <motion.div
            className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-700"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                  À
                </label>
                <input
                  type="text"
                  value={forwardTo}
                  onChange={(e) => setForwardTo(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-black dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sujet
                </label>
                <input
                  type="text"
                  value={forwardSubject}
                  onChange={(e) => setForwardSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-black dark:text-white"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300">
                    Message
                  </label>
                  {userPlan === 'pro' && (
                    <motion.button
                      onClick={handleFixText}
                      disabled={isFixingText || !forwardBody.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-full text-purple-700 dark:text-purple-300 text-[12px] hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <GraduationCap size={14} />
                      <span className="ml-1">Corriger</span>
                    </motion.button>
                  )}
                </div>
                <textarea
                  value={forwardBody}
                  onChange={(e) => setForwardBody(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-black dark:text-white resize-y"
                  placeholder="Ajoutez un message optionnel..."
                />
              </div>
              <div className="flex gap-3">
                <motion.button
                  onClick={handleSendForward}
                  className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Send size={16} />
                  Envoyer
                </motion.button>
                <motion.button
                  onClick={handleCancelCompose}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-full text-[14px] hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Annuler
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Boutons d'action - Masqués si on est en mode composition */}
        {!isReplying && !isForwarding && (
          <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-700 flex gap-3">
            <motion.button
              onClick={handleReplyClick}
              className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-full text-[14px] hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t.reply}
            </motion.button>
            <motion.button
              onClick={handleForwardClick}
              className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-full text-[14px] hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t.forward}
            </motion.button>
            <motion.button
              onClick={() => {
                if (emailIndex !== null) {
                  onArchive(emailIndex);
                }
              }}
              className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-full text-[14px] hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t.archive}
            </motion.button>
            {activeFolder === 'trash' ? (
              <motion.button
                onClick={async () => {
                  if (emailIndex !== null && email?.dbId) {
                    try {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) return;

                      const { error } = await supabase
                        .from('emails')
                        .update({ deleted: false, deleted_at: null })
                        .eq('id', email.dbId)
                        .eq('user_id', user.id);

                      if (error) {
                        console.error('Error restoring email:', error);
                        toast.error('Erreur lors de la restauration');
                      } else {
                        toast.success('Email restauré avec succès');
                        // Recharger les emails
                        loadEmails(activeFolder);
                        loadFolderCounts();
                        // Recharger aussi la boîte de réception
                        loadEmails('inbox');
                      }
                    } catch (error: any) {
                      console.error('Error restoring email:', error);
                      toast.error('Erreur lors de la restauration');
                    }
                  }
                }}
                className="px-6 py-3 border border-green-300 dark:border-green-700 rounded-full text-[14px] hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Restaurer
              </motion.button>
            ) : (
              <motion.button
                onClick={() => {
                  if (emailIndex !== null) {
                    onDelete(emailIndex);
                  }
                }}
                className="px-6 py-3 border border-red-300 dark:border-red-700 rounded-full text-[14px] hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Supprimer
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CONTACTS PANEL (Non-Admin Only)
// ============================================================================

interface ContactsPanelProps {
  contacts: any[];
  isLoading: boolean;
  onClose: () => void;
  onComposeNew: (email?: string) => void;
  onContactAdded?: () => void;
}

function ContactsPanel({ contacts, isLoading, onClose, onComposeNew, onContactAdded }: ContactsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [suggestedContacts, setSuggestedContacts] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Charger les suggestions au montage du composant
  useEffect(() => {
    loadSuggestedContacts();
  }, [contacts]);

  const loadSuggestedContacts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setIsLoadingSuggestions(true);
    try {
      // Récupérer les 20 derniers emails envoyés
      const { data: sentEmails, error } = await supabase
        .from('emails')
        .select('to_email')
        .eq('user_id', user.id)
        .eq('folder', 'sent')
        .not('to_email', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('❌ [CONTACTS] Error loading suggestions:', error);
        return;
      }

      // Extraire les emails uniques qui ne sont pas déjà dans les contacts
      const contactEmails = new Set(contacts.map(c => c.email.toLowerCase()));
      const uniqueEmails = new Map<string, { email: string; name: string | null }>();

      sentEmails?.forEach((email: any) => {
        // to_email peut être un array ou une string
        const toEmails = Array.isArray(email.to_email) ? email.to_email : [email.to_email];
        
        toEmails.forEach((toEmail: string) => {
          if (!toEmail) return;
          
          const emailLower = toEmail.toLowerCase().trim();
          if (emailLower && !contactEmails.has(emailLower) && !uniqueEmails.has(emailLower)) {
            // Chercher le nom dans les contacts existants si possible
            const existingContact = contacts.find(c => c.email.toLowerCase() === emailLower);
            uniqueEmails.set(emailLower, {
              email: toEmail,
              name: existingContact?.name || null
            });
          }
        });
      });

      // Limiter à 5 suggestions
      setSuggestedContacts(Array.from(uniqueEmails.values()).slice(0, 5));
    } catch (error) {
      console.error('❌ [CONTACTS] Unexpected error loading suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (contact.name?.toLowerCase().includes(query) || false) ||
      contact.email.toLowerCase().includes(query)
    );
  });

  const handleContactClick = (email: string) => {
    onComposeNew(email);
    onClose();
  };

  const handleAddContact = async () => {
    if (!newContactEmail || !newContactEmail.includes('@')) {
      toast.error('Veuillez entrer une adresse email valide');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          email: newContactEmail.toLowerCase().trim(),
          name: newContactName.trim() || null,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Ce contact existe déjà');
        } else {
          console.error('❌ [CONTACTS] Error adding contact:', error);
          toast.error('Erreur lors de l\'ajout du contact');
        }
        return;
      }

      toast.success('Contact ajouté avec succès');
      setNewContactName('');
      setNewContactEmail('');
      setShowAddForm(false);
      
      // Recharger les contacts
      if (onContactAdded) {
        onContactAdded();
      }
    } catch (error) {
      console.error('❌ [CONTACTS] Unexpected error:', error);
      toast.error('Erreur lors de l\'ajout du contact');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSuggestedContact = async (email: string, name: string | null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          email: email.toLowerCase().trim(),
          name: name || null,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Ce contact existe déjà');
        } else {
          console.error('❌ [CONTACTS] Error adding suggested contact:', error);
          toast.error('Erreur lors de l\'ajout');
        }
        return;
      }

      toast.success('Contact ajouté');
      // Retirer de la liste des suggestions
      setSuggestedContacts(prev => prev.filter(s => s.email.toLowerCase() !== email.toLowerCase()));
      
      // Recharger les contacts
      if (onContactAdded) {
        onContactAdded();
      }
    } catch (error) {
      console.error('❌ [CONTACTS] Unexpected error:', error);
      toast.error('Erreur lors de l\'ajout');
    }
  };

  return (
    <div className="w-96 flex-shrink-0 h-full overflow-y-auto border-l border-y border-black/10 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors flex flex-col shadow-xl">
      <div className="p-4 border-b border-gray-300 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10" style={{ minHeight: '72px', willChange: 'auto' }}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[18px] font-bold text-black dark:text-white">Contacts</h2>
          <motion.button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={18} className="text-gray-600 dark:text-gray-400" />
          </motion.button>
        </div>
        <div className="h-4 flex items-center" style={{ minHeight: '16px' }}>
          <p className="text-[12px] text-gray-500 dark:text-gray-400 flex items-baseline gap-1">
            {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un contact..."
            className="w-full pl-12 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-full text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-900 text-black dark:text-white"
          />
        </div>
        {!showAddForm && (
          <motion.button
            onClick={() => setShowAddForm(true)}
            className="w-full px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <UserPlus size={16} />
            <span>Ajouter</span>
          </motion.button>
        )}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <input
              type="text"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              placeholder="Nom (optionnel)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-black dark:text-white"
            />
            <input
              type="email"
              value={newContactEmail}
              onChange={(e) => setNewContactEmail(e.target.value)}
              placeholder="Email *"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-black dark:text-white"
            />
            <div className="flex items-center gap-2">
              <motion.button
                onClick={handleAddContact}
                disabled={isSaving || !newContactEmail}
                className="flex-1 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isSaving ? 1 : 1.02 }}
                whileTap={{ scale: isSaving ? 1 : 0.98 }}
              >
                {isSaving ? 'Ajout...' : 'Sauvegarder'}
              </motion.button>
              <motion.button
                onClick={() => {
                  setShowAddForm(false);
                  setNewContactName('');
                  setNewContactEmail('');
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-[14px] hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Annuler
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
        </div>
      ) : (
        <>
          {filteredContacts.length === 0 && !searchQuery ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <Users size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-[14px] text-gray-500 dark:text-gray-400">
                  Aucun contact
                </p>
              </div>
            </div>
          ) : filteredContacts.length === 0 && searchQuery ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <Search size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-[14px] text-gray-500 dark:text-gray-400">
                  Aucun contact trouvé
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredContacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  onClick={() => handleContactClick(contact.email)}
                  className="p-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar avec initiales */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[12px] font-semibold flex-shrink-0"
                      style={{ backgroundColor: getAvatarColor(contact.name || contact.email) }}
                    >
                      {getInitials(contact.name || contact.email)}
                    </div>
                    {/* Nom et email */}
                    <div className="flex-1 min-w-0">
                      {contact.name ? (
                        <>
                          <p className="text-[14px] font-semibold text-black dark:text-white truncate">
                            {contact.name}
                          </p>
                          <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate">
                            {contact.email}
                          </p>
                        </>
                      ) : (
                        <p className="text-[14px] font-semibold text-black dark:text-white truncate">
                          {contact.email}
                        </p>
                      )}
                    </div>
                    {contact.is_trusted && (
                      <Shield size={14} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Section Suggestions */}
          {!searchQuery && (contacts.length === 0 || suggestedContacts.length > 0) && (
            <div className="border-t border-gray-300 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
              <h3 className="text-[14px] font-semibold text-black dark:text-white mb-3">
                Suggérés
              </h3>
              {isLoadingSuggestions ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black dark:border-white"></div>
                </div>
              ) : suggestedContacts.length === 0 ? (
                <p className="text-[12px] text-gray-500 dark:text-gray-400 text-center py-2">
                  Aucune suggestion
                </p>
              ) : (
                <div className="space-y-2">
                  {suggestedContacts.map((suggestion, index) => (
                    <motion.div
                      key={`${suggestion.email}-${index}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex-1 min-w-0">
                        {suggestion.name ? (
                          <>
                            <p className="text-[13px] font-medium text-black dark:text-white truncate">
                              {suggestion.name}
                            </p>
                            <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate">
                              {suggestion.email}
                            </p>
                          </>
                        ) : (
                          <p className="text-[13px] font-medium text-black dark:text-white truncate">
                            {suggestion.email}
                          </p>
                        )}
                      </div>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddSuggestedContact(suggestion.email, suggestion.name);
                        }}
                        className="p-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex-shrink-0"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Plus size={14} />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================================
// SYSTEM MONITOR (Admin Only)
// ============================================================================

interface SystemMonitorProps {
  emails: any[];
  activeSystemTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

function SystemMonitor({ emails, activeSystemTag, onTagSelect }: SystemMonitorProps) {
  // Filtrer les emails système (avec tags)
  const systemEmails = emails.filter(email => isSystemEmail(email.subject));
  
  // Compter les emails par tag
  const tagCounts: Record<string, number> = {};
  systemEmails.forEach(email => {
    const { tag } = extractTagFromSubject(email.subject);
    if (tag) {
      const tagUpper = tag.toUpperCase();
      tagCounts[tagUpper] = (tagCounts[tagUpper] || 0) + 1;
    }
  });

  // Trier les tags par nombre d'emails (décroissant), puis par nom
  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => {
      // D'abord par nombre d'emails (décroissant)
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }
      // Puis par nom alphabétique
      return a[0].localeCompare(b[0]);
    })
    .map(([tag, count]) => ({ tag, count }));

  const handleTagClick = (tag: string) => {
    // Si le tag est déjà actif, le désélectionner
    if (activeSystemTag?.toUpperCase() === tag.toUpperCase()) {
      onTagSelect(null);
    } else {
      onTagSelect(tag);
    }
  };

  return (
    <div className="w-80 flex-shrink-0 h-full overflow-y-auto border-l border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="p-4 border-b border-gray-300 dark:border-gray-700 sticky top-0 bg-gray-50 dark:bg-gray-900 z-10">
        <h2 className="text-[18px] font-bold text-black dark:text-white mb-1">Flux Système</h2>
        <p className="text-[12px] text-gray-500 dark:text-gray-400">
          {systemEmails.length} email{systemEmails.length !== 1 ? 's' : ''} système
        </p>
      </div>

      {sortedTags.length === 0 ? (
        <div className="p-8 text-center">
          <Mail size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-[14px] text-gray-500 dark:text-gray-400">Aucun email système</p>
        </div>
      ) : (
        <div className="p-4 space-y-2">
          {sortedTags.map(({ tag, count }) => {
            const tagColors = getEmailTagColor(tag);
            const isActive = activeSystemTag?.toUpperCase() === tag.toUpperCase();
            
            return (
              <motion.button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`w-full p-3 rounded-lg text-left transition-colors border-2 ${
                  isActive
                    ? `${tagColors.bg} ${tagColors.border} ${tagColors.text}`
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-[12px] font-semibold border ${tagColors.bg} ${tagColors.text} ${tagColors.border}`}>
                      {tag}
                    </span>
                    {isActive && (
                      <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">
                        (actif)
                      </span>
                    )}
                  </div>
                  <span className={`text-[14px] font-bold ${isActive ? tagColors.text : 'text-gray-700 dark:text-gray-300'}`}>
                    {count}
                  </span>
                </div>
              </motion.button>
            );
          })}
          
          {/* Bouton pour réinitialiser le filtre */}
          {activeSystemTag && (
            <motion.button
              onClick={() => onTagSelect(null)}
              className="w-full p-3 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-[14px] font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Afficher tous les emails
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SETTINGS PANEL
// ============================================================================

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zenModeActive: boolean;
  onZenModeChange: (active: boolean) => void;
  theme: 'light' | 'dark';
  language: 'fr' | 'nl' | 'de' | 'en';
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'fr' | 'nl' | 'de' | 'en') => void;
  countVisibility: Record<string, boolean>;
  setCountVisibility: (visibility: Record<string, boolean>) => void;
  user: any;
  userPlan: 'essential' | 'pro';
  aliasPurchased: boolean;
}

function SettingsPanel({ 
  open, 
  onOpenChange, 
  zenModeActive, 
  onZenModeChange,
  theme,
  language,
  setTheme,
  setLanguage,
  countVisibility,
  setCountVisibility,
  user,
  userPlan,
  aliasPurchased,
}: SettingsPanelProps) {
  const [notifications, setNotifications] = useState(true);
  const [premiumShield, setPremiumShield] = useState(true);
  const [immersion, setImmersion] = useState(false);
  const [immersionLanguage, setImmersionLanguage] = useState<'en' | 'de' | 'fr' | 'nl' | 'all'>('en');
  const [rewind, setRewind] = useState(true);
  const [stampPrice, setStampPrice] = useState(0.10);
  const [rewindDelay, setRewindDelay] = useState('30');
  const [creditsBalance, setCreditsBalance] = useState(0);
  const [activeSection, setActiveSection] = useState<'compte' | 'fonctionnalites' | 'notifications' | 'affichage' | 'securite' | 'abonnement' | 'parefeu'>('fonctionnalites');
  const t = translations[language];
  
  // Get user email
  const userEmail = user?.email || 'Chargement...';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [emailSignature, setEmailSignature] = useState('--\nCordialement,\nVotre nom');
  
  // Charger les données du profil depuis Supabase
  useEffect(() => {
    if (user?.id) {
      const loadProfile = async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url, credits_balance, paywall_price')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setFirstName(profile.first_name || '');
          setLastName(profile.last_name || '');
          setAvatarUrl(profile.avatar_url || null);
          setCreditsBalance((profile.credits_balance || 0) / 100); // Convertir centimes en euros
          if (profile.paywall_price) {
            setStampPrice((profile.paywall_price || 10) / 100); // Convertir centimes en euros
          }
        }
      };
      loadProfile();
      
      // Écouter les changements de credits_balance en temps réel
      const creditsChannel = supabase
        .channel('credits-updates')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        }, (payload) => {
          if (payload.new.credits_balance !== undefined) {
            setCreditsBalance((payload.new.credits_balance as number) / 100);
          }
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(creditsChannel);
      };
    }
  }, [user?.id]);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [notificationSounds, setNotificationSounds] = useState(true);
  
  // Security settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Firewall settings
  const [blockedDomains, setBlockedDomains] = useState<string[]>([]);
  const [whitelistedSenders, setWhitelistedSenders] = useState<string[]>([]);
  const [firewallSearchQuery, setFirewallSearchQuery] = useState('');
  const [exceptionInputs, setExceptionInputs] = useState<Record<string, string>>({});
  const [loadingFirewall, setLoadingFirewall] = useState(false);
  const [showAllProviders, setShowAllProviders] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showBlockedDomainsModal, setShowBlockedDomainsModal] = useState(false);

  // Liste prédéfinie de fournisseurs (importée depuis lib/email-providers.ts)
  const popularProviders = EMAIL_PROVIDERS;

  // Charger les paramètres du pare-feu depuis Supabase
  useEffect(() => {
    if (open && activeSection === 'parefeu' && user?.id) {
      loadFirewallSettings();
    }
  }, [open, activeSection, user?.id]);

  const loadFirewallSettings = async () => {
    try {
      setLoadingFirewall(true);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('blocked_domains, whitelisted_senders')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erreur lors du chargement des paramètres du pare-feu:', error);
        return;
      }

      if (profile) {
        setBlockedDomains(profile.blocked_domains || []);
        setWhitelistedSenders(profile.whitelisted_senders || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres du pare-feu:', error);
    } finally {
      setLoadingFirewall(false);
    }
  };

  const saveFirewallSettings = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          blocked_domains: blockedDomains,
          whitelisted_senders: whitelistedSenders,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Erreur lors de la sauvegarde des paramètres du pare-feu:', error);
        toast.error('Erreur lors de la sauvegarde');
        return;
      }

      toast.success('Paramètres du pare-feu enregistrés');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres du pare-feu:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  // Vérifier si tous les domaines d'un fournisseur sont bloqués
  const isProviderFullyBlocked = (providerDomains: string[]): boolean => {
    return providerDomains.every(domain => blockedDomains.includes(domain));
  };

  // Bloquer/débloquer tous les domaines d'un fournisseur
  const toggleProviderBlock = async (providerDomains: string[]) => {
    const isFullyBlocked = isProviderFullyBlocked(providerDomains);
    
    let newBlockedDomains: string[];
    if (isFullyBlocked) {
      // Débloquer : retirer tous les domaines du fournisseur
      newBlockedDomains = blockedDomains.filter(d => !providerDomains.includes(d));
    } else {
      // Bloquer : ajouter tous les domaines du fournisseur (sans doublons)
      const domainsToAdd = providerDomains.filter(d => !blockedDomains.includes(d));
      newBlockedDomains = [...blockedDomains, ...domainsToAdd];
    }
    
    setBlockedDomains(newBlockedDomains);
    
    // Sauvegarder automatiquement
    const { error } = await supabase
      .from('profiles')
      .update({ blocked_domains: newBlockedDomains })
      .eq('id', user.id);

    if (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      // Revenir en arrière en cas d'erreur
      setBlockedDomains(blockedDomains);
      toast.error('Erreur lors de la sauvegarde');
    } else {
      const providerName = EMAIL_PROVIDERS.find(p => 
        JSON.stringify(p.domains.sort()) === JSON.stringify(providerDomains.sort())
      )?.name || 'Fournisseur';
      toast.success(isFullyBlocked ? `${providerName} débloqué` : `${providerName} bloqué`);
    }
  };

  const addException = async (providerId: string, email: string) => {
    if (!email || !email.includes('@')) {
      toast.error('Adresse email invalide');
      return;
    }

    const emailLower = email.toLowerCase().trim();
    if (whitelistedSenders.includes(emailLower)) {
      toast.error('Cette adresse est déjà dans les exceptions');
      return;
    }

    const newWhitelistedSenders = [...whitelistedSenders, emailLower];
    setWhitelistedSenders(newWhitelistedSenders);
    setExceptionInputs({ ...exceptionInputs, [providerId]: '' });

    // Sauvegarder automatiquement
    const { error } = await supabase
      .from('profiles')
      .update({ whitelisted_senders: newWhitelistedSenders })
      .eq('id', user.id);

    if (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setWhitelistedSenders(whitelistedSenders);
      toast.error('Erreur lors de la sauvegarde');
    } else {
      toast.success('Exception ajoutée');
    }
  };

  const removeException = async (email: string) => {
    const newWhitelistedSenders = whitelistedSenders.filter(e => e !== email);
    setWhitelistedSenders(newWhitelistedSenders);

    // Sauvegarder automatiquement
    const { error } = await supabase
      .from('profiles')
      .update({ whitelisted_senders: newWhitelistedSenders })
      .eq('id', user.id);

    if (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setWhitelistedSenders(whitelistedSenders);
      toast.error('Erreur lors de la sauvegarde');
    } else {
      toast.success('Exception supprimée');
    }
  };

  const addCustomDomain = async (domain: string) => {
    const domainLower = domain.toLowerCase().trim();
    if (!domainLower || domainLower.includes('@') || domainLower.includes(' ')) {
      toast.error('Domaine invalide');
      return;
    }

    if (blockedDomains.includes(domainLower)) {
      toast.error('Ce domaine est déjà bloqué');
      return;
    }

    const newBlockedDomains = [...blockedDomains, domainLower];
    setBlockedDomains(newBlockedDomains);
    setFirewallSearchQuery('');

    // Sauvegarder automatiquement
    const { error } = await supabase
      .from('profiles')
      .update({ blocked_domains: newBlockedDomains })
      .eq('id', user.id);

    if (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setBlockedDomains(blockedDomains);
      toast.error('Erreur lors de la sauvegarde');
    } else {
      toast.success(`${domainLower} ajouté et bloqué`);
    }
  };

  // Obtenir toutes les catégories uniques
  const categories = Array.from(new Set(popularProviders.map(p => p.category)));

  // Filtrer les fournisseurs selon la recherche et le filtre de catégorie
  const filteredProviders = popularProviders.filter(provider => {
    // Filtrer par catégorie
    if (filterCategory && provider.category !== filterCategory) {
      return false;
    }
    
    // Filtrer par recherche textuelle
    if (firewallSearchQuery) {
      const query = firewallSearchQuery.toLowerCase();
      // Rechercher dans le nom du fournisseur
      if (provider.name.toLowerCase().includes(query)) return true;
      // Rechercher dans les domaines du fournisseur
      if (provider.domains.some(domain => domain.toLowerCase().includes(query))) return true;
      return false;
    }
    
    return true;
  });

  // Limiter l'affichage à 5 par défaut (sauf si recherche active ou showAllProviders)
  const displayProviders = firewallSearchQuery || showAllProviders 
    ? filteredProviders 
    : filteredProviders.slice(0, 5);
  const hasMoreProviders = !firewallSearchQuery && filteredProviders.length > 5 && !showAllProviders;

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onOpenChange(false)}
      />

      {/* Full Screen Panel */}
      <motion.div
        className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Top Header */}
        <div className="h-16 border-b border-gray-300 dark:border-gray-700 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </motion.button>
            <span className="text-[18px] tracking-tighter text-black dark:text-white font-medium">Naeliv</span>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full text-[14px] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Mail size={16} className="text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">Retour à la boîte</span>
            </motion.button>
            <motion.button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
            </motion.button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 flex flex-col">
            {/* User Info */}
            <div className="p-4 border-b border-gray-300 dark:border-gray-700">
              <p className="text-[12px] text-gray-500 dark:text-gray-400 mb-1">Connecté en tant que</p>
              <p className="text-[14px] font-medium text-black dark:text-white truncate">
                {userEmail}
              </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              <SettingsNavItem 
                icon={User} 
                label="Compte" 
                active={activeSection === 'compte'}
                onClick={() => setActiveSection('compte')}
              />
              <SettingsNavItem 
                icon={Zap} 
                label="Fonctionnalités" 
                active={activeSection === 'fonctionnalites'}
                onClick={() => setActiveSection('fonctionnalites')}
              />
              <SettingsNavItem 
                icon={Bell} 
                label="Notifications" 
                active={activeSection === 'notifications'}
                onClick={() => setActiveSection('notifications')}
              />
              <SettingsNavItem 
                icon={Eye} 
                label="Affichage" 
                active={activeSection === 'affichage'}
                onClick={() => setActiveSection('affichage')}
              />
              <SettingsNavItem 
                icon={Lock} 
                label="Sécurité" 
                active={activeSection === 'securite'}
                onClick={() => setActiveSection('securite')}
              />
              <SettingsNavItem 
                icon={CreditCard} 
                label="Abonnement" 
                active={activeSection === 'abonnement'}
                onClick={() => setActiveSection('abonnement')}
              />
              <SettingsNavItem 
                icon={Shield} 
                label="Pare-feu" 
                active={activeSection === 'parefeu'}
                onClick={() => setActiveSection('parefeu')}
              />
            </nav>
          </div>

          {/* Right Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {activeSection === 'affichage' && (
              <div className="p-8">
                <h1 className="text-[32px] font-bold mb-8 text-black dark:text-white">Affichage</h1>
                
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-[20px] font-semibold mb-4 text-black dark:text-white">Compteurs de dossiers</h2>
                    <p className="text-[14px] text-gray-600 dark:text-gray-400 mb-6">
                      Choisissez quels compteurs afficher dans la barre latérale
                    </p>
                    
                    <div className="space-y-3">
                      {[
                        { key: 'inbox', label: 'Boîte de réception', icon: Inbox },
                        { key: 'starred', label: 'Favoris', icon: Star },
                        { key: 'sent', label: 'Envoyés', icon: Send },
                        { key: 'replied', label: 'Répondus', icon: Reply },
                        { key: 'archived', label: 'Archivés', icon: Archive },
                        { key: 'trash', label: 'Corbeille', icon: Trash2 },
                      ].map(({ key, label, icon: Icon }) => (
                        <div key={key} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <div className="flex items-center gap-3">
                            <Icon size={18} className="text-gray-600 dark:text-gray-400" />
                            <span className="text-[14px] text-gray-700 dark:text-gray-300">{label}</span>
                          </div>
                          <Switch
                            checked={countVisibility[key]}
                            onChange={(checked) => {
                              setCountVisibility({
                                ...countVisibility,
                                [key]: checked,
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'fonctionnalites' && (
              <div className="p-8">
                <h1 className="text-[32px] font-bold mb-8 text-black dark:text-white">Fonctionnalités Naeliv</h1>
                
                <div className="space-y-4 max-w-3xl mx-auto">
                  {/* Zen Mode - Disponible pour tous */}
                  <FeatureCard
                    icon={Zap}
                    iconColor="text-black dark:text-white"
                    name="Zen Mode"
                    description={userPlan === 'pro' ? "Recevez vos emails par lots à heures fixes pour rester concentré" : "Recevez vos emails par lots à heures fixes (limité avec Essential)"}
                    enabled={zenModeActive}
                    onToggle={() => onZenModeChange(!zenModeActive)}
                  />

                  {/* Smart Paywall - Disponible pour tous, mais réglage du prix uniquement pour PRO */}
                  <SmartPaywallCard
                    enabled={premiumShield}
                    onToggle={() => {
                      setPremiumShield(!premiumShield);
                      // Si Essential active le Smart Paywall, fixer le prix à 0.10€
                      if (userPlan === 'essential' && !premiumShield) {
                        setStampPrice(0.10);
                      }
                    }}
                    price={stampPrice}
                    onPriceChange={setStampPrice}
                    userPlan={userPlan}
                    creditsBalance={creditsBalance}
                  />

                  {/* Immersion Linguistique - Fonctionnalité à venir */}
                  <FeatureCard
                    icon={Globe}
                    iconColor="text-blue-600"
                    name="Immersion Linguistique"
                    description="Traduisez automatiquement vos emails entrants"
                    enabled={false}
                    onToggle={() => {}}
                    disabled={true}
                    disabledMessage="Fonctionnalité à venir"
                  />

                  {/* Rewind - Fonctionnalité à venir */}
                  <FeatureCard
                    icon={RotateCcw}
                    iconColor="text-orange-600"
                    name="Rewind"
                    description="Annulez l'envoi d'un email dans les secondes suivantes"
                    enabled={false}
                    onToggle={() => {}}
                    disabled={true}
                    disabledMessage="Fonctionnalité à venir"
                  />
                </div>
              </div>
            )}

            {activeSection === 'compte' && (
              <div className="p-8 max-w-3xl mx-auto">
                <h1 className="text-[32px] font-bold mb-8 text-black dark:text-white text-center">Informations du compte</h1>
                
                <div className="space-y-6">
                  {/* Email Address */}
                  <div>
                    <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Adresse email
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    />
                  </div>

                  {/* Photo de profil */}
                  <div>
                    <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Photo de profil
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Photo de profil" className="w-full h-full object-cover" />
                        ) : (
                          <User size={32} className="text-gray-400 dark:text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            // Vérifier la taille du fichier (max 5MB)
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error('Le fichier est trop volumineux (max 5MB)');
                              return;
                            }
                            
                            try {
                              // Vérifier si le bucket existe, sinon le créer via l'API
                              const checkResponse = await fetch('/api/storage/create-avatars-bucket', {
                                method: 'GET'
                              });
                              
                              const checkData = await checkResponse.json();
                              
                              if (!checkData.exists) {
                                // Créer le bucket
                                const createResponse = await fetch('/api/storage/create-avatars-bucket', {
                                  method: 'POST'
                                });
                                
                                const createData = await createResponse.json();
                                
                                if (!createResponse.ok || !createData.success) {
                                  toast.error('Le bucket "avatars" n\'existe pas et n\'a pas pu être créé automatiquement. Veuillez le créer manuellement dans Supabase Storage.');
                                  console.error('Erreur création bucket:', createData);
                                  return;
                                }
                                
                                console.log('✅ Bucket "avatars" créé automatiquement');
                              }
                              
                              // Upload vers Supabase Storage
                              const fileExt = file.name.split('.').pop();
                              const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
                              const filePath = fileName;
                              
                              const { data: uploadData, error: uploadError } = await supabase.storage
                                .from('avatars')
                                .upload(filePath, file, { 
                                  upsert: true,
                                  cacheControl: '3600',
                                  contentType: file.type
                                });
                              
                              if (uploadError) {
                                console.error('❌ [AVATAR UPLOAD] Erreur upload:', uploadError);
                                
                                // Messages d'erreur spécifiques selon le type d'erreur
                                if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
                                  toast.error('Le bucket "avatars" n\'existe pas. Veuillez le créer dans Supabase Storage (voir la documentation).');
                                } else if (uploadError.message?.includes('new row violates row-level security') || uploadError.message?.includes('row-level security')) {
                                  // Afficher un message détaillé avec option de création automatique
                                  console.error('❌ [AVATAR UPLOAD] Erreur RLS détectée.');
                                  
                                  // Demander à l'utilisateur s'il veut créer automatiquement les politiques
                                  const shouldAutoSetup = confirm(
                                    'Erreur de permissions RLS\n\n' +
                                    'SOLUTION RAPIDE (2 minutes) :\n\n' +
                                    '1. Ouvrez Supabase Dashboard → SQL Editor\n' +
                                    '2. Ouvrez le fichier : executer dans sql/setup_avatars_rls_function.sql\n' +
                                    '3. Copiez-collez tout le contenu et cliquez sur "Run"\n' +
                                    '4. Revenez ici et cliquez "OK" pour créer automatiquement les politiques\n\n' +
                                    'Souhaitez-vous que j\'essaie de créer les politiques maintenant ?\n\n' +
                                    '(Si la fonction n\'existe pas encore, suivez les étapes ci-dessus d\'abord)'
                                  );
                                  
                                  if (shouldAutoSetup) {
                                    try {
                                      toast.info('Création des politiques RLS en cours...', { duration: 5000 });
                                      
                                      const setupResponse = await fetch('/api/storage/setup-avatars-rls', {
                                        method: 'POST'
                                      });
                                      
                                      const setupData = await setupResponse.json();
                                      
                                      if (setupData.success) {
                                        toast.success('Politiques RLS créées avec succès ! Réessayez d\'uploader votre photo.', { duration: 8000 });
                                        console.log('✅ [AVATAR UPLOAD] Politiques RLS créées automatiquement');
                                      } else {
                                        // Si la fonction exec_sql n'existe pas, donner les instructions
                                        if (setupData.message?.includes('fonction') || setupData.instructions) {
                                          toast.error('La fonction SQL nécessaire n\'existe pas encore.', { duration: 8000 });
                                          alert(
                                            'Étape préalable requise\n\n' +
                                            'Pour activer la création automatique, exécutez d\'abord ce script SQL dans Supabase SQL Editor :\n\n' +
                                            '📄 Fichier : executer dans sql/setup_avatars_rls_function.sql\n\n' +
                                            '1. Ouvrez Supabase Dashboard → SQL Editor\n' +
                                            '2. Ouvrez le fichier mentionné ci-dessus\n' +
                                            '3. Copiez-collez tout le contenu dans l\'éditeur SQL\n' +
                                            '4. Cliquez sur "Run"\n\n' +
                                            'Ensuite, réessayez d\'uploader votre photo.\n\n' +
                                            'OU créez les politiques manuellement :\n' +
                                            'Dashboard → Storage → Policies → avatars\n\n' +
                                            '📖 Guide : docs/GUIDE_RLS_AVATARS_SIMPLE.md'
                                          );
                                        } else {
                                          toast.error('Impossible de créer les politiques automatiquement. Veuillez suivre le guide manuel.', { duration: 8000 });
                                          console.log('📋 Instructions manuelles :', setupData.instructions || setupData.message);
                                        }
                                      }
                                    } catch (setupError: any) {
                                      console.error('❌ [AVATAR UPLOAD] Erreur lors de la création automatique:', setupError);
                                      toast.error('Erreur lors de la création automatique. Veuillez suivre le guide manuel.', { duration: 8000 });
                                      alert(
                                        'Erreur lors de la création automatique\n\n' +
                                        'Veuillez créer les politiques manuellement :\n\n' +
                                        '1. Ouvrez Supabase Dashboard\n' +
                                        '2. Allez dans Storage → Policies\n' +
                                        '3. Sélectionnez le bucket "avatars"\n' +
                                        '4. Créez les 4 politiques manuellement\n\n' +
                                        '📖 Guide simple : docs/GUIDE_RLS_AVATARS_SIMPLE.md'
                                      );
                                    }
                                  } else {
                                    // Afficher les instructions manuelles
                                    toast.error(
                                      'Erreur de permissions RLS. Les politiques de sécurité doivent être configurées.',
                                      { duration: 10000 }
                                    );
                                    console.log('📋 SOLUTION MANUELLE :');
                                    console.log('1. Ouvrez Supabase Dashboard → Storage → Policies');
                                    console.log('2. Sélectionnez le bucket "avatars"');
                                    console.log('3. Créez les 4 politiques manuellement (voir guide)');
                                    console.log('📖 Guide détaillé : docs/GUIDE_RLS_AVATARS_SIMPLE.md');
                                  }
                                } else if (uploadError.message?.includes('File size exceeds maximum')) {
                                  toast.error('Le fichier est trop volumineux (max 5MB)');
                                } else {
                                  toast.error(`Erreur lors de l'upload: ${uploadError.message || 'Erreur inconnue'}`);
                                }
                                return;
                              }
                              
                              // Récupérer l'URL publique
                              const { data: { publicUrl } } = supabase.storage
                                .from('avatars')
                                .getPublicUrl(filePath);
                              
                              // Mettre à jour le profil
                              const { error: updateError } = await supabase
                                .from('profiles')
                                .update({ avatar_url: publicUrl })
                                .eq('id', user?.id);
                              
                              if (updateError) {
                                console.error('❌ [AVATAR UPLOAD] Erreur mise à jour profil:', updateError);
                                toast.error(`Erreur lors de la mise à jour: ${updateError.message || 'Erreur inconnue'}`);
                                return;
                              }
                              
                              setAvatarUrl(publicUrl);
                              toast.success('Photo de profil mise à jour');
                            } catch (error: any) {
                              console.error('❌ [AVATAR UPLOAD] Erreur inattendue:', error);
                              toast.error(`Erreur: ${error.message || 'Erreur inconnue'}`);
                            }
                          }}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="inline-block px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          Choisir une photo
                        </label>
                        {avatarUrl && (
                          <button
                            onClick={async () => {
                              const { error } = await supabase
                                .from('profiles')
                                .update({ avatar_url: null })
                                .eq('id', user?.id);
                              
                              if (error) {
                                toast.error('Erreur lors de la suppression');
                                return;
                              }
                              
                              setAvatarUrl(null);
                              toast.success('Photo supprimée');
                            }}
                            className="ml-2 px-4 py-2 bg-red-500 text-white rounded-lg text-[14px] font-medium hover:bg-red-600 transition-colors"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Prénom */}
                  <div>
                    <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Votre prénom"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>

                  {/* Nom */}
                  <div>
                    <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Votre nom"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>

                  {/* Email Signature */}
                  <div>
                    <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Signature email
                    </label>
                    <textarea
                      value={emailSignature}
                      onChange={(e) => setEmailSignature(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-black dark:text-white resize-y"
                    />
                  </div>

                  {/* Save Button */}
                  <div className="pt-4">
                    <motion.button
                      onClick={async () => {
                        const { error } = await supabase
                          .from('profiles')
                          .update({
                            first_name: firstName,
                            last_name: lastName,
                          })
                          .eq('id', user?.id);
                        
                        if (error) {
                          toast.error('Erreur lors de la sauvegarde');
                          return;
                        }
                        
                        toast.success('Modifications enregistrées avec succès !');
                      }}
                      className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Enregistrer les modifications
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="p-8 max-w-3xl mx-auto">
                <h1 className="text-[32px] font-bold mb-8 text-black dark:text-white text-center">Notifications</h1>
                
                <div className="space-y-4">
                  {/* Email Notifications */}
                  <NotificationCard
                    title="Notifications email"
                    description="Recevoir des résumés par email"
                    enabled={emailNotifications}
                    onToggle={() => setEmailNotifications(!emailNotifications)}
                  />
                  
                  {/* Push Notifications */}
                  <NotificationCard
                    title="Notifications push"
                    description="Alertes instantanées sur votre appareil"
                    enabled={pushNotifications}
                    onToggle={() => setPushNotifications(!pushNotifications)}
                  />
                  
                  {/* Notification Sounds */}
                  <NotificationCard
                    title="Sons de notification"
                    description="Jouer un son lors de nouveaux emails"
                    enabled={notificationSounds}
                    onToggle={() => setNotificationSounds(!notificationSounds)}
                  />
                </div>
              </div>
            )}

            {activeSection === 'securite' && (
              <div className="p-8 max-w-3xl mx-auto">
                <h1 className="text-[32px] font-bold mb-8 text-black dark:text-white text-center">Sécurité & Confidentialité</h1>
                
                <div className="space-y-8">
                  {/* Change Password Section */}
                  <div>
                    <h2 className="text-[20px] font-semibold text-black dark:text-white mb-4">Changer le mot de passe</h2>
                    <div className="space-y-4">
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Mot de passe actuel"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nouveau mot de passe"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmer le nouveau mot de passe"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                      <motion.button
                        onClick={() => {
                          if (!currentPassword || !newPassword || !confirmPassword) {
                            alert('Veuillez remplir tous les champs');
                            return;
                          }
                          if (newPassword !== confirmPassword) {
                            alert('Les mots de passe ne correspondent pas');
                            return;
                          }
                          alert('Mot de passe mis à jour avec succès !');
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                        className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg text-[14px] font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Mettre à jour le mot de passe
                      </motion.button>
                    </div>
                  </div>

                  {/* Active Sessions Section */}
                  <div>
                    <h2 className="text-[20px] font-semibold text-black dark:text-white mb-4">Sessions actives</h2>
                    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[14px] font-medium text-black dark:text-white mb-1">Cette session</p>
                          <p className="text-[12px] text-gray-500 dark:text-gray-400">Dernière activité : Maintenant</p>
                        </div>
                        <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone Section */}
                  <div className="pt-4 border-t border-gray-300 dark:border-gray-700">
                    <h2 className="text-[20px] font-semibold text-red-600 dark:text-red-400 mb-2">Zone de danger</h2>
                    <p className="text-[14px] text-gray-600 dark:text-gray-400 mb-4">
                      Actions irréversibles concernant votre compte
                    </p>
                    <motion.button
                      onClick={() => {
                        if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
                          alert('Compte supprimé avec succès');
                        }
                      }}
                      className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-red-500 text-red-600 dark:text-red-400 rounded-lg text-[14px] font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Trash size={16} />
                      Supprimer mon compte
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'parefeu' && (
              <div className="p-8 max-w-3xl mx-auto">
                <h1 className="text-[32px] font-bold mb-8 text-black dark:text-white">Pare-feu</h1>
                <p className="text-[14px] text-gray-600 dark:text-gray-400 mb-8">
                  Bloquez des fournisseurs d'emails entiers tout en autorisant des exceptions spécifiques
                </p>

                {loadingFirewall ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Barre de recherche */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3 mb-4">
                        <Search size={20} className="text-gray-500 dark:text-gray-400" />
                        <input
                          type="text"
                          value={firewallSearchQuery}
                          onChange={(e) => setFirewallSearchQuery(e.target.value)}
                          placeholder="Rechercher un fournisseur ou ajouter un domaine personnalisé..."
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-black dark:text-white"
                        />
                        {firewallSearchQuery && !ALL_BLOCKED_DOMAINS_FLAT.includes(firewallSearchQuery.toLowerCase().trim()) && (
                          <motion.button
                            onClick={() => addCustomDomain(firewallSearchQuery)}
                            className="px-4 py-2 bg-black text-white rounded-lg text-[14px] font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Plus size={16} />
                            <span>Ajouter</span>
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Liste des fournisseurs */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <h2 className="text-[20px] font-semibold mb-4 text-black dark:text-white">
                        Fournisseurs d'emails
                      </h2>
                      <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-4">
                        Activez le switch pour bloquer tous les domaines d'un fournisseur. Les emails de ces domaines seront automatiquement rejetés, sauf ceux dans vos exceptions.
                      </p>

                      {/* Filtres intelligents */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        <motion.button
                          onClick={() => setFilterCategory(null)}
                          className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                            filterCategory === null
                              ? 'bg-black text-white dark:bg-white dark:text-black'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Tous
                        </motion.button>
                        {categories.map((category) => (
                          <motion.button
                            key={category}
                            onClick={() => setFilterCategory(filterCategory === category ? null : category)}
                            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                              filterCategory === category
                                ? 'bg-black text-white dark:bg-white dark:text-black'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {category === 'Global' ? (
                              <span className="flex items-center gap-1.5">
                                <Globe size={14} />
                                Global
                              </span>
                            ) : category === 'Privacy' ? (
                              <span className="flex items-center gap-1.5">
                                <Shield size={14} />
                                Sécurité
                              </span>
                            ) : category === 'Europe' ? (
                              <span className="flex items-center gap-1.5">
                                <Globe size={14} />
                                Europe
                              </span>
                            ) : category === 'North America' ? (
                              <span className="flex items-center gap-1.5">
                                <Globe size={14} />
                                Amérique du Nord
                              </span>
                            ) : category === 'Asia/Russia' ? (
                              <span className="flex items-center gap-1.5">
                                <Globe size={14} />
                                Asie/Russie
                              </span>
                            ) : category === 'South America' ? (
                              <span className="flex items-center gap-1.5">
                                <Globe size={14} />
                                Amérique du Sud
                              </span>
                            ) : (
                              category
                            )}
                          </motion.button>
                        ))}
                      </div>

                      <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {displayProviders.length === 0 ? (
                          <p className="text-[14px] text-gray-500 dark:text-gray-400 text-center py-8">
                            Aucun fournisseur trouvé
                          </p>
                        ) : (
                          displayProviders.map((provider) => {
                            const isBlocked = isProviderFullyBlocked(provider.domains);
                            // Récupérer toutes les exceptions pour tous les domaines de ce fournisseur
                            const providerExceptions = whitelistedSenders.filter(email => {
                              const emailDomain = email.split('@')[1]?.toLowerCase();
                              return emailDomain && provider.domains.includes(emailDomain);
                            });

                            // Afficher les domaines principaux (max 3) avec "..." si plus
                            const mainDomains = provider.domains.slice(0, 3);
                            const hasMoreDomains = provider.domains.length > 3;

                            return (
                              <div key={provider.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-3 last:pb-0">
                                <div className="flex items-center justify-between py-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 flex-wrap">
                                      <span className="text-[16px] font-medium text-black dark:text-white">
                                        {provider.name}
                                      </span>
                                      <span className="text-[13px] text-gray-500 dark:text-gray-400">
                                        ({mainDomains.join(', ')}{hasMoreDomains ? `, +${provider.domains.length - 3} autres` : ''})
                                      </span>
                                      {isBlocked && (
                                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded text-[11px] font-medium">
                                          BLOQUÉ
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <Switch
                                    checked={isBlocked}
                                    onChange={() => toggleProviderBlock(provider.domains)}
                                  />
                                </div>

                                {/* Zone d'exceptions (s'affiche si le fournisseur est bloqué) */}
                                <AnimatePresence>
                                  {isBlocked && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                                    >
                                      <p className="text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Exceptions pour {provider.name} ({mainDomains.join(', ')}{hasMoreDomains ? '...' : ''})
                                      </p>
                                      
                                      {/* Input pour ajouter une exception */}
                                      <div className="flex items-center gap-2 mb-3">
                                        <input
                                          type="email"
                                          value={exceptionInputs[provider.id] || ''}
                                          onChange={(e) => setExceptionInputs({
                                            ...exceptionInputs,
                                            [provider.id]: e.target.value
                                          })}
                                          placeholder="email@example.com"
                                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-black dark:text-white"
                                          onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                              addException(provider.id, exceptionInputs[provider.id] || '');
                                            }
                                          }}
                                        />
                                        <motion.button
                                          onClick={() => addException(provider.id, exceptionInputs[provider.id] || '')}
                                          className="px-3 py-2 bg-black text-white rounded-lg text-[13px] font-medium hover:bg-gray-800 transition-colors flex items-center gap-1"
                                          whileHover={{ scale: 1.02 }}
                                          whileTap={{ scale: 0.98 }}
                                        >
                                          <Plus size={14} />
                                          <span>Ajouter</span>
                                        </motion.button>
                                      </div>

                                      {/* Liste des exceptions */}
                                      {providerExceptions.length > 0 && (
                                        <div className="space-y-2">
                                          {providerExceptions.map((email) => (
                                            <div
                                              key={email}
                                              className="flex items-center justify-between px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                                            >
                                              <span className="text-[13px] text-green-900 dark:text-green-100">
                                                {email}
                                              </span>
                                              <motion.button
                                                onClick={() => removeException(email)}
                                                className="p-1 hover:bg-green-100 dark:hover:bg-green-900/40 rounded transition-colors"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                              >
                                                <X size={14} className="text-green-700 dark:text-green-300" />
                                              </motion.button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Bouton "Voir plus" / "Voir moins" */}
                      {hasMoreProviders && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <motion.button
                            onClick={() => setShowAllProviders(true)}
                            className="w-full px-4 py-2 text-[14px] font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            Voir plus ({filteredProviders.length - 5} autres)
                          </motion.button>
                        </div>
                      )}

                      {showAllProviders && !firewallSearchQuery && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <motion.button
                            onClick={() => setShowAllProviders(false)}
                            className="w-full px-4 py-2 text-[14px] font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            Voir moins
                          </motion.button>
                        </div>
                      )}
                    </div>

                    {/* Statistiques */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <h3 className="text-[18px] font-semibold mb-4 text-black dark:text-white">
                        Statistiques
                      </h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-[14px] text-gray-600 dark:text-gray-400 mb-1">
                            Domaines bloqués
                          </p>
                          <p className="text-[24px] font-bold text-black dark:text-white">
                            {blockedDomains.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-[14px] text-gray-600 dark:text-gray-400 mb-1">
                            Exceptions autorisées
                          </p>
                          <p className="text-[24px] font-bold text-black dark:text-white">
                            {whitelistedSenders.length}
                          </p>
                        </div>
                      </div>
                      
                      {/* Bouton pour voir les domaines bloqués */}
                      {blockedDomains.length > 0 && (
                        <motion.button
                          onClick={() => setShowBlockedDomainsModal(true)}
                          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-[14px] font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Eye size={16} />
                          <span>Voir les domaines bloqués</span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Modal pour afficher les domaines bloqués */}
                <AnimatePresence>
                    {showBlockedDomainsModal && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowBlockedDomainsModal(false)}
                      >
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[20px] font-semibold text-black dark:text-white">
                              Domaines bloqués ({blockedDomains.length})
                            </h3>
                            <button
                              onClick={() => setShowBlockedDomainsModal(false)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                              <X size={20} className="text-gray-600 dark:text-gray-400" />
                            </button>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {blockedDomains.map((domain) => (
                                <div
                                  key={domain}
                                  className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between"
                                >
                                  <span className="text-[13px] text-red-900 dark:text-red-200 font-medium">
                                    {domain}
                                  </span>
                                  <motion.button
                                    onClick={async () => {
                                      const newBlockedDomains = blockedDomains.filter(d => d !== domain);
                                      setBlockedDomains(newBlockedDomains);
                                      
                                      const { error } = await supabase
                                        .from('profiles')
                                        .update({ blocked_domains: newBlockedDomains })
                                        .eq('id', user?.id);
                                      
                                      if (error) {
                                        console.error('Erreur:', error);
                                        setBlockedDomains(blockedDomains);
                                        toast.error('Erreur lors de la suppression');
                                      } else {
                                        toast.success(`${domain} débloqué`);
                                      }
                                    }}
                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <X size={14} className="text-red-700 dark:text-red-300" />
                                  </motion.button>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <motion.button
                              onClick={() => setShowBlockedDomainsModal(false)}
                              className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-[14px] font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              Fermer
                            </motion.button>
                          </div>
                      </motion.div>
                    </motion.div>
                    )}
                  </AnimatePresence>
              </div>
            )}

            {activeSection === 'abonnement' && (
              <div className="p-8 max-w-3xl mx-auto">
                <h1 className="text-[32px] font-bold mb-8 text-black dark:text-white">Abonnement & Facturation</h1>
                
                <div className="space-y-6">
                  {/* Votre abonnement Card */}
                  <div className="bg-gray-50 border border-gray-300 rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-[24px] font-bold text-black mb-1">Votre abonnement</h2>
                        <p className="text-[14px] text-gray-500">Gérez votre plan Naeliv</p>
                      </div>
                      {userPlan === 'pro' ? (
                        <div className="px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-[12px] font-medium flex items-center gap-2">
                          <Zap size={14} />
                          <span>NAELIV PRO</span>
                        </div>
                      ) : (
                        <motion.button
                          onClick={() => window.location.href = '/paiement'}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-[14px] font-medium hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Zap size={16} />
                          <span>Passer à PRO</span>
                        </motion.button>
                      )}
                    </div>
                    
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-[24px] font-bold text-black mb-1">
                          {userPlan === 'pro' ? 'Naeliv PRO' : 'Naeliv Essential'}
                        </h3>
                        <p className="text-[14px] text-gray-500">Plan actuel</p>
                      </div>
                      <div className="text-right">
                        {userPlan === 'pro' ? (
                          <>
                            <p className="text-[32px] font-bold text-black">5€</p>
                            <p className="text-[14px] text-gray-500">/mois</p>
                          </>
                        ) : (
                          <>
                            <p className="text-[32px] font-bold text-black">Gratuit</p>
                            <p className="text-[14px] text-gray-500">/mois</p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      {userPlan === 'pro' ? (
                        <>
                          <div className="flex items-center gap-2">
                            <Check size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-[14px] text-gray-700">Adresse @naeliv.com personnalisée</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-[14px] text-gray-700">Stockage illimité</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-[14px] text-gray-700">Zen Mode illimité</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-[14px] text-gray-700">Smart Paywall (Premium Shield)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-[14px] text-gray-700">Immersion Linguistique</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-[14px] text-gray-700">Rewind illimité</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-[14px] text-gray-700">Détox Digitale</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-[14px] text-gray-700">Naeliv Intelligence (IA)</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <Check size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-[14px] text-gray-700">pseudo123@naeliv.com</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-[14px] text-gray-700">5 Go de stockage</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-[14px] text-gray-700">Zen Mode fixe (09h00 & 17h00)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-[14px] text-gray-700">Smart Paywall (0,10€ par défaut)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-[14px] text-gray-700">Immersion Linguistique (Anglais)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-[14px] text-gray-700">Rewind Digital (annulation 10 secondes)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-[14px] text-gray-700">Détox Digitale (conservation des emails)</span>
                          </div>
                          <div className="flex items-center gap-2 opacity-50">
                            <Check size={18} className="text-gray-400 flex-shrink-0" />
                            <span className="text-[14px] line-through text-gray-400">Naeliv Intelligence</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {userPlan === 'pro' ? (
                      <motion.button
                        onClick={() => alert('Gestion de l\'abonnement - Fonctionnalité à venir')}
                        className="w-full px-6 py-3 bg-gray-200 border border-gray-300 text-black rounded-lg text-[14px] font-semibold hover:bg-gray-300 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Gérer mon abonnement
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={() => window.location.href = '/paiement'}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-[14px] font-semibold hover:from-purple-700 hover:to-blue-700 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Passer à Naeliv PRO
                      </motion.button>
                    )}
                  </div>

                  {/* Achat d'alias Section */}
                  <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-[20px] font-semibold text-black mb-1">Votre adresse email</h2>
                        <p className="text-[14px] text-gray-500">
                          {userEmail}
                        </p>
                      </div>
                      {aliasPurchased ? (
                        <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-[14px] font-medium flex items-center gap-2">
                          <Check size={16} />
                          <span>Alias acheté</span>
                        </div>
                      ) : (
                        <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-[14px] font-medium">
                          Alias non acheté
                        </div>
                      )}
                    </div>
                    
                    {!aliasPurchased && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-[14px] text-blue-900 mb-2">
                            <strong>Achetez votre adresse email unique</strong>
                          </p>
                          <p className="text-[13px] text-blue-700 mb-3">
                            Pour <strong>60,50€</strong>, vous pouvez acheter votre nom d'utilisateur <strong>{userEmail.split('@')[0]}</strong> et l'utiliser avec ou sans abonnement PRO.
                          </p>
                          <ul className="text-[13px] text-blue-700 space-y-1 mb-4">
                            <li>✓ Utilisez votre adresse email sans abonnement PRO</li>
                            <li>✓ Conservez votre adresse même si vous annulez PRO</li>
                            <li>✓ Achat unique, valable à vie</li>
                          </ul>
                        </div>
                        
                        <motion.button
                          onClick={() => window.location.href = '/paiement/alias'}
                          className="w-full px-6 py-3 bg-black text-white rounded-lg text-[14px] font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                          <CreditCard size={18} />
                          <span>Acheter mon alias (60,50€)</span>
                        </motion.button>
                      </div>
                    )}
                    
                    {aliasPurchased && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-[14px] text-green-900 flex items-center gap-2">
                          <CheckCircle size={16} className="flex-shrink-0 text-green-600" />
                          <span>Votre alias a été acheté. Vous pouvez utiliser votre adresse email <strong>{userEmail}</strong> avec ou sans abonnement PRO.</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Payment Method Section */}
                  <div>
                    <h2 className="text-[20px] font-semibold text-black mb-2">Moyen de paiement</h2>
                    <p className="text-[14px] text-gray-500 mb-4">Aucune carte enregistrée</p>
                    <motion.button
                      onClick={() => alert('Ajout de carte - Fonctionnalité à venir')}
                      className="px-6 py-3 bg-white border-2 border-black text-black rounded-lg text-[14px] font-semibold hover:bg-gray-50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Ajouter une carte
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

interface SettingsNavItemProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}

function SettingsNavItem({ icon: Icon, label, active, onClick }: SettingsNavItemProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full px-4 py-3 rounded-lg text-left text-[15px] flex items-center gap-3 transition-colors ${
        active 
          ? 'bg-black dark:bg-white text-white dark:text-black' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      whileHover={{ scale: active ? 1 : 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon size={20} />
      <span>{label}</span>
    </motion.button>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
  name: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  additionalSettings?: React.ReactNode;
  disabled?: boolean;
  disabledMessage?: string;
}

function FeatureCard({ icon: Icon, iconColor, name, description, enabled, onToggle, additionalSettings, disabled = false, disabledMessage }: FeatureCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-sm ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <Icon size={24} className={`${iconColor} flex-shrink-0 mt-1`} />
          <div className="flex-1 min-w-0">
            <h3 className="text-[18px] font-semibold text-black dark:text-white mb-1">{name}</h3>
            <p className="text-[14px] text-gray-600 dark:text-gray-400">{description}</p>
            {disabled && disabledMessage && (
              <p className="text-[12px] text-purple-600 dark:text-purple-400 mt-2 font-medium">{disabledMessage}</p>
            )}
            {additionalSettings}
          </div>
        </div>
        <div className="flex-shrink-0 ml-4">
          <Switch
            checked={enabled}
            onChange={onToggle}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}

interface NotificationCardProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

function NotificationCard({ title, description, enabled, onToggle }: NotificationCardProps) {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 border border-gray-300 dark:border-gray-700 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-[16px] font-semibold text-black dark:text-white mb-1">{title}</h3>
          <p className="text-[14px] text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        <Switch
          checked={enabled}
          onChange={onToggle}
          className="ml-4"
        />
      </div>
    </div>
  );
}

interface SmartPaywallCardProps {
  enabled: boolean;
  onToggle: () => void;
  price: number;
  onPriceChange: (price: number) => void;
  userPlan: 'essential' | 'pro';
  creditsBalance: number;
}

function SmartPaywallCard({ enabled, onToggle, price, onPriceChange, userPlan, creditsBalance }: SmartPaywallCardProps) {
  const commissionRate = 0.01; // 1% commission
  const estimatedEmailsPerMonth = 30;
  const estimatedRevenue = price * estimatedEmailsPerMonth * commissionRate;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-300 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Shield size={24} className="text-green-600 dark:text-green-500" strokeWidth={1.5} />
          <h3 className="text-[18px] font-semibold text-black dark:text-white">Smart Paywall</h3>
        </div>
        <Switch
          checked={enabled}
          onChange={onToggle}
        />
      </div>

      {/* Description */}
      <div className="mb-6 space-y-1">
        <p className="text-[14px] text-gray-700 dark:text-gray-300">
          Fixez le prix que les inconnus doivent payer pour vous écrire (0,10€ à 100€)
        </p>
        <p className="text-[14px] text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <Hand size={14} className="flex-shrink-0" />
          <span>Vous touchez 1% de commission sur chaque email reçu</span>
        </p>
      </div>

      {/* Credits Balance */}
      <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] text-gray-600 dark:text-gray-400 mb-1">Vos gains disponibles</p>
            <p className="text-[32px] font-bold text-green-600 dark:text-green-400">
              {creditsBalance.toFixed(2)}€
            </p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-gray-600 dark:text-gray-400">
              Utilisez ces crédits pour payer votre abonnement Naeliv PRO
            </p>
          </div>
        </div>
      </div>

      {/* Price Slider - Only for PRO users */}
      {userPlan === 'pro' ? (
        <div className="mb-6">
          <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-3">
            Prix du timbre (€)
          </label>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[12px] text-gray-600 dark:text-gray-400 font-medium">0,10€</span>
            <div className="flex-1 relative">
              <input
                type="range"
                min="0.10"
                max="100"
                step="0.10"
                value={price}
                onChange={(e) => onPriceChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #00CC88 0%, #00CC88 ${((price - 0.10) / (100 - 0.10)) * 100}%, #d1d5db ${((price - 0.10) / (100 - 0.10)) * 100}%, #d1d5db 100%)`
                }}
              />
              <style jsx>{`
                input[type="range"]::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #00CC88;
                  cursor: pointer;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                input[type="range"]::-moz-range-thumb {
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #00CC88;
                  cursor: pointer;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
              `}</style>
            </div>
            <span className="text-[12px] text-gray-600 dark:text-gray-400 font-medium">100€</span>
          </div>
          {/* Current Price Display */}
          <div className="text-center">
            <span className="text-[32px] font-light text-green-600 dark:text-green-500">
              {price.toFixed(2)}€
            </span>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-300 dark:border-gray-600 mb-4">
            <p className="text-[14px] text-gray-600 dark:text-gray-400 text-center mb-2">
              Prix fixe pour les comptes Essential
            </p>
            <div className="text-center">
              <span className="text-[32px] font-light text-green-600 dark:text-green-500">
                0,10€
              </span>
            </div>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 text-center mt-2">
              Passer à PRO pour personnaliser le prix (0,10€ à 100€)
            </p>
          </div>
        </div>
      )}

      {/* Estimated Revenue - Only for PRO users */}
      {userPlan === 'pro' && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <p className="text-[14px] text-gray-700 dark:text-gray-300 mb-1">
            Revenus estimés (30 emails/mois):
          </p>
          <p className="text-[20px] font-light text-green-600 dark:text-green-500">
            +{estimatedRevenue.toFixed(2)}€/mois
          </p>
        </div>
      )}
    </div>
  );
}

export default function MailPage() {
  return (
    <ThemeProvider>
      <MailPageContent />
    </ThemeProvider>
  );
}

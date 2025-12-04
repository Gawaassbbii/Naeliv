"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Search, Settings, LogOut, Inbox, Archive, Trash2, Star, Send, Shield, Globe, RotateCcw, Zap, Bell, Moon, Sun, Languages, ArrowLeft, User, Lock, CreditCard, ChevronRight, AlertTriangle, CheckCircle, Trash, Check, X, Reply } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useTheme, ThemeProvider } from '@/app/contexts/ThemeContext';
import { translations } from '@/app/translations/mail';

// ============================================================================
// CONSTANTS
// ============================================================================

const ANIMATION_DURATION = {
  fast: 0.3,
  normal: 0.6,
  slow: 0.8,
};

// ============================================================================
// COMPONENT
// ============================================================================

function MailPageContent() {
  const router = useRouter();
  const { theme, language, setTheme, setLanguage } = useTheme();
  const t = translations[language];
  const [zenModeActive, setZenModeActive] = useState(true);
  
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
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'starred' | 'archived' | 'trash' | 'sent' | 'replied'>('inbox');
  const [isLoading, setIsLoading] = useState(true);
  const [emails, setEmails] = useState<any[]>([]);
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

  useEffect(() => {
    checkUser();
  }, []);

  // Recharger les emails quand l'utilisateur change (après reconnexion)
  useEffect(() => {
    if (user) {
      loadEmails(activeFolder);
      loadFolderCounts();
    }
  }, [user]);

  // Recharger les emails quand le dossier actif change
  useEffect(() => {
    if (user) {
      loadEmails(activeFolder);
    }
  }, [activeFolder]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/connexion');
    } else {
      setUser(user);
      
      // Récupérer le plan de l'utilisateur depuis Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single();
      
      if (profile?.plan) {
        setUserPlan(profile.plan as 'essential' | 'pro');
      }
    }
  };

  // Initialize mock emails in Supabase if they don't exist
  const initializeMockEmails = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Vérifier si des emails existent déjà
    const { data: existingEmails } = await supabase
      .from('emails')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    // Si des emails existent déjà, ne pas initialiser les mockés
    if (existingEmails && existingEmails.length > 0) {
      return;
    }

    // Créer les emails mockés dans Supabase
    const mockEmails = [
      {
        user_id: user.id,
        from_email: 'marie.dubois@example.com',
        from_name: 'Marie Dubois',
        subject: 'Réunion de demain',
        body: 'Bonjour, je voulais confirmer notre réunion de demain à 14h. Pouvez-vous apporter les documents d...',
        preview: 'Bonjour, je voulais confirmer notre réunion de demain à 14h. Pouvez-vous apporter les documents d...',
        received_at: new Date().toISOString(),
        read_at: null,
        starred: true,
        archived: false,
        deleted: false,
        has_paid_stamp: false,
      },
      {
        user_id: user.id,
        from_email: 'thomas.laurent@example.com',
        from_name: 'Thomas Laurent',
        subject: 'Proposition de projet',
        body: 'Suite à notre conversation, voici la proposition détaillée pour le nouveau projet. J\'attends vos retours.',
        preview: 'Suite à notre conversation, voici la proposition détaillée pour le nouveau projet. J\'attends vos retours.',
        received_at: new Date().toISOString(),
        read_at: null,
        starred: false,
        archived: false,
        deleted: false,
        has_paid_stamp: true,
      },
      {
        user_id: user.id,
        from_email: 'newsletter@naeliv.com',
        from_name: 'Newsletter Naeliv',
        subject: 'Nouvelles fonctionnalités disponibles',
        body: 'Découvrez les dernières mises à jour de Naeliv: Zen Mode amélioré, nouvelles langues pour Immersi...',
        preview: 'Découvrez les dernières mises à jour de Naeliv: Zen Mode amélioré, nouvelles langues pour Immersi...',
        received_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        starred: false,
        archived: false,
        deleted: false,
        has_paid_stamp: false,
      },
      {
        user_id: user.id,
        from_email: 'sophie.martin@example.com',
        from_name: 'Sophie Martin',
        subject: 'Feedback sur la présentation',
        body: 'Excellente présentation aujourd\'hui ! Quelques suggestions pour la prochaine fois...',
        preview: 'Excellente présentation aujourd\'hui ! Quelques suggestions pour la prochaine fois...',
        received_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        starred: true,
        archived: false,
        deleted: false,
        has_paid_stamp: false,
      },
      {
        user_id: user.id,
        from_email: 'jean.dupont@example.com',
        from_name: 'Jean Dupont',
        subject: 'Budget Q4 2025',
        body: 'Voici le récapitulatif du budget pour le dernier trimestre. Merci de valider avant vendredi.',
        preview: 'Voici le récapitulatif du budget pour le dernier trimestre. Merci de valider avant vendredi.',
        received_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        read_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        starred: false,
        archived: false,
        deleted: false,
        has_paid_stamp: false,
      },
      {
        user_id: user.id,
        from_email: 'ancien.client@example.com',
        from_name: 'Ancien Client',
        subject: 'Opportunité de collaboration',
        body: 'Cela fait un moment ! J\'ai une proposition intéressante à vous faire...',
        preview: 'Cela fait un moment ! J\'ai une proposition intéressante à vous faire...',
        received_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        read_at: null,
        starred: false,
        archived: false,
        deleted: false,
        has_paid_stamp: false,
      },
      {
        user_id: user.id,
        from_email: 'service.rh@example.com',
        from_name: 'Service RH',
        subject: 'Documents administratifs',
        body: 'Merci de compléter les documents ci-joints pour finaliser votre dossier...',
        preview: 'Merci de compléter les documents ci-joints pour finaliser votre dossier...',
        received_at: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(),
        read_at: null,
        starred: false,
        archived: false,
        deleted: false,
        has_paid_stamp: false,
      },
    ];

    const { error } = await supabase
      .from('emails')
      .insert(mockEmails);

    if (error) {
      console.error('Error initializing mock emails:', error);
    } else {
      console.log('Mock emails initialized in Supabase');
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

    // Initialiser les emails mockés si nécessaire (seulement au premier chargement)
    if (folder === 'inbox') {
      await initializeMockEmails();
    }

    // Build query with server-side filtering based on folder
    let query = supabase
      .from('emails')
      .select('*')
      .eq('user_id', user.id);

    // Apply folder-specific filters
    switch (folder) {
      case 'inbox':
        query = query.eq('archived', false).eq('deleted', false);
        break;
      case 'starred':
        query = query.eq('starred', true).eq('archived', false).eq('deleted', false);
        break;
      case 'archived':
        query = query.eq('archived', true).eq('deleted', false);
        break;
      case 'trash':
        query = query.eq('deleted', true);
        break;
      case 'sent':
        // For sent emails, filter by folder='sent' and no in_reply_to (not replies)
        // Note: folder column must exist in Supabase (run add_email_sending_columns.sql)
        query = query.eq('folder', 'sent').eq('deleted', false).is('in_reply_to', null);
        break;
      case 'replied':
        // For replied emails, filter by folder='sent' and has in_reply_to (is a reply)
        // We'll filter client-side since Supabase .not('is', null) syntax is tricky
        // Note: folder column must exist in Supabase (run add_email_sending_columns.sql)
        query = query.eq('folder', 'sent').eq('deleted', false);
        break;
      default:
        query = query.eq('archived', false).eq('deleted', false);
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

    console.log(`📧 [MAIL PAGE] Loaded ${data?.length || 0} emails from Supabase for folder: ${folder}`);
    console.log(`📧 [MAIL PAGE] User ID: ${user.id}`);
    // Filter replied emails client-side if needed (fallback for 'replied' folder)
    let filteredData = data || [];
    if (folder === 'replied' && filteredData.length > 0) {
      filteredData = filteredData.filter((email: any) => email.in_reply_to !== null && email.in_reply_to !== undefined);
    }

    if (filteredData && filteredData.length > 0) {
      console.log(`📧 [MAIL PAGE] First email sample:`, {
        id: filteredData[0].id,
        from: filteredData[0].from_email,
        subject: filteredData[0].subject,
        archived: filteredData[0].archived,
        deleted: filteredData[0].deleted,
        folder: filteredData[0].folder,
        in_reply_to: filteredData[0].in_reply_to,
      });
      // Debug: Check if body/body_html exist in raw data
      console.log('📧 [MAIL PAGE] Raw email body check:', {
        hasBody: !!filteredData[0].body,
        hasBodyHtml: !!filteredData[0].body_html,
        hasPreview: !!filteredData[0].preview,
        bodyValue: filteredData[0].body,
        bodyHtmlValue: filteredData[0].body_html,
        previewValue: filteredData[0].preview,
        allKeys: Object.keys(filteredData[0]),
      });
    }

    if (filteredData && filteredData.length > 0) {
      // Transform Supabase data to match our email format
      const transformedEmails = filteredData.map((email: any) => ({
        id: email.id,
        from: email.from_name || email.from_email,
        subject: email.subject,
        preview: email.preview || email.body?.substring(0, 100) || '',
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
        // Map body from Supabase columns (try all possible column names)
        body: email.body || email.text_content || email.text || email.body_text || null,
        // Map body_html from Supabase columns (try all possible column names)
        body_html: email.body_html || email.html_content || email.html || email.body_html_content || null,
      }));
      
      // Debug: Log first email to check content
      if (transformedEmails.length > 0) {
        console.log('📧 [MAIL PAGE] First email content:', {
          id: transformedEmails[0].id,
          subject: transformedEmails[0].subject,
          hasBody: !!transformedEmails[0].body,
          hasBodyHtml: !!transformedEmails[0].body_html,
          hasPreview: !!transformedEmails[0].preview,
          bodyLength: transformedEmails[0].body?.length || 0,
          bodyHtmlLength: transformedEmails[0].body_html?.length || 0,
          previewLength: transformedEmails[0].preview?.length || 0,
        });
      }
      setEmails(transformedEmails);
    } else {
      setEmails([]);
    }

    setIsLoading(false);
  };

  // Load folder counts from Supabase (all folders at once)
  const loadFolderCounts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Fetch all counts in parallel
      const [inboxResult, starredResult, archivedResult, trashResult, sentResult, repliedResult] = await Promise.all([
        // Inbox: not archived, not deleted
        supabase
          .from('emails')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('archived', false)
          .eq('deleted', false),
        
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
        e.from.toLowerCase().includes(query) ||
        e.subject.toLowerCase().includes(query) ||
        e.preview.toLowerCase().includes(query)
      );
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
  const handleComposeNew = () => {
    setIsComposeOpen(true);
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
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
  
  return (
    <div 
      className="h-screen overflow-hidden overflow-x-hidden flex flex-col transition-colors"
      style={{
        backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
        color: theme === 'dark' ? '#f3f4f6' : '#111827',
        height: '100vh',
        width: '100vw',
        maxWidth: '100vw'
      }}
    >
      {/* Top Header */}
      <Header 
        onSignOut={handleSignOut} 
        zenModeActive={zenModeActive} 
        setZenModeActive={setZenModeActive}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
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
            Zen Mode activé • Prochaine distribution à 17h00
          </span>
        </motion.div>
      )}

      {/* Main Content Area - Fixed height, no scroll */}
      <div className="flex-1 flex h-full overflow-hidden overflow-x-hidden">
        {/* Sidebar - Fixed height, scrollable */}
        <Sidebar 
          user={user}
          userPlan={userPlan}
          activeFolder={activeFolder}
          setActiveFolder={setActiveFolder}
          folderCounts={folderCounts}
          onComposeNew={handleComposeNew}
        />

        {/* Email List and Viewer - Takes remaining space */}
        <div className="flex-1 flex h-full overflow-hidden overflow-x-hidden">
          {/* Email List - Scrollable */}
          <EmailList 
            emails={getFilteredEmails()}
            selectedEmail={selectedEmail}
            onSelectEmail={handleSelectEmail}
            activeFolder={activeFolder}
            isLoading={isLoading}
            folderCounts={folderCounts}
          />

          {/* Email Viewer - Scrollable */}
          <EmailViewer 
            email={selectedEmail !== null ? getFilteredEmails()[selectedEmail] : null}
            emailIndex={selectedEmail}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onReply={handleReply}
            onForward={handleForward}
          />
        </div>
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          >
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
                <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Écrivez votre message ici..."
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-[14px] bg-white dark:bg-gray-800 text-black dark:text-white resize-none"
                />
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
  setZenModeActive: (active: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

// Memoize Header to prevent unnecessary re-renders
const Header = React.memo(function Header({ onSignOut, zenModeActive, setZenModeActive, searchQuery, setSearchQuery }: HeaderProps) {
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
          onClick={() => setZenModeActive(!zenModeActive)}
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
  onComposeNew: () => void;
}

// Memoize Sidebar to prevent unnecessary re-renders
const Sidebar = React.memo(function Sidebar({ user, userPlan, activeFolder, setActiveFolder, folderCounts, onComposeNew }: SidebarProps) {
  const { language } = useTheme();
  const t = translations[language];
  
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
          onClick={onComposeNew}
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
          count={folderCounts.inbox}
          onClick={() => setActiveFolder('inbox')}
        />
        <NavItem 
          icon={Star} 
          label={t.starred} 
          active={activeFolder === 'starred'}
          count={folderCounts.starred}
          onClick={() => setActiveFolder('starred')}
        />
        <NavItem 
          icon={Send} 
          label={t.sent} 
          active={activeFolder === 'sent'}
          count={folderCounts.sent}
          onClick={() => setActiveFolder('sent')}
        />
        <NavItem 
          icon={Reply} 
          label={t.replied} 
          active={activeFolder === 'replied'}
          count={folderCounts.replied}
          onClick={() => setActiveFolder('replied')}
        />
        <NavItem 
          icon={Archive} 
          label={t.archived} 
          active={activeFolder === 'archived'}
          count={folderCounts.archived}
          onClick={() => setActiveFolder('archived')}
        />
        <NavItem 
          icon={Trash2} 
          label={t.trash} 
          active={activeFolder === 'trash'}
          count={folderCounts.trash}
          onClick={() => setActiveFolder('trash')}
        />

        {/* Separator */}
        <div className="my-4 border-t border-gray-300 dark:border-gray-700"></div>

        {/* Features Section */}
        <div className="mb-2">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2 px-4">FONCTIONNALITÉS</p>
          <NavItem icon={Shield} label={t.premiumShield} />
          <NavItem icon={Globe} label={t.immersion} />
          <NavItem icon={RotateCcw} label={t.rewind} />
        </div>
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
}

function EmailList({ emails, selectedEmail, onSelectEmail, activeFolder, isLoading = false, folderCounts }: EmailListProps) {
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
              className={`p-4 cursor-pointer transition-colors relative ${
                selectedEmail === index 
                  ? 'bg-blue-50 dark:bg-blue-900/20' 
                  : !email.read
                  ? 'bg-blue-50/50 dark:bg-blue-900/10'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => onSelectEmail(index)}
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
                      <p className={`text-[14px] truncate min-w-0 ${!email.read ? 'font-bold text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {email.from}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {email.starred && (
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      )}
                      {getDateDisplay() && (
                        <span className="text-[12px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {getDateDisplay()}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className={`text-[14px] truncate mb-1 min-w-0 ${!email.read ? 'font-semibold text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {email.subject}
                  </p>
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
  onArchive: (index: number) => void;
  onDelete: (index: number) => void;
  onReply: (email: any) => void;
  onForward: (email: any) => void;
}

function EmailViewer({ email, onArchive, onDelete, onReply, onForward }: EmailViewerProps) {
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
  }, [email?.id]);

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
          text: replyBody,
          html: `<p>${replyBody.replace(/\n/g, '<br>')}</p>`,
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
          text: forwardBody,
          html: `<p>${forwardBody.replace(/\n/g, '<br>')}</p>`,
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
          <h1 className="text-[32px] font-bold mb-4 text-black dark:text-white">{email.subject}</h1>
          <div className="flex items-center gap-4 text-[14px] text-gray-600 dark:text-gray-400">
            <div>
              <p className="font-semibold text-black dark:text-white">{email.from}</p>
            </div>
            <div className="ml-auto text-gray-500 dark:text-gray-400">
              {email.date} {email.time && `à ${email.time}`}
            </div>
          </div>
        </div>

        <div className="prose max-w-none">
          {(() => {
            // Debug: Log email content when displaying
            // Check all possible property names
            const bodyHtml = email.body_html || email.bodyHtml || email.html_content || email.htmlContent;
            const body = email.body || email.text_content || email.textContent;
            const preview = email.preview;
            
            console.log('📧 [EMAIL VIEWER] Displaying email content:', {
              id: email.id,
              subject: email.subject,
              hasBody: !!body,
              hasBodyHtml: !!bodyHtml,
              hasPreview: !!preview,
              bodyValue: body,
              bodyHtmlValue: bodyHtml,
              previewValue: preview,
              allEmailKeys: Object.keys(email),
              emailObject: email,
            });
            
            if (bodyHtml) {
              console.log('✅ [EMAIL VIEWER] Using body_html:', bodyHtml.substring(0, 100));
              return (
                <div 
                  className="text-[16px] leading-relaxed text-gray-700 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              );
            } else if (body) {
              console.log('✅ [EMAIL VIEWER] Using body:', body.substring(0, 100));
              return (
                <p className="text-[16px] leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {body}
                </p>
              );
            } else if (preview) {
              console.log('✅ [EMAIL VIEWER] Using preview:', preview.substring(0, 100));
              return (
                <p className="text-[16px] leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {preview}
                </p>
              );
            } else {
              console.log('❌ [EMAIL VIEWER] No content available');
              return (
                <p className="text-[16px] leading-relaxed text-gray-500 dark:text-gray-400 italic">
                  Aucun contenu disponible
                </p>
              );
            }
          })()}
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
                <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
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
                <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
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
          </div>
        )}
      </div>
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
}

function SettingsPanel({ 
  open, 
  onOpenChange, 
  zenModeActive, 
  onZenModeChange,
  theme,
  language,
  setTheme,
  setLanguage
}: SettingsPanelProps) {
  const [notifications, setNotifications] = useState(true);
  const [premiumShield, setPremiumShield] = useState(true);
  const [immersion, setImmersion] = useState(false);
  const [immersionLanguage, setImmersionLanguage] = useState<'en' | 'de' | 'fr' | 'nl' | 'all'>('en');
  const [rewind, setRewind] = useState(true);
  const [stampPrice, setStampPrice] = useState(0.10);
  const [rewindDelay, setRewindDelay] = useState('30');
  const [activeSection, setActiveSection] = useState<'compte' | 'fonctionnalites' | 'notifications' | 'securite' | 'abonnement'>('fonctionnalites');
  const t = translations[language];
  
  // Get user email and plan
  const [userEmail, setUserEmail] = useState('test@naeliv.com');
  const [userPlan, setUserPlan] = useState<'essential' | 'pro'>('essential');
  const [fullName, setFullName] = useState('');
  const [emailSignature, setEmailSignature] = useState('--\nCordialement,\nVotre nom');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [notificationSounds, setNotificationSounds] = useState(true);
  
  // Security settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
        
        // Récupérer le plan depuis la table profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single();
        
        if (profile?.plan) {
          setUserPlan(profile.plan as 'essential' | 'pro');
        }
      }
    };
    getUser();
  }, []);

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
            </nav>
          </div>

          {/* Right Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {activeSection === 'fonctionnalites' && (
              <div className="p-8">
                <h1 className="text-[32px] font-bold mb-8 text-black dark:text-white">Fonctionnalités Naeliv</h1>
                
                <div className="space-y-4 max-w-3xl mx-auto">
                  {/* Zen Mode - Disponible pour tous */}
                  <FeatureCard
                    icon={Zap}
                    iconColor="text-purple-600"
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
                  />

                  {/* Immersion Linguistique - Disponible pour tous, mais langues limitées pour Essential */}
                  <FeatureCard
                    icon={Globe}
                    iconColor="text-blue-600"
                    name="Immersion Linguistique"
                    description={userPlan === 'pro' ? "Traduisez automatiquement vos emails entrants" : "Traduisez automatiquement vos emails entrants (Anglais uniquement avec Essential)"}
                    enabled={immersion}
                    onToggle={() => setImmersion(!immersion)}
                    additionalSettings={
                      immersion && (
                        <div className="mt-4">
                          <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Langue de traduction
                          </label>
                          <select
                            value={userPlan === 'essential' ? 'en' : immersionLanguage}
                            onChange={(e) => {
                              if (userPlan === 'essential') {
                                // Les Essential ne peuvent choisir que l'anglais
                                setImmersionLanguage('en');
                              } else {
                                setImmersionLanguage(e.target.value as 'en' | 'de' | 'fr' | 'nl' | 'all');
                              }
                            }}
                            disabled={userPlan === 'essential'}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {userPlan === 'pro' ? (
                              <>
                                <option value="en">Anglais (EN)</option>
                                <option value="de">Allemand (DE)</option>
                                <option value="fr">Français (FR)</option>
                                <option value="nl">Néerlandais (NL)</option>
                                <option value="all">Toutes les langues</option>
                              </>
                            ) : (
                              <option value="en">Anglais (EN) - Limité avec Essential</option>
                            )}
                          </select>
                          {userPlan === 'essential' && (
                            <p className="text-[12px] text-purple-600 dark:text-purple-400 mt-2">
                              Passer à PRO pour accéder à toutes les langues
                            </p>
                          )}
                        </div>
                      )
                    }
                  />

                  {/* Rewind - Disponible pour tous, mais délais limités pour Essential */}
                  <FeatureCard
                    icon={RotateCcw}
                    iconColor="text-orange-600"
                    name="Rewind"
                    description={userPlan === 'pro' ? "Annulez l'envoi d'un email dans les secondes suivantes" : "Annulez l'envoi d'un email (10-30 secondes avec Essential)"}
                    enabled={rewind}
                    onToggle={() => setRewind(!rewind)}
                    additionalSettings={
                      rewind && (
                        <div className="mt-4">
                          <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Délai d'annulation (secondes)
                          </label>
                          <select
                            value={rewindDelay}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              // Limiter les Essential à 10-20-30 secondes
                              if (userPlan === 'essential' && newValue === '60') {
                                return;
                              }
                              setRewindDelay(newValue);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-black dark:text-white"
                          >
                            <option value="10">10 secondes</option>
                            <option value="20">20 secondes</option>
                            <option value="30">30 secondes</option>
                            {userPlan === 'pro' && <option value="60">60 secondes</option>}
                          </select>
                          {userPlan === 'essential' && (
                            <p className="text-[12px] text-purple-600 dark:text-purple-400 mt-2">
                              Passer à PRO pour accéder à 60 secondes
                            </p>
                          )}
                        </div>
                      )
                    }
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

                  {/* Full Name */}
                  <div>
                    <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
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
                      onClick={() => {
                        alert('Modifications enregistrées avec succès !');
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
                        <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-[14px] font-medium flex items-center gap-2">
                          <Zap size={16} />
                          <span>Naeliv PRO</span>
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
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <Check size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-[14px] text-gray-700">Adresse @naeliv.com</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-[14px] text-gray-700">Stockage de base</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-[14px] text-gray-700">Zen Mode limité</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[18px] text-gray-400 flex-shrink-0">✗</span>
                            <span className="text-[14px] text-gray-500">Smart Paywall (Premium Shield) - PRO uniquement</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[18px] text-gray-400 flex-shrink-0">✗</span>
                            <span className="text-[14px] text-gray-500">Immersion Linguistique - PRO uniquement</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[18px] text-gray-400 flex-shrink-0">✗</span>
                            <span className="text-[14px] text-gray-500">Rewind illimité - PRO uniquement</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[18px] text-gray-400 flex-shrink-0">✗</span>
                            <span className="text-[14px] text-gray-500">Détox Digitale - PRO uniquement</span>
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
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <Icon size={24} className={`${iconColor} flex-shrink-0 mt-1`} />
          <div className="flex-1">
            <h3 className="text-[18px] font-semibold text-black dark:text-white mb-1">{name}</h3>
            <p className="text-[14px] text-gray-600 dark:text-gray-400">{description}</p>
            {disabled && disabledMessage && (
              <p className="text-[12px] text-purple-600 dark:text-purple-400 mt-2 font-medium">{disabledMessage}</p>
            )}
            {additionalSettings}
          </div>
        </div>
        <motion.button
          onClick={disabled ? undefined : onToggle}
          disabled={disabled}
          className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${
            enabled ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'
          } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          whileTap={disabled ? {} : { scale: 0.95 }}
        >
          <motion.div
            className="absolute rounded-full z-10"
            style={{
              top: '2px',
              left: '2px',
              width: '20px',
              height: '20px',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              border: '1px solid #e5e7eb'
            }}
            animate={{ x: enabled ? 24 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </motion.button>
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
        <motion.button
          onClick={onToggle}
          className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${
            enabled ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute rounded-full z-10"
            style={{
              top: '2px',
              left: '2px',
              width: '20px',
              height: '20px',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              border: '1px solid #e5e7eb'
            }}
            animate={{ x: enabled ? 24 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </motion.button>
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
}

function SmartPaywallCard({ enabled, onToggle, price, onPriceChange, userPlan }: SmartPaywallCardProps) {
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
        <motion.button
          onClick={onToggle}
          className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
            enabled ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute rounded-full z-10"
            style={{
              top: '2px',
              left: '2px',
              width: '20px',
              height: '20px',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              border: '1px solid #e5e7eb'
            }}
            animate={{ x: enabled ? 24 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </motion.button>
      </div>

      {/* Description */}
      <div className="mb-6 space-y-1">
        <p className="text-[14px] text-gray-700 dark:text-gray-300">
          Fixez le prix que les inconnus doivent payer pour vous écrire (0,10€ à 100€)
        </p>
        <p className="text-[14px] text-gray-700 dark:text-gray-300 flex items-center gap-1">
          👋 Vous touchez 1% de commission sur chaque email reçu
        </p>
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

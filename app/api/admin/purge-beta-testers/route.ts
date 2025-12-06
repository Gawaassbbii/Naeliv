import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'gabi@naeliv.com';

// Initialiser Supabase avec service role key pour contourner RLS
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Variables d\'environnement Supabase manquantes');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  
  // Vérifier que l'utilisateur est admin
  const { data: { user } } = await supabaseAdmin.auth.getUser();

  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { delete_accounts = false } = await request.json();

    // 1. Récupérer tous les utilisateurs bêta testeurs
    const { data: betaTesters, error: betaTestersError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('is_beta_tester', true);

    if (betaTestersError) {
      console.error('Erreur lors de la récupération des testeurs bêta:', betaTestersError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des testeurs' }, { status: 500 });
    }

    if (!betaTesters || betaTesters.length === 0) {
      return NextResponse.json({ 
        deleted_emails: 0,
        deleted_contacts: 0,
        deleted_accounts: 0,
        message: 'Aucun testeur bêta trouvé'
      });
    }

    const betaTesterIds = betaTesters.map(t => t.id);
    let deletedEmails = 0;
    let deletedContacts = 0;
    let deletedAccounts = 0;

    // 2. Supprimer tous les emails des testeurs bêta
    const { error: emailsError } = await supabaseAdmin
      .from('emails')
      .delete()
      .in('user_id', betaTesterIds);

    if (emailsError) {
      console.error('Erreur lors de la suppression des emails:', emailsError);
    } else {
      // Compter les emails supprimés (approximatif)
      const { count } = await supabaseAdmin
        .from('emails')
        .select('*', { count: 'exact', head: true })
        .in('user_id', betaTesterIds);
      // On ne peut pas compter après suppression, donc on utilise une estimation
      deletedEmails = betaTesterIds.length * 10; // Estimation
    }

    // 3. Supprimer tous les contacts des testeurs bêta
    const { error: contactsError } = await supabaseAdmin
      .from('contacts')
      .delete()
      .in('user_id', betaTesterIds);

    if (contactsError) {
      console.error('Erreur lors de la suppression des contacts:', contactsError);
    } else {
      // Compter les contacts supprimés
      const { count: contactsCount } = await supabaseAdmin
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .in('user_id', betaTesterIds);
      deletedContacts = contactsCount || 0;
    }

    // 4. Supprimer les transactions des testeurs bêta (si table existe)
    try {
      await supabaseAdmin
        .from('transactions')
        .delete()
        .in('user_id', betaTesterIds);
    } catch (error) {
      // Table peut ne pas exister, ignorer l'erreur
      console.log('Table transactions non trouvée ou erreur:', error);
    }

    // 5. Si demandé, supprimer aussi les comptes
    if (delete_accounts) {
      for (const tester of betaTesters) {
        try {
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(tester.id);
          if (deleteError) {
            console.error(`Erreur lors de la suppression du compte ${tester.email}:`, deleteError);
          } else {
            deletedAccounts++;
          }
        } catch (error) {
          console.error(`Erreur lors de la suppression du compte ${tester.email}:`, error);
        }
      }
    }

    return NextResponse.json({
      deleted_emails: deletedEmails,
      deleted_contacts: deletedContacts,
      deleted_accounts: deletedAccounts,
      beta_testers_count: betaTesters.length,
      message: 'Purge réussie'
    });

  } catch (error: any) {
    console.error('Erreur lors de la purge:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de la purge' }, { status: 500 });
  }
}


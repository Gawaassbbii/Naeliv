/**
 * Script pour gérer le compte jakub@naeliv.com
 * - Supprime les anciens comptes jakub123@naeliv.com et jakub@naeliv.com
 * - Crée un nouveau compte jakub@naeliv.com
 * - Le rend PRO avec le mot de passe "cipkanamida"
 * 
 * Usage: node scripts/manage-jakub-account.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement depuis .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (key && value) {
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erreur: NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function deleteUser(email) {
  try {
    // 1. Trouver l'utilisateur
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error(`❌ Erreur lors de la liste des utilisateurs:`, listError);
      return false;
    }

    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.log(`ℹ️  Utilisateur ${email} non trouvé (déjà supprimé ou n'existe pas)`);
      return true;
    }

    // 2. Supprimer l'utilisateur (cela supprimera automatiquement son profil grâce à ON DELETE CASCADE)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error(`❌ Erreur lors de la suppression de ${email}:`, deleteError);
      return false;
    }

    console.log(`✅ Utilisateur ${email} supprimé avec succès (ID: ${user.id})`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur inattendue lors de la suppression de ${email}:`, error);
    return false;
  }
}

async function createJakubAccount() {
  try {
    const email = 'jakub@naeliv.com';
    const password = 'cipkanamida';
    const username = 'jakub';

    // 1. Vérifier si l'utilisateur existe déjà
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erreur lors de la liste des utilisateurs:', listError);
      return false;
    }

    const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      console.log(`⚠️  L'utilisateur ${email} existe déjà. Suppression...`);
      const deleted = await deleteUser(email);
      if (!deleted) {
        return false;
      }
    }

    // 2. Créer le nouvel utilisateur
    console.log(`\n📝 Création du compte ${email}...`);
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Confirmer l'email automatiquement
      user_metadata: {
        first_name: 'Jakub',
        username: username
      }
    });

    if (createError) {
      console.error('❌ Erreur lors de la création de l\'utilisateur:', createError);
      return false;
    }

    if (!newUser.user) {
      console.error('❌ Utilisateur créé mais données manquantes');
      return false;
    }

    console.log(`✅ Utilisateur ${email} créé avec succès (ID: ${newUser.user.id})`);

    // 3. Attendre un peu pour que le trigger crée le profil
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 4. Mettre à jour le profil pour le rendre PRO
    console.log(`\n⭐ Mise à jour du profil pour rendre le compte PRO...`);
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        plan: 'pro',
        is_pro: true,
        first_name: 'Jakub',
        username: username
      })
      .eq('id', newUser.user.id)
      .select()
      .single();

    if (profileError) {
      console.error('❌ Erreur lors de la mise à jour du profil:', profileError);
      // Le profil n'existe peut-être pas encore, essayons de le créer
      console.log('⚠️  Tentative de création du profil...');
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: newUser.user.id,
          email: email,
          username: username,
          first_name: 'Jakub',
          plan: 'pro',
          is_pro: true
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erreur lors de la création du profil:', insertError);
        return false;
      }

      console.log(`✅ Profil créé et configuré en PRO`);
    } else {
      console.log(`✅ Profil mis à jour en PRO`);
    }

    console.log(`\n✅✅✅ COMPTE CRÉÉ AVEC SUCCÈS ✅✅✅`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Mot de passe: ${password}`);
    console.log(`⭐ Plan: PRO`);
    console.log(`\nVous pouvez maintenant vous connecter à ${email} avec le mot de passe "${password}"`);

    return true;
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Démarrage de la gestion du compte jakub@naeliv.com\n');

  // 1. Supprimer les anciens comptes
  console.log('🗑️  Suppression des anciens comptes...');
  await deleteUser('jakub123@naeliv.com');
  await deleteUser('jakub@naeliv.com');
  
  console.log('\n');

  // 2. Créer le nouveau compte
  const success = await createJakubAccount();

  if (success) {
    console.log('\n✅ Script terminé avec succès !');
    process.exit(0);
  } else {
    console.log('\n❌ Script terminé avec des erreurs');
    process.exit(1);
  }
}

main();


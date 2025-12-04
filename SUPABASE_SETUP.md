# Configuration Supabase

## Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
NEXT_PUBLIC_SUPABASE_URL=https://qmwcvaaviheclxgerdgq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_rtV0FkubiAIH544cWRazHA_7U_Iio6_
```

## Configuration Supabase

### 1. Tables nécessaires

**📋 FICHIER SQL PRÊT À COPIER-COLLER : `executer dans sql/supabase_schema.sql`**

Le fichier `executer dans sql/supabase_schema.sql` contient tout le code SQL nécessaire. Suivez ces étapes :

1. Ouvrez le tableau de bord Supabase
2. Allez dans **SQL Editor** (dans le menu de gauche)
3. Cliquez sur **New Query**
4. Ouvrez le fichier `supabase_schema.sql` dans votre éditeur
5. **Copiez tout le contenu** et **collez-le** dans l'éditeur SQL de Supabase
6. Cliquez sur **Run** (ou appuyez sur Ctrl+Enter)

Le script créera automatiquement :
- ✅ Table `profiles` (profils utilisateurs)
- ✅ Table `emails` (emails reçus - optionnel)
- ✅ Table `contacts` (contacts de l'utilisateur)
- ✅ Table `subscriptions` (abonnements PRO)
- ✅ Toutes les politiques de sécurité (RLS)
- ✅ Les triggers pour `updated_at`
- ✅ Les index pour les performances
- ✅ Une fonction pour créer automatiquement un profil à l'inscription

### 2. Configuration de l'authentification

Dans le tableau de bord Supabase :
1. Allez dans **Authentication** > **Settings**
2. Configurez les **Site URL** et **Redirect URLs** selon votre domaine
3. Activez l'authentification par email/mot de passe

### 3. Fonctionnalités implémentées

- ✅ Inscription avec email et mot de passe
- ✅ Connexion avec email et mot de passe
- ✅ Stockage des métadonnées utilisateur (nom, prénom, plan)
- ✅ Gestion des erreurs
- ✅ Redirection après connexion/inscription

### 4. Prochaines étapes

- [ ] Créer une page de réinitialisation de mot de passe
- [ ] Ajouter la vérification d'email
- [ ] Créer un contexte d'authentification global
- [ ] Protéger les routes nécessitant une authentification


# 🔧 Guide de Résolution - Problème de Connexion

## Problème : "Invalid login credentials" après l'inscription

### ✅ Solution Rapide (Recommandée)

**Étape 1 : Désactiver la vérification d'email dans Supabase**

1. Allez dans **Supabase Dashboard** → **Authentication** → **Settings**
2. Dans la section **"Email Auth"**, **décochez** "Enable email confirmations"
3. Cliquez sur **"Save"**

Cela permettra aux utilisateurs de se connecter immédiatement après l'inscription.

---

**Étape 2 : Confirmer tous les emails existants**

1. Allez dans **Supabase Dashboard** → **SQL Editor**
2. Exécutez ce script SQL :

```sql
-- Confirmer tous les emails existants
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;
```

3. Vérifiez que les emails sont confirmés :

```sql
SELECT email, email_confirmed_at 
FROM auth.users 
WHERE email LIKE '%@naeliv.com'
ORDER BY created_at DESC;
```

---

### 🔍 Vérifications

**Vérifier que l'utilisateur existe :**

```sql
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'votre_email@naeliv.com';
```

**Vérifier que le profil existe :**

```sql
SELECT * FROM profiles
WHERE email = 'votre_email@naeliv.com';
```

**Si le profil n'existe pas, le créer manuellement :**

```sql
INSERT INTO profiles (id, email, first_name, last_name, username, plan)
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'first_name',
  u.raw_user_meta_data->>'last_name',
  COALESCE(u.raw_user_meta_data->>'username', SPLIT_PART(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'plan', 'essential')
FROM auth.users u
WHERE u.email = 'votre_email@naeliv.com'
ON CONFLICT (id) DO NOTHING;
```

---

### 🛠️ Solution Complète (Configuration des Triggers)

Si vous voulez que tout soit automatique, exécutez ces scripts SQL dans l'ordre :

1. **`executer dans sql/verifier_et_corriger_inscription.sql`** - Configure les triggers
2. **`executer dans sql/desactiver_verification_email_complet.sql`** - Confirme tous les emails

---

### 📝 Notes

- Après avoir désactivé la vérification d'email dans Supabase, tous les nouveaux utilisateurs pourront se connecter immédiatement
- Les utilisateurs existants doivent avoir leur email confirmé via le script SQL
- En production, vous devrez réactiver la vérification d'email et utiliser un vrai service d'envoi d'emails

---

### ❓ Si le problème persiste

1. Vérifiez dans la console du navigateur (F12) les erreurs détaillées
2. Vérifiez que l'email et le mot de passe sont corrects
3. Vérifiez que l'utilisateur existe bien dans Supabase
4. Vérifiez que le profil existe dans la table `profiles`




# 🔐 Configuration des Variables d'Environnement - Guide Détaillé

## ⚠️ IMPORTANT : Remplacez TOUTES les valeurs d'exemple par vos vraies clés !

---

## 1. SUPABASE_SERVICE_ROLE_KEY

### Comment l'obtenir :
1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** (⚙️) > **API**
4. Dans la section **Project API keys**, trouvez **`service_role`** (⚠️ pas `anon` !)
5. Cliquez sur l'icône 👁️ pour révéler la clé
6. **Copiez la clé complète** (elle commence généralement par `eyJ...`)

### Dans votre `.env.local` :
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtd2N2YWF2aWhlY2x4Z2VyZGdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5ODk2NzIwMCwiZXhwIjoyMDE0NTQzMjAwfQ.votre_vraie_cle_ici
```

⚠️ **SÉCURITÉ** : Cette clé contourne toutes les politiques de sécurité. Ne la partagez JAMAIS publiquement !

---

## 2. WEBHOOK_SECRET

### Comment le générer :

**Option A : En ligne de commande (recommandé)**
```bash
# Sur Windows (PowerShell)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Sur Mac/Linux
openssl rand -hex 32
```

**Option B : En ligne**
- Allez sur [randomkeygen.com](https://randomkeygen.com/)
- Utilisez "CodeIgniter Encryption Keys" (256-bit)
- Copiez une des clés générées

**Option C : Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Dans votre `.env.local` :
```env
WEBHOOK_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

⚠️ **Important** : 
- Minimum 32 caractères
- Gardez cette clé secrète
- Utilisez la MÊME clé dans votre service email (Resend/Mailgun)

---

## 3. RESEND_API_KEY (si vous utilisez Resend)

### Comment l'obtenir :
1. Créez un compte sur [Resend.com](https://resend.com)
2. Allez dans **API Keys**
3. Cliquez sur **Create API Key**
4. Donnez-lui un nom (ex: "Naeliv Production")
5. Copiez la clé (elle commence par `re_`)

### Dans votre `.env.local` :
```env
RESEND_API_KEY=re_1234567890abcdefghijklmnopqrstuvwxyz
```

---

## 4. MAILGUN_API_KEY (si vous utilisez Mailgun)

### Comment l'obtenir :
1. Créez un compte sur [Mailgun.com](https://www.mailgun.com)
2. Allez dans **Settings** > **API Keys**
3. Copiez la **Private API key** (pas la Public key)

### Dans votre `.env.local` :
```env
MAILGUN_API_KEY=key-1234567890abcdefghijklmnopqrstuvwxyz
MAILGUN_DOMAIN=votre-domaine.com
```

---

## 📝 Exemple de fichier `.env.local` complet

```env
# ============================================================================
# SUPABASE
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://qmwcvaaviheclxgerdgq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtd2N2YWF2aWhlY2x4Z2VyZGdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg5NjcyMDAsImV4cCI6MjAxNDU0MzIwMH0.votre_anon_key_ici

# ⚠️ SERVICE ROLE KEY - Contourne RLS (UNIQUEMENT pour l'API webhook)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtd2N2YWF2aWhlY2x4Z2VyZGdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5ODk2NzIwMCwiZXhwIjoyMDE0NTQzMjAwfQ.votre_service_role_key_ici

# ============================================================================
# SÉCURITÉ WEBHOOK
# ============================================================================
# Générez une clé aléatoire de 32+ caractères
WEBHOOK_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# ============================================================================
# SERVICE EMAIL (choisissez UN SEUL)
# ============================================================================

# Option 1: Resend (recommandé)
RESEND_API_KEY=re_1234567890abcdefghijklmnopqrstuvwxyz

# Option 2: Mailgun (décommentez si vous utilisez Mailgun)
# MAILGUN_API_KEY=key-1234567890abcdefghijklmnopqrstuvwxyz
# MAILGUN_DOMAIN=naeliv.com

# ============================================================================
# SÉCURITÉ (optionnel)
# ============================================================================
EMAIL_BLACKLIST=spam@example.com,bad@example.com
ALLOW_UNSIGNED_WEBHOOKS=false
NODE_ENV=development
```

---

## ✅ Checklist de Vérification

Avant de continuer, vérifiez que :

- [ ] `SUPABASE_SERVICE_ROLE_KEY` commence par `eyJ` (c'est un JWT)
- [ ] `WEBHOOK_SECRET` fait au moins 32 caractères
- [ ] `RESEND_API_KEY` commence par `re_` (si vous utilisez Resend)
- [ ] `MAILGUN_API_KEY` commence par `key-` (si vous utilisez Mailgun)
- [ ] Aucune valeur ne contient `xxxxx`, `votre_`, `example`, etc.
- [ ] Le fichier `.env.local` est dans `.gitignore` (ne pas le commiter !)

---

## 🚨 Erreurs Courantes

### ❌ "Invalid API key"
→ Vérifiez que vous avez copié la clé complète (sans espaces avant/après)

### ❌ "Service role key not found"
→ Vérifiez que vous avez bien la clé `service_role` et pas `anon`

### ❌ "Webhook secret too short"
→ Votre `WEBHOOK_SECRET` doit faire au moins 32 caractères

---

**Besoin d'aide ?** Vérifiez que toutes vos clés sont bien remplacées par de vraies valeurs !


# 📝 Instructions pour créer .env.local

## ⚠️ IMPORTANT : Pour Vercel (Production)

Le fichier `.env.local` est **UNIQUEMENT pour le développement local**. 

**Pour la production sur Vercel, vous DEVEZ configurer les variables dans Vercel Dashboard :**

1. Allez dans **Vercel** > Votre projet > **Settings** > **Environment Variables**
2. Ajoutez chaque variable une par une
3. Cochez les environnements : Production, Preview, Development

## 📋 Pour le développement local

1. **Copiez le template** :
   ```bash
   # Dans PowerShell
   Copy-Item .env.local.template .env.local
   ```

2. **Ouvrez `.env.local`** et remplacez toutes les valeurs `votre_xxx_ici` par vos vraies valeurs

3. **Vérifiez que `.env.local` est dans `.gitignore`** (il devrait déjà y être)

## 🔍 Où trouver les valeurs

### Supabase
- **URL** : Supabase Dashboard > Settings > API > Project URL
- **Anon Key** : Supabase Dashboard > Settings > API > anon public key  
- **Service Role Key** : Supabase Dashboard > Settings > API > service_role secret key

### Resend
- **API Key** : Resend Dashboard > API Keys
- **Webhook Secret** : Resend Dashboard > Domains > naeliv.com > Webhooks > Secret

## ✅ Checklist

- [ ] J'ai copié `.env.local.template` en `.env.local`
- [ ] J'ai remplacé `NEXT_PUBLIC_SUPABASE_ANON_KEY` par la vraie valeur
- [ ] J'ai remplacé `SUPABASE_SERVICE_ROLE_KEY` par la vraie valeur
- [ ] J'ai remplacé `RESEND_API_KEY` par la vraie valeur
- [ ] `WEBHOOK_SECRET` est correct (whsec_1okDSlt2vHmmmZrSaHviDk3vX9kQgtei)
- [ ] Pour Vercel, j'ai ajouté toutes les variables dans Vercel Dashboard


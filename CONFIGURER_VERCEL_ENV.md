# 🔐 Configurer les Variables d'Environnement dans Vercel

## ⚠️ Problème actuel

L'erreur "error making request: client error (Connect)" indique que :
1. Le webhook Resend ne peut pas se connecter à Vercel
2. OU les variables d'environnement ne sont pas configurées dans Vercel

## ✅ Solution : Configurer dans Vercel

**Important** : `.env.local` est pour le développement local. Pour la production sur Vercel, vous devez configurer les variables dans Vercel Dashboard.

### Étapes :

1. **Allez dans Vercel Dashboard** > Votre projet > **Settings** > **Environment Variables**

2. **Ajoutez ces variables** (une par une) :

```
NEXT_PUBLIC_SUPABASE_URL
Valeur: https://qmwcvaaviheclxgerdgq.supabase.co
Environnements: ✅ Production, ✅ Preview, ✅ Development

NEXT_PUBLIC_SUPABASE_ANON_KEY
Valeur: [votre clé anon]
Environnements: ✅ Production, ✅ Preview, ✅ Development

SUPABASE_SERVICE_ROLE_KEY
Valeur: [votre service role key]
Environnements: ✅ Production, ✅ Preview, ✅ Development

WEBHOOK_SECRET
Valeur: whsec_1okDSlt2vHmmmZrSaHviDk3vX9kQgtei
Environnements: ✅ Production, ✅ Preview, ✅ Development

RESEND_API_KEY
Valeur: [votre clé API Resend]
Environnements: ✅ Production, ✅ Preview, ✅ Development

NODE_ENV
Valeur: production
Environnements: ✅ Production

ALLOW_UNSIGNED_WEBHOOKS
Valeur: false
Environnements: ✅ Production, ✅ Preview, ✅ Development
```

3. **Après avoir ajouté toutes les variables**, Vercel redéploiera automatiquement

4. **Vérifiez le webhook Resend** :
   - Allez dans Resend Dashboard > Domains > naeliv.com
   - Vérifiez que l'URL est : `https://naeliv.com/api/inbound-email`
   - Vérifiez que le Secret est : `whsec_1okDSlt2vHmmmZrSaHviDk3vX9kQgtei`

## 🔍 Vérifier que ça fonctionne

1. Attendez 2-3 minutes que Vercel redéploie
2. Vérifiez les logs Vercel (Votre projet > Logs)
3. Envoyez un email de test vers `test2@naeliv.com`
4. Vérifiez les logs pour voir si le webhook arrive

## 📝 Où trouver les valeurs

### Supabase
- **URL** : Supabase Dashboard > Settings > API > Project URL
- **Anon Key** : Supabase Dashboard > Settings > API > anon public key
- **Service Role Key** : Supabase Dashboard > Settings > API > service_role secret key

### Resend
- **API Key** : Resend Dashboard > API Keys
- **Webhook Secret** : Resend Dashboard > Domains > naeliv.com > Webhooks > Secret



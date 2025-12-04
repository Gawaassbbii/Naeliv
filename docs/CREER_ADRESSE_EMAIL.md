# 📧 Comment créer une adresse email ask@support-naeliv.com

## 🎯 Vue d'ensemble

Pour créer l'adresse `ask@support-naeliv.com`, vous avez deux options selon votre configuration DNS :

### Option 1 : Sous-domaine (support-naeliv.com)
Si `support-naeliv.com` est un sous-domaine de `naeliv.com`, vous pouvez utiliser la configuration existante.

### Option 2 : Domaine séparé
Si `support-naeliv.com` est un domaine complètement séparé, vous devez le configurer dans Resend.

---

## 🚀 Méthode Recommandée : Utiliser Resend Inbound

### Étape 1 : Vérifier votre configuration Resend actuelle

1. Allez sur [resend.com](https://resend.com) et connectez-vous
2. Allez dans **Domains** pour voir vos domaines configurés
3. Vérifiez si `naeliv.com` est déjà configuré

### Étape 2 : Configurer le domaine support-naeliv.com

#### Si support-naeliv.com est un sous-domaine de naeliv.com :

Vous pouvez utiliser la configuration existante de `naeliv.com`. Il suffit de créer une route inbound spécifique.

#### Si support-naeliv.com est un domaine séparé :

1. Dans Resend Dashboard, allez dans **Domains**
2. Cliquez sur **Add Domain**
3. Entrez `support-naeliv.com`
4. Resend vous donnera des enregistrements DNS à ajouter

### Étape 3 : Configuration DNS

Ajoutez ces enregistrements DNS dans votre gestionnaire DNS (chez votre registrar) :

```
Type    Name    Value                           Priority
MX      @       feedback-smtp.resend.com        10
TXT     @       v=spf1 include:resend.com ~all
TXT     _dmarc  v=DMARC1; p=none; rua=mailto:dmarc@support-naeliv.com
```

**Important** : La propagation DNS peut prendre jusqu'à 48h.

### Étape 4 : Créer une route Inbound spécifique

1. Dans Resend Dashboard, allez dans **Inbound**
2. Cliquez sur **Create Route**
3. Configurez :
   - **Pattern** : `ask@support-naeliv.com` (pour cette adresse spécifique)
     OU
     `*@support-naeliv.com` (pour recevoir tous les emails sur ce domaine)
   - **Webhook URL** : `https://votre-domaine.com/api/inbound-email`
   - Activez la route

### Étape 5 : Vérifier votre endpoint API

Votre endpoint `/api/inbound-email` est déjà configuré dans `app/api/inbound-email/route.ts`.

Assurez-vous que :
- `RESEND_API_KEY` est configuré dans vos variables d'environnement
- `WEBHOOK_SECRET` est configuré pour la vérification de signature
- L'URL du webhook dans Resend pointe vers votre domaine de production

### Étape 6 : Variables d'environnement

Vérifiez que ces variables sont configurées (`.env.local` pour le dev, Vercel/Netlify pour la prod) :

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
WEBHOOK_SECRET=your_random_secret_key_here
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

---

## 🧪 Tester la réception

### Test 1 : Envoyer un email de test

1. Depuis n'importe quelle boîte email (Gmail, Outlook, etc.)
2. Envoyez un email à `ask@support-naeliv.com`
3. Vérifiez les logs dans Vercel/Netlify pour voir si le webhook est reçu
4. Vérifiez dans Supabase que l'email a été enregistré dans la table `emails`

### Test 2 : Vérifier les logs

Dans les logs de votre application (Vercel/Netlify), vous devriez voir :
```
📧 [INBOUND EMAIL] Requête reçue à ...
📧 [INBOUND EMAIL] Signature Resend (Svix) vérifiée avec succès
```

---

## 🔍 Dépannage

### L'email n'arrive pas ?

1. **Vérifier la propagation DNS** : Utilisez [MXToolbox](https://mxtoolbox.com/) pour vérifier que les enregistrements MX sont corrects
2. **Vérifier la route Inbound** : Dans Resend Dashboard > Inbound, vérifiez que la route est active
3. **Vérifier les logs** : Regardez les logs de votre application pour voir si le webhook est reçu
4. **Vérifier la signature** : Assurez-vous que `WEBHOOK_SECRET` correspond à celui configuré dans Resend

### L'email arrive mais n'est pas enregistré ?

1. Vérifiez les logs pour voir s'il y a des erreurs
2. Vérifiez que Supabase est correctement configuré
3. Vérifiez que l'utilisateur existe dans Supabase (l'email est associé à un `user_id`)

---

## 📝 Notes importantes

- **Sous-domaine vs Domaine séparé** : Si `support-naeliv.com` est un sous-domaine, vous pouvez utiliser la configuration DNS de `naeliv.com` avec un wildcard `*@*.naeliv.com`
- **Limites Resend** : Le plan gratuit de Resend a des limites. Vérifiez votre plan.
- **Sécurité** : Ne partagez jamais votre `RESEND_API_KEY` ou `WEBHOOK_SECRET` publiquement

---

## 🎯 Configuration rapide (si naeliv.com est déjà configuré)

Si `naeliv.com` est déjà configuré dans Resend et que `support-naeliv.com` est un sous-domaine :

1. Créez simplement une route Inbound dans Resend :
   - Pattern : `ask@support-naeliv.com`
   - Webhook URL : `https://votre-domaine.com/api/inbound-email`
   - Activez la route

2. Les emails seront automatiquement reçus et traités par votre endpoint existant !


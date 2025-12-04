# 🔧 Vérifier le domaine naeliv.com dans Resend

## ❌ Erreur actuelle

```
The naeliv.com domain is not verified. Please, add and verify your domain on https://resend.com/domains
```

## ✅ Solution : Vérifier le domaine dans Resend

### Étape 1 : Accéder à Resend Dashboard

1. Allez sur [https://resend.com/domains](https://resend.com/domains)
2. Connectez-vous à votre compte Resend

### Étape 2 : Ajouter/Vérifier le domaine

1. Dans la liste des domaines, trouvez `naeliv.com`
2. Si le domaine n'existe pas :
   - Cliquez sur **"Add Domain"**
   - Entrez `naeliv.com`
   - Cliquez sur **"Add"**

3. Si le domaine existe mais n'est pas vérifié :
   - Cliquez sur le domaine `naeliv.com`
   - Vous verrez les enregistrements DNS à ajouter

### Étape 3 : Configurer les enregistrements DNS

Resend vous donnera des enregistrements DNS à ajouter dans votre registrar (là où vous avez acheté le domaine `naeliv.com`).

**Exemple d'enregistrements à ajouter :**

```
Type    Name    Value                           Priority
TXT     @       v=spf1 include:resend.com ~all
TXT     _resend resend-domain-verification=xxxxx
CNAME   resend  resend.net
```

**Important :**
- Remplacez `xxxxx` par la valeur exacte fournie par Resend
- Ajoutez ces enregistrements dans votre registrar DNS
- La propagation DNS peut prendre jusqu'à 48h (généralement quelques minutes)

### Étape 4 : Vérifier le domaine

1. Une fois les enregistrements DNS ajoutés, retournez dans Resend Dashboard
2. Cliquez sur **"Verify Domain"** ou attendez la vérification automatique
3. Le statut devrait passer à **"Verified"** (vérifié)

### Étape 5 : Tester l'envoi

Une fois le domaine vérifié :
1. Retournez sur `naeliv.com`
2. Essayez d'envoyer un email en réponse
3. L'email devrait être envoyé avec succès

## 📝 Notes importantes

- **Le domaine doit être vérifié** avant de pouvoir envoyer des emails
- **La réception d'emails** (webhook inbound) fonctionne même si le domaine n'est pas vérifié
- **L'envoi d'emails** nécessite un domaine vérifié

## 🔍 Vérifier le statut

Dans Resend Dashboard > Domains > `naeliv.com`, vous devriez voir :
- ✅ **Status: Verified** (si vérifié)
- ❌ **Status: Pending** (si en attente de vérification)

## ⚠️ Si le domaine est déjà vérifié mais l'erreur persiste

1. Vérifiez que vous utilisez bien `naeliv.com` (et pas `www.naeliv.com`)
2. Vérifiez que `RESEND_API_KEY` est correctement configuré dans Vercel
3. Attendez quelques minutes pour la propagation des changements


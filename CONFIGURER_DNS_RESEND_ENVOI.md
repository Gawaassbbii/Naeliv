# 🔧 Configurer les enregistrements DNS pour l'envoi d'emails (Resend)

## ❌ Problème actuel

Les enregistrements SPF sont manquants ou incorrects :
- MX record pour `send` : **Failed**
- TXT record pour `send` : **Failed**

## ✅ Solution : Configurer les enregistrements DNS

### Étape 1 : Voir les enregistrements requis dans Resend

1. Allez sur [https://resend.com/domains](https://resend.com/domains)
2. Cliquez sur le domaine `naeliv.com`
3. Allez dans l'onglet **"Sending"** ou **"Enable Sending"**
4. Vous verrez les enregistrements DNS à ajouter

### Étape 2 : Ajouter les enregistrements dans votre registrar

Allez dans votre registrar DNS (là où vous avez acheté `naeliv.com`) et ajoutez ces enregistrements :

#### Enregistrement MX (pour l'envoi)

```
Type: MX
Name: send
Value: feedback-smtp.eu-west-1.amazonses.com (ou la valeur exacte affichée dans Resend)
Priority: 10
TTL: Auto (ou 3600)
```

#### Enregistrement TXT (SPF pour l'envoi)

```
Type: TXT
Name: send
Value: v=spf1 include:amazonses.com ~all (ou la valeur exacte affichée dans Resend)
TTL: Auto (ou 3600)
```

**Important :**
- Utilisez **exactement** les valeurs affichées dans Resend Dashboard
- Le nom doit être `send` (pas `@` ni `send.naeliv.com`)
- Attendez 5-15 minutes pour la propagation DNS

### Étape 3 : Vérifier dans Resend

1. Retournez dans Resend Dashboard > Domains > `naeliv.com` > Sending
2. Cliquez sur **"Verify"** ou attendez la vérification automatique
3. Les statuts devraient passer de **"Failed"** à **"Verified"** ✅

### Étape 4 : Tester l'envoi

Une fois les enregistrements vérifiés :
1. Retournez sur `naeliv.com`
2. Essayez d'envoyer un email en réponse
3. L'email devrait être envoyé avec succès

## 📝 Notes importantes

### Différence entre réception et envoi

- **Réception (Inbound)** : Utilise les enregistrements MX pour `@` (déjà configuré)
- **Envoi (Sending)** : Utilise les enregistrements MX et TXT pour `send` (à configurer)

### Enregistrements DNS complets pour naeliv.com

Vous devriez avoir :

**Pour la réception (déjà configuré) :**
```
Type: MX
Name: @
Value: feedback-smtp.resend.com
Priority: 10
```

**Pour l'envoi (à ajouter) :**
```
Type: MX
Name: send
Value: feedback-smtp.eu-west-1.amazonses.com (valeur exacte de Resend)
Priority: 10

Type: TXT
Name: send
Value: v=spf1 include:amazonses.com ~all (valeur exacte de Resend)
```

## 🔍 Vérifier le statut

Dans Resend Dashboard > Domains > `naeliv.com` > Sending :
- ✅ **Status: Verified** (si vérifié)
- ❌ **Status: Failed** (si les enregistrements sont incorrects ou manquants)

## ⚠️ Si les enregistrements restent en "Failed"

1. Vérifiez que vous avez utilisé **exactement** les valeurs de Resend
2. Vérifiez que le nom est bien `send` (pas `send.naeliv.com` ni `@`)
3. Attendez 15-30 minutes pour la propagation DNS complète
4. Vérifiez dans votre registrar que les enregistrements sont bien présents
5. Essayez de cliquer sur "Verify" à nouveau dans Resend


# 🌐 Configuration DNS pour naeliv.com - Guide Complet

Vercel vous donne **deux méthodes** pour configurer vos domaines. Choisissez celle que vous préférez.

---

## 🎯 Méthode 1 : Ajouter les Enregistrements DNS (Recommandée)

### Pour `naeliv.com` (domaine racine) :

Dans votre registrar (là où vous avez acheté le domaine), ajoutez cet enregistrement :

```
Type: A
Name: @
Value: 216.198.79.1
TTL: Auto (ou 3600)
```

### Pour `www.naeliv.com` :

Dans votre registrar, ajoutez cet enregistrement :

```
Type: CNAME
Name: www
Value: 251d8d413e29800b.vercel-dns-017.com.
TTL: Auto (ou 3600)
```

⚠️ **Important** : Notez le point (`.`) à la fin de la valeur CNAME : `251d8d413e29800b.vercel-dns-017.com.`

---

## 🎯 Méthode 2 : Utiliser les Nameservers de Vercel (Plus Simple)

Cette méthode permet à Vercel de gérer directement tous vos DNS.

### Étapes :

1. Dans votre registrar, allez dans la section **Nameservers** (ou **DNS Servers**)
2. Remplacez les nameservers actuels par :
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
3. Sauvegardez
4. Attendez 5-10 minutes
5. Dans Vercel, cliquez sur **"Refresh"** à côté de chaque domaine

⚠️ **Note** : Avec cette méthode, Vercel gère tous vos DNS. Vous ne pourrez plus ajouter d'enregistrements DNS manuellement dans votre registrar.

---

## 📋 Instructions par Registrar

### Namecheap

**Méthode 1 (Enregistrements DNS) :**
1. Connectez-vous à Namecheap
2. Allez dans **Domain List** > Cliquez sur **"Manage"** à côté de `naeliv.com`
3. Onglet **"Advanced DNS"**
4. Cliquez sur **"Add New Record"**
5. Pour `naeliv.com` :
   - Type : **A Record**
   - Host : **@**
   - Value : **216.198.79.1**
   - TTL : **Automatic**
6. Pour `www.naeliv.com` :
   - Type : **CNAME Record**
   - Host : **www**
   - Value : **251d8d413e29800b.vercel-dns-017.com.**
   - TTL : **Automatic**
7. Cliquez sur **"Save All Changes"**

**Méthode 2 (Nameservers) :**
1. Domain List > Manage > Onglet **"Nameservers"**
2. Sélectionnez **"Custom DNS"**
3. Entrez :
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
4. Cliquez sur **"Save"**

### GoDaddy

**Méthode 1 (Enregistrements DNS) :**
1. Connectez-vous à GoDaddy
2. Allez dans **My Products** > **DNS** à côté de `naeliv.com`
3. Cliquez sur **"Add"**
4. Pour `naeliv.com` :
   - Type : **A**
   - Name : **@**
   - Value : **216.198.79.1**
   - TTL : **600**
5. Pour `www.naeliv.com` :
   - Type : **CNAME**
   - Name : **www**
   - Value : **251d8d413e29800b.vercel-dns-017.com.**
   - TTL : **600**
6. Cliquez sur **"Save"**

**Méthode 2 (Nameservers) :**
1. My Products > Cliquez sur **"DNS"** ou **"Manage DNS"**
2. Allez dans **"Nameservers"**
3. Cliquez sur **"Change"**
4. Sélectionnez **"Custom"**
5. Entrez :
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
6. Cliquez sur **"Save"**

### OVH

**Méthode 1 (Enregistrements DNS) :**
1. Connectez-vous à OVH
2. Allez dans **Web Cloud** > **Domaines** > `naeliv.com`
3. Onglet **"Zone DNS"**
4. Cliquez sur **"Ajouter une entrée"**
5. Pour `naeliv.com` :
   - Type : **A**
   - Sous-domaine : **@** (ou laissé vide)
   - Cible : **216.198.79.1**
6. Pour `www.naeliv.com` :
   - Type : **CNAME**
   - Sous-domaine : **www**
   - Cible : **251d8d413e29800b.vercel-dns-017.com.**
7. Cliquez sur **"Valider"**

**Méthode 2 (Nameservers) :**
1. Web Cloud > Domaines > `naeliv.com`
2. Onglet **"Serveurs DNS"**
3. Cliquez sur **"Modifier"**
4. Remplacez par :
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
5. Cliquez sur **"Valider"**

---

## ✅ Vérification

### Après avoir configuré les DNS :

1. **Attendez 5-10 minutes** (la propagation peut prendre jusqu'à 24-48h)
2. Dans Vercel, cliquez sur **"Refresh"** à côté de chaque domaine
3. Le statut devrait passer de **"Invalid Configuration"** à **"Valid"** (coche verte ✅)

### Vérifier la propagation DNS :

Utilisez ces outils en ligne :
- https://www.whatsmydns.net/#A/naeliv.com
- https://dnschecker.org/#A/naeliv.com

Entrez `naeliv.com` et vérifiez que l'adresse IP `216.198.79.1` apparaît.

---

## 🆘 Problèmes Courants

### Le statut reste "Invalid Configuration" après 24h

1. Vérifiez que les valeurs sont **exactement** comme indiqué (surtout le point à la fin du CNAME)
2. Vérifiez qu'il n'y a pas d'anciens enregistrements qui entrent en conflit
3. Supprimez les anciens enregistrements A ou CNAME pour `@` et `www`
4. Attendez encore quelques heures (la propagation peut être lente)

### Erreur "Domain already in use"

Cela signifie que le domaine est peut-être utilisé ailleurs. Vérifiez dans Vercel si le domaine n'est pas déjà assigné à un autre projet.

---

## 📝 Résumé des Valeurs

**Pour référence rapide :**

```
naeliv.com:
  Type: A
  Name: @
  Value: 216.198.79.1

www.naeliv.com:
  Type: CNAME
  Name: www
  Value: 251d8d413e29800b.vercel-dns-017.com.

Nameservers Vercel:
  ns1.vercel-dns.com
  ns2.vercel-dns.com
```

---

**Besoin d'aide ?** Dites-moi quel est votre registrar et je vous guiderai étape par étape !


# 🔧 Corriger la Configuration DNS pour naeliv.com

## Problème
Les domaines `naeliv.com` et `www.naeliv.com` affichent "Invalid Configuration" dans Vercel.

## Solution : Configurer les DNS

### Étape 1 : Obtenir les valeurs DNS depuis Vercel

1. Dans Vercel, cliquez sur **"Edit"** à côté de `naeliv.com`
2. Vercel vous donnera des instructions DNS spécifiques
3. Notez les valeurs à ajouter (généralement des enregistrements A ou CNAME)

### Étape 2 : Configurer les DNS dans votre registrar

**Où avez-vous acheté le domaine `naeliv.com` ?** (ex: Namecheap, GoDaddy, OVH, etc.)

#### Pour `naeliv.com` (domaine racine) :

Vercel vous donnera généralement :
- **Type** : `A` ou `CNAME`
- **Name** : `@` ou laissé vide
- **Value** : Une adresse IP (ex: `76.76.21.21`) ou un CNAME (ex: `cname.vercel-dns.com`)

#### Pour `www.naeliv.com` :

- **Type** : `CNAME`
- **Name** : `www`
- **Value** : `cname.vercel-dns.com` (ou la valeur donnée par Vercel)

### Étape 3 : Ajouter les enregistrements DNS

1. Connectez-vous à votre registrar (là où vous avez acheté le domaine)
2. Allez dans la section **DNS** ou **Gestion DNS**
3. Ajoutez les enregistrements selon les instructions de Vercel

**Exemple typique :**

```
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto (ou 3600)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto (ou 3600)
```

### Étape 4 : Vérifier dans Vercel

1. Après avoir ajouté les DNS, attendez 5-10 minutes
2. Dans Vercel, cliquez sur **"Refresh"** à côté de chaque domaine
3. Le statut devrait passer de "Invalid Configuration" à "Valid" (coche verte)

⚠️ **Note** : La propagation DNS peut prendre jusqu'à 24-48 heures, mais généralement c'est beaucoup plus rapide (quelques minutes à quelques heures).

---

## Vérification

### Vérifier la propagation DNS

Utilisez un outil en ligne pour vérifier si les DNS sont propagés :
- https://www.whatsmydns.net/#A/naeliv.com
- https://dnschecker.org/#A/naeliv.com

### Si ça ne fonctionne toujours pas après 24h

1. Vérifiez que les enregistrements DNS sont exactement comme indiqué par Vercel
2. Vérifiez qu'il n'y a pas de conflits (anciens enregistrements)
3. Contactez le support de votre registrar si nécessaire

---

## Alternative : Utiliser les DNS de Vercel

Si votre registrar le permet, vous pouvez utiliser les nameservers de Vercel :

1. Dans Vercel, allez dans **Settings** > **Domains** > `naeliv.com`
2. Cherchez l'option **"Use Vercel DNS"** ou **"Nameservers"**
3. Vercel vous donnera des nameservers (ex: `ns1.vercel-dns.com`)
4. Dans votre registrar, changez les nameservers pour utiliser ceux de Vercel
5. Cela permet à Vercel de gérer directement les DNS

---

## Besoin d'aide ?

Dites-moi :
- Quel est votre registrar ? (Namecheap, GoDaddy, OVH, etc.)
- Quelles valeurs DNS Vercel vous a données ?
- Je peux vous guider étape par étape selon votre registrar !


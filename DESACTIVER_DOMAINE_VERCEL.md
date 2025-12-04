# 🔒 Comment désactiver le domaine naeliv.com dans Vercel

## Méthode 1 : Retirer le domaine (Recommandé)

1. Allez dans **Vercel Dashboard** > Votre projet **Naeliv**
2. Cliquez sur **Settings** (Paramètres)
3. Allez dans **Domains** (Domaines)
4. Trouvez `naeliv.com` et `www.naeliv.com` dans la liste
5. Cliquez sur les **3 points** (⋮) à droite de chaque domaine
6. Sélectionnez **Remove** (Retirer)
7. Confirmez la suppression

**Résultat** : Le site ne sera plus accessible via `naeliv.com`, mais restera accessible via l'URL Vercel (ex: `naeliv-xxx.vercel.app`)

## Méthode 2 : Suspendre le déploiement

1. Allez dans **Vercel Dashboard** > Votre projet
2. Cliquez sur **Settings** > **General**
3. Scroll jusqu'à **Deployment Protection**
4. Activez **"Pause Deployments"** (Suspendre les déploiements)

**Résultat** : Les nouveaux déploiements seront bloqués, mais le site actuel restera en ligne

## Méthode 3 : Désactiver le domaine DNS

1. Allez dans votre registrar DNS (là où vous avez configuré `naeliv.com`)
2. Supprimez ou désactivez les enregistrements DNS pointant vers Vercel :
   - `A` record pointant vers Vercel
   - `CNAME` record pour `www.naeliv.com`

**Résultat** : Le domaine ne pointera plus vers Vercel, mais restera configuré dans Vercel

## ⚠️ Important

- **Les emails continueront de fonctionner** : Les webhooks Resend ne dépendent pas du domaine Vercel
- **Pour réactiver** : Il suffit de rajouter le domaine dans Vercel et de reconfigurer le DNS


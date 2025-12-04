# 🔧 Activer/Désactiver le mode maintenance

## Option 1 : Utiliser le proxy (Recommandé)

Le proxy (Next.js 16+) redirige automatiquement tous les visiteurs vers `/maintenance` si la variable d'environnement est activée.

### Activer la maintenance

1. Allez dans **Vercel Dashboard** > Votre projet > **Settings** > **Environment Variables**
2. Ajoutez une nouvelle variable :
   - **Name** : `MAINTENANCE_MODE`
   - **Value** : `true`
   - **Environment** : 
     - **Option A** : Sélectionnez seulement **Production** (recommandé) → La maintenance s'affichera uniquement sur `naeliv.com`
     - **Option B** : Sélectionnez **Production + Preview + Development** → La maintenance s'affichera partout (production, preview, et local)
3. Cliquez sur **Save**
4. **Redéployez** le projet (ou attendez le prochain déploiement)

**Note** : Pour les autres variables d'environnement (Supabase, Resend, etc.), c'est **correct** d'avoir les 3 environnements sélectionnés. Cela permet d'utiliser les mêmes valeurs en production, preview et développement.

### Désactiver la maintenance

1. Allez dans **Vercel Dashboard** > **Settings** > **Environment Variables**
2. Trouvez `MAINTENANCE_MODE`
3. Changez la valeur de `true` à `false`
4. **Redéployez** le projet

### ⚠️ Important

- **Les webhooks continuent de fonctionner** : Les routes `/api/*` ne sont pas redirigées
- **Les emails continueront d'être reçus** : L'API `/api/inbound-email` reste accessible
- **Pour tester localement** : Ajoutez `MAINTENANCE_MODE=true` dans votre `.env.local`
- **Si vous avez sélectionné les 3 environnements** : La maintenance sera aussi active en preview et en développement local

## Option 2 : Retirer le domaine dans Vercel

Voir le fichier `DESACTIVER_DOMAINE_VERCEL.md` pour les instructions complètes.

**Avantages** :
- Le site n'est plus accessible via `naeliv.com`
- Les webhooks continuent de fonctionner
- Facile à réactiver

## Option 3 : Désactiver le DNS

1. Allez dans votre registrar DNS
2. Supprimez les enregistrements pointant vers Vercel

**Avantages** :
- Le domaine ne pointe plus vers le site
- Facile à réactiver

## Comparaison des options

| Option | Site accessible | Webhooks fonctionnent | Facile à réactiver |
|--------|----------------|---------------------|-------------------|
| Proxy | Non (page maintenance) | ✅ Oui | ✅ Très facile |
| Retirer domaine Vercel | Non | ✅ Oui | ✅ Facile |
| Désactiver DNS | Non | ✅ Oui | ⚠️ Moyen |

## Recommandation

**Utilisez le proxy** si vous voulez :
- Garder le domaine actif
- Afficher une page de maintenance professionnelle
- Pouvoir activer/désactiver facilement

**Retirez le domaine Vercel** si vous voulez :
- Complètement masquer le site
- Ne pas afficher de page de maintenance


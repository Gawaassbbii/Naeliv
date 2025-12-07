# 🔑 Configuration OpenAI API

Ce guide vous explique comment configurer l'API OpenAI pour activer les fonctionnalités IA de Naeliv PRO.

## 📋 Prérequis

- Un compte OpenAI (gratuit ou payant)
- Un accès à la plateforme OpenAI

## 🚀 Étapes de Configuration

### 1. Créer un compte OpenAI

1. Allez sur [platform.openai.com](https://platform.openai.com)
2. Créez un compte ou connectez-vous
3. Vérifiez votre email si nécessaire

### 2. Obtenir une clé API

1. Une fois connecté, allez dans **API keys** (dans le menu de gauche)
2. Cliquez sur **Create new secret key**
3. Donnez un nom à votre clé (ex: "Naeliv Production")
4. **Copiez la clé immédiatement** - elle ne sera affichée qu'une seule fois !

### 3. Ajouter la clé dans votre projet

#### En développement local :

1. Créez un fichier `.env.local` à la racine du projet (s'il n'existe pas déjà)
2. Ajoutez cette ligne :

```env
OPENAI_API_KEY=sk-votre_cle_api_ici
```

3. Redémarrez votre serveur de développement :
```bash
npm run dev
```

#### En production (Vercel) :

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous
2. Sélectionnez votre projet Naeliv
3. Allez dans **Settings** > **Environment Variables**
4. Cliquez sur **Add New**
5. Ajoutez :
   - **Name** : `OPENAI_API_KEY`
   - **Value** : `sk-votre_cle_api_ici`
   - **Environment** : Sélectionnez Production, Preview, et Development
6. Cliquez sur **Save**
7. Redéployez votre application

### 4. Vérifier la configuration

Une fois la clé ajoutée, vous devriez voir dans les logs :
```
✅ [AI API] OpenAI configuré correctement
```

Si vous voyez toujours l'erreur, vérifiez que :
- La clé commence bien par `sk-`
- Il n'y a pas d'espaces avant ou après la clé
- Le fichier `.env.local` est bien à la racine du projet
- Vous avez redémarré le serveur après avoir ajouté la clé

## 💰 Coûts OpenAI

Les fonctionnalités IA utilisent le modèle **GPT-4o-mini** qui est très économique :
- **~0,15$ par 1 million de tokens d'entrée**
- **~0,60$ par 1 million de tokens de sortie**

Pour un usage normal (quelques centaines d'emails par jour), les coûts sont généralement inférieurs à 1$ par mois.

## 🔒 Sécurité

⚠️ **IMPORTANT** : Ne partagez jamais votre clé API OpenAI publiquement !

- Ne commitez jamais `.env.local` dans Git (il est déjà dans `.gitignore`)
- Ne partagez pas votre clé sur Discord, Slack, ou autres plateformes
- Si votre clé est compromise, supprimez-la immédiatement sur platform.openai.com et créez-en une nouvelle

## 🐛 Dépannage

### Erreur : "OpenAI API non configurée"

**Solution** : Vérifiez que `OPENAI_API_KEY` est bien définie dans `.env.local` et redémarrez le serveur.

### Erreur : "Incorrect API key provided"

**Solution** : Vérifiez que votre clé API est correcte et qu'elle n'a pas expiré.

### Erreur : "You exceeded your current quota"

**Solution** : Ajoutez des crédits à votre compte OpenAI sur platform.openai.com > Billing.

## 📚 Ressources

- [Documentation OpenAI](https://platform.openai.com/docs)
- [Tarifs OpenAI](https://openai.com/pricing)
- [Gestion des clés API](https://platform.openai.com/api-keys)


# 🚀 Guide : Connecter le projet à GitHub

## Option 1 : Connecter à l'ancien dépôt (RECOMMANDÉ)

### Étape 1 : Initialiser Git localement

```bash
git init
git add .
git commit -m "Refonte complète : rebranding Naeliv + nouvelle page de connexion"
```

### Étape 2 : Connecter à votre ancien dépôt GitHub

**Remplacez `VOTRE_USERNAME` et `NOM_DU_DEPOT` par vos valeurs :**

```bash
git remote add origin https://github.com/VOTRE_USERNAME/NOM_DU_DEPOT.git
git branch -M main
```

### Étape 3 : Récupérer l'historique de l'ancien dépôt (optionnel)

Si vous voulez garder l'historique :

```bash
git pull origin main --allow-unrelated-histories
```

Si vous avez des conflits, résolvez-les puis :

```bash
git add .
git commit -m "Merge avec ancien dépôt"
```

### Étape 4 : Pousser la nouvelle version

```bash
git push -u origin main --force
```

⚠️ **Attention** : `--force` écrase l'ancienne version. Si vous voulez garder l'ancien code, créez une branche `backup` d'abord :

```bash
git checkout -b backup
git push origin backup
git checkout main
git push origin main --force
```

---

## Option 2 : Créer un nouveau dépôt

### Étape 1 : Créer un nouveau dépôt sur GitHub

1. Allez sur [github.com](https://github.com)
2. Cliquez sur "New repository"
3. Nommez-le (ex: `naeliv-mail` ou `naeliv-website`)
4. **Ne cochez PAS** "Initialize with README" (vous avez déjà des fichiers)
5. Cliquez sur "Create repository"

### Étape 2 : Initialiser Git et pousser

```bash
git init
git add .
git commit -m "Initial commit - Naeliv BETA"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/NOM_DU_NOUVEAU_DEPOT.git
git push -u origin main
```

---

## Vérification

Après avoir poussé, vérifiez sur GitHub que tous les fichiers sont bien présents.

---

## Prochaine étape : Déployer sur Vercel

Une fois le code sur GitHub, suivez le guide `GUIDE_DEPLOIEMENT_NAELIV.md` pour déployer sur Vercel.


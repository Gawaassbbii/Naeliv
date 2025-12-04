# 🚀 Déploiement Naeliv sur GitHub

## Commandes à exécuter

Si Git est installé, exécutez ces commandes dans PowerShell :

```powershell
# 1. Créer/Modifier README
echo "# Naeliv - Email en toute clarté" > README.md

# 2. Initialiser Git
git init

# 3. Ajouter TOUS les fichiers (pas juste README)
git add .

# 4. Premier commit
git commit -m "Refonte complète : Naeliv BETA avec nouvelle page de connexion Account Chooser"

# 5. Renommer la branche en main
git branch -M main

# 6. Connecter au dépôt GitHub (NOUVEAU dépôt Naeliv)
git remote add origin https://github.com/Gawaassbbii/Naeliv.git

# 7. Pousser sur GitHub
git push -u origin main
```

## ⚠️ Important

1. **Créez d'abord le dépôt sur GitHub** :
   - Allez sur https://github.com/new
   - Nom : `Naeliv`
   - **NE COCHEZ PAS** "Initialize this repository with a README"
   - Cliquez sur "Create repository"

2. **Si Git n'est pas installé** :
   - Utilisez GitHub Desktop (voir ci-dessous)
   - Ou installez Git : https://git-scm.com/download/win

## Alternative : GitHub Desktop

1. **Créez le dépôt sur GitHub** (comme ci-dessus)
2. Dans GitHub Desktop :
   - **File** > **Clone Repository**
   - Onglet **URL**
   - URL : `https://github.com/Gawaassbbii/Naeliv.git`
   - Local path : `C:\Users\Gebruiker\AuraWebSite\klar-mail`
   - Cliquez sur **Clone**
3. GitHub Desktop détectera les fichiers
4. **Commit** et **Push**


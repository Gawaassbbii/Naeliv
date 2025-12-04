# 🔧 Corriger le problème "Files too large" dans GitHub Desktop

## Problème
GitHub Desktop a détecté des fichiers volumineux qui ne font PAS partie de votre projet Naeliv (fichiers de jeux, cache, etc. dans AppData\Local).

## Solution : Réinitialiser le dépôt Git dans le bon dossier

### Étape 1 : Annuler dans GitHub Desktop
1. Dans GitHub Desktop, cliquez sur **"Cancel"** dans la boîte de dialogue
2. Fermez GitHub Desktop temporairement

### Étape 2 : Vérifier et nettoyer le dépôt Git
Le dépôt Git a probablement été initialisé dans le mauvais dossier. Vérifions :

1. Ouvrez PowerShell dans le dossier `C:\Users\Gebruiker\AuraWebSite\klar-mail`
2. Vérifiez s'il y a un dossier `.git` :
   ```powershell
   Test-Path .git
   ```

### Étape 3 : Supprimer le dépôt Git si mal placé
Si le `.git` est dans le dossier parent (AuraWebSite), supprimez-le :

```powershell
# ATTENTION : Ne faites ceci QUE si .git est dans le mauvais dossier
# Vérifiez d'abord avec : Get-ChildItem -Path .. -Filter .git -Recurse -Force
Remove-Item -Path ..\.git -Recurse -Force
```

### Étape 4 : Réinitialiser dans le bon dossier
1. Dans PowerShell, dans le dossier `klar-mail` :
   ```powershell
   cd C:\Users\Gebruiker\AuraWebSite\klar-mail
   git init
   ```

2. Vérifiez que le `.gitignore` est bien présent et à jour

### Étape 5 : Reconnecter dans GitHub Desktop
1. Rouvrez GitHub Desktop
2. Cliquez sur **"File" > "Add Local Repository"**
3. Sélectionnez **uniquement** le dossier `C:\Users\Gebruiker\AuraWebSite\klar-mail`
4. GitHub Desktop devrait maintenant ne voir QUE les fichiers du projet Naeliv

### Étape 6 : Connecter au dépôt GitHub distant
1. Dans GitHub Desktop, allez dans **"Repository" > "Repository Settings"**
2. Cliquez sur l'onglet **"Remote"**
3. Ajoutez l'URL : `https://github.com/Gawaassbbii/Klaremailappfeatures.git`
4. Cliquez sur **"Save"**

### Étape 7 : Commit et Push
1. Dans GitHub Desktop, vous devriez maintenant voir uniquement les fichiers du projet
2. Sélectionnez tous les fichiers
3. Écrivez le message : "Refonte complète : Naeliv BETA avec nouvelle page de connexion"
4. Cliquez sur **"Commit to main"**
5. Cliquez sur **"Push origin"**

---

## Alternative : Utiliser uniquement le dossier klar-mail

Si le problème persiste, créez un nouveau dépôt Git **uniquement** dans le dossier klar-mail :

1. Dans GitHub Desktop, **"File" > "New Repository"**
2. Nom : `naeliv-mail` (ou gardez `Klaremailappfeatures`)
3. Local path : `C:\Users\Gebruiker\AuraWebSite\klar-mail`
4. Cochez **"Initialize this repository with a README"** (optionnel)
5. Cliquez sur **"Create Repository"**
6. Puis connectez-le au dépôt GitHub existant via **"Repository Settings" > "Remote"**


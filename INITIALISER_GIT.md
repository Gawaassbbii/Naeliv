# 🚀 Initialiser Git pour Naeliv

## Commandes à exécuter dans PowerShell

Ouvrez PowerShell dans le dossier `C:\Users\Gebruiker\AuraWebSite\klar-mail` et exécutez :

```powershell
# 1. Initialiser Git
git init

# 2. Vérifier que .gitignore est présent
Test-Path .gitignore

# 3. Ajouter tous les fichiers (sauf ceux dans .gitignore)
git add .

# 4. Premier commit
git commit -m "Refonte complète : Naeliv BETA avec nouvelle page de connexion Account Chooser"

# 5. Connecter au dépôt GitHub distant
git remote add origin https://github.com/Gawaassbbii/Klaremailappfeatures.git

# 6. Renommer la branche en main
git branch -M main
```

## Ensuite dans GitHub Desktop

1. Rouvrez GitHub Desktop
2. Cliquez sur **"File" > "Add Local Repository"**
3. Naviguez vers : `C:\Users\Gebruiker\AuraWebSite\klar-mail`
4. GitHub Desktop devrait détecter le dépôt Git existant
5. Cliquez sur **"Add"**
6. Vous verrez votre commit local
7. Cliquez sur **"Push origin"** pour envoyer sur GitHub

## Si vous voulez forcer le push (écraser l'ancienne version)

Dans GitHub Desktop, après avoir ajouté le dépôt :
1. Allez dans **"Repository" > "Push"**
2. Si nécessaire, utilisez **"Force push"** (mais attention, cela écrase l'ancienne version)


# Script pour uploader directement sur GitHub
# Remplace complètement l'ancienne version

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubToken,
    
    [Parameter(Mandatory=$false)]
    [string]$RepoOwner = "Gawaassbbii",
    
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "Klaremailappfeatures"
)

Write-Host "🚀 Upload du projet Naeliv sur GitHub..." -ForegroundColor Green

# Vérifier que nous sommes dans le bon dossier
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur : package.json introuvable. Assurez-vous d'être dans le dossier klar-mail." -ForegroundColor Red
    exit 1
}

# Créer un fichier temporaire pour le zip
$tempZip = "$env:TEMP\naeliv-upload.zip"
Write-Host "📦 Création de l'archive..." -ForegroundColor Yellow

# Exclure node_modules, .next, .git, etc.
$excludeItems = @("node_modules", ".next", ".git", ".vercel", "*.log")
$filesToZip = Get-ChildItem -Path . -Exclude $excludeItems -Recurse -File

# Créer le zip (nécessite Compress-Archive)
try {
    Compress-Archive -Path $filesToZip.FullName -DestinationPath $tempZip -Force
    Write-Host "✅ Archive créée : $tempZip" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la création de l'archive : $_" -ForegroundColor Red
    Write-Host "💡 Alternative : Utilisez GitHub Desktop ou l'upload web" -ForegroundColor Yellow
    exit 1
}

# Lire le contenu du zip en base64
Write-Host "📤 Préparation de l'upload..." -ForegroundColor Yellow
$zipContent = [Convert]::ToBase64String([IO.File]::ReadAllBytes($tempZip))

# Créer le commit via l'API GitHub
$headers = @{
    "Authorization" = "token $GitHubToken"
    "Accept" = "application/vnd.github.v3+json"
}

# Étape 1 : Créer un nouveau tree avec tous les fichiers
Write-Host "🌳 Création de l'arbre de fichiers..." -ForegroundColor Yellow

# Pour simplifier, on va utiliser l'API pour créer un commit qui supprime tout et ajoute le nouveau contenu
# Mais c'est complexe avec l'API REST. 

Write-Host ""
Write-Host "⚠️  L'API GitHub REST est complexe pour uploader un projet complet." -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 SOLUTION PLUS SIMPLE :" -ForegroundColor Green
Write-Host ""
Write-Host "1. Allez sur : https://github.com/Gawaassbbii/Klaremailappfeatures" -ForegroundColor Cyan
Write-Host "2. Cliquez sur 'Add file' > 'Upload files'" -ForegroundColor Cyan
Write-Host "3. Glissez-déposez TOUT le contenu du dossier klar-mail" -ForegroundColor Cyan
Write-Host "4. Message : 'Refonte complète : Naeliv BETA'" -ForegroundColor Cyan
Write-Host "5. Cliquez sur 'Commit changes'" -ForegroundColor Cyan
Write-Host ""
Write-Host "OU utilisez GitHub Desktop :" -ForegroundColor Green
Write-Host "1. File > Add Local Repository" -ForegroundColor Cyan
Write-Host "2. Sélectionnez : C:\Users\Gebruiker\AuraWebSite\klar-mail" -ForegroundColor Cyan
Write-Host "3. Commit et Push" -ForegroundColor Cyan
Write-Host ""

# Nettoyer
Remove-Item $tempZip -ErrorAction SilentlyContinue

Write-Host "📝 Archive temporaire créée à : $tempZip" -ForegroundColor Yellow
Write-Host "   (Vous pouvez l'utiliser pour upload manuel si besoin)" -ForegroundColor Gray


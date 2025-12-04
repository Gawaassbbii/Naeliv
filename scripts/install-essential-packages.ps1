# Script PowerShell pour Windows
# Installation des packages essentiels
# Usage: .\scripts\install-essential-packages.ps1

Write-Host "🚀 Installation des packages essentiels pour Naeliv Mail" -ForegroundColor Cyan
Write-Host ""

# Priorité 1 - CRITIQUES
Write-Host "📦 Installation Priorité 1 (CRITIQUES)..." -ForegroundColor Yellow
npm install resend zod @tanstack/react-query

# Priorité 2 - TRÈS IMPORTANTS
Write-Host ""
Write-Host "📦 Installation Priorité 2 (TRÈS IMPORTANTS)..." -ForegroundColor Yellow
npm install date-fns @upstash/redis bcryptjs winston

# Priorité 3 - IMPORTANTS
Write-Host ""
Write-Host "📦 Installation Priorité 3 (IMPORTANTS)..." -ForegroundColor Yellow
npm install next-secure-headers nodemailer sharp react-error-boundary @hookform/resolvers

# Types TypeScript
Write-Host ""
Write-Host "📦 Installation des types TypeScript..." -ForegroundColor Yellow
npm install --save-dev @types/bcryptjs @types/nodemailer

Write-Host ""
Write-Host "✅ Installation terminée !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Packages installés :" -ForegroundColor Cyan
Write-Host "  - resend (réception d'emails)"
Write-Host "  - zod (validation)"
Write-Host "  - @tanstack/react-query (gestion des données)"
Write-Host "  - date-fns (dates)"
Write-Host "  - @upstash/redis (rate limiting)"
Write-Host "  - bcryptjs (sécurité)"
Write-Host "  - winston (logs)"
Write-Host "  - next-secure-headers (sécurité)"
Write-Host "  - nodemailer (envoi d'emails)"
Write-Host "  - sharp (optimisation images)"
Write-Host "  - react-error-boundary (gestion d'erreurs)"
Write-Host "  - @hookform/resolvers (validation formulaires)"
Write-Host ""
Write-Host "📚 Consultez docs/PACKAGES_ESSENTIELS.md pour plus d'informations" -ForegroundColor Cyan


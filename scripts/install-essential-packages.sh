#!/bin/bash

# Script d'installation des packages essentiels
# Usage: bash scripts/install-essential-packages.sh

echo "🚀 Installation des packages essentiels pour Naeliv Mail"
echo ""

# Priorité 1 - CRITIQUES
echo "📦 Installation Priorité 1 (CRITIQUES)..."
npm install resend zod @tanstack/react-query

# Priorité 2 - TRÈS IMPORTANTS
echo ""
echo "📦 Installation Priorité 2 (TRÈS IMPORTANTS)..."
npm install date-fns @upstash/redis bcryptjs winston

# Priorité 3 - IMPORTANTS
echo ""
echo "📦 Installation Priorité 3 (IMPORTANTS)..."
npm install next-secure-headers nodemailer sharp react-error-boundary @hookform/resolvers

# Types TypeScript
echo ""
echo "📦 Installation des types TypeScript..."
npm install --save-dev @types/bcryptjs @types/nodemailer

echo ""
echo "✅ Installation terminée !"
echo ""
echo "📋 Packages installés :"
echo "  - resend (réception d'emails)"
echo "  - zod (validation)"
echo "  - @tanstack/react-query (gestion des données)"
echo "  - date-fns (dates)"
echo "  - @upstash/redis (rate limiting)"
echo "  - bcryptjs (sécurité)"
echo "  - winston (logs)"
echo "  - next-secure-headers (sécurité)"
echo "  - nodemailer (envoi d'emails)"
echo "  - sharp (optimisation images)"
echo "  - react-error-boundary (gestion d'erreurs)"
echo "  - @hookform/resolvers (validation formulaires)"
echo ""
echo "📚 Consultez docs/PACKAGES_ESSENTIELS.md pour plus d'informations"


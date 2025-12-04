/**
 * Script de vérification de la configuration des emails
 * Exécutez avec: node scripts/verifier_configuration.js
 * 
 * Note: Ce script vérifie les variables d'environnement chargées par Next.js
 * Assurez-vous que votre serveur Next.js est démarré ou que les variables sont dans .env.local
 */

// Charger les variables d'environnement depuis .env.local si disponible
try {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (e) {
  // Ignorer les erreurs de lecture
}

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function check(condition, message, errorMessage) {
  if (condition) {
    console.log(`${colors.green}✅${colors.reset} ${message}`);
    return true;
  } else {
    console.log(`${colors.red}❌${colors.reset} ${errorMessage}`);
    return false;
  }
}

function warn(message) {
  console.log(`${colors.yellow}⚠️${colors.reset} ${message}`);
}

function info(message) {
  console.log(`${colors.blue}ℹ️${colors.reset} ${message}`);
}

console.log('\n' + '='.repeat(60));
console.log('🔍 VÉRIFICATION DE LA CONFIGURATION DES EMAILS');
console.log('='.repeat(60) + '\n');

let allChecks = [];

// 1. Vérifier Supabase
console.log('📦 SUPABASE:');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

allChecks.push(check(
  supabaseUrl && supabaseUrl.startsWith('https://'),
  `NEXT_PUBLIC_SUPABASE_URL configuré: ${supabaseUrl?.substring(0, 30)}...`,
  'NEXT_PUBLIC_SUPABASE_URL manquant ou invalide'
));

allChecks.push(check(
  supabaseAnonKey && supabaseAnonKey.length > 20,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY configuré',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY manquant ou invalide'
));

if (supabaseServiceKey) {
  if (supabaseServiceKey.startsWith('eyJ')) {
    allChecks.push(check(
      supabaseServiceKey.length > 100,
      'SUPABASE_SERVICE_ROLE_KEY configuré (format JWT correct)',
      'SUPABASE_SERVICE_ROLE_KEY trop court'
    ));
  } else {
    warn('SUPABASE_SERVICE_ROLE_KEY ne commence pas par "eyJ" (format JWT attendu)');
    allChecks.push(false);
  }
} else {
  warn('SUPABASE_SERVICE_ROLE_KEY non configuré - l\'insertion d\'emails via webhook pourrait échouer');
  allChecks.push(false);
}

// 2. Vérifier Webhook Secret
console.log('\n🔐 SÉCURITÉ WEBHOOK:');
const webhookSecret = process.env.WEBHOOK_SECRET;

if (webhookSecret) {
  allChecks.push(check(
    webhookSecret.length >= 32,
    `WEBHOOK_SECRET configuré (${webhookSecret.length} caractères)`,
    `WEBHOOK_SECRET trop court (${webhookSecret.length} caractères, minimum 32 requis)`
  ));
  
  // Vérifier qu'il ne contient pas de valeurs d'exemple
  const exampleValues = ['votre', 'example', 'xxxxx', 'secret_aleatoire', 'your_'];
  const containsExample = exampleValues.some(val => webhookSecret.toLowerCase().includes(val));
  
  if (containsExample) {
    warn('WEBHOOK_SECRET semble contenir une valeur d\'exemple - remplacez-la par une vraie clé aléatoire');
    allChecks.push(false);
  }
} else {
  warn('WEBHOOK_SECRET non configuré - les webhooks ne seront pas sécurisés');
  allChecks.push(false);
}

// 3. Vérifier Service Email
console.log('\n📧 SERVICE EMAIL:');
const resendKey = process.env.RESEND_API_KEY;
const mailgunKey = process.env.MAILGUN_API_KEY;
const mailgunDomain = process.env.MAILGUN_DOMAIN;

if (resendKey) {
  if (resendKey.startsWith('re_')) {
    allChecks.push(check(
      resendKey.length > 10,
      'RESEND_API_KEY configuré (format correct)',
      'RESEND_API_KEY invalide'
    ));
    
    if (resendKey.includes('xxxxx') || resendKey.includes('example')) {
      warn('RESEND_API_KEY semble contenir une valeur d\'exemple');
      allChecks.push(false);
    }
  } else {
    warn('RESEND_API_KEY ne commence pas par "re_"');
    allChecks.push(false);
  }
} else if (mailgunKey) {
  if (mailgunKey.startsWith('key-')) {
    allChecks.push(check(
      mailgunKey.length > 10,
      'MAILGUN_API_KEY configuré (format correct)',
      'MAILGUN_API_KEY invalide'
    ));
    
    allChecks.push(check(
      mailgunDomain && mailgunDomain.length > 0,
      `MAILGUN_DOMAIN configuré: ${mailgunDomain}`,
      'MAILGUN_DOMAIN manquant (requis avec MAILGUN_API_KEY)'
    ));
    
    if (mailgunKey.includes('xxxxx') || mailgunKey.includes('example')) {
      warn('MAILGUN_API_KEY semble contenir une valeur d\'exemple');
      allChecks.push(false);
    }
  } else {
    warn('MAILGUN_API_KEY ne commence pas par "key-"');
    allChecks.push(false);
  }
} else {
  warn('Aucun service email configuré (RESEND_API_KEY ou MAILGUN_API_KEY)');
  info('Vous devrez configurer un service email pour recevoir des emails');
  allChecks.push(false);
}

// 4. Vérifier autres variables
console.log('\n⚙️ AUTRES CONFIGURATIONS:');
const allowUnsigned = process.env.ALLOW_UNSIGNED_WEBHOOKS;
if (allowUnsigned === 'true') {
  warn('ALLOW_UNSIGNED_WEBHOOKS=true - DÉSACTIVEZ en production !');
  allChecks.push(false);
} else {
  allChecks.push(check(
    allowUnsigned === 'false' || !allowUnsigned,
    'ALLOW_UNSIGNED_WEBHOOKS correctement configuré',
    ''
  ));
}

// Résumé
console.log('\n' + '='.repeat(60));
const successCount = allChecks.filter(Boolean).length;
const totalCount = allChecks.length;

if (successCount === totalCount) {
  console.log(`${colors.green}✅ TOUT EST CONFIGURÉ CORRECTEMENT !${colors.reset}`);
  console.log(`   ${successCount}/${totalCount} vérifications réussies\n`);
} else {
  console.log(`${colors.yellow}⚠️ CONFIGURATION INCOMPLÈTE${colors.reset}`);
  console.log(`   ${successCount}/${totalCount} vérifications réussies\n`);
  console.log(`${colors.blue}💡 CONSEILS:${colors.reset}`);
  console.log('   1. Vérifiez que toutes les valeurs dans .env.local sont réelles (pas d\'exemples)');
  console.log('   2. Consultez GUIDE_CONFIGURATION_EMAILS.md pour les instructions détaillées');
  console.log('   3. Consultez CONFIGURATION_ENV_EXEMPLE.md pour des exemples de valeurs\n');
}

process.exit(successCount === totalCount ? 0 : 1);


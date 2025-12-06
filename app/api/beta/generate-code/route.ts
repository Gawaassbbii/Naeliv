import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client avec service role key (contourne RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const ADMIN_EMAIL = 'gabi@naeliv.com';

// Générer un code aléatoire au format NAELIV-XXXX
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'NAELIV-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Vérifier le token avec Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // 2. Vérifier que l'utilisateur est admin
    if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { error: 'Accès refusé. Admin uniquement.' },
        { status: 403 }
      );
    }

    // 3. Récupérer les données de la requête
    const body = await request.json();
    const { note } = body;

    // 4. Générer un code unique
    let newCode = generateCode();
    let codeExists = true;
    let attempts = 0;
    const maxAttempts = 10;

    // Vérifier que le code n'existe pas déjà (éviter les collisions)
    while (codeExists && attempts < maxAttempts) {
      const { data: existing } = await supabaseAdmin
        .from('beta_codes')
        .select('id')
        .eq('code', newCode)
        .single();

      if (!existing) {
        codeExists = false;
      } else {
        newCode = generateCode();
        attempts++;
      }
    }

    if (codeExists) {
      return NextResponse.json(
        { error: 'Impossible de générer un code unique. Réessayez.' },
        { status: 500 }
      );
    }

    // 5. Préparer les données à insérer (sans usage_count d'abord pour éviter l'erreur)
    const insertData: any = {
      code: newCode,
      note: note?.trim() || null,
      is_active: true
    };

    // Ajouter usage_count seulement si la colonne existe
    try {
      const testUsageResult = await supabaseAdmin
        .from('beta_codes')
        .select('usage_count')
        .limit(1);
      
      if (!testUsageResult.error) {
        insertData.usage_count = 0;
      }
    } catch (err) {
      console.log('ℹ️ [BETA CODE] Colonne usage_count non disponible');
    }

    // Ajouter created_by si la colonne existe
    try {
      const testCreatedByResult = await supabaseAdmin
        .from('beta_codes')
        .select('created_by')
        .limit(1);
      
      if (!testCreatedByResult.error) {
        insertData.created_by = user.id;
      }
    } catch (err) {
      console.log('ℹ️ [BETA CODE] Colonne created_by non disponible');
    }

    // 6. Insérer le code
    const { data: insertedCode, error: insertError } = await supabaseAdmin
      .from('beta_codes')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ [BETA CODE] Erreur lors de la création:', insertError);
      return NextResponse.json(
        { error: insertError.message || 'Erreur lors de la création du code' },
        { status: 400 }
      );
    }

    console.log(`✅ [BETA CODE] Code ${newCode} créé avec succès par ${user.email}`);
    
    return NextResponse.json({
      success: true,
      code: insertedCode
    });
  } catch (error: any) {
    console.error('❌ [BETA CODE] Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}


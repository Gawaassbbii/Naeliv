import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Vérifier si le mode maintenance est activé
  // Utiliser MAINTENANCE_MODE (sans NEXT_PUBLIC_) pour éviter de redéployer à chaque changement
  // Le middleware s'exécute côté serveur, donc on peut utiliser les variables d'environnement serveur
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  
  // Si le mode maintenance est activé, rediriger vers la page de maintenance
  // (sauf si on est déjà sur la page de maintenance ou sur les routes API)
  if (maintenanceMode) {
    const pathname = request.nextUrl.pathname;
    
    // Ne pas rediriger si :
    // - On est déjà sur /maintenance
    // - C'est une route API (pour que les webhooks continuent de fonctionner)
    // - C'est une route statique (assets, images, etc.)
    if (
      !pathname.startsWith('/maintenance') &&
      !pathname.startsWith('/api') &&
      !pathname.startsWith('/_next') &&
      !pathname.startsWith('/favicon.ico')
    ) {
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }
  }
  
  // Si le mode maintenance est désactivé mais qu'on est sur la page de maintenance,
  // rediriger vers la page d'accueil
  if (!maintenanceMode && request.nextUrl.pathname.startsWith('/maintenance')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};


import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Vérifier si la maintenance est activée via variable d'environnement
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';

  // Si la maintenance est activée, rediriger vers /maintenance
  // Sauf si on est déjà sur /maintenance ou sur les routes API
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


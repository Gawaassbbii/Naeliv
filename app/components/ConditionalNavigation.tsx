"use client";

import { usePathname } from 'next/navigation';
import { Navigation } from './Navigation';

export function ConditionalNavigation() {
  const pathname = usePathname();
  
  // Ne pas afficher la navigation sur la page de boîte mail
  if (pathname?.startsWith('/mail')) {
    return null;
  }
  
  return <Navigation />;
}


import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formate une date d'email de manière lisible
 * Exemples : "il y a 5 minutes", "Hier", "15 janvier 2024"
 */
export function formatEmailDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!dateObj || isNaN(dateObj.getTime())) {
    return 'Date invalide';
  }
  
  const now = new Date();
  const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);
  
  // Moins de 24 heures : "il y a X minutes/heures"
  if (diffInHours < 24) {
    return formatDistanceToNow(dateObj, { 
      addSuffix: true, 
      locale: fr 
    });
  }
  
  // Aujourd'hui : "Aujourd'hui à HH:mm"
  if (isToday(dateObj)) {
    return `Aujourd'hui à ${format(dateObj, 'HH:mm', { locale: fr })}`;
  }
  
  // Hier : "Hier à HH:mm"
  if (isYesterday(dateObj)) {
    return `Hier à ${format(dateObj, 'HH:mm', { locale: fr })}`;
  }
  
  // Moins de 7 jours : "Il y a X jours"
  if (diffInHours < 168) {
    const days = Math.floor(diffInHours / 24);
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  }
  
  // Plus ancien : "15 janvier 2024"
  return format(dateObj, 'd MMMM yyyy', { locale: fr });
}

/**
 * Formate une date pour l'affichage dans la liste d'emails
 */
export function formatEmailListDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!dateObj || isNaN(dateObj.getTime())) {
    return '';
  }
  
  const now = new Date();
  const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);
  
  if (isToday(dateObj)) {
    return 'Aujourd\'hui';
  }
  
  if (isYesterday(dateObj)) {
    return 'Hier';
  }
  
  if (diffInHours < 168) {
    const days = Math.floor(diffInHours / 24);
    return `${days} jour${days > 1 ? 's' : ''}`;
  }
  
  return format(dateObj, 'd MMM yyyy', { locale: fr });
}

/**
 * Formate l'heure d'un email
 */
export function formatEmailTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!dateObj || isNaN(dateObj.getTime())) {
    return '';
  }
  
  return format(dateObj, 'HH:mm', { locale: fr });
}


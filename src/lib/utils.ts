import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(amountNok: number | undefined | null): string {
  if (amountNok === undefined || amountNok === null || isNaN(amountNok)) {
    return '0 kr';
  }
  return `${Math.round(amountNok).toLocaleString('nb-NO')} kr`;
}

export function formatDateNorwegian(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('nb-NO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTimeNorwegian(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('nb-NO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function calculateDogAge(birthDateString: string): string {
  try {
    const birth = new Date(birthDateString);
    const now = new Date();
    const diffMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    
    if (diffMonths < 1) return 'Nyfødt';
    if (diffMonths < 12) return `${diffMonths} mnd (Valp)`;
    const years = Math.floor(diffMonths / 12);
    const remainingMonths = diffMonths % 12;
    if (remainingMonths === 0) return `${years} år`;
    return `${years} år, ${remainingMonths} mnd`;
  } catch {
    return 'Ukjent alder';
  }
}

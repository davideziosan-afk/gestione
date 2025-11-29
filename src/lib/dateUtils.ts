import { format, startOfMonth, addMonths, parseISO } from "date-fns";
import { it } from "date-fns/locale";

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: it });
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(num);
}

export function getFirstDayOfMonth(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return startOfMonth(dateObj);
}

export function getMonthLabel(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMMM yyyy', { locale: it });
}

export function generateMonthsArray(startDate: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, i) => addMonths(startDate, i));
}
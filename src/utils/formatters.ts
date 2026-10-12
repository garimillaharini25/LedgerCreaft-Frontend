const CURRENCY_LOCALES: Record<string, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  JPY: 'ja-JP',
  CAD: 'en-CA',
  AUD: 'en-AU',
};

export function formatCurrency(amount: number | null | undefined, currency = 'INR'): string {
  const safeCurrency = (currency || 'INR').toUpperCase();
  const safeAmount = amount == null || isNaN(amount) ? 0 : amount;
  const locale = CURRENCY_LOCALES[safeCurrency] || 'en-US';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: safeCurrency === 'JPY' ? 0 : 2,
      maximumFractionDigits: safeCurrency === 'JPY' ? 0 : 2,
    }).format(safeAmount);
  } catch {
    const symbol = safeCurrency === 'INR' ? '₹' : safeCurrency === 'USD' ? '$' : safeCurrency === 'EUR' ? '€' : safeCurrency + ' ';
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(safeAmount));
    return safeAmount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
  }
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
    }
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatMonthName(monthNumber: number): string {
  const date = new Date(2026, monthNumber - 1, 1);
  return date.toLocaleString('en-US', { month: 'long' });
}

export function formatPercentage(pct: number | null | undefined): string {
  if (pct == null || isNaN(pct)) return '0.0%';
  return `${pct.toFixed(1)}%`;
}

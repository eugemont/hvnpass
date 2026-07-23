/** All monetary amounts in the system are stored/transmitted as integer cents to avoid float drift. */

export function formatMoney(cents: number, currency = "USD", locale = "es-UY"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function centsToUnits(cents: number): number {
  return cents / 100;
}

export function unitsToCents(units: number): number {
  return Math.round(units * 100);
}

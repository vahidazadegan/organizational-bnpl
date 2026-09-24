const tomanFormatter = new Intl.NumberFormat("fa-IR");

/** Displays amounts in تومان (input is Rial). */
export function formatToman(amountRial: number): string {
  const toman = Math.round(amountRial / 10);
  return `${tomanFormatter.format(toman)} تومان`;
}

export function formatFaDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function maskMobile(mobile: string): string {
  if (mobile.length < 7) {
    return mobile;
  }
  return `${mobile.slice(0, 4)}***${mobile.slice(-4)}`;
}

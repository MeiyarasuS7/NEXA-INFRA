const inrCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const inrCompactFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
});

const inrNumberFormatter = new Intl.NumberFormat("en-IN");

export const formatInr = (amount: number): string => inrCurrencyFormatter.format(amount);

export const formatInrCompact = (amount: number): string => inrCompactFormatter.format(amount);

export const formatInrNumber = (amount: number): string => inrNumberFormatter.format(amount);

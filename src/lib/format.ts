export function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00+09:00`);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatRate(rate: number) {
  return new Intl.NumberFormat('ja-JP', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(rate);
}

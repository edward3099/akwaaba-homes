export function formatPrice(price: number): string {
  if (price === 0) return 'Price on request';
  
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPriceRange(minPrice: number, maxPrice: number): string {
  if (minPrice === 0 && maxPrice === 0) return 'Price on request';
  if (minPrice === 0) return `Up to ${formatPrice(maxPrice)}`;
  if (maxPrice === 0) return `From ${formatPrice(minPrice)}`;
  
  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
}


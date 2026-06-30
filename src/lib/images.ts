export function getImageUrl(img: { image?: string; image_url?: string } | undefined, fallback: string): string {
  return img?.image_url || img?.image || fallback;
}

const PLACEHOLDER_COLORS = [
  '6366f1', '8b5cf6', 'ec4899', 'f43f5e', 'f97316',
  '14b8a6', '06b6d4', '3b82f6', '22c55e', 'eab308',
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getProductImage(productName: string, index = 0): string {
  const hash = hashString(productName);
  const color = PLACEHOLDER_COLORS[(hash + index) % PLACEHOLDER_COLORS.length];
  return `https://placehold.co/400x400/${color}/ffffff?text=${encodeURIComponent(productName.slice(0, 20))}`;
}

export function getVariantImage(variantName: string, productName: string): string {
  const hash = hashString(variantName + productName);
  const color = PLACEHOLDER_COLORS[hash % PLACEHOLDER_COLORS.length];
  return `https://placehold.co/400x400/${color}/ffffff?text=${encodeURIComponent(variantName.slice(0, 15))}`;
}

export function getBrandImage(brandName: string): string {
  const hash = hashString(brandName);
  const color = PLACEHOLDER_COLORS[hash % PLACEHOLDER_COLORS.length];
  return `https://placehold.co/200x200/${color}/ffffff?text=${encodeURIComponent(brandName.slice(0, 10))}`;
}

export function getCategoryImage(categoryName: string): string {
  const hash = hashString(categoryName);
  const color = PLACEHOLDER_COLORS[hash % PLACEHOLDER_COLORS.length];
  return `https://placehold.co/300x300/${color}/ffffff?text=${encodeURIComponent(categoryName.slice(0, 12))}`;
}

/**
 * Returns a deterministic hex color (without #) for a given name.
 * Used by SmartImage to generate consistent avatar background colors.
 */
export function getInitialsColor(name: string): string {
  const hash = hashString(name);
  return PLACEHOLDER_COLORS[hash % PLACEHOLDER_COLORS.length];
}

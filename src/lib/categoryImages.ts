/**
 * Maps category names to locally stored product photos.
 * All images are in public/categories/ as optimized JPGs from Unsplash.
 *
 * Priority: Backend Image → Local Image → Default Placeholder
 */

const CATEGORY_IMAGES: Record<string, string> = {
  'laptop': '/categories/laptop.jpg',
  'laptops': '/categories/laptop.jpg',
  'notebook': '/categories/laptop.jpg',
  'smartphone': '/categories/smartphone.jpg',
  'smartphones': '/categories/smartphone.jpg',
  'mobile': '/categories/smartphone.jpg',
  'mobiles': '/categories/smartphone.jpg',
  'phone': '/categories/smartphone.jpg',
  'camera': '/categories/camera.jpg',
  'cameras': '/categories/camera.jpg',
  'photography': '/categories/camera.jpg',
  'cctv': '/categories/cctv.jpg',
  'surveillance': '/categories/cctv.jpg',
  'printer': '/categories/printer.jpg',
  'printers': '/categories/printer.jpg',
  'printing': '/categories/printer.jpg',
  'monitor': '/categories/monitor.jpg',
  'monitors': '/categories/monitor.jpg',
  'display': '/categories/monitor.jpg',
  'keyboard': '/categories/keyboard.jpg',
  'keyboards': '/categories/keyboard.jpg',
  'mouse': '/categories/mouse.jpg',
  'mice': '/categories/mouse.jpg',
  'pointing': '/categories/mouse.jpg',
  'ssd': '/categories/ssd.jpg',
  'solid state': '/categories/ssd.jpg',
  'hdd': '/categories/hdd.jpg',
  'hard disk': '/categories/hdd.jpg',
  'hard drive': '/categories/hdd.jpg',
  'storage': '/categories/hdd.jpg',
  'ram': '/categories/ram.jpg',
  'memory': '/categories/ram.jpg',
  'graphics card': '/categories/graphics-card.jpg',
  'gpu': '/categories/graphics-card.jpg',
  'video card': '/categories/graphics-card.jpg',
  'motherboard': '/categories/motherboard.jpg',
  'mobo': '/categories/motherboard.jpg',
  'processor': '/categories/processor.jpg',
  'cpu': '/categories/processor.jpg',
  'chip': '/categories/processor.jpg',
  'router': '/categories/router.jpg',
  'routers': '/categories/router.jpg',
  'switch': '/categories/switch.jpg',
  'switches': '/categories/switch.jpg',
  'networking': '/categories/switch.jpg',
  'network': '/categories/switch.jpg',
  'wifi': '/categories/wifi.jpg',
  'wireless': '/categories/wifi.jpg',
  'speaker': '/categories/speaker.jpg',
  'speakers': '/categories/speaker.jpg',
  'audio': '/categories/speaker.jpg',
  'sound': '/categories/speaker.jpg',
  'headphone': '/categories/headphones.jpg',
  'headphones': '/categories/headphones.jpg',
  'earphone': '/categories/headphones.jpg',
  'earbuds': '/categories/earbuds.jpg',
  'earbud': '/categories/earbuds.jpg',
  'tws': '/categories/earbuds.jpg',
  'projector': '/categories/projector.jpg',
  'projectors': '/categories/projector.jpg',
  'presentation': '/categories/projector.jpg',
  'webcam': '/categories/webcam.jpg',
  'web camera': '/categories/webcam.jpg',
  'video camera': '/categories/webcam.jpg',
  'ups': '/categories/ups.jpg',
  'inverter': '/categories/inverter.jpg',
  'power backup': '/categories/inverter.jpg',
  'power supply': '/categories/power-supply.jpg',
  'psu': '/categories/power-supply.jpg',
  'cabinet': '/categories/cabinet.jpg',
  'case': '/categories/cabinet.jpg',
  'gaming': '/categories/gaming.jpg',
  'game': '/categories/gaming.jpg',
  'accessories': '/categories/accessories.jpg',
  'computer accessories': '/categories/accessories.jpg',
  'peripheral': '/categories/accessories.jpg',
  'security': '/categories/security.jpg',
  'smart home': '/categories/smart-home.jpg',
  'smarthome': '/categories/smart-home.jpg',
  'iot': '/categories/smart-home.jpg',
  'automation': '/categories/smart-home.jpg',
  'industrial': '/categories/processor.jpg',
};

const DEFAULT_IMAGE = '/categories/accessories.jpg';

/**
 * Get the local image path for a category name.
 * Falls back to a default image if no match is found.
 *
 * @param categoryName - The category name from the backend or fallback list
 * @param backendImage - Optional backend image URL (takes priority if provided)
 * @returns The image path to use
 */
export function getCategoryImage(categoryName: string, backendImage?: string | null): string {
  if (backendImage) return backendImage;

  const lower = categoryName.toLowerCase().trim();
  // Direct match
  if (CATEGORY_IMAGES[lower]) return CATEGORY_IMAGES[lower];
  // Partial match
  for (const [key, path] of Object.entries(CATEGORY_IMAGES)) {
    if (lower.includes(key) || key.includes(lower)) return path;
  }
  return DEFAULT_IMAGE;
}

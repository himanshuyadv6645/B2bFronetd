const GEOLOCATION_TIMEOUT = 15000;
const STORAGE_KEY = 'b2b_detected_location';

export interface DetectedLocation {
  latitude: number;
  longitude: number;
}

export interface GeocodedAddress {
  city: string;
  state: string;
  pincode: string;
  country: string;
  address_line1: string;
}

function getCachedLocation(): DetectedLocation | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function setCachedLocation(location: DetectedLocation) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
}

export function clearCachedLocation() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function checkGeolocationPermission(): Promise<boolean> {
  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state === 'granted';
  } catch {
    return true;
  }
}

export function requestBrowserLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: false,
        timeout: GEOLOCATION_TIMEOUT,
        maximumAge: 300000,
      }
    );
  });
}

export async function detectLocationCoords(forceRefresh = false): Promise<DetectedLocation> {
  if (!forceRefresh) {
    const cached = getCachedLocation();
    if (cached) {
      return cached;
    }
  }

  // Call getCurrentPosition directly — THIS is what triggers the browser's native
  // permission prompt. Do NOT pre-check navigator.permissions and gate on 'granted':
  // a first-time user is in the 'prompt' state, so gating there rejects before the
  // prompt ever appears (this was the original "not working" bug). Let the real
  // GeolocationPositionError (with .code 1/2/3) propagate so callers can react.
  const position = await requestBrowserLocation();
  const coords: DetectedLocation = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
  setCachedLocation(coords);
  return coords;
}

/**
 * Reverse-geocode coordinates to a human address using OpenStreetMap Nominatim.
 * Runs client-side (Nominatim allows CORS) so guests — who can't use the
 * authenticated backend endpoint — can still turn GPS coords into an address.
 */
export async function reverseGeocode(coords: DetectedLocation): Promise<GeocodedAddress> {
  const url =
    `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}` +
    `&lon=${coords.longitude}&format=json&addressdetails=1&accept-language=en`;

  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('Reverse geocoding failed');

  const data = await response.json();
  const addr = data.address || {};

  const city = addr.city || addr.town || addr.village || addr.county || '';
  const area = addr.suburb || addr.neighbourhood || addr.residential || '';
  const road = addr.road || addr.pedestrian || '';
  let addressLine1 = area;
  if (road) addressLine1 = addressLine1 ? `${addressLine1}, ${road}` : road;
  if (!addressLine1) addressLine1 = city;

  return {
    city,
    state: addr.state || '',
    pincode: addr.postcode || '',
    country: addr.country || 'India',
    address_line1: addressLine1,
  };
}

export async function detectLocationViaIP(): Promise<DetectedLocation> {
  const cached = getCachedLocation();
  if (cached) return cached;

  const response = await fetch('https://ipapi.co/json/', { 
    signal: AbortSignal.timeout(8000) 
  });
  if (!response.ok) throw new Error('IP geolocation failed');
  
  const data = await response.json();
  if (!data.latitude || !data.longitude) {
    throw new Error('IP geolocation returned no coordinates');
  }

  const coords: DetectedLocation = {
    latitude: data.latitude,
    longitude: data.longitude,
  };
  setCachedLocation(coords);
  return coords;
}
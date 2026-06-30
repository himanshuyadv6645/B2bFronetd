const GEOLOCATION_TIMEOUT = 15000;
const STORAGE_KEY = 'b2b_detected_location';
let isRequestInProgress = false;

export interface DetectedLocation {
  latitude: number;
  longitude: number;
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
  if (isRequestInProgress) {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (isRequestInProgress) {
      throw new Error('Location detection in progress');
    }
  }

  if (!forceRefresh) {
    const cached = getCachedLocation();
    if (cached) {
      return cached;
    }
  }

  isRequestInProgress = true;

  try {
    const hasPermission = await checkGeolocationPermission();
    if (!hasPermission) {
      throw new Error('Permission denied');
    }

    const position = await requestBrowserLocation();
    const coords: DetectedLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    setCachedLocation(coords);
    return coords;
  } finally {
    isRequestInProgress = false;
  }
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
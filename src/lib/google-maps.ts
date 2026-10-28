/**
 * Google Maps & Geocoding Service with graceful fallback
 */

let googleMapsScriptPromise: Promise<boolean> | null = null;

export function getGoogleMapsApiKey(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
}

/**
 * Loads Google Maps JavaScript SDK dynamically with Places library
 */
export function loadGoogleMapsScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);

  // If already loaded
  if (typeof (window as unknown as { google?: { maps?: unknown } }).google?.maps !== 'undefined') {
    return Promise.resolve(true);
  }

  if (googleMapsScriptPromise) {
    return googleMapsScriptPromise;
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    return Promise.resolve(false);
  }

  googleMapsScriptPromise = new Promise<boolean>((resolve) => {
    // Check if script already exists in DOM
    const existing = document.querySelector('script[data-google-maps]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.setAttribute('data-google-maps', 'true');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Google Maps script failed to load. Using fallback geocoding.');
      resolve(false);
    };
    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
}

/**
 * Reverse geocodes coordinates to a clean address string
 */
export async function reverseGeocodeCoords(lat: number, lng: number): Promise<string> {
  const apiKey = getGoogleMapsApiKey();

  // 1. Try Google Geocoder if script is loaded
  if (apiKey) {
    try {
      const loaded = await loadGoogleMapsScript();
      const googleObj = (window as unknown as {
        google?: {
          maps?: {
            Geocoder: new () => {
              geocode: (
                req: { location: { lat: number; lng: number } },
                cb: (results: Array<{ formatted_address: string }>, status: string) => void
              ) => void;
            };
          };
        };
      }).google;

      if (loaded && googleObj?.maps?.Geocoder) {
        const geocoder = new googleObj.maps.Geocoder();
        const address = await new Promise<string>((resolve) => {
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              resolve(results[0].formatted_address);
            } else {
              resolve('');
            }
          });
        });

        if (address) return address;
      }
    } catch (e) {
      console.warn('Google Geocoding error, falling back to OSM:', e);
    }
  }

  // 2. Fallback to OpenStreetMap Nominatim reverse geocode
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        // Build clean short address
        const a = data.address || {};
        const road = a.road || a.pedestrian || a.suburb || '';
        const neighborhood = a.neighbourhood || a.suburb || a.city_district || '';
        const city = a.city || a.town || a.county || '';
        const postal = a.postcode || '';

        const parts = [road, neighborhood, city, postal].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : data.display_name;
      }
    }
  } catch (err) {
    console.warn('OSM Nominatim reverse geocode failed:', err);
  }

  // 3. Last fallback
  return `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

/**
 * Returns a universal Google Maps URL for opening location
 */
export function getGoogleMapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

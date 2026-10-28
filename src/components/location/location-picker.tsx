'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Building,
  Navigation,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  loadGoogleMapsScript,
  reverseGeocodeCoords,
  getGoogleMapsLink,
  getGoogleMapsApiKey,
} from '@/lib/google-maps';

interface LocationPickerProps {
  location: string;
  onChangeLocation: (val: string) => void;
  landmark: string;
  onChangeLandmark: (val: string) => void;
  pincode?: string;
  onChangePincode?: (pin: string) => void;
  latitude: number | null;
  longitude: number | null;
  onCoordsChange: (lat: number, lng: number) => void;
}

export function LocationPicker({
  location,
  onChangeLocation,
  landmark,
  onChangeLandmark,
  pincode = '',
  onChangePincode,
  latitude,
  longitude,
  onCoordsChange,
}: LocationPickerProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markerInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => {
      setMapError(true);
    };
  }, []);

  // 1. Initialize Google Maps script and Places Autocomplete
  useEffect(() => {
    let mounted = true;

    async function initGoogle() {
      const success = await loadGoogleMapsScript();
      if (!mounted) return;
      setMapsLoaded(success);

      if (success && inputRef.current) {
        const googleObj = (window as unknown as {
          google?: {
            maps?: {
              places?: {
                Autocomplete: new (
                  input: HTMLInputElement,
                  opts?: { fields: string[]; types?: string[] }
                ) => {
                  addListener: (event: string, cb: () => void) => void;
                  getPlace: () => {
                    formatted_address?: string;
                    geometry?: {
                      location?: {
                        lat: () => number;
                        lng: () => number;
                      };
                    };
                  };
                };
              };
            };
          };
        }).google;

        if (googleObj?.maps?.places?.Autocomplete) {
          const autocomplete = new googleObj.maps.places.Autocomplete(inputRef.current, {
            fields: ['formatted_address', 'geometry', 'name'],
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.formatted_address) {
              onChangeLocation(place.formatted_address);
              const pinMatch = place.formatted_address.match(/\b560\d{3}\b/) || place.formatted_address.match(/\b\d{6}\b/);
              if (pinMatch && onChangePincode) {
                onChangePincode(pinMatch[0]);
              }
            }
            if (place.geometry?.location) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              onCoordsChange(lat, lng);
            }
          });
        }
      }
    }

    initGoogle();
    return () => {
      mounted = false;
    };
  }, [onChangeLocation, onCoordsChange]);

  // 2. Initialize or Update Interactive Google Map if coordinates are present
  useEffect(() => {
    if (!mapsLoaded || !mapContainerRef.current || latitude === null || longitude === null) {
      return;
    }

    const googleObj = (window as unknown as {
      google?: {
        maps?: {
          Map: new (
            el: HTMLElement,
            opts: {
              center: { lat: number; lng: number };
              zoom: number;
              disableDefaultUI?: boolean;
              zoomControl?: boolean;
            }
          ) => unknown;
          Marker: new (opts: {
            position: { lat: number; lng: number };
            map: unknown;
            title?: string;
          }) => {
            setPosition: (pos: { lat: number; lng: number }) => void;
          };
        };
      };
    }).google;

    if (!googleObj?.maps) return;

    const center = { lat: latitude, lng: longitude };

    if (!mapInstanceRef.current) {
      const map = new googleObj.maps.Map(mapContainerRef.current, {
        center,
        zoom: 16,
        disableDefaultUI: true,
        zoomControl: true,
      });
      mapInstanceRef.current = map;

      const marker = new googleObj.maps.Marker({
        position: center,
        map,
        title: 'Reported Hazard Location',
      });
      markerInstanceRef.current = marker;
    } else {
      // Update existing map
      const map = mapInstanceRef.current as { setCenter: (pos: { lat: number; lng: number }) => void };
      if (typeof map.setCenter === 'function') {
        map.setCenter(center);
      }
      const marker = markerInstanceRef.current as {
        setPosition: (pos: { lat: number; lng: number }) => void;
      };
      if (marker && typeof marker.setPosition === 'function') {
        marker.setPosition(center);
      }
    }
  }, [mapsLoaded, latitude, longitude]);

  // 3. User clicks "Detect My Current Location"
  const handleDetectLocation = async () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        onCoordsChange(lat, lng);

        try {
          const address = await reverseGeocodeCoords(lat, lng);
          if (address) {
            onChangeLocation(address);
            const pinMatch = address.match(/\b560\d{3}\b/) || address.match(/\b\d{6}\b/);
            if (pinMatch && onChangePincode) {
              onChangePincode(pinMatch[0]);
            }
          }
        } catch (e) {
          console.warn('Geocoding error:', e);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        alert('Could not acquire your current location. Please check your browser location permissions.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number';
  const apiKey = getGoogleMapsApiKey();

  return (
    <div className="space-y-3.5">
      {/* Location Input with Auto-detection button */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            <span>Problem Location / Address *</span>
          </label>

          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isLocating}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLocating ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <Navigation className="w-3 h-3" />
                <span>Use Current GPS</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={location}
            onChange={(e) => onChangeLocation(e.target.value)}
            placeholder="Type street, landmark, or use GPS detection"
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all pr-8"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>
      </div>

      {/* PIN Code & Landmark Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-800 flex items-center justify-between mb-1.5">
            <span>Bengaluru PIN Code *</span>
            <span className="text-[10px] text-indigo-600 font-semibold">Auto-assigns Department</span>
          </label>
          <input
            type="text"
            maxLength={6}
            value={pincode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
              if (onChangePincode) onChangePincode(val);
            }}
            placeholder="e.g. 560038"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono tracking-wider"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <span>Nearby Landmark (Optional)</span>
          </label>
          <input
            type="text"
            value={landmark}
            onChange={(e) => onChangeLandmark(e.target.value)}
            placeholder="e.g. Near Metro Pillar 12"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* GPS Coordinates & Interactive Map Preview */}
      {hasCoords && (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                GPS Locked: {latitude.toFixed(5)}°, {longitude.toFixed(5)}°
              </span>
            </div>

            <a
              href={getGoogleMapsLink(latitude, longitude)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              <span>Open Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Map Preview Container */}
          {!mapError && mapsLoaded && apiKey ? (
            <div
              ref={mapContainerRef}
              className="w-full h-36 rounded-xl border border-slate-200 overflow-hidden bg-slate-200"
            />
          ) : (
            <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
              {/* Fallback visual map representation */}
              <iframe
                title="OSM Location Preview"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.003}%2C${
                  latitude - 0.002
                }%2C${longitude + 0.003}%2C${latitude + 0.002}&layer=mapnik&marker=${latitude}%2C${longitude}`}
                className="w-full h-full border-0 pointer-events-none"
              />
              <div className="absolute inset-0 bg-transparent" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

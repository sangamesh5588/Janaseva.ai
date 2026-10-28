'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { getStaffSession, StaffSession } from '@/lib/staff-auth';
import { normalizePincode, ALL_117_BENGALURU_PINCODES } from '@/lib/routing-engine';

// Precise coordinates for major Bengaluru ward PIN codes to center Google Map cleanly with zero popup balloons
const BENGALURU_PINCODE_COORDS: Record<string, { lat: number; lng: number }> = {
  '001': { lat: 12.9756, lng: 77.6066 }, // Ashok Nagar / MG Road
  '002': { lat: 12.9642, lng: 77.5768 }, // City Market
  '003': { lat: 13.0031, lng: 77.5643 }, // Malleshwaram
  '004': { lat: 12.9422, lng: 77.5753 }, // Basavanagudi
  '005': { lat: 12.9982, lng: 77.6125 }, // Frazer Town
  '008': { lat: 12.9786, lng: 77.6256 }, // Ulsoor
  '009': { lat: 12.9772, lng: 77.5729 }, // Majestic
  '010': { lat: 12.9915, lng: 77.5524 }, // Rajajinagar
  '011': { lat: 12.9308, lng: 77.5838 }, // Jayanagar
  '017': { lat: 12.9554, lng: 77.6645 }, // Vimanapura / HAL
  '024': { lat: 13.0358, lng: 77.5970 }, // Hebbal
  '025': { lat: 12.9632, lng: 77.6033 }, // Richmond Town
  '034': { lat: 12.9352, lng: 77.6245 }, // Koramangala
  '037': { lat: 12.9569, lng: 77.7011 }, // Marathahalli
  '038': { lat: 12.9784, lng: 77.6408 }, // Indiranagar
  '040': { lat: 12.9698, lng: 77.5358 }, // Vijayanagar
  '043': { lat: 13.0104, lng: 77.6508 }, // Banaswadi
  '064': { lat: 13.1007, lng: 77.5963 }, // Yelahanka
  '066': { lat: 12.9698, lng: 77.7499 }, // Whitefield
  '068': { lat: 12.8912, lng: 77.6234 }, // Bommanahalli
  '076': { lat: 12.8984, lng: 77.5991 }, // BTM Layout
  '078': { lat: 12.9081, lng: 77.5855 }, // J.P. Nagar
  '085': { lat: 12.9254, lng: 77.5468 }, // Banashankari 3rd Stage
  '097': { lat: 12.9237, lng: 77.5186 }, // Rajarajeshwari Nagar
  '100': { lat: 12.8452, lng: 77.6602 }, // Electronic City
  '102': { lat: 12.9121, lng: 77.6446 }, // HSR Layout
  '103': { lat: 12.9304, lng: 77.6784 }, // Bellandur
  '104': { lat: 12.9600, lng: 77.5385 }, // RPC Layout / Vijayanagar 2nd Stage
};

const ZONE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'East Zone': { lat: 12.9840, lng: 77.6250 },
  'West Zone': { lat: 12.9700, lng: 77.5450 },
  'South Zone': { lat: 12.9250, lng: 77.5850 },
  'Mahadevapura': { lat: 12.9750, lng: 77.7000 },
  'Bommanahalli': { lat: 12.8950, lng: 77.6350 },
  'Yelahanka': { lat: 13.0900, lng: 77.5950 },
  'Dasarahalli': { lat: 13.0450, lng: 77.5150 },
  'R.R. Nagar': { lat: 12.9250, lng: 77.5180 },
};

export default function OfficialMapPage() {
  const [session, setSession] = useState<StaffSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    const active = getStaffSession();
    if (active) {
      setSession(active);
    }
  }, []);

  const handleRetry = () => {
    setLoading(true);
    // Reload map iframe cleanly
    setMapKey((k) => k + 1);
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  if (!session) return null;

  const { suffix, pincode } = normalizePincode(session.pincodeSuffix || session.pincode);
  const matchedLocality = ALL_117_BENGALURU_PINCODES.find((p) => p.suffix === suffix);
  const localityName = matchedLocality ? matchedLocality.name : `Bengaluru PIN ${pincode}`;
  const zoneName = matchedLocality ? matchedLocality.zone : 'East Zone';

  // Get coordinates to center Google Maps cleanly without any place cards or popups
  const coords =
    BENGALURU_PINCODE_COORDS[suffix] ||
    ZONE_COORDINATES[zoneName] || { lat: 12.9716, lng: 77.5946 };

  // Google Maps embed with ll=LAT,LNG renders the authentic map cleanly with zero info window balloons
  const googleMapEmbedUrl = `https://maps.google.com/maps?ll=${coords.lat},${coords.lng}&z=15&t=m&output=embed`;

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-slate-100 overflow-hidden font-sans">
      {/* 1. Normal Authentic Google Map */}
      <iframe
        key={mapKey}
        title="Google Map"
        src={googleMapEmbedUrl}
        className="w-full h-full border-0"
        loading="lazy"
        allowFullScreen
      />

      {/* 2. Top Floating Bar: Just the ward chip and retry button */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-2 pointer-events-auto">
        {/* Ward Chip */}
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-md border border-slate-200/80 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
            JS
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[170px] sm:max-w-none">
              {localityName}
            </div>
            <div className="text-[10px] font-mono text-emerald-700 font-medium leading-tight">
              pin {session.pincode}
            </div>
          </div>
        </div>

        {/* Retry / Refresh Button */}
        <button
          type="button"
          onClick={handleRetry}
          disabled={loading}
          className="w-8 h-8 rounded-2xl bg-white/95 hover:bg-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center transition-colors cursor-pointer"
          title="retry"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}

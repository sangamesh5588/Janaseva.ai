'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n/context';
import { PROBLEM_CATEGORIES } from '@/lib/constants';
import { ProblemCategory } from '@/types/report';
import { submitNewReport } from '@/lib/reports-store';
import { NeoTextArea } from '@/components/neopop/neo-input';
import { CategoryIllustration } from '@/components/icons/category-illustrations';
import { CivicCamera } from '@/components/camera/civic-camera';
import { LocationPicker } from '@/components/location/location-picker';
import { reverseGeocodeCoords } from '@/lib/google-maps';
import { Send, Check, AlertCircle, Lock, Loader2 } from 'lucide-react';

function ReportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get('category') as ProblemCategory) || 'road_damage';

  const { user, isLoading } = useAuth();
  const { t, language } = useI18n();

  const [category, setCategory] = useState<ProblemCategory>(initialCategory);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Protect route: Redirect unauthenticated citizens to login with return target
  useEffect(() => {
    if (!isLoading && !user) {
      const returnUrl = typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}`
        : '/report';
      router.replace(`/login?redirectTo=${encodeURIComponent(returnUrl)}`);
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    const paramCat = searchParams.get('category') as ProblemCategory;
    if (paramCat && PROBLEM_CATEGORIES.some((c) => c.id === paramCat)) {
      setCategory(paramCat);
    }
  }, [searchParams]);

  // Handler for CivicCamera live capture
  const handlePhotoCapture = async (
    file: File,
    meta: { latitude: number | null; longitude: number | null; accuracy: number | null }
  ) => {
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));

    if (meta.latitude && meta.longitude) {
      setLatitude(meta.latitude);
      setLongitude(meta.longitude);

      // Auto reverse-geocode address if location field is not yet set
      try {
        const detectedAddress = await reverseGeocodeCoords(meta.latitude, meta.longitude);
        if (detectedAddress && !location.trim()) {
          setLocation(detectedAddress);
          const pinMatch = detectedAddress.match(/\b560\d{3}\b/) || detectedAddress.match(/\b\d{6}\b/);
          if (pinMatch && !pincode) {
            setPincode(pinMatch[0]);
          }
        }
      } catch (err) {
        console.warn('Auto reverse geocode on capture failed:', err);
      }
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
  };

  const handleCoordsChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError(language === 'kn' ? 'ದೂರು ದಾಖಲಿಸಲು ದಯವಿಟ್ಟು ಸೈನ್ ಇನ್ ಮಾಡಿ' : 'Please sign in to submit a complaint');
      const returnUrl = typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}`
        : '/report';
      router.push(`/login?redirectTo=${encodeURIComponent(returnUrl)}`);
      return;
    }

    if (!description.trim()) {
      setError(language === 'kn' ? 'ದಯವಿಟ್ಟು ಸಮಸ್ಯೆಯ ವಿವರಣೆ ಬರೆಯಿರಿ' : 'Please provide problem details');
      return;
    }
    if (!location.trim()) {
      setError(language === 'kn' ? 'ದಯವಿಟ್ಟು ಸ್ಥಳ ಅಥವಾ ವಿಳಾಸ ನಮೂದಿಸಿ' : 'Please provide location');
      return;
    }

    setError('');
    setLoading(true);

    const citizenId = user.id;
    const { report, error: submitError } = await submitNewReport({
      citizenId,
      category,
      description,
      location,
      landmark,
      pincode,
      latitude,
      longitude,
      photoFile,
    });

    setLoading(false);

    if (submitError || !report) {
      setError(submitError?.message || 'Failed to submit report. Please try again.');
    } else {
      router.push(`/reports/${report.tracking_id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center p-8 space-y-3 font-sans">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">
          {language === 'kn' ? 'ಖಾತೆಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Verifying citizen authentication...'}
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-extrabold text-slate-900">
            {language === 'kn' ? 'ಲಾಗಿನ್ ಅಗತ್ಯವಿದೆ' : 'Sign In Required'}
          </h2>
          <p className="text-xs font-medium text-slate-500 max-w-xs mx-auto">
            {language === 'kn'
              ? 'ದೂರು ದಾಖಲಿಸಲು ಮತ್ತು ನವೀಕರಣಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ದಯವಿಟ್ಟು ಸೈನ್ ಇನ್ ಮಾಡಿ.'
              : 'Please sign in to file civic complaints and track progress with municipal officers.'}
          </p>
        </div>
        <button
          onClick={() => {
            const returnUrl = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/report';
            router.push(`/login?redirectTo=${encodeURIComponent(returnUrl)}`);
          }}
          className="px-5 py-2.5 rounded-xl bg-[#1E1B4B] hover:bg-[#2B2564] text-white text-xs font-bold shadow-md cursor-pointer transition-all"
        >
          {language === 'kn' ? 'ಈಗ ಸೈನ್ ಇನ್ ಮಾಡಿ' : 'Sign In to Continue'}
        </button>
      </div>
    );
  }

  return (
    <div className="py-1 pb-32 space-y-5 font-sans">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          {t.uploadTitle}
        </h1>
        <p className="text-xs font-medium text-slate-500 mt-1">
          {t.uploadSubtitle}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Category Selection */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.stepCategory}
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">Step 1 of 3</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {PROBLEM_CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center relative ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}

                  <div className="mb-2 transition-transform group-hover:scale-105">
                    <CategoryIllustration categoryId={cat.id} size={56} />
                  </div>

                  <span
                    className={`text-xs font-bold leading-tight ${
                      isSelected ? 'text-indigo-700' : 'text-slate-800'
                    }`}
                  >
                    {cat.labelEn}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Step 2: Live Camera Capture with Auto-GPS Watermarking */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.stepPhoto} (Live Camera Only)
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">Step 2 of 3</span>
          </div>

          <CivicCamera
            onCapture={handlePhotoCapture}
            onRemove={removePhoto}
            capturedPreviewUrl={photoPreview}
            locationName={location}
          />
        </section>

        {/* Step 3: Location & Google Places */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.stepDetails} & Location
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">Step 3 of 3</span>
          </div>

          <NeoTextArea
            label={t.descriptionLabel}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.descriptionPlaceholder}
            rows={3}
            required
            helperText="Describe what happened and hazard severity"
          />

          <LocationPicker
            location={location}
            onChangeLocation={setLocation}
            landmark={landmark}
            onChangeLandmark={setLandmark}
            pincode={pincode}
            onChangePincode={setPincode}
            latitude={latitude}
            longitude={longitude}
            onCoordsChange={handleCoordsChange}
          />
        </section>

        {/* Scroll Clearance Spacer: Ensures remaining form data scrolls completely above the fixed submit bar with zero overlap */}
        <div className="h-28 w-full flex-shrink-0 pointer-events-none" aria-hidden="true" />

        {/* Fixed Bottom Action Bar: Non-movable Submit Button replacing the bottom nav bar */}
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] pb-safe">
          <div className="max-w-lg mx-auto">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#1E1B4B] hover:bg-[#2B2564] text-white font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? t.submitting : t.submitReportBtn}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-semibold text-neutral-500">Loading...</div>}>
      <ReportForm />
    </Suspense>
  );
}

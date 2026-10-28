'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  RotateCcw,
  RefreshCw,
  X,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { applyCivicWatermark, WatermarkData } from '@/lib/watermark';

interface CivicCameraProps {
  onCapture: (file: File, meta: { latitude: number | null; longitude: number | null; accuracy: number | null }) => void;
  onRemove: () => void;
  capturedPreviewUrl?: string | null;
  locationName?: string | null;
}

export function CivicCamera({
  onCapture,
  onRemove,
  capturedPreviewUrl,
  locationName,
}: CivicCameraProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // GPS state
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number | null;
  } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'searching' | 'locked' | 'denied'>('idle');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Acquire GPS position
  const fetchLocation = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setGpsStatus('denied');
      return;
    }

    setGpsStatus('searching');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setGpsStatus('locked');
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setGpsStatus('denied');
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  }, []);

  // Start live camera stream
  const startCamera = async () => {
    setStreamError(null);
    setIsOpen(true);
    fetchLocation();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera streaming is not supported on this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to access camera';
      console.warn('getUserMedia failed, falling back to camera input:', msg);
      setStreamError(msg);
    }
  };

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsOpen(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Flip camera (environment/user)
  const toggleFacingMode = async () => {
    stopCamera();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    setTimeout(() => {
      startCamera();
    }, 200);
  };

  // Handle capture from live video
  const handleShutterClick = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);

    try {
      const watermarkData: WatermarkData = {
        latitude: coords?.latitude || null,
        longitude: coords?.longitude || null,
        accuracy: coords?.accuracy || null,
        locationName: locationName || null,
        timestamp: new Date(),
      };

      const result = await applyCivicWatermark(videoRef.current, watermarkData);
      stopCamera();
      onCapture(result.file, {
        latitude: coords?.latitude || null,
        longitude: coords?.longitude || null,
        accuracy: coords?.accuracy || null,
      });
    } catch (err) {
      console.error('Failed to capture and watermark photo:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Fallback hardware camera input handler
  const handleFallbackFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const rawFile = e.target.files[0];
    setIsProcessing(true);

    try {
      // Ensure GPS is queried
      let currentCoords = coords;
      if (!currentCoords && 'geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 6000,
            });
          });
          currentCoords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setCoords(currentCoords);
          setGpsStatus('locked');
        } catch {
          // GPS failed or denied
        }
      }

      const watermarkData: WatermarkData = {
        latitude: currentCoords?.latitude || null,
        longitude: currentCoords?.longitude || null,
        accuracy: currentCoords?.accuracy || null,
        locationName: locationName || null,
        timestamp: new Date(),
      };

      const result = await applyCivicWatermark(rawFile, watermarkData);
      setIsOpen(false);
      onCapture(result.file, {
        latitude: currentCoords?.latitude || null,
        longitude: currentCoords?.longitude || null,
        accuracy: currentCoords?.accuracy || null,
      });
    } catch (err) {
      console.error('Failed to watermark fallback photo:', err);
    } finally {
      setIsProcessing(false);
      // Reset input value so same photo can be retaken if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 1. Captured State: Display preview with verified GPS badge & retake button
  if (capturedPreviewUrl) {
    return (
      <div className="space-y-2">
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950">
          <img
            src={capturedPreviewUrl}
            alt="Captured Evidence"
            className="w-full max-h-80 object-cover"
          />

          {/* Top Status Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-emerald-400 text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>GPS Watermarked</span>
            </div>

            <button
              type="button"
              onClick={onRemove}
              className="pointer-events-auto p-1.5 rounded-full bg-black/80 hover:bg-black text-white shadow transition-colors"
              title="Discard and retake photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={startCamera}
          className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retake Live Photo</span>
        </button>
      </div>
    );
  }

  // 2. Live Camera Viewfinder Modal
  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between">
        {/* Top Control Bar */}
        <div className="p-4 pt-6 flex items-center justify-between text-white bg-gradient-to-b from-black/80 to-transparent z-20">
          <div className="flex items-center gap-2">
            {gpsStatus === 'locked' && coords ? (
              <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
                </span>
              </div>
            ) : gpsStatus === 'searching' ? (
              <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Locking GPS...</span>
              </div>
            ) : (
              <div className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>GPS Standby</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFacingMode}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
              title="Switch camera"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
              title="Close camera"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {streamError ? (
            <div className="text-center p-6 space-y-4 max-w-sm text-white">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-base">Direct Camera Streaming Unavailable</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Use the native device camera capture button below to snap your photo with GPS proof.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-lg active:scale-95 transition-all">
                <Camera className="w-4 h-4" />
                <span>Open Hardware Camera</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFallbackFile}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Reticle */}
              <div className="absolute inset-8 border border-white/20 rounded-2xl pointer-events-none flex items-center justify-center">
                <div className="w-12 h-12 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0 rounded-tl-xl" />
                <div className="w-12 h-12 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0 rounded-tr-xl" />
                <div className="w-12 h-12 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0 rounded-bl-xl" />
                <div className="w-12 h-12 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0 rounded-tr-xl" />
                <span className="text-[11px] font-bold text-white/70 tracking-wider uppercase bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                  Point At Hazard
                </span>
              </div>
            </>
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center space-y-3 z-30">
              <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-white">Stamping GPS Watermark...</p>
            </div>
          )}
        </div>

        {/* Bottom Shutter Controls */}
        <div className="p-6 pb-8 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center z-20">
          {!streamError && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleShutterClick}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 hover:bg-white/40 active:scale-95 transition-all shadow-2xl cursor-pointer disabled:opacity-50"
              title="Capture Photo"
            >
              <div className="w-14 h-14 rounded-full bg-white shadow-inner flex items-center justify-center text-slate-900">
                <Camera className="w-7 h-7" />
              </div>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Idle State: Clean Action Card enforcing Live Camera Capture
  return (
    <div className="space-y-2">
      <div
        onClick={startCamera}
        className="w-full rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-500/60 bg-slate-50/60 hover:bg-emerald-50/30 p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer group active:scale-[0.99]"
      >
        <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 group-hover:bg-emerald-200/80 text-emerald-700 flex items-center justify-center mb-3 transition-transform group-hover:scale-105">
          <Camera className="w-7 h-7 stroke-[2.2]" />
        </div>

        <span className="text-sm font-extrabold text-slate-900 tracking-tight">
          Snap Live Photo with GPS
        </span>
        <p className="text-xs text-slate-500 font-medium mt-1 max-w-xs">
          Camera only — embeds live GPS coordinates, date & time directly on the image proof.
        </p>

        <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tamper-proof live capture</span>
        </div>
      </div>

      {/* Hidden fallback hardware camera input for devices that require standard intent */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFallbackFile}
        className="hidden"
      />
    </div>
  );
}

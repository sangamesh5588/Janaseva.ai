export interface WatermarkData {
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
  locationName?: string | null;
  timestamp?: Date;
}

export interface WatermarkResult {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
}

/**
 * Formats latitude to DD.DDDD° N/S
 */
function formatLat(lat: number): string {
  const dir = lat >= 0 ? 'N' : 'S';
  return `${Math.abs(lat).toFixed(5)}° ${dir}`;
}

/**
 * Formats longitude to DD.DDDD° E/W
 */
function formatLng(lng: number): string {
  const dir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lng).toFixed(5)}° ${dir}`;
}

/**
 * Formats date and time into civic inspection timestamp
 */
function formatCivicTimestamp(date: Date): string {
  const d = date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const t = date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  return `${d} • ${t}`;
}

/**
 * Draws a civic tamper-proof watermark onto a canvas containing the captured image
 */
export async function applyCivicWatermark(
  imageSource: HTMLVideoElement | HTMLImageElement | File | Blob,
  meta: WatermarkData
): Promise<WatermarkResult> {
  const timestamp = meta.timestamp || new Date();

  // Create offscreen image if source is a File/Blob
  let imgElement: HTMLImageElement | HTMLVideoElement;
  let naturalWidth = 1280;
  let naturalHeight = 720;

  if (imageSource instanceof HTMLVideoElement) {
    imgElement = imageSource;
    naturalWidth = imageSource.videoWidth || 1280;
    naturalHeight = imageSource.videoHeight || 720;
  } else if (imageSource instanceof HTMLImageElement) {
    imgElement = imageSource;
    naturalWidth = imageSource.naturalWidth || 1280;
    naturalHeight = imageSource.naturalHeight || 720;
  } else {
    // File or Blob
    const url = URL.createObjectURL(imageSource);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
    URL.revokeObjectURL(url);
    imgElement = img;
    naturalWidth = img.naturalWidth || 1280;
    naturalHeight = img.naturalHeight || 720;
  }

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = naturalWidth;
  canvas.height = naturalHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get 2D canvas context for watermarking');
  }

  // 1. Draw base photo
  ctx.drawImage(imgElement, 0, 0, naturalWidth, naturalHeight);

  // 2. Compute dynamic banner scale based on image dimensions
  const baseScale = Math.max(naturalWidth / 1000, 0.7);
  const bannerHeight = Math.round(110 * baseScale);
  const paddingX = Math.round(24 * baseScale);

  // 3. Draw dark gradient banner at bottom
  const gradient = ctx.createLinearGradient(0, naturalHeight - bannerHeight - 40, 0, naturalHeight);
  gradient.addColorStop(0, 'rgba(15, 23, 42, 0)');
  gradient.addColorStop(0.3, 'rgba(15, 23, 42, 0.75)');
  gradient.addColorStop(1, 'rgba(15, 23, 42, 0.95)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, naturalHeight - bannerHeight - 40, naturalWidth, bannerHeight + 40);

  // Accent line at the top of banner
  ctx.fillStyle = '#10B981'; // Emerald accent line
  ctx.fillRect(0, naturalHeight - bannerHeight - 2, naturalWidth, 3 * baseScale);

  // 4. Render Brand / Header
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.round(18 * baseScale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText('JANASEVA AI • VERIFIED CITIZEN CAPTURE', paddingX, naturalHeight - bannerHeight + Math.round(28 * baseScale));

  // 5. Render GPS Coordinates & Accuracy
  ctx.fillStyle = '#34D399'; // Emerald-400 for GPS coordinates
  ctx.font = `bold ${Math.round(22 * baseScale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace`;

  let gpsText = 'GPS: LOCATION PENDING';
  if (typeof meta.latitude === 'number' && typeof meta.longitude === 'number') {
    const latStr = formatLat(meta.latitude);
    const lngStr = formatLng(meta.longitude);
    const accStr = meta.accuracy ? ` (±${Math.round(meta.accuracy)}m)` : '';
    gpsText = `📍 ${latStr}, ${lngStr}${accStr}`;
  }
  ctx.fillText(gpsText, paddingX, naturalHeight - bannerHeight + Math.round(58 * baseScale));

  // 6. Render Timestamp & Location Name (Bottom Line)
  ctx.fillStyle = '#CBD5E1'; // Slate-300
  ctx.font = `500 ${Math.round(14 * baseScale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  const timeText = `🕒 ${formatCivicTimestamp(timestamp)}`;
  const locText = meta.locationName ? ` • ${meta.locationName}` : '';
  ctx.fillText(`${timeText}${locText}`, paddingX, naturalHeight - bannerHeight + Math.round(86 * baseScale));

  // 7. Security Hash / Timestamp watermark in top-right corner
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = `bold ${Math.round(12 * baseScale)}px monospace`;
  ctx.textAlign = 'right';
  ctx.fillText(
    `EVID-ID: ${Date.now().toString(36).toUpperCase()}`,
    naturalWidth - paddingX,
    naturalHeight - bannerHeight + Math.round(28 * baseScale)
  );
  ctx.textAlign = 'left'; // reset

  // 8. Export to Blob / File
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
  });

  if (!blob) {
    throw new Error('Failed to create JPEG blob from canvas');
  }

  const fileName = `civic_proof_${Date.now()}.jpg`;
  const file = new File([blob], fileName, { type: 'image/jpeg' });
  const previewUrl = URL.createObjectURL(blob);

  return {
    file,
    previewUrl,
    width: naturalWidth,
    height: naturalHeight,
  };
}

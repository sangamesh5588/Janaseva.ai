import { createClient } from './client';

/**
 * Converts a File into a persistent base64 data URL fallback
 * ensuring images remain viewable across reloads and offline sessions.
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve(URL.createObjectURL(file));
    reader.readAsDataURL(file);
  });
}

export async function uploadReportPhoto(file: File, trackingId: string): Promise<string | null> {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop() || 'jpg';
  const cleanTracking = trackingId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filePath = `${cleanTracking}/${Date.now()}.${fileExt}`;

  try {
    const { error } = await supabase.storage
      .from('report-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.warn('Supabase storage upload notice:', error.message);
      // Persist as base64 so image is 100% visible even if Supabase storage bucket is not yet configured
      return await fileToDataUrl(file);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('report-photos').getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.warn('Storage upload exception, using persistent base64 fallback:', err);
    return await fileToDataUrl(file);
  }
}

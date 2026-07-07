// Cloudinary Integration - server-side signed upload + client helper
import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryConfig, isCloudinaryConfigured } from './config';

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudinaryConfig.cloudName,
    api_key: cloudinaryConfig.apiKey,
    api_secret: cloudinaryConfig.apiSecret,
    secure: true,
  });
}

export interface UploadResult {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  error?: string;
}

// Server-side signed upload (used in API route)
export async function uploadToCloudinaryServer(fileBuffer: Buffer, options: { folder?: string; resourceType?: 'image' | 'video' | 'auto' } = {}): Promise<UploadResult> {
  if (!isCloudinaryConfigured) return { url: '', error: 'Cloudinary not configured' };
  try {
    const dataUri = `data:application/octet-stream;base64,${fileBuffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: options.folder || 'pbr',
      resource_type: options.resourceType || 'auto',
      unique_filename: true,
      overwrite: false,
    });
    return { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height, bytes: result.bytes, format: result.format };
  } catch (err: any) {
    console.error('[cloudinary] upload failed:', err);
    return { url: '', error: err?.message || 'Upload gagal' };
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  if (!isCloudinaryConfigured) return false;
  try { await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' }); return true; }
  catch (err) { console.error('[cloudinary] delete failed:', err); return false; }
}

// Client-side unsigned upload (fallback)
export async function uploadToCloudinary(file: File | Blob, onProgress?: (p: number) => void): Promise<UploadResult> {
  const cloudName = cloudinaryConfig.cloudName;
  const uploadPreset = cloudinaryConfig.uploadPreset;
  if (!cloudName || !uploadPreset) return { url: '', error: 'Cloudinary unsigned upload not configured' };
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText);
        if (res.secure_url) resolve({ url: res.secure_url, publicId: res.public_id, width: res.width, height: res.height, bytes: res.bytes, format: res.format });
        else resolve({ url: '', error: res.error?.message || 'Upload gagal' });
      } catch { resolve({ url: '', error: 'Respon tidak valid' }); }
    };
    xhr.onerror = () => resolve({ url: '', error: 'Kesalahan jaringan' });
    xhr.send(formData);
  });
}

export function getCloudinaryUrl(url: string): string { return url || ''; }

export function extractPublicId(url: string): string | null {
  if (!url || !url.includes('res.cloudinary.com')) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)$/);
  return match ? match[1].replace(/\.[^.]+$/, '') : null;
}

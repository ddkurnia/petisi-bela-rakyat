// Firebase & Cloudinary Configuration
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId
);

export const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || firebaseConfig.projectId,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
};

export const isFirebaseAdminConfigured = Boolean(
  firebaseAdminConfig.projectId && firebaseAdminConfig.clientEmail && firebaseAdminConfig.privateKey
);

export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'belarakyat_unsigned',
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
};

export const isCloudinaryConfigured = Boolean(
  cloudinaryConfig.cloudName && cloudinaryConfig.apiKey && cloudinaryConfig.apiSecret
);

export const siteConfig = {
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://belarakyat.org',
  name: 'Petisi Bela Rakyat',
};

export const COLLECTIONS = {
  BLOG: 'blog',
  NEWS: 'news',
  CAMPAIGNS: 'campaigns',
  PENGURUS: 'pengurus',
  PENASEHAT: 'penasehat',
  RELAWAN: 'relawan',
  SUPPORTERS: 'supporters',
  GALLERY: 'gallery',
  WORK: 'work',
  TRANSPARENCY: 'transparency',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  MEDIA: 'media',
  MESSAGES: 'messages',
  USERS: 'users',
  PROPOSALS: 'proposals',
  PETITION_SIGNATURES: 'petition_signatures',
  OFFICIAL_LETTERS: 'official_letters',
  INSTITUTIONS: 'institutions',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

export function assertFirebaseConfigured(): void {
  if (!isFirebaseConfigured) {
    throw new Error('[PBR] Firebase not configured. Set NEXT_PUBLIC_FIREBASE_* env vars in .env.local');
  }
}

export function assertCloudinaryConfigured(): void {
  if (!isCloudinaryConfigured) {
    throw new Error('[PBR] Cloudinary not configured. Set CLOUDINARY_* env vars in .env.local');
  }
}

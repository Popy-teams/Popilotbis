import { DEMO_MEMBER_PHOTO_URLS } from '../data/teamSpaceDemoImages';
import { LEGACY_TASK_USER_TO_TEAM_ID } from './teamMemberStore';

export const MEMBER_PHOTOS_KEY = 'popilot:team-space-member-photos';

/** Fichier source accepté (photos téléphone) */
const MAX_INPUT_BYTES = 25 * 1024 * 1024;
/** Cible après compression pour localStorage */
const MAX_OUTPUT_BYTES = 450_000;
const MAX_DIMENSION = 1280;

export function loadMemberPhotos(): Record<string, string> {
  try {
    const raw = localStorage.getItem(MEMBER_PHOTOS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function saveMemberPhoto(memberId: string, dataUrl: string): void {
  const all = loadMemberPhotos();
  all[memberId] = dataUrl;
  try {
    localStorage.setItem(MEMBER_PHOTOS_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('popilot:team-space-updated'));
  } catch {
    throw new Error('Stockage plein — essayez une image plus simple');
  }
}

export function getMemberPhoto(memberId: string, photos?: Record<string, string>): string | undefined {
  return (photos ?? loadMemberPhotos())[memberId];
}

/** Injecte les avatars démo (URLs) si absents */
export function mergeDemoMemberPhotos(existing: Record<string, string>): Record<string, string> {
  const merged = { ...existing };
  for (const [id, url] of Object.entries(DEMO_MEMBER_PHOTO_URLS)) {
    merged[id] = url;
  }
  return merged;
}

export function migrateLegacyMemberPhotos(): void {
  const current = loadMemberPhotos();
  let changed = false;
  for (const [legacyId, teamId] of Object.entries(LEGACY_TASK_USER_TO_TEAM_ID)) {
    if (current[legacyId] && !current[teamId]) {
      current[teamId] = current[legacyId];
      delete current[legacyId];
      changed = true;
    }
  }
  if (changed) {
    try {
      localStorage.setItem(MEMBER_PHOTOS_KEY, JSON.stringify(current));
    } catch {
      /* ignore */
    }
  }
}

export function seedMemberPhotoFixtures(force = false): void {
  const current = loadMemberPhotos();
  const next = force ? mergeDemoMemberPhotos({}) : mergeDemoMemberPhotos(current);
  try {
    localStorage.setItem(MEMBER_PHOTOS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image illisible'));
    };
    img.src = objectUrl;
  });
}

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Compression impossible'))),
      'image/jpeg',
      quality
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Lecture impossible'));
    reader.readAsDataURL(blob);
  });
}

async function compressImage(file: File): Promise<string> {
  const img = await loadImageElement(file);
  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

  if (!width || !height) {
    throw new Error('Dimensions image invalides');
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  width = Math.max(1, Math.round(width * scale));
  height = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Compression impossible');

  let quality = 0.9;
  let blob: Blob;

  for (let attempt = 0; attempt < 8; attempt++) {
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    blob = await canvasToJpegBlob(canvas, quality);

    if (blob.size <= MAX_OUTPUT_BYTES) {
      return blobToDataUrl(blob);
    }

    if (quality > 0.45) {
      quality -= 0.1;
    } else {
      width = Math.round(width * 0.85);
      height = Math.round(height * 0.85);
      quality = 0.82;
    }
  }

  throw new Error('Image trop lourde même après compression — essayez un recadrage plus serré');
}

/** Lit et compresse une image pour stockage local (accepte les photos téléphone). */
export async function readImageFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Choisissez une image (JPG, PNG, WebP…)');
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('Fichier trop volumineux (max 25 Mo)');
  }
  return compressImage(file);
}

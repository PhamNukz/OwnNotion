export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const;
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

/** Validates an image file. Returns an error string, or null if valid. */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
    return 'Solo se permiten imágenes JPG, PNG o WebP.';
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `La imagen no puede superar ${MAX_IMAGE_SIZE_MB}MB.`;
  }
  return null;
}

/** Basic email format validation */
export function validateEmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
}

/** Strips characters that could be used for XSS */
export function sanitizeInput(input: string): string {
  return input.replace(/[<>"'`]/g, '').trim();
}

/** Creates an object URL and returns it. Caller is responsible for revoking. */
export function createSafeObjectURL(file: File): string {
  return URL.createObjectURL(file);
}

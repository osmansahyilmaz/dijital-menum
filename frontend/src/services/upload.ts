import type { MenuDataV1 } from './api/types';
import { supabase } from '../lib/supabase';

/**
 * API Configuration
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Image Upload Constants (must match backend)
 */
export const IMAGE_UPLOAD_LIMITS = {
    MAX_FILE_COUNT: 5,
    MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'webp'],
};

/**
 * Get auth token from Supabase session
 */
async function getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
}

/**
 * Image upload result
 */
export interface ImageUploadResult {
    path: string;
    url: string;
}

/**
 * Image upload response
 */
export interface ImageUploadResponse {
    images: ImageUploadResult[];
}

/**
 * Upload progress callback type
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * Client-side file validation
 */
export function validateFiles(files: File[]): { valid: boolean; error?: string } {
    // Check count
    if (files.length === 0) {
        return { valid: false, error: 'Lütfen en az bir dosya seçin' };
    }

    if (files.length > IMAGE_UPLOAD_LIMITS.MAX_FILE_COUNT) {
        return { valid: false, error: `En fazla ${IMAGE_UPLOAD_LIMITS.MAX_FILE_COUNT} dosya yükleyebilirsiniz` };
    }

    // Check each file
    for (const file of files) {
        // Check type
        if (!IMAGE_UPLOAD_LIMITS.ALLOWED_TYPES.includes(file.type)) {
            return {
                valid: false,
                error: `"${file.name}" dosya tipi desteklenmiyor. İzin verilen: JPEG, PNG, WebP`
            };
        }

        // Check size
        if (file.size > IMAGE_UPLOAD_LIMITS.MAX_FILE_SIZE_BYTES) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            return {
                valid: false,
                error: `"${file.name}" çok büyük (${sizeMB}MB). Maksimum: 5MB`
            };
        }

        // Check if empty
        if (file.size === 0) {
            return { valid: false, error: `"${file.name}" dosyası boş` };
        }
    }

    return { valid: true };
}

/**
 * Upload images to backend
 */
export async function uploadImages(
    menuId: string,
    files: File[],
    onProgress?: UploadProgressCallback
): Promise<ImageUploadResponse> {
    // Client-side validation
    const validation = validateFiles(files);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // Get auth token
    const token = await getAuthToken();
    if (!token) {
        throw new Error('Oturum açmanız gerekiyor');
    }

    // Create FormData
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('files', file);
    });

    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable && onProgress) {
                const progress = Math.round((event.loaded / event.total) * 100);
                onProgress(progress);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch {
                    reject(new Error('Sunucu yanıtı işlenemedi'));
                }
            } else {
                try {
                    const error = JSON.parse(xhr.responseText);
                    reject(new Error(error.detail || 'Yükleme başarısız'));
                } catch {
                    reject(new Error(`Yükleme başarısız (${xhr.status})`));
                }
            }
        });

        xhr.addEventListener('error', () => {
            reject(new Error('Ağ hatası oluştu'));
        });

        xhr.addEventListener('abort', () => {
            reject(new Error('Yükleme iptal edildi'));
        });

        xhr.open('POST', `${API_BASE_URL}/api/menus/${menuId}/images`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
    });
}

/**
 * Create a new menu (placeholder - will be updated when menu creation is ready)
 */
export async function createMenu(data: MenuDataV1): Promise<{ menu_id: string }> {
    const token = await getAuthToken();
    if (!token) {
        throw new Error('Oturum açmanız gerekiyor');
    }

    const response = await fetch(`${API_BASE_URL}/api/menus`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Menü oluşturulamadı');
    }

    return response.json();
}

import { useState, useCallback } from 'react';
import {
    uploadImages,
    validateFiles,
    IMAGE_UPLOAD_LIMITS,
    type ImageUploadResult
} from '../services/upload';
import { useToast } from '../components/ui/Toast';

export interface UploadState {
    files: File[];
    previews: string[];
    uploadedImages: ImageUploadResult[];
    isUploading: boolean;
    progress: number;
    error: string | null;
}

export interface UseImageUploadReturn {
    state: UploadState;
    addFiles: (newFiles: FileList | File[]) => void;
    removeFile: (index: number) => void;
    clearFiles: () => void;
    upload: (menuId: string) => Promise<ImageUploadResult[]>;
    reset: () => void;
}

const initialState: UploadState = {
    files: [],
    previews: [],
    uploadedImages: [],
    isUploading: false,
    progress: 0,
    error: null,
};

/**
 * Hook for managing image upload state and operations
 */
export function useImageUpload(): UseImageUploadReturn {
    const [state, setState] = useState<UploadState>(initialState);
    const toast = useToast();

    // Add files with validation
    const addFiles = useCallback((newFiles: FileList | File[]) => {
        const fileArray = Array.from(newFiles);

        setState((prev) => {
            const allFiles = [...prev.files, ...fileArray];

            // Validate total count
            if (allFiles.length > IMAGE_UPLOAD_LIMITS.MAX_FILE_COUNT) {
                toast.error(`En fazla ${IMAGE_UPLOAD_LIMITS.MAX_FILE_COUNT} dosya yükleyebilirsiniz`);
                return prev;
            }

            // Validate new files
            const validation = validateFiles(fileArray);
            if (!validation.valid) {
                toast.error(validation.error || 'Dosya doğrulama hatası');
                return prev;
            }

            // Create previews for new files
            const newPreviews = fileArray.map((file) => URL.createObjectURL(file));

            return {
                ...prev,
                files: allFiles,
                previews: [...prev.previews, ...newPreviews],
                error: null,
            };
        });
    }, [toast]);

    // Remove a file by index
    const removeFile = useCallback((index: number) => {
        setState((prev) => {
            // Revoke preview URL to free memory
            if (prev.previews[index]) {
                URL.revokeObjectURL(prev.previews[index]);
            }

            return {
                ...prev,
                files: prev.files.filter((_, i) => i !== index),
                previews: prev.previews.filter((_, i) => i !== index),
            };
        });
    }, []);

    // Clear all files
    const clearFiles = useCallback(() => {
        setState((prev) => {
            // Revoke all preview URLs
            prev.previews.forEach((url) => URL.revokeObjectURL(url));

            return {
                ...prev,
                files: [],
                previews: [],
                error: null,
            };
        });
    }, []);

    // Upload files to server
    const upload = useCallback(async (menuId: string): Promise<ImageUploadResult[]> => {
        if (state.files.length === 0) {
            throw new Error('Yüklenecek dosya yok');
        }

        setState((prev) => ({
            ...prev,
            isUploading: true,
            progress: 0,
            error: null,
        }));

        try {
            const response = await uploadImages(
                menuId,
                state.files,
                (progress) => {
                    setState((prev) => ({ ...prev, progress }));
                }
            );

            setState((prev) => ({
                ...prev,
                isUploading: false,
                progress: 100,
                uploadedImages: response.images,
            }));

            toast.success(`${response.images.length} görsel başarıyla yüklendi`);
            return response.images;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Yükleme başarısız';

            setState((prev) => ({
                ...prev,
                isUploading: false,
                progress: 0,
                error: errorMessage,
            }));

            toast.error(errorMessage);
            throw error;
        }
    }, [state.files, toast]);

    // Reset everything
    const reset = useCallback(() => {
        setState((prev) => {
            prev.previews.forEach((url) => URL.revokeObjectURL(url));
            return initialState;
        });
    }, []);

    return {
        state,
        addFiles,
        removeFile,
        clearFiles,
        upload,
        reset,
    };
}

export default useImageUpload;

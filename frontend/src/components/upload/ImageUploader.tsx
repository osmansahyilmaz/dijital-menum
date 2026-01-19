import { useRef, useState, useCallback } from 'react';
import { IMAGE_UPLOAD_LIMITS } from '../../services/upload';

interface ImageUploaderProps {
    files: File[];
    previews: string[];
    isUploading: boolean;
    progress: number;
    onAddFiles: (files: FileList | File[]) => void;
    onRemoveFile: (index: number) => void;
    disabled?: boolean;
}

export function ImageUploader({
    files,
    previews,
    isUploading,
    progress,
    onAddFiles,
    onRemoveFile,
    disabled = false,
}: ImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleClick = () => {
        if (!disabled && !isUploading) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onAddFiles(e.target.files);
            // Reset input value to allow re-selecting same files
            e.target.value = '';
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled && !isUploading) {
            setIsDragging(true);
        }
    }, [disabled, isUploading]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled || isUploading) return;

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            onAddFiles(droppedFiles);
        }
    }, [disabled, isUploading, onAddFiles]);

    const canAddMore = files.length < IMAGE_UPLOAD_LIMITS.MAX_FILE_COUNT;

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${isDragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                    }
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          ${!canAddMore ? 'opacity-50' : ''}
        `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={IMAGE_UPLOAD_LIMITS.ALLOWED_TYPES.join(',')}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={disabled || isUploading || !canAddMore}
                />

                <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>

                    <div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">
                            {canAddMore
                                ? 'Fotoğrafları sürükleyip bırakın veya tıklayın'
                                : 'Maksimum dosya sayısına ulaşıldı'
                            }
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            JPEG, PNG, WebP • Maks. 5MB • En fazla {IMAGE_UPLOAD_LIMITS.MAX_FILE_COUNT} dosya
                        </p>
                    </div>
                </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Yükleniyor...</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Preview Grid */}
            {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {previews.map((preview, index) => (
                        <div key={index} className="relative group aspect-square">
                            <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg shadow-md"
                            />

                            {/* File name overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg">
                                <p className="text-white text-xs truncate">
                                    {files[index]?.name}
                                </p>
                            </div>

                            {/* Remove button */}
                            {!isUploading && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveFile(index);
                                    }}
                                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    title="Kaldır"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* File count indicator */}
            {files.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    {files.length} / {IMAGE_UPLOAD_LIMITS.MAX_FILE_COUNT} dosya seçildi
                </p>
            )}
        </div>
    );
}

export default ImageUploader;

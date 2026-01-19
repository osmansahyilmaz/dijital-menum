import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { useImageUpload } from '../hooks/useImageUpload';
import { ImageUploader } from '../components/upload/ImageUploader';

export function CreateMenuPage() {
    const { user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const imageUpload = useImageUpload();
    const [menuTitle, setMenuTitle] = useState('');

    // For now, we use a placeholder menu ID since menu creation will be handled later
    // In production, this would first create the menu, then upload images
    const TEMP_MENU_ID = 'menu-1';

    const handleUpload = async () => {
        if (imageUpload.state.files.length === 0) {
            toast.error('Lütfen en az bir fotoğraf seçin');
            return;
        }

        try {
            await imageUpload.upload(TEMP_MENU_ID);
            toast.success('Fotoğraflar yüklendi! OCR işlemi başlatılacak...');
            // In future phases, this will redirect to the menu editor
            // navigate('/menus/' + menuId + '/edit');
        } catch (error) {
            // Error is already handled by the hook
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Yeni Menü Oluştur
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                    {/* Step 1: Menu Title */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Menü Adı (Opsiyonel)
                        </label>
                        <input
                            type="text"
                            value={menuTitle}
                            onChange={(e) => setMenuTitle(e.target.value)}
                            placeholder="Örn: Akşam Menüsü, Hafta Sonu Menüsü"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Step 2: Upload Images */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Menü Fotoğraflarını Yükleyin
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Menünüzün fotoğraflarını yükleyin. Yapay zeka fotoğrafları analiz edip dijital menünüzü oluşturacak.
                        </p>

                        <ImageUploader
                            files={imageUpload.state.files}
                            previews={imageUpload.state.previews}
                            isUploading={imageUpload.state.isUploading}
                            progress={imageUpload.state.progress}
                            onAddFiles={imageUpload.addFiles}
                            onRemoveFile={imageUpload.removeFile}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 justify-end">
                        <button
                            onClick={() => {
                                imageUpload.clearFiles();
                                setMenuTitle('');
                            }}
                            disabled={imageUpload.state.isUploading || imageUpload.state.files.length === 0}
                            className="px-6 py-3 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Temizle
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={imageUpload.state.isUploading || imageUpload.state.files.length === 0}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {imageUpload.state.isUploading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Yükleniyor...
                                </span>
                            ) : (
                                'Fotoğrafları Yükle'
                            )}
                        </button>
                    </div>

                    {/* Upload Status */}
                    {imageUpload.state.uploadedImages.length > 0 && (
                        <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <h3 className="text-green-800 dark:text-green-400 font-medium mb-2">
                                ✓ Yükleme Tamamlandı
                            </h3>
                            <p className="text-green-700 dark:text-green-500 text-sm">
                                {imageUpload.state.uploadedImages.length} görsel başarıyla yüklendi.
                                OCR işlemi için bir sonraki aşamaya geçebilirsiniz.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default CreateMenuPage;

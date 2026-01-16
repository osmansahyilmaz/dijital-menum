import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';

export function DashboardPage() {
    const { user, signOut } = useAuth();
    const toast = useToast();

    const handleLogout = async () => {
        await signOut();
        toast.success('Çıkış yapıldı');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        Dijital Menüm
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {user?.email}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                        Hoş Geldiniz!
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Create Menu Card */}
                        <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Yeni Menü Oluştur
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Menü fotoğraflarınızı yükleyerek dijital menünüzü oluşturun
                                </p>
                            </div>
                        </div>

                        {/* My Menus Card */}
                        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Menülerim
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Henüz bir menünüz bulunmuyor. Yeni bir menü oluşturarak başlayın.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default DashboardPage;

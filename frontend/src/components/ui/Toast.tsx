import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (type: ToastType, message: string, duration?: number) => void;
    removeToast: (id: string) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast Provider component
 */
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback(
        (type: ToastType, message: string, duration = 5000) => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const newToast: Toast = { id, type, message, duration };

            setToasts((prev) => [...prev, newToast]);

            if (duration > 0) {
                setTimeout(() => {
                    removeToast(id);
                }, duration);
            }
        },
        [removeToast]
    );

    const success = useCallback(
        (message: string, duration?: number) => addToast('success', message, duration),
        [addToast]
    );

    const error = useCallback(
        (message: string, duration?: number) => addToast('error', message, duration),
        [addToast]
    );

    const warning = useCallback(
        (message: string, duration?: number) => addToast('warning', message, duration),
        [addToast]
    );

    const info = useCallback(
        (message: string, duration?: number) => addToast('info', message, duration),
        [addToast]
    );

    return (
        <ToastContext.Provider
            value={{ toasts, addToast, removeToast, success, error, warning, info }}
        >
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

/**
 * Toast Container component
 */
function ToastContainer({
    toasts,
    onRemove,
}: {
    toasts: Toast[];
    onRemove: (id: string) => void;
}) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

/**
 * Individual Toast item
 */
function ToastItem({
    toast,
    onRemove,
}: {
    toast: Toast;
    onRemove: (id: string) => void;
}) {
    const typeStyles = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white',
    };

    const icons = {
        success: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
        error: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        warning: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        info: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    };

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-md animate-slide-in ${typeStyles[toast.type]}`}
        >
            {icons[toast.type]}
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className="p-1 hover:opacity-70 transition-opacity"
                aria-label="Close"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

/**
 * useToast hook
 */
export function useToast(): ToastContextType {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export default ToastProvider;

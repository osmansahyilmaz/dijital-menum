import type { ApiError, ApiResult, Menu, CreateMenuResponse, PublishMenuResponse } from './types';

/**
 * API Configuration
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Custom API Error class
 */
export class ApiRequestError extends Error {
    public status: number;
    public code?: string;
    public details?: Record<string, unknown>;

    constructor(error: ApiError, status: number = 500) {
        super(error.message);
        this.name = 'ApiRequestError';
        this.status = status;
        this.code = error.code;
        this.details = error.details;
    }
}

/**
 * Get auth token from storage
 */
function getAuthToken(): string | null {
    // Supabase stores the session in localStorage
    const session = localStorage.getItem('sb-auth-token');
    if (session) {
        try {
            const parsed = JSON.parse(session);
            return parsed.access_token || null;
        } catch {
            return null;
        }
    }
    return null;
}

/**
 * Base fetch wrapper with auth and error handling
 */
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add auth token if available
    const token = getAuthToken();
    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            if (!response.ok) {
                throw new ApiRequestError(
                    { message: `HTTP error: ${response.statusText}`, status: response.status },
                    response.status
                );
            }
            return {} as T;
        }

        const data = await response.json();

        if (!response.ok) {
            const error: ApiError = data.error || {
                message: data.message || 'An error occurred',
                status: response.status,
            };
            throw new ApiRequestError(error, response.status);
        }

        return data as T;
    } catch (error) {
        if (error instanceof ApiRequestError) {
            throw error;
        }

        // Network or other errors
        throw new ApiRequestError({
            message: error instanceof Error ? error.message : 'Network error',
            code: 'NETWORK_ERROR',
        });
    }
}

/**
 * API Client Methods
 */
export const api = {
    /**
     * Create a new menu from uploaded images
     */
    async createMenu(images: File[]): Promise<CreateMenuResponse> {
        const formData = new FormData();
        images.forEach((image, index) => {
            formData.append(`image_${index}`, image);
        });

        const token = getAuthToken();
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/menus`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new ApiRequestError(
                data.error || { message: 'Failed to create menu' },
                response.status
            );
        }

        return response.json();
    },

    /**
     * Get a menu by ID (owner only)
     */
    async getMenu(menuId: string): Promise<Menu> {
        return apiFetch<Menu>(`/menus/${menuId}`);
    },

    /**
     * Update a menu (owner only)
     */
    async updateMenu(menuId: string, menu: Menu): Promise<void> {
        await apiFetch(`/menus/${menuId}`, {
            method: 'PUT',
            body: JSON.stringify(menu),
        });
    },

    /**
     * Publish a menu (owner only)
     */
    async publishMenu(menuId: string): Promise<PublishMenuResponse> {
        return apiFetch<PublishMenuResponse>(`/menus/${menuId}/publish`, {
            method: 'POST',
        });
    },

    /**
     * Get a public menu (published only)
     */
    async getPublicMenu(menuId: string): Promise<Menu> {
        return apiFetch<Menu>(`/public/menus/${menuId}`);
    },
};

/**
 * Helper to check if result is an error
 */
export function isApiError<T>(result: ApiResult<T>): result is { error: ApiError; success: false } {
    return !result.success;
}

export default api;

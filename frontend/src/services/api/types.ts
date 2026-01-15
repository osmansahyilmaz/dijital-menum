/**
 * API Error Types
 */
export interface ApiError {
    message: string;
    code?: string;
    status?: number;
    details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
    data: T;
    success: true;
}

export interface ApiErrorResponse {
    error: ApiError;
    success: false;
}

export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;

/**
 * Menu Types (from menu.schema.json)
 */
export interface MenuItem {
    name: string;
    description?: string;
    price?: number | string | null;
}

export interface MenuCategory {
    name: string;
    items: MenuItem[];
}

export interface MenuTheme {
    primaryColor?: string;
    backgroundColor?: string;
    font?: string;
}

export interface Menu {
    title?: string;
    categories: MenuCategory[];
    theme?: MenuTheme;
    published?: boolean;
    lastUpdated?: string;
}

/**
 * API Request/Response Types
 */
export interface CreateMenuResponse {
    menu_id: string;
    data: Menu;
}

export interface PublishMenuResponse {
    public_url: string;
}

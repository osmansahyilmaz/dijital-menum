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
 * Menu Types (from contracts/menu.schema.v1.json)
 * DO NOT modify without updating the schema version
 */

/** Current schema version - must match schema_version in MenuDataV1 */
export const MENU_SCHEMA_VERSION = 1;

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

/**
 * Menu data structure as stored in menus.data JSONB column
 * This matches contracts/menu.schema.v1.json exactly
 */
export interface MenuDataV1 {
    schema_version: 1;
    title?: string;
    categories: MenuCategory[];
    theme?: MenuTheme;
}

/**
 * Full menu record from database (includes metadata)
 */
export interface MenuRecord {
    id: string;
    user_id: string;
    data: MenuDataV1;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Legacy Menu interface for backward compatibility
 * @deprecated Use MenuDataV1 for new code
 */
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
    data: MenuDataV1;
}

export interface PublishMenuResponse {
    public_url: string;
}

export interface GetMenuResponse {
    menu: MenuRecord;
}

export interface UpdateMenuRequest {
    data: MenuDataV1;
}

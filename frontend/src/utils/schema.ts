import type { MenuDataV1, MenuCategory, MenuItem } from '../services/api/types';
import { MENU_SCHEMA_VERSION } from '../services/api/types';

/**
 * Schema validation errors
 */
export interface SchemaValidationError {
    path: string;
    message: string;
}

export interface SchemaValidationResult {
    valid: boolean;
    errors: SchemaValidationError[];
}

/**
 * Validates menu data against v1 schema
 * This is a runtime validation for frontend use
 */
export function validateMenuDataV1(data: unknown): SchemaValidationResult {
    const errors: SchemaValidationError[] = [];

    if (!data || typeof data !== 'object') {
        return { valid: false, errors: [{ path: '', message: 'Data must be an object' }] };
    }

    const menu = data as Record<string, unknown>;

    // Check schema_version
    if (menu.schema_version !== MENU_SCHEMA_VERSION) {
        errors.push({
            path: 'schema_version',
            message: `schema_version must be ${MENU_SCHEMA_VERSION}`,
        });
    }

    // Check categories
    if (!Array.isArray(menu.categories)) {
        errors.push({ path: 'categories', message: 'categories must be an array' });
    } else {
        menu.categories.forEach((cat, catIndex) => {
            if (!cat || typeof cat !== 'object') {
                errors.push({ path: `categories[${catIndex}]`, message: 'Category must be an object' });
                return;
            }

            const category = cat as Record<string, unknown>;

            // Check category name
            if (typeof category.name !== 'string' || category.name.length < 1) {
                errors.push({
                    path: `categories[${catIndex}].name`,
                    message: 'Category name is required and must be non-empty',
                });
            }

            // Check items
            if (!Array.isArray(category.items)) {
                errors.push({
                    path: `categories[${catIndex}].items`,
                    message: 'Category items must be an array',
                });
            } else {
                (category.items as unknown[]).forEach((item, itemIndex) => {
                    if (!item || typeof item !== 'object') {
                        errors.push({
                            path: `categories[${catIndex}].items[${itemIndex}]`,
                            message: 'Item must be an object',
                        });
                        return;
                    }

                    const menuItem = item as Record<string, unknown>;

                    // Check item name
                    if (typeof menuItem.name !== 'string' || menuItem.name.length < 1) {
                        errors.push({
                            path: `categories[${catIndex}].items[${itemIndex}].name`,
                            message: 'Item name is required and must be non-empty',
                        });
                    }

                    // Check price type if present
                    if (
                        menuItem.price !== undefined &&
                        menuItem.price !== null &&
                        typeof menuItem.price !== 'number' &&
                        typeof menuItem.price !== 'string'
                    ) {
                        errors.push({
                            path: `categories[${catIndex}].items[${itemIndex}].price`,
                            message: 'Price must be number, string, or null',
                        });
                    }
                });
            }
        });
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Creates an empty valid MenuDataV1 structure
 */
export function createEmptyMenuData(title?: string): MenuDataV1 {
    return {
        schema_version: 1,
        title: title || '',
        categories: [],
    };
}

/**
 * Adds a category to menu data
 */
export function addCategory(menu: MenuDataV1, categoryName: string): MenuDataV1 {
    return {
        ...menu,
        categories: [
            ...menu.categories,
            { name: categoryName, items: [] },
        ],
    };
}

/**
 * Adds an item to a category
 */
export function addItemToCategory(
    menu: MenuDataV1,
    categoryIndex: number,
    item: MenuItem
): MenuDataV1 {
    const newCategories = [...menu.categories];
    if (categoryIndex >= 0 && categoryIndex < newCategories.length) {
        newCategories[categoryIndex] = {
            ...newCategories[categoryIndex],
            items: [...newCategories[categoryIndex].items, item],
        };
    }
    return { ...menu, categories: newCategories };
}

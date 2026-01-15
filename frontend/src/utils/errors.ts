import { ApiRequestError } from '../services/api/api';

/**
 * Extract a user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof ApiRequestError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return 'An unexpected error occurred';
}

/**
 * Extract error code if available
 */
export function getErrorCode(error: unknown): string | undefined {
    if (error instanceof ApiRequestError) {
        return error.code;
    }
    return undefined;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
    if (error instanceof ApiRequestError) {
        return error.code === 'NETWORK_ERROR';
    }
    return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
    if (error instanceof ApiRequestError) {
        return error.status === 401 || error.status === 403;
    }
    return false;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
    if (error instanceof ApiRequestError) {
        return error.status === 400 || error.status === 422;
    }
    return false;
}

/**
 * Log error for debugging (can be extended for error tracking services)
 */
export function logError(error: unknown, context?: string): void {
    const message = getErrorMessage(error);
    const code = getErrorCode(error);

    console.error(`[Error${context ? ` - ${context}` : ''}]`, {
        message,
        code,
        error,
    });
}

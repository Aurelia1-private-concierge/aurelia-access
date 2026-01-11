/**
 * Centralized error handling utilities for edge functions
 * Sanitizes error messages to prevent information leakage
 */

// Safe error messages that can be exposed to clients
const SAFE_ERROR_MESSAGES: Record<string, string> = {
  'authentication': 'Authentication required. Please log in and try again.',
  'authorization': 'You do not have permission to perform this action.',
  'not_found': 'The requested resource was not found.',
  'validation': 'Invalid input. Please check your data and try again.',
  'rate_limit': 'Too many requests. Please wait a moment and try again.',
  'conflict': 'This action conflicts with existing data.',
  'server_error': 'An unexpected error occurred. Please try again later.',
  'external_service': 'A third-party service is temporarily unavailable.',
  'timeout': 'The request timed out. Please try again.',
};

export type ErrorType = keyof typeof SAFE_ERROR_MESSAGES;

/**
 * Creates a sanitized error response that hides internal details
 * Logs the full error server-side for debugging
 */
export function createErrorResponse(
  error: unknown,
  errorType: ErrorType = 'server_error',
  statusCode: number = 500,
  context?: string
): Response {
  // Log detailed error server-side for debugging
  console.error(`[${context || 'Edge Function'}] Error:`, {
    type: errorType,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  // Return sanitized message to client
  return new Response(
    JSON.stringify({
      error: SAFE_ERROR_MESSAGES[errorType],
      code: errorType.toUpperCase(),
    }),
    {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Maps common error patterns to safe error types
 */
export function categorizeError(error: unknown): { type: ErrorType; status: number } {
  if (!(error instanceof Error)) {
    return { type: 'server_error', status: 500 };
  }

  const message = error.message.toLowerCase();

  // Authentication errors
  if (message.includes('jwt') || message.includes('token') || message.includes('unauthorized') || message.includes('not authenticated')) {
    return { type: 'authentication', status: 401 };
  }

  // Authorization errors
  if (message.includes('permission') || message.includes('forbidden') || message.includes('not allowed')) {
    return { type: 'authorization', status: 403 };
  }

  // Not found errors
  if (message.includes('not found') || message.includes('does not exist')) {
    return { type: 'not_found', status: 404 };
  }

  // Validation errors
  if (message.includes('invalid') || message.includes('required') || message.includes('must be')) {
    return { type: 'validation', status: 400 };
  }

  // Rate limit errors
  if (message.includes('rate limit') || message.includes('too many')) {
    return { type: 'rate_limit', status: 429 };
  }

  // Conflict errors
  if (message.includes('already exists') || message.includes('duplicate') || message.includes('conflict')) {
    return { type: 'conflict', status: 409 };
  }

  // Timeout errors
  if (message.includes('timeout') || message.includes('timed out')) {
    return { type: 'timeout', status: 504 };
  }

  // Default to server error
  return { type: 'server_error', status: 500 };
}

/**
 * Wraps an async handler with automatic error sanitization
 */
export function withErrorHandling(
  handler: (req: Request) => Promise<Response>,
  context: string
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    try {
      return await handler(req);
    } catch (error) {
      const { type, status } = categorizeError(error);
      return createErrorResponse(error, type, status, context);
    }
  };
}

/**
 * CORS headers helper
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Creates a success response with consistent formatting
 */
export function createSuccessResponse(data: unknown, statusCode: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

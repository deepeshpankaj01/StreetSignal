/**
 * Standardized API Gateway HTTP API response helper
 */

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Api-Key',
};

export function successResponse(statusCode = 200, data = {}, message = 'Success') {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    })
  };
}

export function errorResponse(statusCode = 400, message = 'Bad Request', errors = null) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      success: false,
      message,
      errors: errors || undefined,
      timestamp: new Date().toISOString()
    })
  };
}

export function corsOptionsResponse() {
  return {
    statusCode: 204,
    headers: CORS_HEADERS,
    body: ''
  };
}

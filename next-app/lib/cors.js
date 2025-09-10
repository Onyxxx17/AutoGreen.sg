/**
 * AutoGreen.sg - Secure CORS Configuration
 * 
 * Centralized CORS handling for API routes
 * Only allows requests from trusted domains where the extension operates
 */

// Get allowed origins based on environment
const getAllowedOrigins = () => {
  const origins = [
    // Browser extension origins
    'chrome-extension://*',
    
    // Content script origins (where extension runs)
    'https://foodpanda.sg',
    'https://www.foodpanda.sg',
    'https://foodpanda.com.sg',
    'https://www.foodpanda.com.sg',
    'https://lazada.sg',
    'https://www.lazada.sg',
    'https://lazada.com.sg',
    'https://www.lazada.com.sg',
    'https://checkout.lazada.sg',
    
    // Production website
    'https://autogreen-sg.vercel.app'
  ];
  
  // Add development origins only in development
  if (process.env.NODE_ENV === 'development') {
    origins.push(
      'http://localhost:3000',
      'http://localhost:3001'
    );
  }
  
  return origins;
};

/**
 * Generate CORS headers for a request
 * @param {Request} request - The incoming request object
 * @returns {Object} CORS headers object
 */
export const getCorsHeaders = (request) => {
  const origin = request.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();
  
  // Handle chrome-extension origins (wildcard support)
  const isAllowedOrigin = origin && (
    allowedOrigins.includes(origin) ||
    (origin.startsWith('chrome-extension://') && allowedOrigins.includes('chrome-extension://*'))
  );
  
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
};

/**
 * Handle preflight OPTIONS requests
 * @param {Request} request - The incoming request object
 * @returns {Response} OPTIONS response with CORS headers
 */
export const handleCorsOptions = (request) => {
  const corsHeaders = getCorsHeaders(request);
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
};

/**
 * Create a JSON response with CORS headers
 * @param {Object} data - Response data
 * @param {Object} options - Response options (status, etc.)
 * @param {Request} request - The incoming request object
 * @returns {Response} JSON response with CORS headers
 */
export const corsJsonResponse = (data, options = {}, request) => {
  const corsHeaders = getCorsHeaders(request);
  
  return Response.json(data, {
    ...options,
    headers: {
      ...corsHeaders,
      ...options.headers
    }
  });
};

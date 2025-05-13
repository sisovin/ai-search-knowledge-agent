// Supabase Edge Function Configuration
// Common configuration settings for all edge functions

// Environment variable access with default values
export const config = {
  // API Keys
  EXA_API_KEY: Deno.env.get("EXA_API_KEY") || "",
  
  // Supabase Connection
  SUPABASE_URL: Deno.env.get("SUPABASE_URL") || "",
  SUPABASE_SERVICE_ROLE_KEY: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
  SUPABASE_ANON_KEY: Deno.env.get("SUPABASE_ANON_KEY") || "",
  
  // Rate limiting settings
  CACHE_TTL: parseInt(Deno.env.get("CACHE_TTL") || "3600000"), // 1 hour default
  RATE_LIMIT_WINDOW: parseInt(Deno.env.get("RATE_LIMIT_WINDOW") || "60000"), // 1 minute default
  MAX_REQUESTS_PER_WINDOW: parseInt(Deno.env.get("MAX_REQUESTS_PER_WINDOW") || "5"),
  
  // Security settings
  ALLOWED_ORIGINS: (Deno.env.get("ALLOWED_ORIGINS") || "http://localhost:3000")
    .split(",")
    .map(origin => origin.trim()),
    
  // Logging
  DEBUG_MODE: Deno.env.get("DEBUG_MODE") === "true"
};

// Validate required configs
export function validateConfig() {
  const requiredVars = [
    "EXA_API_KEY",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY"
  ];
  
  for (const varName of requiredVars) {
    if (!config[varName as keyof typeof config]) {
      throw new Error(`Required environment variable ${varName} is missing`);
    }
  }
  
  return true;
}

// Helper to create a Supabase client
export function createSupabaseClient() {
  // Import dynamically to avoid issues with import maps in different environments
  const { createClient } = require("supabase");
  
  return createClient(
    config.SUPABASE_URL,
    config.SUPABASE_SERVICE_ROLE_KEY
  );
}

// CORS headers helper
export function corsHeaders(origin: string) {
  const allowedOrigin = config.ALLOWED_ORIGINS.includes(origin) 
    ? origin 
    : config.ALLOWED_ORIGINS[0];
    
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };
}

// Error response helper
export function errorResponse(message: string, status = 400) {
  return new Response(
    JSON.stringify({
      error: message
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}

// Rate limiting helpers
const RATE_LIMIT_TRACKER = new Map<string, number[]>();

export function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userRequests = RATE_LIMIT_TRACKER.get(userId) || [];
  
  // Filter out requests outside the current window
  const recentRequests = userRequests.filter(timestamp => 
    timestamp > now - config.RATE_LIMIT_WINDOW
  );
  
  // Update the tracker
  RATE_LIMIT_TRACKER.set(userId, recentRequests);
  
  // Check if the user has exceeded the limit
  return recentRequests.length < config.MAX_REQUESTS_PER_WINDOW;
}

export function updateRateLimit(userId: string): void {
  const now = Date.now();
  const userRequests = RATE_LIMIT_TRACKER.get(userId) || [];
  
  // Add the current request timestamp
  userRequests.push(now);
  
  // Update the tracker
  RATE_LIMIT_TRACKER.set(userId, userRequests);
}

// Supabase Edge Function for Exa Search
// Implements rate limiting, caching, and search history
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0'

// Define response types
interface ExaSearchResult {
  id: string;
  url: string;
  title: string;
  content: string;
  score: number;
  published_date?: string;
  author?: string;
  highlights?: {
    content?: {
      text: string;
      ranges: Array<{
        start: number;
        end: number;
      }>;
    }[];
  };
}

interface ExaSearchResponse {
  results: ExaSearchResult[];
  total: number;
  next_page_token?: string;
}

// Create a simple in-memory cache for demonstration
// In production, consider using a distributed cache like Redis
const CACHE = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 3600000; // Cache TTL in milliseconds (1 hour)
const RATE_LIMIT_WINDOW = 60000; // Rate limit window in milliseconds (1 minute)
const MAX_REQUESTS_PER_WINDOW = 5; // Max requests per window per user

// Rate limiting tracking
const RATE_LIMIT_TRACKER = new Map<string, number[]>();

// Helper to generate a cache key
const generateCacheKey = (query: string, limit: number): string => {
  return `search:${query}:${limit}`;
};

// Helper to check rate limiting
const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userRequests = RATE_LIMIT_TRACKER.get(userId) || [];
  
  // Filter out requests outside the current window
  const recentRequests = userRequests.filter(timestamp => 
    timestamp > now - RATE_LIMIT_WINDOW
  );
  
  // Update the tracker
  RATE_LIMIT_TRACKER.set(userId, recentRequests);
  
  // Check if the user has exceeded the limit
  return recentRequests.length < MAX_REQUESTS_PER_WINDOW;
};

// Helper to record a request for rate limiting
const recordRequest = (userId: string): void => {
  const userRequests = RATE_LIMIT_TRACKER.get(userId) || [];
  userRequests.push(Date.now());
  RATE_LIMIT_TRACKER.set(userId, userRequests);
};

// Handler for the Exa search function
serve(async (req) => {
  // Handle CORS for preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      status: 204,
    });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }

  try {
    // Parse the request body
    const requestData = await req.json();
    const { query, limit = 10, highlight = true } = requestData;

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query parameter is required' }), { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Get environment variables
    const exaApiKey = Deno.env.get('EXA_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!exaApiKey) {
      return new Response(JSON.stringify({ error: 'API configuration error' }), { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Create Supabase client if credentials are available
    let supabase = null;
    if (supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey);
    }

    // Get user ID from the request (via JWT)
    let userId = 'anonymous';
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ') && supabase) {
      const token = authHeader.split(' ')[1];
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          userId = user.id;
        }
      } catch (error) {
        console.error('Error getting user from token:', error);
      }
    }

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Please try again later.' 
      }), { 
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Record this request for rate limiting
    recordRequest(userId);

    // Check cache
    const cacheKey = generateCacheKey(query, limit);
    const cachedResponse = CACHE.get(cacheKey);
    
    if (cachedResponse && (Date.now() - cachedResponse.timestamp) < CACHE_TTL) {
      // Save search to history if Supabase is configured
      if (supabase && userId !== 'anonymous') {
        try {
          await supabase.from('search_history').insert({
            query,
            user_id: userId,
            results: cachedResponse.data.results,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error saving search history:', error);
        }
      }
      
      return new Response(JSON.stringify(cachedResponse.data), { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-Cache': 'HIT',
        }
      });
    }

    // Call the Exa API
    const response = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': exaApiKey,
      },
      body: JSON.stringify({
        query,
        num_results: limit,
        include_domains: [],  // Optional: restrict to specific domains
        exclude_domains: [],  // Optional: exclude specific domains
        use_autoprompt: true, // Optional: let Exa refine the query
        highlighting: highlight,
        text_only: false,     // Optional: set to true to get only text
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch search results', 
        details: errorData 
      }), { 
        status: response.status,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    const data = await response.json() as ExaSearchResponse;
    
    // Save to cache
    CACHE.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    // Save search to history if Supabase is configured
    if (supabase && userId !== 'anonymous') {
      try {
        await supabase.from('search_history').insert({
          query,
          user_id: userId,
          results: data.results,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error saving search history:', error);
      }
    }

    return new Response(JSON.stringify(data), { 
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-Cache': 'MISS',
      }
    });
  } catch (error) {
    console.error('Error processing search request:', error);
    
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
});

// Supabase Edge Function for Exa Scraping
// Implements secure scraping with HTML sanitization, rate limiting, and document storage
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0'
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts'

// Define the interface for the scraped content
interface ScrapedContent {
  title: string;
  content: string;
  url: string;
  html?: string;
  metadata?: {
    author?: string;
    publishedDate?: string;
    siteName?: string;
    description?: string;
    wordCount?: number;
    imageUrl?: string;
  };
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
const generateCacheKey = (url: string): string => {
  return `scrape:${url}`;
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

// Helper to sanitize HTML content
const sanitizeHtml = (html: string): string => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    // Remove potentially dangerous elements
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'applet', 'form', 'input', 'button'];
    
    dangerousTags.forEach(tagName => {
      const elements = doc?.querySelectorAll(tagName);
      if (elements) {
        elements.forEach(el => el.parentNode?.removeChild(el));
      }
    });
    
    // Remove event handlers from all elements
    const allElements = doc?.querySelectorAll("*");
    if (allElements) {
      allElements.forEach(el => {
        const attributes = el.getAttributeNames();
        attributes.forEach(attr => {
          if (attr.startsWith('on')) {
            el.removeAttribute(attr);
          }
        });
      });
    }
    
    return doc?.documentElement.outerHTML || '';
  } catch (error) {
    console.error('Error sanitizing HTML:', error);
    return ''; // Return empty string if sanitization fails
  }
};

// Handler for the Exa scrape function
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
    const { url } = requestData;

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL parameter is required' }), { 
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
    const cacheKey = generateCacheKey(url);
    const cachedResponse = CACHE.get(cacheKey);
    
    if (cachedResponse && (Date.now() - cachedResponse.timestamp) < CACHE_TTL) {
      return new Response(JSON.stringify(cachedResponse.data), { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-Cache': 'HIT',
        }
      });
    }

    // Call the Exa API for scraping
    const response = await fetch('https://api.exa.ai/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': exaApiKey,
      },
      body: JSON.stringify({
        url,
        include_metadata: true,
        extract_text: true,
        extract_html: true, // We want HTML to sanitize it
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle different status codes
      if (response.status === 404) {
        return new Response(JSON.stringify({ error: 'URL not found or cannot be accessed' }), { 
          status: 404,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
      } else if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), { 
          status: 429,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'Failed to scrape content', 
        details: errorData 
      }), { 
        status: response.status,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    const data = await response.json();
    
    // Sanitize HTML if present
    let sanitizedHtml = '';
    if (data.html) {
      sanitizedHtml = sanitizeHtml(data.html);
    }

    // Process and clean the scraped content
    const scrapedContent: ScrapedContent = {
      title: data.metadata?.title || 'Untitled',
      content: data.text || '',
      url: data.url || url,
      html: sanitizedHtml,
      metadata: {
        author: data.metadata?.author,
        publishedDate: data.metadata?.published_date,
        siteName: data.metadata?.site_name,
        description: data.metadata?.description,
        wordCount: data.metadata?.word_count || data.text?.split(/\s+/).length || 0,
        imageUrl: data.metadata?.image,
      }
    };

    // Save to cache
    CACHE.set(cacheKey, {
      data: { success: true, content: scrapedContent },
      timestamp: Date.now(),
    });

    // Save to Supabase if configured and user is authenticated
    if (supabase && userId !== 'anonymous') {
      try {
        // Insert into the documents table
        const { error } = await supabase
          .from('documents')
          .insert([
            {
              title: scrapedContent.title,
              content: scrapedContent.content,
              url: scrapedContent.url,
              user_id: userId,
              metadata: scrapedContent.metadata,
              created_at: new Date().toISOString(),
              // You would need to compute embeddings separately
              // embedding: embeddings,
            }
          ]);
        
        if (error) {
          console.error('Error saving to Supabase:', error);
        }
      } catch (error) {
        console.error('Failed to save to database:', error);
      }
    }

    // Return the processed content
    return new Response(JSON.stringify({
      success: true,
      content: scrapedContent
    }), { 
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-Cache': 'MISS',
      }
    });
  } catch (error) {
    console.error('Error processing scrape request:', error);
    
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
});

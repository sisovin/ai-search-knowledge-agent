/**
 * Exa API Client
 * 
 * A strongly typed client for interacting with the Exa API for web search and content scraping.
 * Implements methods for:
 * - searchAndContents: Search for content with Exa's web search API
 * - scrape: Fetch and extract content from a URL
 */

// Result types for Exa API responses
export interface ExaSearchResult {
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

export interface ExaSearchResponse {
  results: ExaSearchResult[];
  next_page_token?: string;
  total: number;
}

export interface ExaScrapedContent {
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

// Search query options
export interface ExaSearchOptions {
  query: string;
  limit?: number;
  highlight?: boolean;
  useAutoprompt?: boolean;
  includeDomains?: string[];
  excludeDomains?: string[];
}

// Scraping options
export interface ExaScrapeOptions {
  url: string;
  includeMetadata?: boolean;
  extractText?: boolean;
  extractHtml?: boolean;
}

export class ExaClient {
  private apiKey: string;
  private apiEndpoint: string;

  constructor(apiKey?: string, apiEndpoint = 'https://api.exa.ai') {
    // Allow for API key to be passed directly or from env vars
    this.apiKey = apiKey || process.env.EXA_API_KEY || '';
    this.apiEndpoint = apiEndpoint || process.env.EXA_API_ENDPOINT || 'https://api.exa.ai';
    
    if (!this.apiKey) {
      console.warn('Exa API key not provided. API calls will likely fail.');
    }
  }

  /**
   * Search for content using Exa's web search API
   * 
   * @param options Search options
   * @returns Search results
   */
  async searchAndContents(options: ExaSearchOptions): Promise<ExaSearchResponse> {
    if (!this.apiKey) {
      throw new Error('Exa API key is required for search');
    }

    const { query, limit = 10, highlight = true, useAutoprompt = true, includeDomains = [], excludeDomains = [] } = options;

    try {
      const response = await fetch(`${this.apiEndpoint}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify({
          query,
          num_results: limit,
          include_domains: includeDomains,
          exclude_domains: excludeDomains,
          use_autoprompt: useAutoprompt,
          highlighting: highlight,
          text_only: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Exa API error (${response.status}): ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      return data as ExaSearchResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Unexpected error during Exa search: ${String(error)}`);
    }
  }

  /**
   * Scrape content from a URL using Exa's scraping API
   * 
   * @param options Scraping options
   * @returns Scraped content
   */
  async scrape(options: ExaScrapeOptions): Promise<ExaScrapedContent> {
    if (!this.apiKey) {
      throw new Error('Exa API key is required for scraping');
    }

    const { url, includeMetadata = true, extractText = true, extractHtml = false } = options;

    try {
      const response = await fetch(`${this.apiEndpoint}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify({
          url,
          include_metadata: includeMetadata,
          extract_text: extractText,
          extract_html: extractHtml,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Exa API error (${response.status}): ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // Transform the API response into our expected format
      const content: ExaScrapedContent = {
        title: data.metadata?.title || 'Untitled',
        content: data.text || '',
        url: data.url || url,
        html: extractHtml ? data.html : undefined,
        metadata: {
          author: data.metadata?.author,
          publishedDate: data.metadata?.published_date,
          siteName: data.metadata?.site_name,
          description: data.metadata?.description,
          wordCount: data.metadata?.word_count || data.text?.split(/\s+/).length || 0,
          imageUrl: data.metadata?.image,
        },
      };

      return content;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Unexpected error during Exa scraping: ${String(error)}`);
    }
  }
}

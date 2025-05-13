import { NextRequest, NextResponse } from 'next/server';

// Define response types
interface ExaSearchResult {
  id: string;
  url: string;
  title: string;
  content: string;
  score: number;
  published_date?: string;
  author?: string;
}

interface ExaSearchResponse {
  results: ExaSearchResult[];
  total: number;
  next_page_token?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 10, highlights = true } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const exaApiKey = process.env.EXA_API_KEY;
    
    if (!exaApiKey) {
      console.error('EXA_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
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
        highlighting: highlights,
        text_only: false,     // Optional: set to true to get only text
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Exa API error:', errorData);
      
      return NextResponse.json(
        { error: 'Failed to fetch search results', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json() as ExaSearchResponse;
    
    // Log results for debugging (remove in production)
    console.log(`Search for "${query}" returned ${data.results.length} results`);

    // Save search history to database (implement this functionality)
    // await saveSearchToHistory(query, data.results);

    return NextResponse.json({
      results: data.results,
      total: data.total,
      next_page_token: data.next_page_token,
    });
  } catch (error) {
    console.error('Error processing search request:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Rate limiting could be implemented by adding a middleware
// Example:
// export const config = {
//   runtime: 'edge',
//   api: {
//     bodyParser: true,
//     externalResolver: true,
//   },
// };

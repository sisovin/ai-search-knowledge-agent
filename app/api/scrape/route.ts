import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Define the interface for the scraped content
interface ScrapedContent {
  title: string;
  content: string;
  url: string;
  metadata?: {
    author?: string;
    publishedDate?: string;
    siteName?: string;
    description?: string;
    wordCount?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
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
        extract_html: false, // Set to true if you want HTML
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Exa API scraping error:', errorData);
      
      // Handle different status codes
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'URL not found or cannot be accessed' },
          { status: 404 }
        );
      } else if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to scrape content', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Process and clean the scraped content
    const scrapedContent: ScrapedContent = {
      title: data.metadata?.title || 'Untitled',
      content: data.text || data.html || '',
      url: data.url || url,
      metadata: {
        author: data.metadata?.author,
        publishedDate: data.metadata?.published_date,
        siteName: data.metadata?.site_name,
        description: data.metadata?.description,
        wordCount: data.metadata?.word_count || data.text?.split(/\\s+/).length || 0,
      }
    };

    // Save to Supabase if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      try {
        // Insert into the documents table
        const { data: insertedData, error } = await supabase
          .from('documents')
          .insert([
            {
              title: scrapedContent.title,
              content: scrapedContent.content,
              url: scrapedContent.url,
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
    return NextResponse.json({
      success: true,
      content: scrapedContent
    });
  } catch (error) {
    console.error('Error processing scrape request:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

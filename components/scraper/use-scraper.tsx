"use client";

import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface UseScraperOptions {
  onSuccess?: (content: any) => void;
  onError?: (error: Error) => void;
}

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

export function useScraper({ onSuccess, onError }: UseScraperOptions = {}) {
  const [url, setUrl] = useState("");
  const [content, setContent] = useState<ScrapedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const scrapeUrl = async (targetUrl: string) => {
    if (!targetUrl.trim() || isLoading) return;
    
    setUrl(targetUrl);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to scrape content";
        
        // Handle different error status codes
        if (response.status === 404) {
          errorMessage = "URL not found or cannot be accessed";
        } else if (response.status === 429) {
          errorMessage = "Rate limit exceeded. Please try again later.";
        }
        
        try {
          const errorData = await response.json();
          if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch {}
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.content) {
        throw new Error("No content found in the response");
      }
      
      setContent(data.content);
      
      toast({
        title: "Content scraped successfully",
        description: `${data.content.title} - ${data.content.metadata?.wordCount || 0} words`,
      });
      
      if (onSuccess) {
        onSuccess(data.content);
      }
      
      return data.content;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error occurred");
      setError(error);
      setContent(null);
      
      toast({
        title: "Scraping failed",
        description: error.message,
        variant: "destructive",
      });
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearContent = () => {
    setUrl("");
    setContent(null);
    setError(null);
  };

  return {
    url,
    content,
    isLoading,
    error,
    scrapeUrl,
    clearContent,
  };
}

"use client";

import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface UseSearchQueryOptions {
  maxRetries?: number;
  initialQuery?: string;
  onSuccess?: (results: any) => void;
  onError?: (error: Error) => void;
}

export function useSearchQuery({
  maxRetries = 2,
  initialQuery = "",
  onSuccess,
  onError,
}: UseSearchQueryOptions = {}) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const searchWithRetry = async (searchQuery: string, retryCount = 0): Promise<any> => {
    try {
      const response = await fetch("/api/exa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle rate limiting specifically
        if (response.status === 429) {
          toast({
            title: "Rate limit exceeded",
            description: "Please try again in a moment.",
            variant: "destructive",
          });
          throw new Error("Rate limit exceeded");
        }
        
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Handle network errors or other issues
      if (retryCount < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        
        toast({
          title: "Retrying search",
          description: `Attempt ${retryCount + 1} of ${maxRetries + 1}`,
          variant: "default",
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return searchWithRetry(searchQuery, retryCount + 1);
      }
      
      throw error;
    }
  };

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setQuery(searchQuery);
    setIsLoading(true);
    setError(null);

    try {
      const data = await searchWithRetry(searchQuery);
      setResults(data.results || []);
      
      // Store search in history
      try {
        await fetch("/api/search-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            query: searchQuery,
            results: data.results
          }),
        });
      } catch (historyError) {
        console.error("Failed to save search to history:", historyError);
      }
      
      if (onSuccess) {
        onSuccess(data.results);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown search error");
      setError(error);
      setResults(null);
      
      toast({
        title: "Search failed",
        description: error.message || "Failed to complete your search. Please try again.",
        variant: "destructive",
      });
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults(null);
    setError(null);
  };

  return {
    query,
    results,
    isLoading,
    error,
    executeSearch,
    clearSearch,
  };
}

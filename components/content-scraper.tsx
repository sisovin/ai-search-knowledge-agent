"use client";

import { ContentViewer } from "@/components/scraper/content-viewer";
import { UrlInput } from "@/components/scraper/url-input";
import { useScraper } from "@/components/scraper/use-scraper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/toaster";
import { Database, Globe } from "lucide-react";
import { useState } from "react";

interface ContentScraperProps {
  className?: string;
}

export function ContentScraper({ className }: ContentScraperProps) {
  const [isStored, setIsStored] = useState(false);
  
  const {
    content,
    isLoading,
    error,
    scrapeUrl,
    clearContent,
  } = useScraper({
    onSuccess: () => {
      setIsStored(true);
    },
  });

  const handleSubmit = async (url: string) => {
    setIsStored(false);
    try {
      await scrapeUrl(url);
    } catch (err) {
      // Error is handled in useScraper
    }
  };

  return (
    <div className={className}>
      <div className="mb-6">
        <UrlInput
          onSubmit={handleSubmit}
          isLoading={isLoading}
          placeholder="Enter a URL to scrape (e.g., https://example.com/article)"
        />
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {isStored && (
        <Alert className="mb-4">
          <Database className="h-4 w-4" />
          <AlertTitle>Content stored</AlertTitle>
          <AlertDescription>
            This content has been successfully indexed in your knowledge base.
          </AlertDescription>
        </Alert>
      )}

      {content ? (
        <ContentViewer content={content} />
      ) : (
        <div className="text-center py-12 border rounded-md">
          <Globe className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Scrape Web Content</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Enter a URL to scrape content from a website. The content will be
            indexed in your knowledge base for future searches.
          </p>
        </div>
      )}
      
      <Toaster />
    </div>
  );
}

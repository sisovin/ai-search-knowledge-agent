"use client";

import { ResultsDisplay } from "@/components/search/results-display";
import { SearchInput } from "@/components/search/search-input";
import { useSearchQuery } from "@/components/search/use-search-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { FileSearch, History } from "lucide-react";
import { useState } from "react";

interface KnowledgeSearchProps {
  className?: string;
}

export function KnowledgeSearch({ className }: KnowledgeSearchProps) {
  const [activeTab, setActiveTab] = useState<"search" | "history">("search");
  const [searchHistory, setSearchHistory] = useState<{ query: string; timestamp: Date }[]>([]);
  
  const {
    query,
    results,
    isLoading,
    error,
    executeSearch,
    clearSearch,
  } = useSearchQuery({
    onSuccess: (results) => {
      // Add to local search history
      if (query.trim()) {
        setSearchHistory((prev) => [
          { query, timestamp: new Date() },
          ...prev.filter((item) => item.query !== query),
        ].slice(0, 10)); // Keep only 10 most recent
      }
    },
  });

  const handleSearch = async (searchQuery: string) => {
    setActiveTab("search");
    await executeSearch(searchQuery);
  };

  const loadFromHistory = (historyQuery: string) => {
    executeSearch(historyQuery);
  };

  return (
    <div className={className}>
      <div className="mb-6">
        <SearchInput
          onSearch={handleSearch}
          placeholder="Ask anything about your knowledge base..."
          autoFocus
          disabled={isLoading}
        />
        
        {(results || isLoading) && (
          <div className="flex justify-end mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="text-xs"
            >
              Clear results
            </Button>
          </div>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "search" | "history")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="search">
            <FileSearch className="mr-2 h-4 w-4" />
            Search Results
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            Search History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="space-y-4">
          {(results || isLoading) ? (
            <ResultsDisplay
              results={results || []}
              query={query}
              isLoading={isLoading}
            />
          ) : (
            <div className="text-center py-12 border rounded-md">
              <FileSearch className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Search your knowledge base</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                Ask questions, find information, or explore your indexed documents
                using natural language.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="history">
          {searchHistory.length > 0 ? (
            <div className="space-y-2">
              {searchHistory.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 rounded-md border hover:bg-accent cursor-pointer"
                  onClick={() => loadFromHistory(item.query)}
                >
                  <div className="truncate">{item.query}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-md">
              <History className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No search history</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your recent searches will appear here.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <Toaster />
    </div>
  );
}

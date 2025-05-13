"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, FileSearch, FileText, Globe, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [urlToScrape, setUrlToScrape] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Here you would call your Exa API endpoint
    try {
      // const response = await fetch('/api/exa', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ query: searchQuery }),
      // });
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Handle response here
      console.log("Search executed for:", searchQuery);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlToScrape.trim()) return;
    
    setIsScraping(true);
    // Here you would call your scraping API endpoint
    try {
      // const response = await fetch('/api/scrape', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ url: urlToScrape }),
      // });
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Handle response here
      console.log("Scraping executed for:", urlToScrape);
    } catch (error) {
      console.error("Scraping error:", error);
    } finally {
      setIsScraping(false);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">AI Knowledge Agent</h1>
        <p className="text-muted-foreground">
          Search through your knowledge base or add new content by scraping websites.
        </p>
        <Link href="/ui-components" className="text-sm text-primary hover:underline inline-flex items-center mt-2">
          View UI Components Demo
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
            <circle cx="12" cy="12" r="10"/>
            <path d="M16.2 7.8l-2 6.3-6.4 2.1 2-6.3z"/>
          </svg>
        </Link>
      </div>
      
      <Tabs defaultValue="knowledge-search" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="knowledge-search">
            <Search className="mr-2 h-4 w-4" />
            Knowledge Search
          </TabsTrigger>
          <TabsTrigger value="content-scraper">
            <Globe className="mr-2 h-4 w-4" />
            Content Scraper
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="knowledge-search" className="space-y-6">
          <div className="rounded-lg border p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FileSearch className="mr-2 h-5 w-5" />
              Search Your Knowledge Base
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Enter your question to search through your knowledge base using advanced AI.
            </p>
            
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search-query">Search Query</Label>
                <Input 
                  id="search-query"
                  placeholder="What would you like to know?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 flex items-center justify-between text-sm">
              <div className="flex items-center text-muted-foreground">
                <Database className="mr-1 h-4 w-4" />
                <span>Powered by Exa API</span>
              </div>
              <div className="text-muted-foreground">
                <FileText className="mr-1 h-4 w-4 inline" />
                <span>0 documents indexed</span>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="content-scraper" className="space-y-6">
          <div className="rounded-lg border p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Add Content to Knowledge Base
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Enter a URL to scrape and add the content to your knowledge base.
            </p>
            
            <form onSubmit={handleScrape} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url-to-scrape">Website URL</Label>
                <Input 
                  id="url-to-scrape"
                  placeholder="https://example.com/article"
                  value={urlToScrape}
                  onChange={(e) => setUrlToScrape(e.target.value)}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isScraping || !urlToScrape.trim()}
              >
                {isScraping ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Scraping...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Scrape Content
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-sm text-muted-foreground">
              <p className="flex items-center">
                <Database className="mr-1 h-4 w-4" />
                <span>Content will be processed and stored in Supabase</span>
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

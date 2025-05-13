// Shared utility functions for Supabase Edge Functions
import { config } from './config.ts';

// Simple in-memory cache implementation
// In production, consider using a distributed cache like Redis
const CACHE = new Map<string, { data: any, timestamp: number }>();

// Cache helpers
export function getCachedData(key: string): any | null {
  const cached = CACHE.get(key);
  if (!cached) return null;
  
  // Check if cached data is still valid
  if (Date.now() - cached.timestamp > config.CACHE_TTL) {
    CACHE.delete(key);
    return null;
  }
  
  return cached.data;
}

export function setCachedData(key: string, data: any): void {
  CACHE.set(key, {
    data,
    timestamp: Date.now()
  });
}

// HTML sanitization
export function sanitizeHtml(html: string): string {
  // Basic sanitization - in production use a proper library
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
}

// Extract metadata from HTML
export function extractMetadata(html: string, url: string) {
  try {
    // Import dynamically to avoid issues with import maps in different environments
    const { DOMParser } = require('deno-dom');
    
    const doc = new DOMParser().parseFromString(html, 'text/html');
    if (!doc) return {};
    
    // Extract metadata
    const title = doc.querySelector('title')?.textContent || '';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const author = doc.querySelector('meta[name="author"]')?.getAttribute('content') || '';
    
    // Get Open Graph data
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
    const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
    const ogSiteName = doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
    
    // Get publish date
    const publishedDate = 
      doc.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ||
      doc.querySelector('time')?.getAttribute('datetime') ||
      '';
    
    // Count words in the body text
    const bodyText = doc.querySelector('body')?.textContent || '';
    const wordCount = bodyText.trim().split(/\s+/).length;
    
    return {
      title: ogTitle || title,
      description: ogDescription || description,
      author,
      publishedDate,
      siteName: ogSiteName || new URL(url).hostname.replace('www.', ''),
      wordCount,
      imageUrl: ogImage ? new URL(ogImage, url).toString() : undefined
    };
  } catch (error) {
    console.error("Error extracting metadata:", error);
    return {};
  }
}

// Extract main content from HTML
export function extractMainContent(html: string): string {
  try {
    // Import dynamically to avoid issues with import maps in different environments
    const { DOMParser } = require('deno-dom');
    
    const doc = new DOMParser().parseFromString(html, 'text/html');
    if (!doc) return '';
    
    // Common content containers
    const contentSelectors = [
      'article',
      'main',
      '.content',
      '.post',
      '.entry',
      '.article',
      '#content',
      '#main',
      '.post-content'
    ];
    
    // Try to find the main content container
    let mainContent = '';
    for (const selector of contentSelectors) {
      const element = doc.querySelector(selector);
      if (element && element.textContent.length > 500) {
        mainContent = element.innerHTML;
        break;
      }
    }
    
    // If no content container found, use body
    if (!mainContent) {
      mainContent = doc.querySelector('body')?.innerHTML || '';
      
      // Remove navigation, header, footer, sidebar, etc.
      const removeSelectors = [
        'nav', 'header', 'footer', 'aside', '.sidebar', '.menu', '.navigation',
        '.nav', '.footer', '.header', '.comments', '.advertisement', '.ad'
      ];
      
      for (const selector of removeSelectors) {
        const elements = doc.querySelectorAll(selector);
        for (const element of elements) {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
        }
      }
    }
    
    return sanitizeHtml(mainContent);
  } catch (error) {
    console.error("Error extracting main content:", error);
    return '';
  }
}

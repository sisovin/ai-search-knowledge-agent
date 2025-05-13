import { ContentScraper } from '@/components/content-scraper';
import { useScraper } from '@/components/scraper/use-scraper';
import { ThemeProvider } from '@/components/theme-provider';
import type { Meta, StoryObj } from '@storybook/react';

// Mock the useScraper hook
jest.mock('@/components/scraper/use-scraper', () => ({
  useScraper: jest.fn()
}));

// Sample scraped content for different states
const sampleContent = {
  title: "Understanding Vector Databases for AI Applications",
  content: `
  # Understanding Vector Databases for AI Applications
  
  Vector databases have become an essential component in modern AI systems, particularly for applications involving similarity search, recommendation systems, and natural language processing.
  
  ## What is a Vector Database?
  
  A vector database is a specialized database designed to store, manage, and query high-dimensional vectors efficiently. These vectors are numerical representations of data objects like text, images, or audio.
  
  ## Key Features
  
  - **Similarity Search**: Finding items that are semantically similar
  - **Efficient Indexing**: Algorithms like HNSW or IVF for fast retrieval
  - **Scalability**: Handling billions of vectors across distributed systems
  - **Multi-modal Support**: Working with vectors from different data types
  
  ## Popular Vector Databases
  
  - Pinecone
  - Weaviate
  - Milvus
  - Qdrant
  - Chroma
  
  Vector databases are the backbone of many AI-powered search and retrieval systems, allowing for semantic understanding beyond simple keyword matching.
  `,
  url: "https://example.com/vector-databases",
  metadata: {
    author: "Dr. Jane Smith",
    publishedDate: "2025-01-25T08:30:00Z",
    siteName: "AI Research Blog",
    description: "A comprehensive guide to vector databases and their applications in modern AI systems",
    wordCount: 842
  }
};

const meta: Meta<typeof ContentScraper> = {
  title: 'Components/ContentScraper',
  component: ContentScraper,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="container mx-auto p-6">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ContentScraper>;

export const Default: Story = {
  args: {
    className: 'w-full max-w-4xl mx-auto',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default state of the ContentScraper component with no URL entered.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock default state - no scraping performed yet
      (useScraper as jest.Mock).mockReturnValue({
        content: null,
        isLoading: false,
        error: null,
        scrapeUrl: async () => {},
        clearContent: () => {},
      });
      return <Story />;
    }
  ],
};

export const Loading: Story = {
  args: {
    className: 'w-full max-w-4xl mx-auto',
  },
  parameters: {
    docs: {
      description: {
        story: 'ContentScraper component in loading state while scraping content from a URL.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock loading state
      (useScraper as jest.Mock).mockReturnValue({
        url: 'https://example.com/vector-databases',
        content: null,
        isLoading: true,
        error: null,
        scrapeUrl: async () => {},
        clearContent: () => {},
      });
      return <Story />;
    }
  ],
};

export const WithScrapedContent: Story = {
  args: {
    className: 'w-full max-w-4xl mx-auto',
  },
  parameters: {
    docs: {
      description: {
        story: 'ContentScraper component displaying successfully scraped content.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock with scraped content
      (useScraper as jest.Mock).mockReturnValue({
        url: 'https://example.com/vector-databases',
        content: sampleContent,
        isLoading: false,
        error: null,
        scrapeUrl: async () => {},
        clearContent: () => {},
      });
      return <Story />;
    }
  ],
};

export const WithScrapedAndStored: Story = {
  args: {
    className: 'w-full max-w-4xl mx-auto',
  },
  parameters: {
    docs: {
      description: {
        story: 'ContentScraper component displaying scraped content that has been stored in the knowledge base.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock with scraped content and stored state
      const Component = () => {
        const props = {
          className: 'w-full max-w-4xl mx-auto',
        };
        
        // Mock the useState for isStored to be true
        const originalReact = require('react');
        const mockUseState = jest.spyOn(originalReact, 'useState');
        mockUseState.mockImplementationOnce(() => [true, jest.fn()]);
        
        // Mock the hook
        (useScraper as jest.Mock).mockReturnValue({
          url: 'https://example.com/vector-databases',
          content: sampleContent,
          isLoading: false,
          error: null,
          scrapeUrl: async () => {},
          clearContent: () => {},
        });
        
        return <ContentScraper {...props} />;
      };
      
      return <Component />;
    }
  ],
};

export const WithError: Story = {
  args: {
    className: 'w-full max-w-4xl mx-auto',
  },
  parameters: {
    docs: {
      description: {
        story: 'ContentScraper component with an error while trying to scrape content.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock error state
      (useScraper as jest.Mock).mockReturnValue({
        url: 'https://example.com/invalid-url',
        content: null,
        isLoading: false,
        error: new Error('Failed to scrape content. The URL might be invalid or the site blocks scraping.'),
        scrapeUrl: async () => {},
        clearContent: () => {},
      });
      return <Story />;
    }
  ],
};

export const InvalidURLError: Story = {
  args: {
    className: 'w-full max-w-4xl mx-auto',
  },
  parameters: {
    docs: {
      description: {
        story: 'ContentScraper component with an invalid URL error.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock invalid URL error
      (useScraper as jest.Mock).mockReturnValue({
        url: 'invalid-url-format',
        content: null,
        isLoading: false,
        error: new Error('Invalid URL format. Please enter a valid URL including http:// or https://.'),
        scrapeUrl: async () => {},
        clearContent: () => {},
      });
      return <Story />;
    }
  ],
};

export const RateLimitedError: Story = {
  args: {
    className: 'w-full max-w-4xl mx-auto',
  },
  parameters: {
    docs: {
      description: {
        story: 'ContentScraper component with a rate limit error.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock rate limit error
      (useScraper as jest.Mock).mockReturnValue({
        url: 'https://example.com/rate-limited',
        content: null,
        isLoading: false,
        error: new Error('Rate limit exceeded. Please try again later.'),
        scrapeUrl: async () => {},
        clearContent: () => {},
      });
      return <Story />;
    }
  ],
};

export const DarkMode: Story = {
  args: {
    className: 'w-full max-w-4xl mx-auto',
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'ContentScraper component in dark mode with scraped content.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock with scraped content
      (useScraper as jest.Mock).mockReturnValue({
        url: 'https://example.com/vector-databases',
        content: sampleContent,
        isLoading: false,
        error: null,
        scrapeUrl: async () => {},
        clearContent: () => {},
      });
      return (
        <div className="dark">
          <Story />
        </div>
      );
    }
  ],
};

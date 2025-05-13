import { KnowledgeSearch } from '@/components/knowledge-search';
import { useSearchQuery } from '@/components/search/use-search-query';
import { ThemeProvider } from '@/components/theme-provider';
import type { Meta, StoryObj } from '@storybook/react';

// Mock the useSearchQuery hook
jest.mock('@/components/search/use-search-query', () => ({
  useSearchQuery: jest.fn()
}));

// Sample search results for different states
const sampleResults = [
  {
    id: '1',
    url: 'https://example.com/article-1',
    title: 'Understanding AI Search Algorithms',
    content: 'AI search algorithms are fundamental to modern search engines. They utilize techniques like semantic understanding, vectorization, and ranking to provide relevant results.',
    score: 0.92,
    author: 'John Doe',
    published_date: '2025-01-15',
    highlights: {
      content: [
        {
          text: 'AI search algorithms are fundamental to modern search engines. They utilize techniques like semantic understanding, vectorization, and ranking to provide relevant results.',
          ranges: [{ start: 0, end: 27 }, { start: 53, end: 72 }]
        }
      ]
    }
  },
  {
    id: '2',
    url: 'https://example.com/article-2',
    title: 'Vector Database Implementation Guide',
    content: 'Implementing vector databases for efficient similarity search is crucial for AI applications. This guide covers indexing strategies, distance metrics, and scaling considerations.',
    score: 0.85,
    author: 'Jane Smith',
    published_date: '2025-02-10'
  },
  {
    id: '3',
    url: 'https://example.com/article-3',
    title: 'Knowledge Graphs for Information Retrieval',
    content: 'Knowledge graphs connect entities and concepts to enhance search capabilities beyond keyword matching, enabling more intelligent information retrieval.',
    score: 0.78,
    author: 'Robert Johnson',
    published_date: '2025-03-05'
  }
];

const meta: Meta<typeof KnowledgeSearch> = {
  title: 'Components/KnowledgeSearch',
  component: KnowledgeSearch,
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
type Story = StoryObj<typeof KnowledgeSearch>;

export const Default: Story = {
  args: {
    className: 'w-full max-w-4xl mx-auto',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default state of the KnowledgeSearch component with empty search.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock default state - no search performed yet
      (useSearchQuery as jest.Mock).mockReturnValue({
        query: '',
        results: null,
        isLoading: false,
        error: null,
        executeSearch: async () => {},
        clearSearch: () => {},
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
        story: 'KnowledgeSearch component in loading state while waiting for search results.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock loading state
      (useSearchQuery as jest.Mock).mockReturnValue({
        query: 'artificial intelligence search',
        results: null,
        isLoading: true,
        error: null,
        executeSearch: async () => {},
        clearSearch: () => {},
      });
      return <Story />;
    }
  ],
};

export const WithResults: Story = {
  args: {
    className: 'w-full max-w-4xl mx-auto',
  },
  parameters: {
    docs: {
      description: {
        story: 'KnowledgeSearch component displaying search results.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock with results
      (useSearchQuery as jest.Mock).mockReturnValue({
        query: 'artificial intelligence search',
        results: sampleResults,
        isLoading: false,
        error: null,
        executeSearch: async () => {},
        clearSearch: () => {},
      });
      return <Story />;
    }
  ],
};

export const WithNoResults: Story = {
  args: {
    className: 'w-full max-w-4xl mx-auto',
  },
  parameters: {
    docs: {
      description: {
        story: 'KnowledgeSearch component with a search that returned no results.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock with empty results
      (useSearchQuery as jest.Mock).mockReturnValue({
        query: 'highly specific query with no matches',
        results: [],
        isLoading: false,
        error: null,
        executeSearch: async () => {},
        clearSearch: () => {},
      });
      return <Story />;
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
        story: 'KnowledgeSearch component with an error state.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock with error
      (useSearchQuery as jest.Mock).mockReturnValue({
        query: 'error causing query',
        results: null,
        isLoading: false,
        error: new Error('Failed to fetch search results. Please try again.'),
        executeSearch: async () => {},
        clearSearch: () => {},
      });
      return <Story />;
    }
  ],
};

export const WithHistory: Story = {
  args: {
    className: 'w-full max-w-4xl mx-auto',
  },
  parameters: {
    docs: {
      description: {
        story: 'KnowledgeSearch component showing search history tab.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock with results and history
      const mockedUseSearchQuery = useSearchQuery as jest.Mock;
      mockedUseSearchQuery.mockReturnValue({
        query: 'artificial intelligence',
        results: sampleResults,
        isLoading: false,
        error: null,
        executeSearch: async () => {},
        clearSearch: () => {},
      });
      
      // We'll modify the component to show history tab
      return (
        <div>
          <style jsx global>{`
            /* Force history tab to be active for this story */
            [data-value="history"] {
              [data-state="active"] {
                background-color: hsl(var(--background));
                color: hsl(var(--foreground));
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              [data-orientation="horizontal"] {
                border-bottom: 2px solid hsl(var(--primary));
              }
            }
          `}</style>
          <Story />
        </div>
      );
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
        story: 'KnowledgeSearch component in dark mode with search results.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock with results
      (useSearchQuery as jest.Mock).mockReturnValue({
        query: 'artificial intelligence search',
        results: sampleResults,
        isLoading: false,
        error: null,
        executeSearch: async () => {},
        clearSearch: () => {},
      });
      return (
        <div className="dark">
          <Story />
        </div>
      );
    }
  ],
};

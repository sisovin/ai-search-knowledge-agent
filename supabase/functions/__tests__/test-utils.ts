// Testing utilities for Supabase Edge Functions
import {
  assertEquals,
  assertExists,
  assertMatch,
} from "https://deno.land/std@0.177.0/testing/asserts.ts";
import {
  MockDb,
  MockSupabaseClient,
} from "https://deno.land/x/supabase_edge_test/mod.ts";
import { FetchMock } from "https://deno.land/x/mock_fetch@0.1.0/mod.ts";

// Mock Environment Variables
const mockEnvVars = {
  EXA_API_KEY: "test-exa-api-key",
  SUPABASE_URL: "https://test.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
  SUPABASE_ANON_KEY: "test-anon-key",
  CACHE_TTL: "3600000",
  RATE_LIMIT_WINDOW: "60000",
  MAX_REQUESTS_PER_WINDOW: "5",
  ALLOWED_ORIGINS: "http://localhost:3000",
  DEBUG_MODE: "false",
};

// Setup environment for tests
export function setupTestEnvironment() {
  // Set mock environment variables
  Object.entries(mockEnvVars).forEach(([key, value]) => {
    Deno.env.set(key, value);
  });
}

// Create a mock Supabase client
export function createMockSupabaseClient() {
  const mockDb = new MockDb();
  const mockSupabaseClient = new MockSupabaseClient(mockDb);
  return { mockDb, mockSupabaseClient };
}

// Create mock fetch for external API calls
export function setupMockFetch() {
  const fetchMock = new FetchMock();
  globalThis.fetch = fetchMock.fetch;
  return fetchMock;
}

// Mock Exa search API response
export const mockExaSearchResponse = {
  results: [
    {
      id: "test-result-1",
      url: "https://example.com/article1",
      title: "Test Article 1",
      content: "This is test content for article 1.",
      score: 0.92,
      highlights: {
        content: [
          {
            text: "This is test content for article 1.",
            ranges: [{ start: 0, end: 11 }],
          },
        ],
      },
    },
    {
      id: "test-result-2",
      url: "https://example.com/article2",
      title: "Test Article 2",
      content: "This is test content for article 2.",
      score: 0.85,
    },
  ],
  total: 2,
};

// Helper to create mock request object
export function createMockRequest(body, headers = {}) {
  return new Request("http://localhost/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

// Clean up mocks
export function cleanupMocks() {
  // Reset environment variables
  Object.keys(mockEnvVars).forEach((key) => {
    Deno.env.delete(key);
  });

  // Reset fetch
  globalThis.fetch = fetch;
}

export { assertEquals, assertExists, assertMatch };

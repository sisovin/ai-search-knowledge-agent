// Integration tests for exa-search edge function
import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.177.0/testing/asserts.ts";
import {
  setupTestEnvironment,
  createMockSupabaseClient,
  setupMockFetch,
  mockExaSearchResponse,
  createMockRequest,
  cleanupMocks,
} from "../__tests__/test-utils.ts";

// Import the handler function - we'll need to modify the original function to make it more testable
import { default as handler } from "../exa-search/index.ts";

Deno.test({
  name: "exa-search: should return search results successfully",
  async fn() {
    // Setup test environment
    setupTestEnvironment();
    const { mockSupabaseClient } = createMockSupabaseClient();
    const fetchMock = setupMockFetch();

    // Mock Exa API response
    fetchMock.mock("https://api.exa.ai/search", {
      status: 200,
      body: JSON.stringify(mockExaSearchResponse),
    });

    // Create a mock request
    const req = createMockRequest(
      {
        query: "test query",
        limit: 5,
        highlight: true,
      },
      {
        Authorization: "Bearer test-token",
      }
    );

    try {
      // Call the handler
      const response = await handler(req);

      // Verify response
      assertEquals(response.status, 200);
      const responseData = await response.json();
      assertExists(responseData.results);
      assertEquals(responseData.results.length, 2);
      assertEquals(responseData.total, 2);

      // Verify first result
      const firstResult = responseData.results[0];
      assertEquals(firstResult.id, "test-result-1");
      assertEquals(firstResult.url, "https://example.com/article1");
      assertEquals(firstResult.title, "Test Article 1");
    } finally {
      cleanupMocks();
    }
  },
});

Deno.test({
  name: "exa-search: should return 400 for missing query",
  async fn() {
    // Setup test environment
    setupTestEnvironment();

    // Create a mock request with missing query
    const req = createMockRequest({
      limit: 5,
      highlight: true,
    });

    try {
      // Call the handler
      const response = await handler(req);

      // Verify response
      assertEquals(response.status, 400);
      const responseData = await response.json();
      assertEquals(responseData.error, "Query parameter is required");
    } finally {
      cleanupMocks();
    }
  },
});

Deno.test({
  name: "exa-search: should handle API errors gracefully",
  async fn() {
    // Setup test environment
    setupTestEnvironment();
    const fetchMock = setupMockFetch();

    // Mock Exa API error response
    fetchMock.mock("https://api.exa.ai/search", {
      status: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    });

    // Create a mock request
    const req = createMockRequest({
      query: "test query",
      limit: 5,
    });

    try {
      // Call the handler
      const response = await handler(req);

      // Verify response
      assertEquals(response.status, 502);
      const responseData = await response.json();
      assertExists(responseData.error);
    } finally {
      cleanupMocks();
    }
  },
});

Deno.test({
  name: "exa-search: should save search history for authenticated users",
  async fn() {
    // Setup test environment
    setupTestEnvironment();
    const { mockDb, mockSupabaseClient } = createMockSupabaseClient();
    const fetchMock = setupMockFetch();

    // Mock Exa API response
    fetchMock.mock("https://api.exa.ai/search", {
      status: 200,
      body: JSON.stringify(mockExaSearchResponse),
    });

    // Mock Supabase auth.getUser
    mockSupabaseClient.auth.getUser = async () => ({
      data: {
        user: { id: "test-user-id", email: "test@example.com" },
      },
      error: null,
    });

    // Mock Supabase from.insert
    let insertedData = null;
    mockSupabaseClient.from = (table) => {
      assertEquals(table, "search_history");
      return {
        insert: async (data) => {
          insertedData = data;
          return { data, error: null };
        },
      };
    };

    // Create a mock request with auth token
    const req = createMockRequest(
      {
        query: "test query",
        limit: 5,
      },
      {
        Authorization: "Bearer test-token",
      }
    );

    try {
      // Call the handler
      const response = await handler(req);

      // Verify response
      assertEquals(response.status, 200);

      // Verify search history was saved
      assertExists(insertedData);
      assertEquals(insertedData.query, "test query");
      assertEquals(insertedData.user_id, "test-user-id");
    } finally {
      cleanupMocks();
    }
  },
});

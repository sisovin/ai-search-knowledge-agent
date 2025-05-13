// Integration tests for exa-scrape edge function
import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.177.0/testing/asserts.ts";
import {
  setupTestEnvironment,
  createMockSupabaseClient,
  setupMockFetch,
  createMockRequest,
  cleanupMocks,
} from "../__tests__/test-utils.ts";

// Import the handler function - we'll need to modify the original function to make it more testable
import { default as handler } from "../exa-scrape/index.ts";

// Mock scraped content response
const mockScrapedContent = {
  title: "Test Article",
  content:
    "This is test content for an article. It contains useful information.",
  url: "https://example.com/article",
  html: "<html><head><title>Test Article</title></head><body><h1>Test Article</h1><p>This is test content for an article. It contains useful information.</p></body></html>",
  metadata: {
    author: "Test Author",
    publishedDate: "2025-05-01",
    siteName: "Example Site",
    description: "Test article description",
    wordCount: 42,
    imageUrl: "https://example.com/image.jpg",
  },
};

Deno.test({
  name: "exa-scrape: should scrape content successfully",
  async fn() {
    // Setup test environment
    setupTestEnvironment();
    const { mockSupabaseClient } = createMockSupabaseClient();
    const fetchMock = setupMockFetch();

    // Mock Exa API/direct fetch response for url content
    fetchMock.mock("https://example.com/article", {
      status: 200,
      body: mockScrapedContent.html,
      headers: { "Content-Type": "text/html" },
    });

    // Create a mock request
    const req = createMockRequest(
      {
        url: "https://example.com/article",
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

      assertExists(responseData.title);
      assertEquals(responseData.url, "https://example.com/article");
      assertExists(responseData.content);
    } finally {
      cleanupMocks();
    }
  },
});

Deno.test({
  name: "exa-scrape: should return 400 for missing url",
  async fn() {
    // Setup test environment
    setupTestEnvironment();

    // Create a mock request with missing url
    const req = createMockRequest({
      someOtherParam: "value",
    });

    try {
      // Call the handler
      const response = await handler(req);

      // Verify response
      assertEquals(response.status, 400);
      const responseData = await response.json();
      assertEquals(responseData.error, "URL parameter is required");
    } finally {
      cleanupMocks();
    }
  },
});

Deno.test({
  name: "exa-scrape: should handle invalid URLs",
  async fn() {
    // Setup test environment
    setupTestEnvironment();

    // Create a mock request with invalid URL
    const req = createMockRequest({
      url: "not-a-valid-url",
    });

    try {
      // Call the handler
      const response = await handler(req);

      // Verify response
      assertEquals(response.status, 400);
      const responseData = await response.json();
      assertExists(responseData.error);
    } finally {
      cleanupMocks();
    }
  },
});

Deno.test({
  name: "exa-scrape: should handle fetch errors gracefully",
  async fn() {
    // Setup test environment
    setupTestEnvironment();
    const fetchMock = setupMockFetch();

    // Mock fetch error response
    fetchMock.mock("https://example.com/error-article", {
      status: 404,
      body: "Not found",
    });

    // Create a mock request
    const req = createMockRequest({
      url: "https://example.com/error-article",
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
  name: "exa-scrape: should sanitize HTML content",
  async fn() {
    // Setup test environment
    setupTestEnvironment();
    const fetchMock = setupMockFetch();

    // Create HTML with potentially malicious content
    const unsafeHtml = `
      <html>
        <head><title>Test Page</title></head>
        <body>
          <h1>Safe Content</h1>
          <p>This is safe content.</p>
          <script>alert('XSS attack!');</script>
          <iframe src="https://malicious-site.com"></iframe>
          <div onclick="runMaliciousCode()">Click me</div>
        </body>
      </html>
    `;

    // Mock response with unsafe HTML
    fetchMock.mock("https://example.com/unsafe", {
      status: 200,
      body: unsafeHtml,
      headers: { "Content-Type": "text/html" },
    });

    // Create a mock request
    const req = createMockRequest({
      url: "https://example.com/unsafe",
    });

    try {
      // Call the handler
      const response = await handler(req);

      // Verify response
      assertEquals(response.status, 200);
      const responseData = await response.json();

      // Check that HTML was sanitized
      assertExists(responseData.html);
      assertEquals(responseData.html.includes("<script>"), false);
      assertEquals(responseData.html.includes("<iframe"), false);
      assertEquals(responseData.html.includes("onclick="), false);
    } finally {
      cleanupMocks();
    }
  },
});

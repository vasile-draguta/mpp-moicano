// Test setup file for Bun
// This file is preloaded before tests run

// Global test setup

// Mocking the Response global used by Next.js
class MockResponse {
  static json(data: unknown, init?: ResponseInit) {
    return {
      data,
      init,
    };
  }
}

// Override the global Response constructor
// @ts-expect-error - Overriding for test purposes
globalThis.Response = MockResponse;

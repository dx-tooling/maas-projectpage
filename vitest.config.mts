/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true, // Use Jest-compatible globals (describe, it, expect, vi)
    environment: "jsdom", // Use jsdom for DOM testing
    setupFiles: ["./tests/setup.ts"], // Add setup file to handle JSDOM issues
    coverage: {
      provider: "v8", // Use V8 for coverage
      reporter: ["text", "json", "html"], // Coverage reporters
    },
  },
});

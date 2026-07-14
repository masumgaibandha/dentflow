import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Satisfies config/env.ts's zod validation (which runs at import time and
    // process.exit(1)s on failure) before any test file imports the app.
    // MONGODB_URI's value is never actually used to connect - tests connect
    // mongoose directly to an in-memory mongodb-memory-server instance
    // instead of calling connectToDatabase().
    env: {
      NODE_ENV: "test",
      PORT: "4000",
      MONGODB_URI: "mongodb://127.0.0.1:27017/dentflow-test-placeholder",
      CORS_ORIGIN: "http://localhost:3000",
      JWT_SECRET: "test-jwt-secret-at-least-32-characters-long",
      JWT_EXPIRES_IN: "7d",
    },
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});

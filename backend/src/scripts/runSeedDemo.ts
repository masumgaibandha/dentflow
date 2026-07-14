import mongoose from "mongoose";
import { connectToDatabase } from "../config/db";
import { seedDemo } from "./seedDemo";

// The CLI entry point behind `npm run seed:demo`. Deliberately thin: all the
// actual upsert logic lives in seedDemo.ts so it can be exercised directly
// against mongodb-memory-server in tests, without a real connect/disconnect
// cycle. This file only owns the parts that only make sense for a one-shot
// CLI run - connecting, logging, and always closing the connection after.
async function main(): Promise<void> {
  // connectToDatabase() transitively imports config/env, which validates
  // MONGODB_URI (and everything else) at import time and exits with a clear,
  // controlled error if it's missing - no separate check needed here.
  await connectToDatabase();

  const result = await seedDemo();

  console.log("[seed:demo] Demo clinic seeded successfully:");
  for (const entry of result.log) {
    console.log(`  - ${entry.entity}: ${entry.action}`);
  }
  console.log("[seed:demo] Done.");
}

main()
  .catch((error: unknown) => {
    console.error("[seed:demo] Failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

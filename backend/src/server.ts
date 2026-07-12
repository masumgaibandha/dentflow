import { createApp } from "./app";
import { connectToDatabase } from "./config/db";
import { env } from "./config/env";

async function start(): Promise<void> {
  await connectToDatabase();

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`[server] Listening on http://localhost:${env.PORT}`);
  });
}

start().catch((error: unknown) => {
  console.error("[server] Failed to start:", error);
  process.exit(1);
});

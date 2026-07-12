import mongoose from "mongoose";
import { env } from "./env";

let cachedConnection: Promise<typeof mongoose> | null = null;

/**
 * Reuses the same connection across invocations (required on Vercel's
 * serverless functions, where a fresh module scope can otherwise open a
 * new connection per request and exhaust Atlas's connection limit).
 */
export function connectToDatabase(): Promise<typeof mongoose> {
  if (cachedConnection) {
    return cachedConnection;
  }

  mongoose.set("strictQuery", true);

  cachedConnection = mongoose
    .connect(env.MONGODB_URI)
    .then((connection) => {
      console.log("[db] MongoDB connected");
      return connection;
    })
    .catch((error) => {
      cachedConnection = null;
      throw error;
    });

  return cachedConnection;
}

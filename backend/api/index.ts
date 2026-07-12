import type { IncomingMessage, ServerResponse } from "http";
import { createApp } from "../src/app";
import { connectToDatabase } from "../src/config/db";

const app = createApp();

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  await connectToDatabase();
  app(req, res);
}

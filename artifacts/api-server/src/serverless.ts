// @ts-nocheck
import app from "./app";
import { seedIfEmpty } from "./lib/seed";

let seedPromise: Promise<void> | null = null;

function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = seedIfEmpty().catch((err) => {
      console.error("Seed failed:", err);
    });
  }
  return seedPromise;
}

export default async function handler(req, res) {
  await ensureSeeded();
  return app(req, res);
}

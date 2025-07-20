import { QdrantClient } from "@qdrant/js-client-rest";

const QDRANT_URL = process.env.QDRANT_URL;

if (!QDRANT_URL) throw new Error('Missing Qdrant URL');

export const qdrantClient = new QdrantClient({
  url: QDRANT_URL,
});

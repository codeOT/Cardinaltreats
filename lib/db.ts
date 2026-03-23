import { MongoClient, type Db, ServerApiVersion } from "mongodb";

const uri    = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || "cardinaltreats";

if (!uri) throw new Error("MONGODB_URI is not defined");

// ── Global cache to survive Next.js hot reloads in dev ────────────────────────
// Without this, every hot reload creates a new MongoClient and the old one's
// connections are never closed, quickly hitting Atlas M0's connection limit.
declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
  // eslint-disable-next-line no-var
  var _mongoDb:     Db | undefined;
}

let client: MongoClient;
let db:     Db;

if (process.env.NODE_ENV === "development") {
  // In dev, reuse the cached client across hot reloads
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri, {
      serverApi: {
        version:           ServerApiVersion.v1,
        strict:            true,
        deprecationErrors: true,
      },
    });
  }
  client = global._mongoClient;
} else {
  // In production each instance gets its own client (normal behaviour)
  client = new MongoClient(uri, {
    serverApi: {
      version:           ServerApiVersion.v1,
      strict:            true,
      deprecationErrors: true,
    },
  });
}

export async function getDb(): Promise<Db> {
  if (global._mongoDb) return global._mongoDb;

  await client.connect();
  db = client.db(dbName);

  if (process.env.NODE_ENV === "development") {
    global._mongoDb = db;
  }

  return db;
}

export async function getCollection<
  TSchema extends object = Record<string, unknown>
>(name: string) {
  const database = await getDb();
  return database.collection<TSchema>(name);
}
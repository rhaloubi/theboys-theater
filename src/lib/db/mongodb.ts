import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const CONNECT_OPTIONS = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 10000,
} as const;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export function isMongoConnectionError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return (
    err.name === "MongooseServerSelectionError" ||
    err.name === "MongoServerSelectionError" ||
    err.message.includes("Could not connect to any servers") ||
    err.message.includes("MongoDB Atlas")
  );
}

export function resetDbConnectionCache(): void {
  cached.conn = null;
  cached.promise = null;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, CONNECT_OPTIONS)
      .catch((err) => {
        resetDbConnectionCache();
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    resetDbConnectionCache();
    throw err;
  }
}

export function isDBConfigured(): boolean {
  return Boolean(MONGODB_URI);
}

import { EventEmitter } from "events";
EventEmitter.defaultMaxListeners = 20;

import mongoose, { Mongoose } from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables.");
}

/**
 * Define a global interface for our cached Mongoose connection.
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Augment the NodeJS global type with our mongooseCache property.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

/**
 * Retrieve or create the global mongooseCache.
 */
function getGlobalCache(): MongooseCache {
  if (!global.mongooseCache) {
    global.mongooseCache = { conn: null, promise: null };
  }
  return global.mongooseCache;
}

export async function connect() {
  const cached = getGlobalCache();

  // If there's already a cached connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If there's no existing promise, create one with pooling enabled
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI as string, {
      // Setting the maximum number of connections in the pool
      maxPoolSize: 10,
    }).then((mongooseInstance) => mongooseInstance);
  }

  try {
    cached.conn = await cached.promise;
    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("MongoDB connected...");
    });

    connection.on("error", (err) => {
      console.error(
        "MongoDB connection error. Please make sure MongoDB is running.",
        err
      );
      process.exit();
    });

    return cached.conn;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit();
  }
}
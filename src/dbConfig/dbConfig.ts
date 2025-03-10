import { EventEmitter } from "events";
EventEmitter.defaultMaxListeners = 20;

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables.");
}

// Cache the connection in a global variable to avoid multiple connections
let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connect() {
  // Return the cached connection if it exists
  if (cached.conn) {
    return cached.conn;
  }

  // If there's no cached promise, create one
  if (!cached.promise) {
    const opts = {
      // Add any specific options if needed, e.g. useNewUrlParser, useUnifiedTopology, etc.
    };
    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      return mongoose;
    });
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

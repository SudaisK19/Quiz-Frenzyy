import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

export async function connect() {
  try {
    console.log("MONGO_URI:", process.env.MONGO_URI); // Debug log
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables.");
    }

    await mongoose.connect(process.env.MONGO_URI); // Connect to MongoDB
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
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit();
  }
}

/* MongoDB & Mongoose connection */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

console.log("MONGO URI:", process.env.MONGO_URI);
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

/** @type {typeof mongoose | undefined} */
export let dbInstance = undefined;

const connectDB = async (retries = 5, delay = 5000) => {
  try {
    // console.log(`${process.env.MONGODB_URI}/${DB_NAME}`);
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    dbInstance = connectionInstance;
    console.log(
      `\n☘️  MongoDB Connected! Db host: ${connectionInstance.connection.host}\n`
    );
  } catch (error) {
    console.log("MongoDB connection error: ", error);
    if (retries > 0) {
      console.log(`Retrying connection in ${delay / 1000} seconds...`);
      setTimeout(() => connectDB(retries - 1, delay), delay);
    } else {
      console.error("Failed to connect to MongoDB after multiple attempts");
      process.exit(1); // Exit the process if unable to connect
    }
  }
};

export default connectDB;

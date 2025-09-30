import mongoose from "mongoose";

let isConnected = false; // Track connection state

export const connectDB = async (): Promise<void> => {
  if (isConnected) {
    console.log("⚡ Using existing MongoDB connection");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI as string);

    isConnected = db.connections?.[0]?.readyState === 1;

    if (isConnected) {
      console.log(
        `✅ New MongoDB connection established: ${db.connection.host}`
      );
    }
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (!isConnected) return;

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("🛑 MongoDB connection closed");
  } catch (error) {
    console.error("❌ Error while disconnecting from MongoDB:", error);
  }
};

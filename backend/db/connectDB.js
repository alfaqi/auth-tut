import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to database:", connection.connection.host);
    console.log("Database connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

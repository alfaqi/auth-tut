import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./db/connectDB.ts";
import authRoutes from "./routes/auth.routes.ts";
import passwordlessRoutes from "./routes/passwordless.routes.ts";
import path from "path";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const __dirname = path.resolve();

// middlewares
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json()); // to parse json data from JSON payloads
app.use(cookieParser()); // allows us to paser incoming cookies

app.use("/api/auth", authRoutes);
app.use("/api/login", passwordlessRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.relative(__dirname, "/frontend/dist/index.html"));
  });
}

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});

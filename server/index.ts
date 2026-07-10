import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import tasksRouter from "./routes/tasks.ts";
import authRouter from "./routes/auth.ts";
import { errorHandler } from "./middleware/errorHandler.ts";
import pool from "./db.ts";

dotenv.config();

const logFile = path.resolve(process.cwd(), "server/request.log");
const requestLog = (message: string) => {
  fs.appendFileSync(logFile, `${new Date().toISOString()} ${message}\n`);
};

const app = express();
app.use(cors());
app.use((req, res, next) => {
  const msg = `Incoming request: ${req.method} ${req.path} content-type=${req.headers["content-type"]}`;
  console.log(msg);
  requestLog(msg);
  next();
});
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/tasks", tasksRouter);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await pool.query("SELECT 1");
    app.listen(PORT, () => {
      console.log(`Task API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
};

startServer();

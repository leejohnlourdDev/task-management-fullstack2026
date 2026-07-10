import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import fs from "fs";
import jwt from "jsonwebtoken";
import pool from "../db.ts";
import { ApiError } from "../utils/apiError.ts";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.ts";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

const debugLog = (message: string) => {
  fs.appendFileSync("server/auth-debug.log", `${new Date().toISOString()} ${message}\n`);
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bodyString = JSON.stringify(req.body);
    console.log("Auth register request body:", req.body);
    debugLog(`register body=${bodyString}`);
    const { name, email, password } = req.body as Record<string, unknown>;

    if (typeof name !== "string" || name.trim() === "") {
      throw new ApiError(400, "Name is required.");
    }
    if (typeof email !== "string" || email.trim() === "") {
      throw new ApiError(400, "Email is required.");
    }
    if (typeof password !== "string" || password.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters.");
    }

    const [existing] = await pool.query<RowDataPacket[]>("SELECT id FROM users WHERE email = ?", [email.trim()]);
    if (existing.length > 0) {
      throw new ApiError(400, "Email already registered.");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name.trim(), email.trim(), passwordHash]
    );

    const userId = result.insertId;
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ id: userId, name: name.trim(), email: email.trim(), token });
  } catch (error) {
    console.error("Register error:", error);
    debugLog(`register error=${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bodyString = JSON.stringify(req.body);
    console.log("Auth login request body:", req.body);
    debugLog(`login body=${bodyString}`);
    const { email, password } = req.body as Record<string, unknown>;

    if (typeof email !== "string" || typeof password !== "string") {
      throw new ApiError(400, "Invalid login credentials.");
    }

    const [rows] = await pool.query<RowDataPacket[]>("SELECT id, name, email, password_hash FROM users WHERE email = ?", [email.trim()]);
    if (rows.length === 0) {
      throw new ApiError(400, "Invalid email or password.");
    }

    const user = rows[0] as { id: number; name: string; email: string; password_hash: string };
    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      throw new ApiError(400, "Invalid email or password.");
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ id: user.id, name: user.name, email: user.email, token });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized.");
    }

    const [rows] = await pool.query<RowDataPacket[]>("SELECT id, name, email FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) {
      throw new ApiError(404, "User not found.");
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

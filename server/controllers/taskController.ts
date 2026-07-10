import type { Request, Response, NextFunction } from "express";
import type { Task } from "../types/task.ts";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../db.ts";
import { ApiError } from "../utils/apiError.ts";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.ts";

const validateTaskPayload = (body: unknown) => {
  if (!body || typeof body !== "object") {
    throw new ApiError(400, "Request body must be a JSON object.");
  }

  const { title, description, completed } = body as Record<string, unknown>;

  if (typeof title !== "string" || title.trim().length === 0) {
    throw new ApiError(400, "Title is required and must be a non-empty string.");
  }

  if (typeof description !== "string") {
    throw new ApiError(400, "Description is required and must be a string.");
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    throw new ApiError(400, "Completed must be a boolean.");
  }

  return {
    title: title.trim(),
    description: description.trim(),
    completed: completed === undefined ? false : completed,
  };
};

export const getAllTasks = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const filter = (req.query.filter as string | undefined)?.toLowerCase();
    let sql = "SELECT id, title, description, completed FROM tasks WHERE user_id = ?";
    const params: Array<string | number> = [userId ?? 0];

    if (filter === "active") {
      sql += " AND completed = ?";
      params.push(1);
    } else if (filter === "inactive") {
      sql += " AND completed = ?";
      params.push(0);
    } else if (filter !== undefined && filter !== "") {
      throw new ApiError(400, "Filter must be 'active' or 'inactive'.");
    }

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized.");
    }

    const { title, description, completed } = validateTaskPayload(req.body);

    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO tasks (user_id, title, description, completed) VALUES (?, ?, ?, ?)",
      [userId, title, description, completed ? 1 : 0]
    );

    const newTask: Task = {
      id: result.insertId,
      title,
      description,
      completed,
    };

    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const id = Number(req.params.id);
    if (!userId) {
      throw new ApiError(401, "Unauthorized.");
    }
    if (Number.isNaN(id)) {
      throw new ApiError(400, "Task id must be a number.");
    }

    const [existingRows] = await pool.query<RowDataPacket[]>(
      "SELECT id, title, description, completed FROM tasks WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existingRows.length === 0) {
      throw new ApiError(404, "Task not found.");
    }

    const update = req.body as Record<string, unknown>;
    const fields: string[] = [];
    const params: Array<string | number> = [];

    if (update.title !== undefined) {
      if (typeof update.title !== "string" || update.title.trim().length === 0) {
        throw new ApiError(400, "Title must be a non-empty string.");
      }
      fields.push("title = ?");
      params.push(update.title.trim());
    }

    if (update.description !== undefined) {
      if (typeof update.description !== "string") {
        throw new ApiError(400, "Description must be a string.");
      }
      fields.push("description = ?");
      params.push(update.description.trim());
    }

    if (update.completed !== undefined) {
      if (typeof update.completed !== "boolean") {
        throw new ApiError(400, "Completed must be a boolean.");
      }
      fields.push("completed = ?");
      params.push(update.completed ? 1 : 0);
    }

    if (fields.length === 0) {
      return res.json(existingRows[0]);
    }

    params.push(id, userId);
    const sql = `UPDATE tasks SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`;
    await pool.execute(sql, params);

    const [updatedRows] = await pool.query<RowDataPacket[]>(
      "SELECT id, title, description, completed FROM tasks WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    res.json(updatedRows[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const id = Number(req.params.id);
    if (!userId) {
      throw new ApiError(401, "Unauthorized.");
    }
    if (Number.isNaN(id)) {
      throw new ApiError(400, "Task id must be a number.");
    }

    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM tasks WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (result.affectedRows === 0) {
      throw new ApiError(404, "Task not found.");
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

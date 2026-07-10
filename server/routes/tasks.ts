import { Router } from "express";
import * as taskController from "../controllers/taskController.ts";
import { authenticate } from "../middleware/authMiddleware.ts";

const router = Router();

router.use(authenticate);
router.get("/", taskController.getAllTasks);
router.post("/", taskController.createTask);
router.patch("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

export default router;

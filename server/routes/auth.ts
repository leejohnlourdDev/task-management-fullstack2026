import { Router } from "express";
import * as authController from "../controllers/authController.ts";
import { authenticate } from "../middleware/authMiddleware.ts";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", authenticate, authController.getProfile);

export default router;

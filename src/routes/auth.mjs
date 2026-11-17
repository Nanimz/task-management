import { Router } from "express";
import authController from "../controllers/auth.mjs";
import authMiddleware from "../middlewares/auth.mjs";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authMiddleware.authenticate, authController.getMe);

export default router;

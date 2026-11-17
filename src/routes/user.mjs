import { Router } from "express";
import authMiddleware from "../middlewares/auth.mjs";
import authController from "../controllers/auth.mjs";
import userController from "../controllers/user.mjs";

const router = Router();
router.use(authMiddleware.authenticate);
router.get("/me", authController.getMe);
router.patch("/me", userController.updateUserProfile);

export default router;

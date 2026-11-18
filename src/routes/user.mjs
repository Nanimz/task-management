import { Router } from "express";
import authMiddleware from "../middlewares/auth.mjs";
import userController from "../controllers/user.mjs";

const router = Router();
router.use(authMiddleware.authenticate);
router.get("/me", userController.getMe);
router.patch("/me", userController.updateUserProfile);
router.patch("/me/password", userController.updateUserPassword);

export default router;

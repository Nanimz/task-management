import { Router } from "express";
import authMiddleware from "../middlewares/auth.mjs";
import authController from "../controllers/auth.mjs";
import userController from "../controllers/user.mjs";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authMiddleware.authenticate, authController.getMe);
router.patch(
  "/me",
  authMiddleware.authenticate,
  userController.updateUserProfile,
);
export default router;

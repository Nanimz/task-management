import { Router } from "express";
import authMiddleware from "../middlewares/auth.mjs";
import taskController from "../controllers/task.mjs";

const router = Router();

router.use(authMiddleware.authenticate);

router.post("/", taskController.createTask);

export default router;

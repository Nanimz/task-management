import { Route } from "express";
import authMiddleware from "../middlewares/auth.mjs";
import taskController from "../controllers/task.mjs";

const router = Route();

router.use(authMiddleware.authenticate);

router.post("/", taskController.createTask);

export default router;

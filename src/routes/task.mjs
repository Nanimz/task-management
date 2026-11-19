import { Router } from "express";
import authMiddleware from "../middlewares/auth.mjs";
import taskController from "../controllers/task.mjs";

const router = Router();

router.use(authMiddleware.authenticate);

router.post("/", taskController.createTask);
router.get("/", taskController.getTasks);
router.get("/:id", taskController.getTaskById);
router.patch("/:id", taskController.updateTaskDetail);
router.delete("/:id", taskController.removeTask);

export default router;

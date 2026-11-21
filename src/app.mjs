import express from "express";
import authRoutes from "./routes/auth.mjs";
import userRoutes from "./routes/user.mjs";
import taskRoutes from "./routes/task.mjs";

export const app = express();
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tasks", taskRoutes);

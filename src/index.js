import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth.mjs";

const app = express();
app.use(express.json());
app.use("/api/v1/auth", authRoutes);

app.listen(3000, () => console.log("Server berjalan di port 3000"));

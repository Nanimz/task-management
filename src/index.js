import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth.mjs";

const app = express();
app.use(express.json());
app.use("/api/v1/auth", authRoutes);

app.listen(process.env.PORT, () => console.log("Server berjalan di port 3000"));

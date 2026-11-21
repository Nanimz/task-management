import "dotenv/config";
import { app } from "./app.mjs";

const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));

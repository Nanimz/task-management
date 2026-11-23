import db from "../src/config/database.mjs";

beforeAll(async () => {
  await db.query("SELECT 1");

  console.log("Testing database connected");
});

afterAll(async () => {
  await db.end();
});

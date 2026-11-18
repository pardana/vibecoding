import { defineConfig } from "drizzle-kit";

const host = process.env.DB_HOST || "127.0.0.1";
const port = process.env.DB_PORT || "3306";
const user = process.env.DB_USER || "root";
const password = process.env.DB_PASSWORD ? `:${process.env.DB_PASSWORD}` : "";
const database = process.env.DB_NAME || "vibecoding";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: `mysql://${user}${password}@${host}:${port}/${database}`,
  },
});

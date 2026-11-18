import { Elysia } from "elysia";
import { db } from "./config/database";
import { sql } from "drizzle-orm";
import { usersRoute } from "./routes/users-route";

const port = Number(process.env.PORT) || 3000;

const app = new Elysia()
  .get("/", () => ({
    message: "ElysiaJS + Drizzle + MySQL API",
    status: "running",
  }))
  .get("/health", async () => {
    try {
      await db.execute(sql`SELECT 1`);
      return { status: "healthy", database: "connected" };
    } catch (error) {
      return { status: "unhealthy", database: "disconnected" };
    }
  })
  .group("/api", (app) => app.use(usersRoute))
  .listen(port);

console.log(`🦊 Server is running at http://${app.server?.hostname}:${app.server?.port}`);

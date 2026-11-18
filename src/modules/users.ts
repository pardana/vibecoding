import { Elysia } from "elysia";
import { db } from "../config/database";
import { users } from "../db/schema";

const userModule = new Elysia({ prefix: "/users" })
  .get("/", async () => {
    const allUsers = await db.select().from(users);
    return allUsers;
  });

export { userModule };

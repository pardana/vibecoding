import { Elysia, t } from "elysia";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from "../services/users-services";

export const usersRoute = new Elysia({ prefix: "/users" })
  .post(
    "/",
    async ({ body, set }) => {
      const data = await registerUser(body);

      set.status = 201;

      return {
        status: "201",
        message: "Data user berhasil dibuat!",
        data,
      };
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .post(
    "/login",
    async ({ body, set }) => {
      try {
        const { token } = await loginUser(body);

        return {
          data: token,
        };
      } catch (error: any) {
        set.status = 401;
        return {
          message: error.message || "Email atau password salah",
        };
      }
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .get("/current", async ({ headers, set }) => {
    const authHeader = headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    const token = authHeader.substring(7).trim();

    try {
      const user = await getCurrentUser(token);
      return {
        data: user,
      };
    } catch (error) {
      set.status = 401;
      return { message: "Unauthorized" };
    }
  })
  .delete("/logout", async ({ headers, set }) => {
    const authHeader = headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    const token = authHeader.substring(7).trim();

    try {
      await logoutUser(token);
      return {
        data: "OK",
      };
    } catch (error) {
      set.status = 401;
      return { message: "Unauthorized" };
    }
  });

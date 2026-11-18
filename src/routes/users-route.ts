import { Elysia, t } from "elysia";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from "../services/users-services";
import { UnauthorizedError } from "../errors/auth-error";

export const usersRoute = new Elysia({ prefix: "/users" })
  .derive({ as: "scoped" }, ({ headers }) => {
    const authHeader = headers["authorization"];
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7).trim()
        : null;

    return { token };
  })
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
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          set.status = 401;
          return { message: error.message };
        }
        set.status = 500;
        return { message: "Internal Server Error" };
      }
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .get("/current", async ({ token, set }) => {
    if (!token) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    try {
      const user = await getCurrentUser(token);
      return {
        data: user,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        set.status = 401;
        return { message: error.message };
      }
      set.status = 500;
      return { message: "Internal Server Error" };
    }
  })
  .delete("/logout", async ({ token, set }) => {
    if (!token) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    try {
      await logoutUser(token);
      return {
        data: "OK",
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        set.status = 401;
        return { message: error.message };
      }
      set.status = 500;
      return { message: "Internal Server Error" };
    }
  });

import { eq } from "drizzle-orm";
import { db } from "../config/database";
import { users, sessions } from "../db/schema";
import { UnauthorizedError } from "../errors/auth-error";

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export async function registerUser(input: RegisterUserInput) {
  const hashedPassword = await Bun.password.hash(input.password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  await db.insert(users).values({
    name: input.name,
    email: input.email,
    password: hashedPassword,
  });

  return {
    name: input.name,
    email: input.email,
  };
}

export async function loginUser(input: LoginUserInput) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (!user) {
    throw new UnauthorizedError("Email atau password salah");
  }

  const isPasswordValid = await Bun.password.verify(
    input.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new UnauthorizedError("Email atau password salah");
  }

  const token = crypto.randomUUID();

  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  return {
    token,
  };
}

export async function getCurrentUser(token: string) {
  const [result] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      created_at: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .limit(1);

  if (!result) {
    throw new UnauthorizedError("Unauthorized");
  }

  return result;
}

export async function logoutUser(token: string) {
  const [result] = await db
    .delete(sessions)
    .where(eq(sessions.token, token));

  if (result.affectedRows === 0) {
    throw new UnauthorizedError("Unauthorized");
  }

  return "OK";
}

import { api, APIError } from "encore.dev/api";
import db from "../db";
import { RegisterRequest, User } from "./types";
import * as bcrypt from 'bcrypt';

// Register creates a new user account
export const register = api<RegisterRequest, User>(
  { expose: true, method: "POST", path: "/auth/register" },
  async (req) => {
    // Check if user already exists
    const existingUser = await db.queryRow`
      SELECT id FROM users WHERE email = ${req.email}
    `;

    if (existingUser) {
      throw APIError.alreadyExists("Email đã được sử dụng");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(req.password, 10);

    // Create user
    const userRow = await db.queryRow<{
      id: number;
      email: string;
      role: string;
      created_at: Date;
    }>`
      INSERT INTO users (email, password_hash, role)
      VALUES (${req.email}, ${passwordHash}, ${req.role})
      RETURNING id, email, role, created_at
    `;

    if (!userRow) {
      throw APIError.internal("Không thể tạo tài khoản");
    }

    return {
      id: userRow.id,
      email: userRow.email,
      role: userRow.role as any,
      created_at: userRow.created_at,
    };
  }
);

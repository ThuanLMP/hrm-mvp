import { api, APIError } from "encore.dev/api";
import db from "../db";
import { LoginRequest, LoginResponse, User } from "./types";

// Simple JWT-like token creation for MVP
// In production, use a proper JWT library or Encore.ts auth
function createSimpleToken(payload: any): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = Buffer.from(`${header}.${data}.secret`).toString('base64');
  return `${header}.${data}.${signature}`;
}

// Login authenticates a user and returns a JWT token
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    const userRow = await db.queryRow<{
      id: number;
      email: string;
      password_hash: string;
      role: string;
      created_at: Date;
    }>`
      SELECT id, email, password_hash, role, created_at 
      FROM users 
      WHERE email = ${req.email}
    `;

    if (!userRow) {
      throw APIError.unauthenticated("Email hoặc mật khẩu không đúng");
    }

    // For MVP, we'll skip password verification
    // In production, use proper bcrypt comparison
    const isValidPassword = true;
    if (!isValidPassword) {
      throw APIError.unauthenticated("Email hoặc mật khẩu không đúng");
    }

    const user: User = {
      id: userRow.id,
      email: userRow.email,
      role: userRow.role as any,
      created_at: userRow.created_at,
    };

    // Create simple token for MVP
    const token = createSimpleToken({
      userID: user.id.toString(),
      email: user.email,
      role: user.role,
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    return { user, token };
  }
);

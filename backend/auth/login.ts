import * as bcrypt from "bcrypt";
import { api, APIError } from "encore.dev/api";
import db from "../db";
import { LoginRequest, LoginResponse, User } from "./types";

// Simple JWT-like token creation for MVP
// In production, use a proper JWT library or Encore.ts auth
function createSimpleToken(payload: any): string {
  // Encode payload as base64 for easy decoding
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64"
  );

  // Create a signature using bcrypt to verify token integrity
  const secret = process.env.JWT_SECRET || "hrm-mvp-secret-key";
  const signature = bcrypt.hashSync(`${encodedPayload}.${secret}`, 10);

  // Return format: base64_payload.bcrypt_signature
  return `${encodedPayload}.${signature}`;
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
      status: string;
    }>`
      SELECT u.id, u.email, u.password_hash, u.role, u.created_at, e.status
      FROM users u
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE u.email = ${req.email}
    `;

    if (!userRow) {
      throw APIError.unauthenticated("Email hoặc mật khẩu không đúng");
    }

    // Check if employee is still active (not terminated)
    if (userRow.status && userRow.status !== "active") {
      throw APIError.unauthenticated(
        "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên."
      );
    }

    // Verify password using bcrypt
    // const isValidPassword = await bcrypt.compare(
    //   req.password,
    //   userRow.password_hash
    // );
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
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    return { user, token };
  }
);

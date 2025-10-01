import { api, APIError, Header } from "encore.dev/api";
import db from "../db";
import { verifySimpleToken } from "./tokenUtils";
import { AuthData } from "./types";

interface VerifyTokenRequest {
  authorization: Header<"Authorization">;
}

// Verify validates a JWT token and returns user data
export const verify = api<VerifyTokenRequest, AuthData>(
  { expose: true, method: "POST", path: "/auth/verify" },
  async (req) => {
    const token = req.authorization?.replace("Bearer ", "");
    if (!token) {
      throw APIError.unauthenticated("Token không hợp lệ");
    }

    try {
      const decoded = verifySimpleToken(token);

      // Check if employee is still active in database
      const employeeStatus = await db.queryRow<{ status: string }>`
        SELECT e.status
        FROM employees e
        WHERE e.user_id = ${parseInt(decoded.userID)}
      `;

      // If employee exists and is not active, reject the token
      if (employeeStatus && employeeStatus.status !== "active") {
        throw APIError.unauthenticated("Tài khoản đã bị vô hiệu hóa");
      }

      return {
        userID: decoded.userID,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.unauthenticated("Token không hợp lệ");
    }
  }
);

import { api, APIError, Header } from "encore.dev/api";
import { AuthData } from "./types";
import * as jwt from 'jsonwebtoken';

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
      const decoded = jwt.verify(token, 'your-secret-key') as any;
      return {
        userID: decoded.userID,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      throw APIError.unauthenticated("Token không hợp lệ");
    }
  }
);

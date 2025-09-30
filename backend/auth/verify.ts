import { api, APIError, Header } from "encore.dev/api";
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

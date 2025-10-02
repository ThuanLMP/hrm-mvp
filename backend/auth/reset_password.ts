import * as bcrypt from "bcrypt";
import { api, APIError, Header } from "encore.dev/api";
import db from "../db";
import { verifySimpleToken } from "./tokenUtils";

interface ResetPasswordRequest {
  user_id: number;
  new_password: string;
  authorization: Header<"Authorization">;
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// Reset password for a user (admin only)
export const resetPassword = api<ResetPasswordRequest, ResetPasswordResponse>(
  { expose: true, method: "POST", path: "/auth/reset-password" },
  async (req) => {
    const { authorization, ...requestData } = req;
    const token = authorization?.replace("Bearer ", "");

    if (!token) {
      throw APIError.unauthenticated("Token không hợp lệ");
    }

    let user;
    try {
      user = verifySimpleToken(token);
    } catch (error) {
      throw APIError.unauthenticated("Token không hợp lệ");
    }

    // Only admin can reset passwords
    if (user.role !== "admin") {
      throw APIError.permissionDenied("Chỉ admin mới có thể reset mật khẩu");
    }

    // Validate input
    if (!requestData.user_id || !requestData.new_password) {
      throw APIError.invalidArgument("user_id và new_password là bắt buộc");
    }

    if (requestData.new_password.length < 6) {
      throw APIError.invalidArgument("Mật khẩu mới phải có ít nhất 6 ký tự");
    }

    // Check if user exists
    const existingUser = await db.queryRow`
      SELECT id, email FROM users WHERE id = ${requestData.user_id}
    `;

    if (!existingUser) {
      throw APIError.notFound("Không tìm thấy người dùng");
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(requestData.new_password, 10);

    // Update password
    await db.exec`
      UPDATE users 
      SET password_hash = ${passwordHash}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${requestData.user_id}
    `;

    return {
      success: true,
      message: "Mật khẩu đã được reset thành công",
    };
  }
);

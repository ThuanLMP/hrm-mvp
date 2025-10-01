import { api, APIError, Header } from "encore.dev/api";
import { verifySimpleToken } from "../auth/tokenUtils";
import db from "../db";

interface RejectBonusRequest {
  id: number;
  rejectionReason: string;
  authorization: Header<"Authorization">;
}

interface RejectResponse {
  success: boolean;
}

export const reject = api<RejectBonusRequest, RejectResponse>(
  { expose: true, method: "POST", path: "/bonuses/:id/reject" },
  async (req) => {
    const { id, rejectionReason, authorization } = req;

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

    if (user.role !== "admin" && user.role !== "manager") {
      throw APIError.permissionDenied(
        "Only admins and manager can reject bonuses"
      );
    }

    // Check if bonus exists and is pending
    const bonus = await db.queryRow`
      SELECT status FROM bonuses WHERE id = ${id}
    `;
    if (!bonus) {
      throw APIError.notFound("Bonus not found");
    }
    if (bonus.status !== "pending") {
      throw APIError.failedPrecondition("Bonus is not pending approval");
    }

    await db.exec`
      UPDATE bonuses 
      SET 
        status = 'rejected',
        rejection_reason = ${rejectionReason},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    return { success: true };
  }
);

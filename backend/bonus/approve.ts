import { api, APIError, Header } from "encore.dev/api";
import db from "../db";
import { verifySimpleToken } from "../auth/tokenUtils";

interface ApproveBonusRequest {
  id: number;
  approvedBy: number;
  authorization: Header<"Authorization">;
}

interface ApproveResponse {
  success: boolean;
}

export const approve = api<ApproveBonusRequest, ApproveResponse>(
  { expose: true, method: "POST", path: "/bonuses/:id/approve" },
  async (req) => {
    const { id, approvedBy, authorization } = req;
    
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
    
    if (user.role !== 'admin' && user.role !== 'hr') {
      throw APIError.permissionDenied("Only admins and HR can approve bonuses");
    }

    // Check if bonus exists and is pending
    const bonus = await db.queryRow`
      SELECT status FROM bonuses WHERE id = ${id}
    `;
    if (!bonus) {
      throw APIError.notFound("Bonus not found");
    }
    if (bonus.status !== 'pending') {
      throw APIError.failedPrecondition("Bonus is not pending approval");
    }

    await db.exec`
      UPDATE bonuses 
      SET 
        status = 'approved',
        approved_by = ${approvedBy},
        approved_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    return { success: true };
  }
);
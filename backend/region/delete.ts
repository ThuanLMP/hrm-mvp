import { api, APIError, Header } from "encore.dev/api";
import db from "../db";
import { verifySimpleToken } from "../auth/tokenUtils";

interface DeleteRegionRequest {
  id: number;
  authorization: Header<"Authorization">;
}

interface DeleteRegionResponse {
  success: boolean;
}

export const deleteRegion = api<DeleteRegionRequest, DeleteRegionResponse>(
  { expose: true, method: "DELETE", path: "/regions/:id" },
  async ({ id, authorization }) => {
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
    
    if (user.role !== 'admin') {
      throw APIError.permissionDenied("Only admins can delete regions");
    }

    const result = await db.queryRow`
      DELETE FROM regions 
      WHERE id = ${id}
      RETURNING id
    `;

    if (!result) {
      throw APIError.notFound("Region not found");
    }

    return { success: true };
  }
);
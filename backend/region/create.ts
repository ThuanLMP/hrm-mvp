import { api, APIError, Header } from "encore.dev/api";
import db from "../db";
import { CreateRegionRequest, Region } from "./types";
import { verifySimpleToken } from "../auth/tokenUtils";

interface CreateRegionRequestWithAuth extends CreateRegionRequest {
  authorization: Header<"Authorization">;
}

export const create = api<CreateRegionRequestWithAuth, Region>(
  { expose: true, method: "POST", path: "/regions" },
  async (req) => {
    const token = req.authorization?.replace("Bearer ", "");
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
      throw APIError.permissionDenied("Only admins can create regions");
    }

    const { name, code, description, timezone = 'Asia/Ho_Chi_Minh' } = req;

    try {
      const region = await db.queryRow<Region>`
        INSERT INTO regions (name, code, description, timezone, updated_at)
        VALUES (${name}, ${code}, ${description}, ${timezone}, CURRENT_TIMESTAMP)
        RETURNING 
          id,
          name,
          code,
          description,
          timezone,
          is_active as "isActive",
          created_at as "createdAt",
          updated_at as "updatedAt"
      `;

      if (!region) {
        throw new Error("Failed to create region");
      }

      return region;
    } catch (error: any) {
      if (error.code === '23505') {
        if (error.detail?.includes('name')) {
          throw new Error("Region name already exists");
        }
        if (error.detail?.includes('code')) {
          throw new Error("Region code already exists");
        }
      }
      throw error;
    }
  }
);
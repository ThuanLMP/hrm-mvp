import { api, APIError, Header } from "encore.dev/api";
import db from "../db";
import { UpdateRegionRequest, Region } from "./types";
import { verifySimpleToken } from "../auth/tokenUtils";

interface UpdateRegionRequestWithAuth extends UpdateRegionRequest {
  id: number;
  authorization: Header<"Authorization">;
}

export const update = api<UpdateRegionRequestWithAuth, Region>(
  { expose: true, method: "PUT", path: "/regions/:id" },
  async (req) => {
    const { id, authorization, ...updateData } = req;
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
      throw APIError.permissionDenied("Only admins can update regions");
    }

    if (!updateData.name && !updateData.code && !updateData.description && updateData.timezone === undefined && updateData.isActive === undefined) {
      throw APIError.failedPrecondition("No fields to update");
    }

    try {
      const region = await db.queryRow<Region>`
        UPDATE regions 
        SET 
          name = COALESCE(${updateData.name}, name),
          code = COALESCE(${updateData.code}, code),
          description = COALESCE(${updateData.description}, description),
          timezone = COALESCE(${updateData.timezone}, timezone),
          is_active = COALESCE(${updateData.isActive}, is_active),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
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
        throw APIError.notFound("Region not found");
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
import { api } from "encore.dev/api";
import db from "../db";
import { Region } from "./types";

interface GetRegionRequest {
  id: number;
}

export const get = api<GetRegionRequest, Region>(
  { expose: true, method: "GET", path: "/regions/:id" },
  async ({ id }) => {
    const region = await db.queryRow<Region>`
      SELECT 
        id,
        name,
        code,
        description,
        timezone,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM regions 
      WHERE id = ${id}
    `;

    if (!region) {
      throw new Error("Region not found");
    }

    return region;
  }
);
import { api } from "encore.dev/api";
import db from "../db";
import { Region } from "./types";

interface ListRegionsResponse {
  regions: Region[];
}

export const list = api<void, ListRegionsResponse>(
  { expose: true, method: "GET", path: "/regions" },
  async () => {
    const regions = await db.queryAll<Region>`
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
      ORDER BY name ASC
    `;

    return { regions };
  }
);
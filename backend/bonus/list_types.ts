import { api } from "encore.dev/api";
import db from "../db";
import { ListBonusTypesResponse, BonusType } from "./types";

export const listBonusTypes = api(
  { expose: true, method: "GET", path: "/bonus/types" },
  async (): Promise<ListBonusTypesResponse> => {
    const bonusTypes = await db.queryAll<BonusType>`
      SELECT 
        id,
        name,
        description,
        icon,
        color,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM bonus_types 
      WHERE is_active = true
      ORDER BY name ASC
    `;

    return { bonusTypes };
  }
);
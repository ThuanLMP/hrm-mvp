import { api } from "encore.dev/api";
import db from "../db";
import { ListCategoriesResponse, TrainingCategory } from "./types";

export const listCategories = api(
  { expose: true, method: "GET", path: "/training/categories" },
  async (): Promise<ListCategoriesResponse> => {
    const categories = await db.queryAll<TrainingCategory>`
      SELECT 
        id,
        name,
        description,
        icon,
        color,
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM training_categories 
      WHERE is_active = true
      ORDER BY name ASC
    `;

    return { categories };
  }
);
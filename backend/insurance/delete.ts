import { api } from "encore.dev/api";
import db from "../db";

interface DeleteInsuranceRequest {
  id: string;
}

export const remove = api(
  { method: "DELETE", path: "/insurance/:id", expose: true },
  async ({ id }: DeleteInsuranceRequest): Promise<{ success: boolean }> => {
    const result = await db.queryRow<{id: string}>`
      DELETE FROM insurance_records WHERE id = ${id} RETURNING id
    `;

    if (!result) {
      throw new Error("Insurance record not found");
    }

    return { success: true };
  }
);
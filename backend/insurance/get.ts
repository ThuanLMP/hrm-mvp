import { api } from "encore.dev/api";
import db from "../db";
import type { InsuranceWithEmployee } from "./types";

interface GetInsuranceRequest {
  id: string;
}

export const get = api(
  { method: "GET", path: "/insurance/:id", expose: true },
  async ({ id }: GetInsuranceRequest): Promise<InsuranceWithEmployee> => {
    const result = await db.queryRow<InsuranceWithEmployee>`
      SELECT 
        ir.*,
        e.full_name as employee_name,
        e.employee_code,
        e.status as employee_status,
        e.photo_url as employee_photo_url,
        d.name as department_name
      FROM insurance_records ir
      JOIN employees e ON ir.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE ir.id = ${id}
    `;

    if (!result) {
      throw new Error("Insurance record not found");
    }

    return result;
  }
);
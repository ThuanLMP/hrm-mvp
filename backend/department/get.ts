import { api, APIError } from "encore.dev/api";
import db from "../db";
import { Department } from "./types";

interface GetDepartmentRequest {
  id: number;
}

// Gets a single department by ID
export const get = api<GetDepartmentRequest, Department>(
  { expose: true, method: "GET", path: "/departments/:id" },
  async (req) => {
    const department = await db.queryRow<Department>`
      SELECT 
        d.id, d.name, d.description, d.manager_id, d.created_at, d.updated_at,
        m.full_name as manager_name,
        COUNT(e.id) as employee_count
      FROM departments d
      LEFT JOIN employees m ON d.manager_id = m.id
      LEFT JOIN employees e ON d.id = e.department_id AND e.status = 'active'
      WHERE d.id = ${req.id}
      GROUP BY d.id, d.name, d.description, d.manager_id, d.created_at, d.updated_at, m.full_name
    `;

    if (!department) {
      throw APIError.notFound("Không tìm thấy phòng ban");
    }

    return department;
  }
);

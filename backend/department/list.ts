import { api } from "encore.dev/api";
import db from "../db";
import { Department, ListDepartmentsResponse } from "./types";

// Lists all departments with employee counts
export const list = api<void, ListDepartmentsResponse>(
  { expose: true, method: "GET", path: "/departments" },
  async () => {
    const departments = await db.queryAll<Department>`
      SELECT 
        d.id, d.name, d.description, d.manager_id, d.created_at, d.updated_at,
        m.full_name as manager_name,
        COUNT(e.id) as employee_count
      FROM departments d
      LEFT JOIN employees m ON d.manager_id = m.id
      LEFT JOIN employees e ON d.id = e.department_id AND e.status = 'active'
      GROUP BY d.id, d.name, d.description, d.manager_id, d.created_at, d.updated_at, m.full_name
      ORDER BY d.name
    `;

    return {
      departments,
      total: departments.length,
    };
  }
);

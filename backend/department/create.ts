import { api, APIError } from "encore.dev/api";
import db from "../db";
import { CreateDepartmentRequest, Department } from "./types";

// Creates a new department
export const create = api<CreateDepartmentRequest, Department>(
  { expose: true, method: "POST", path: "/departments" },
  async (req) => {
    // Check if department name already exists
    const existingDept = await db.queryRow`
      SELECT id FROM departments WHERE name = ${req.name}
    `;

    if (existingDept) {
      throw APIError.alreadyExists("Tên phòng ban đã tồn tại");
    }

    // Validate manager exists if provided
    if (req.manager_id) {
      const manager = await db.queryRow`
        SELECT id FROM employees WHERE id = ${req.manager_id}
      `;
      if (!manager) {
        throw APIError.notFound("Không tìm thấy trưởng phòng");
      }
    }

    // Create department
    const department = await db.queryRow<Department>`
      INSERT INTO departments (name, description, manager_id)
      VALUES (${req.name}, ${req.description}, ${req.manager_id})
      RETURNING id, name, description, manager_id, created_at, updated_at
    `;

    if (!department) {
      throw APIError.internal("Không thể tạo phòng ban");
    }

    // Get manager name if exists
    if (department.manager_id) {
      const manager = await db.queryRow<{ full_name: string }>`
        SELECT full_name FROM employees WHERE id = ${department.manager_id}
      `;
      department.manager_name = manager?.full_name;
    }

    department.employee_count = 0;

    return department;
  }
);

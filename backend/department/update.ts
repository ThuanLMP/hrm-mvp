import { api, APIError } from "encore.dev/api";
import db from "../db";
import { UpdateDepartmentRequest, Department } from "./types";

interface UpdateDepartmentParams {
  id: number;
}

// Updates an existing department
export const update = api<UpdateDepartmentParams & UpdateDepartmentRequest, Department>(
  { expose: true, method: "PUT", path: "/departments/:id" },
  async (req) => {
    const { id, ...updateData } = req;

    // Check if department exists
    const existingDept = await db.queryRow`
      SELECT id FROM departments WHERE id = ${id}
    `;

    if (!existingDept) {
      throw APIError.notFound("Không tìm thấy phòng ban");
    }

    // Check if new name conflicts with existing department
    if (updateData.name) {
      const nameConflict = await db.queryRow`
        SELECT id FROM departments WHERE name = ${updateData.name} AND id != ${id}
      `;
      if (nameConflict) {
        throw APIError.alreadyExists("Tên phòng ban đã tồn tại");
      }
    }

    // Validate manager exists if provided
    if (updateData.manager_id) {
      const manager = await db.queryRow`
        SELECT id FROM employees WHERE id = ${updateData.manager_id}
      `;
      if (!manager) {
        throw APIError.notFound("Không tìm thấy trưởng phòng");
      }
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      throw APIError.invalidArgument("Không có dữ liệu để cập nhật");
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    const updateQuery = `
      UPDATE departments 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, description, manager_id, created_at, updated_at
    `;

    updateValues.push(id);

    const department = await db.rawQueryRow<Department>(updateQuery, ...updateValues);

    if (!department) {
      throw APIError.internal("Không thể cập nhật phòng ban");
    }

    // Get manager name and employee count
    if (department.manager_id) {
      const manager = await db.queryRow<{ full_name: string }>`
        SELECT full_name FROM employees WHERE id = ${department.manager_id}
      `;
      department.manager_name = manager?.full_name;
    }

    const employeeCount = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM employees WHERE department_id = ${id} AND status = 'active'
    `;
    department.employee_count = employeeCount?.count || 0;

    return department;
  }
);

import { api, APIError } from "encore.dev/api";
import db from "../db";

interface DeleteDepartmentRequest {
  id: number;
}

// Deletes a department
export const deleteDepartment = api<DeleteDepartmentRequest, void>(
  { expose: true, method: "DELETE", path: "/departments/:id" },
  async (req) => {
    // Check if department exists
    const existingDept = await db.queryRow`
      SELECT id FROM departments WHERE id = ${req.id}
    `;

    if (!existingDept) {
      throw APIError.notFound("Không tìm thấy phòng ban");
    }

    // Check if department has employees
    const employeeCount = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM employees WHERE department_id = ${req.id}
    `;

    if (employeeCount && employeeCount.count > 0) {
      throw APIError.failedPrecondition("Không thể xóa phòng ban có nhân viên");
    }

    // Delete department
    await db.exec`DELETE FROM departments WHERE id = ${req.id}`;
  }
);

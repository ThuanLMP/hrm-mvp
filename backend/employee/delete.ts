import { api, APIError } from "encore.dev/api";
import db from "../db";

interface DeleteEmployeeRequest {
  id: number;
}

// Deletes an employee
export const deleteEmployee = api<DeleteEmployeeRequest, void>(
  { expose: true, method: "DELETE", path: "/employees/:id" },
  async (req) => {
    // Check if employee exists
    const existingEmployee = await db.queryRow`
      SELECT id FROM employees WHERE id = ${req.id}
    `;

    if (!existingEmployee) {
      throw APIError.notFound("Không tìm thấy nhân viên");
    }

    // Delete employee (user will be cascade deleted if exists)
    await db.exec`DELETE FROM employees WHERE id = ${req.id}`;
  }
);

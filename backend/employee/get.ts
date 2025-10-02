import { api, APIError } from "encore.dev/api";
import db from "../db";
import { Employee } from "./types";

interface GetEmployeeRequest {
  id: number;
}

// Gets a single employee by ID
export const get = api<GetEmployeeRequest, Employee>(
  { expose: true, method: "GET", path: "/employees/:id" },
  async (req) => {
    const employee = await db.queryRow<Employee>`
      SELECT 
        e.id, e.user_id, e.employee_code, e.full_name, e.phone, e.address,
        e.date_of_birth, e.hire_date, e.termination_date, e.position, e.department_id, e.region_id, e.salary,
        e.status, e.photo_url, e.created_at, e.updated_at,
        d.name as department_name,
        r.name as region_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN regions r ON e.region_id = r.id
      WHERE e.id = ${req.id}
    `;

    if (!employee) {
      throw APIError.notFound("Không tìm thấy nhân viên");
    }

    return employee;
  }
);

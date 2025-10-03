import { api, APIError } from "encore.dev/api";
import db from "../db";
import { Employee, UpdateEmployeeRequest } from "./types";

interface UpdateEmployeeParams {
  id: number;
}

// Updates an existing employee
export const update = api<
  UpdateEmployeeParams & UpdateEmployeeRequest,
  Employee
>({ expose: true, method: "PUT", path: "/employees/:id" }, async (req) => {
  const { id, ...updateData } = req;

  // Check if employee exists
  const existingEmployee = await db.queryRow`
      SELECT id FROM employees WHERE id = ${id}
    `;

  if (!existingEmployee) {
    throw APIError.notFound("Không tìm thấy nhân viên");
  }

  const employee = await db.queryRow<Employee>`
      UPDATE employees 
      SET 
        full_name = COALESCE(${updateData.full_name}, full_name),
        phone = COALESCE(${updateData.phone}, phone),
        address = COALESCE(${updateData.address}, address),
        date_of_birth = COALESCE(${updateData.date_of_birth}, date_of_birth),
        termination_date = ${updateData.termination_date},
        position = COALESCE(${updateData.position}, position),
        department_id = COALESCE(${updateData.department_id}, department_id),
        region_id = COALESCE(${updateData.region_id}, region_id),
        salary = COALESCE(${updateData.salary}, salary),
        status = COALESCE(${updateData.status}, status),
        photo_url = COALESCE(${updateData.photo_url}, photo_url),
        education_level = COALESCE(${updateData.education_level}, education_level),
        school_name = COALESCE(${updateData.school_name}, school_name),
        major = COALESCE(${updateData.major}, major),
        graduation_year = COALESCE(${updateData.graduation_year}, graduation_year),
        training_system = COALESCE(${updateData.training_system}, training_system),
        degree_classification = COALESCE(${updateData.degree_classification}, degree_classification),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING 
        id, user_id, employee_code, full_name, phone, address, date_of_birth,
        hire_date, termination_date, position, department_id, region_id, salary, status, photo_url, education_level,
        school_name, major, graduation_year, training_system, degree_classification,
        created_at, updated_at
    `;

  if (!employee) {
    throw APIError.internal("Không thể cập nhật nhân viên");
  }

  // Get department name if exists
  if (employee.department_id) {
    const dept = await db.queryRow<{ name: string }>`
        SELECT name FROM departments WHERE id = ${employee.department_id}
      `;
    employee.department_name = dept?.name;
  }

  // Get region name if exists
  if (employee.region_id) {
    const region = await db.queryRow<{ name: string }>`
        SELECT name FROM regions WHERE id = ${employee.region_id}
      `;
    employee.region_name = region?.name;
  }

  return employee;
});

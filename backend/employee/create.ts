import { api, APIError } from "encore.dev/api";
import db from "../db";
import { CreateEmployeeRequest, Employee } from "./types";
import * as bcrypt from 'bcrypt';

// Creates a new employee
export const create = api<CreateEmployeeRequest, Employee>(
  { expose: true, method: "POST", path: "/employees" },
  async (req) => {
    // Check if employee code already exists
    const existingEmployee = await db.queryRow`
      SELECT id FROM employees WHERE employee_code = ${req.employee_code}
    `;

    if (existingEmployee) {
      throw APIError.alreadyExists("Mã nhân viên đã tồn tại");
    }

    let userId = null;

    // Create user account if email and password provided
    if (req.email && req.password) {
      const existingUser = await db.queryRow`
        SELECT id FROM users WHERE email = ${req.email}
      `;

      if (existingUser) {
        throw APIError.alreadyExists("Email đã được sử dụng");
      }

      const passwordHash = await bcrypt.hash(req.password, 10);
      const userRow = await db.queryRow<{ id: number }>`
        INSERT INTO users (email, password_hash, role)
        VALUES (${req.email}, ${passwordHash}, ${req.role || 'employee'})
        RETURNING id
      `;

      userId = userRow?.id;
    }

    // Create employee
    const employee = await db.queryRow<Employee>`
      INSERT INTO employees (
        user_id, employee_code, full_name, phone, address, date_of_birth,
        hire_date, position, department_id, region_id, salary, photo_url
      )
      VALUES (
        ${userId}, ${req.employee_code}, ${req.full_name}, ${req.phone}, 
        ${req.address}, ${req.date_of_birth}, ${req.hire_date}, ${req.position},
        ${req.department_id}, ${req.region_id}, ${req.salary}, ${req.photo_url}
      )
      RETURNING 
        id, user_id, employee_code, full_name, phone, address, date_of_birth,
        hire_date, position, department_id, region_id, salary, status, photo_url,
        created_at, updated_at
    `;

    if (!employee) {
      throw APIError.internal("Không thể tạo nhân viên");
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
  }
);

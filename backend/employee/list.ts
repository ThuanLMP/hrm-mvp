import { api, Query } from "encore.dev/api";
import db from "../db";
import { Employee, ListEmployeesResponse } from "./types";

interface ListEmployeesRequest {
  limit?: Query<number>;
  offset?: Query<number>;
  department_id?: Query<number>;
  region_id?: Query<number>;
  status?: Query<string>;
  search?: Query<string>;
}

// Lists all employees with optional filtering
export const list = api<ListEmployeesRequest, ListEmployeesResponse>(
  { expose: true, method: "GET", path: "/employees" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;

    // Build WHERE conditions
    let employees: Employee[];
    let countResult: { total: number } | null;

    if (req.department_id || req.region_id || req.status || req.search) {
      // Apply filters
      let baseQuery = `
        SELECT 
          e.id, e.user_id, e.employee_code, e.full_name, e.phone, e.address,
          e.date_of_birth, e.hire_date, e.termination_date, e.position, e.department_id, e.region_id, e.salary,
          e.status, e.photo_url, e.education_level, e.school_name, e.major, e.graduation_year, e.training_system, e.degree_classification,
          e.created_at, e.updated_at,
          d.name as department_name,
          r.name as region_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN regions r ON e.region_id = r.id
        WHERE 1=1
      `;

      let countQuery = `
        SELECT COUNT(*) as total
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN regions r ON e.region_id = r.id
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (req.department_id) {
        baseQuery += ` AND e.department_id = $${paramIndex}`;
        countQuery += ` AND e.department_id = $${paramIndex}`;
        params.push(req.department_id);
        paramIndex++;
      }

      if (req.region_id) {
        baseQuery += ` AND e.region_id = $${paramIndex}`;
        countQuery += ` AND e.region_id = $${paramIndex}`;
        params.push(req.region_id);
        paramIndex++;
      }

      if (req.status) {
        baseQuery += ` AND e.status = $${paramIndex}`;
        countQuery += ` AND e.status = $${paramIndex}`;
        params.push(req.status);
        paramIndex++;
      }

      if (req.search) {
        baseQuery += ` AND (e.full_name ILIKE $${paramIndex} OR e.employee_code ILIKE $${paramIndex})`;
        countQuery += ` AND (e.full_name ILIKE $${paramIndex} OR e.employee_code ILIKE $${paramIndex})`;
        params.push(`%${req.search}%`);
        paramIndex++;
      }

      baseQuery += ` ORDER BY e.created_at DESC LIMIT $${paramIndex} OFFSET $${
        paramIndex + 1
      }`;
      params.push(limit, offset);

      employees = await db.rawQueryAll<Employee>(baseQuery, ...params);
      countResult = await db.rawQueryRow<{ total: number }>(
        countQuery,
        ...params.slice(0, -2)
      );
    } else {
      // No filters - use simple queries
      employees = await db.queryAll<Employee>`
        SELECT 
          e.id, e.user_id, e.employee_code, e.full_name, e.phone, e.address,
          e.date_of_birth, e.hire_date, e.termination_date, e.position, e.department_id, e.region_id, e.salary,
          e.status, e.photo_url, e.education_level, e.school_name, e.major, e.graduation_year, e.training_system, e.degree_classification,
          e.created_at, e.updated_at,
          d.name as department_name,
          r.name as region_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN regions r ON e.region_id = r.id
        ORDER BY e.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      countResult = await db.queryRow<{ total: number }>`
        SELECT COUNT(*) as total
        FROM employees e
      `;
    }

    return {
      employees,
      total: countResult?.total || 0,
    };
  }
);

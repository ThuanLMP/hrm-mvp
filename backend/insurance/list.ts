import { api, Query } from "encore.dev/api";
import db from "../db";
import type { ListInsuranceResponse, InsuranceWithEmployee } from "./types";

interface ListInsuranceRequest {
  page?: Query<number>;
  limit?: Query<number>;
  employee_id?: Query<number>;
  status?: Query<string>;
  search?: Query<string>;
}

export const list = api(
  { method: "GET", path: "/insurance", expose: true },
  async (req: ListInsuranceRequest): Promise<ListInsuranceResponse> => {
    const page = req.page || 1;
    const limit = req.limit || 20;
    const offset = (page - 1) * limit;

    // Build conditions
    let whereConditions: string[] = [];
    
    if (req.employee_id) {
      whereConditions.push(`ir.employee_id = ${req.employee_id}`);
    }

    if (req.status) {
      whereConditions.push(`ir.status = '${req.status}'`);
    }

    if (req.search) {
      const searchTerm = `%${req.search}%`;
      whereConditions.push(`(
        e.full_name ILIKE '${searchTerm}' OR 
        e.employee_code ILIKE '${searchTerm}' OR
        ir.tax_code ILIKE '${searchTerm}' OR
        ir.social_insurance_number ILIKE '${searchTerm}' OR
        ir.id_number ILIKE '${searchTerm}'
      )`);
    }

    // Get total count
    let countResult;
    if (req.employee_id && req.status && req.search) {
      const searchTerm = `%${req.search}%`;
      countResult = await db.queryRow<{total: string}>`
        SELECT COUNT(*) as total
        FROM insurance_records ir
        JOIN employees e ON ir.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE ir.employee_id = ${req.employee_id}
          AND ir.status = ${req.status}
          AND (
            e.full_name ILIKE ${searchTerm} OR 
            e.employee_code ILIKE ${searchTerm} OR
            ir.tax_code ILIKE ${searchTerm} OR
            ir.social_insurance_number ILIKE ${searchTerm} OR
            ir.id_number ILIKE ${searchTerm}
          )
      `;
    } else if (req.employee_id && req.status) {
      countResult = await db.queryRow<{total: string}>`
        SELECT COUNT(*) as total
        FROM insurance_records ir
        JOIN employees e ON ir.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE ir.employee_id = ${req.employee_id} AND ir.status = ${req.status}
      `;
    } else if (req.employee_id && req.search) {
      const searchTerm = `%${req.search}%`;
      countResult = await db.queryRow<{total: string}>`
        SELECT COUNT(*) as total
        FROM insurance_records ir
        JOIN employees e ON ir.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE ir.employee_id = ${req.employee_id}
          AND (
            e.full_name ILIKE ${searchTerm} OR 
            e.employee_code ILIKE ${searchTerm} OR
            ir.tax_code ILIKE ${searchTerm} OR
            ir.social_insurance_number ILIKE ${searchTerm} OR
            ir.id_number ILIKE ${searchTerm}
          )
      `;
    } else if (req.status && req.search) {
      const searchTerm = `%${req.search}%`;
      countResult = await db.queryRow<{total: string}>`
        SELECT COUNT(*) as total
        FROM insurance_records ir
        JOIN employees e ON ir.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE ir.status = ${req.status}
          AND (
            e.full_name ILIKE ${searchTerm} OR 
            e.employee_code ILIKE ${searchTerm} OR
            ir.tax_code ILIKE ${searchTerm} OR
            ir.social_insurance_number ILIKE ${searchTerm} OR
            ir.id_number ILIKE ${searchTerm}
          )
      `;
    } else if (req.employee_id) {
      countResult = await db.queryRow<{total: string}>`
        SELECT COUNT(*) as total
        FROM insurance_records ir
        JOIN employees e ON ir.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE ir.employee_id = ${req.employee_id}
      `;
    } else if (req.status) {
      countResult = await db.queryRow<{total: string}>`
        SELECT COUNT(*) as total
        FROM insurance_records ir
        JOIN employees e ON ir.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE ir.status = ${req.status}
      `;
    } else if (req.search) {
      const searchTerm = `%${req.search}%`;
      countResult = await db.queryRow<{total: string}>`
        SELECT COUNT(*) as total
        FROM insurance_records ir
        JOIN employees e ON ir.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE (
          e.full_name ILIKE ${searchTerm} OR 
          e.employee_code ILIKE ${searchTerm} OR
          ir.tax_code ILIKE ${searchTerm} OR
          ir.social_insurance_number ILIKE ${searchTerm} OR
          ir.id_number ILIKE ${searchTerm}
        )
      `;
    } else {
      countResult = await db.queryRow<{total: string}>`
        SELECT COUNT(*) as total
        FROM insurance_records ir
        JOIN employees e ON ir.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
      `;
    }

    // Get data with same conditions
    let dataResult;
    if (req.employee_id && req.status && req.search) {
      const searchTerm = `%${req.search}%`;
      dataResult = await db.query<InsuranceWithEmployee>`
        SELECT 
          ir.*,
          e.full_name as employee_name,
          e.employee_code,
          e.status as employee_status,
          e.photo_url as employee_photo_url,
          d.name as department_name
        FROM insurance_records ir
        JOIN employees e ON ir.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE ir.employee_id = ${req.employee_id}
          AND ir.status = ${req.status}
          AND (
            e.full_name ILIKE ${searchTerm} OR 
            e.employee_code ILIKE ${searchTerm} OR
            ir.tax_code ILIKE ${searchTerm} OR
            ir.social_insurance_number ILIKE ${searchTerm} OR
            ir.id_number ILIKE ${searchTerm}
          )
        ORDER BY ir.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (req.employee_id && req.status) {
      dataResult = await db.query<InsuranceWithEmployee>`
        SELECT 
          ir.*,
          e.full_name as employee_name,
          e.employee_code,
          e.status as employee_status,
          e.photo_url as employee_photo_url,
          d.name as department_name
        FROM insurance_records ir
        JOIN employees e ON ir.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE ir.employee_id = ${req.employee_id} AND ir.status = ${req.status}
        ORDER BY ir.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (req.employee_id && req.search) {
      const searchTerm = `%${req.search}%`;
      dataResult = await db.query<InsuranceWithEmployee>`
        SELECT 
          ir.*,
          e.full_name as employee_name,
          e.employee_code,
          e.status as employee_status,
          e.photo_url as employee_photo_url,
          d.name as department_name
        FROM insurance_records ir
        JOIN employees e ON ir.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE ir.employee_id = ${req.employee_id}
          AND (
            e.full_name ILIKE ${searchTerm} OR 
            e.employee_code ILIKE ${searchTerm} OR
            ir.tax_code ILIKE ${searchTerm} OR
            ir.social_insurance_number ILIKE ${searchTerm} OR
            ir.id_number ILIKE ${searchTerm}
          )
        ORDER BY ir.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (req.status && req.search) {
      const searchTerm = `%${req.search}%`;
      dataResult = await db.query<InsuranceWithEmployee>`
        SELECT 
          ir.*,
          e.full_name as employee_name,
          e.employee_code,
          e.status as employee_status,
          e.photo_url as employee_photo_url,
          d.name as department_name
        FROM insurance_records ir
        JOIN employees e ON ir.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE ir.status = ${req.status}
          AND (
            e.full_name ILIKE ${searchTerm} OR 
            e.employee_code ILIKE ${searchTerm} OR
            ir.tax_code ILIKE ${searchTerm} OR
            ir.social_insurance_number ILIKE ${searchTerm} OR
            ir.id_number ILIKE ${searchTerm}
          )
        ORDER BY ir.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (req.employee_id) {
      dataResult = await db.query<InsuranceWithEmployee>`
        SELECT 
          ir.*,
          e.full_name as employee_name,
          e.employee_code,
          e.status as employee_status,
          e.photo_url as employee_photo_url,
          d.name as department_name
        FROM insurance_records ir
        JOIN employees e ON ir.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE ir.employee_id = ${req.employee_id}
        ORDER BY ir.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (req.status) {
      dataResult = await db.query<InsuranceWithEmployee>`
        SELECT 
          ir.*,
          e.full_name as employee_name,
          e.employee_code,
          e.status as employee_status,
          e.photo_url as employee_photo_url,
          d.name as department_name
        FROM insurance_records ir
        JOIN employees e ON ir.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE ir.status = ${req.status}
        ORDER BY ir.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (req.search) {
      const searchTerm = `%${req.search}%`;
      dataResult = await db.query<InsuranceWithEmployee>`
        SELECT 
          ir.*,
          e.full_name as employee_name,
          e.employee_code,
          e.status as employee_status,
          e.photo_url as employee_photo_url,
          d.name as department_name
        FROM insurance_records ir
        JOIN employees e ON ir.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE (
          e.full_name ILIKE ${searchTerm} OR 
          e.employee_code ILIKE ${searchTerm} OR
          ir.tax_code ILIKE ${searchTerm} OR
          ir.social_insurance_number ILIKE ${searchTerm} OR
          ir.id_number ILIKE ${searchTerm}
        )
        ORDER BY ir.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      dataResult = await db.query<InsuranceWithEmployee>`
        SELECT 
          ir.*,
          e.full_name as employee_name,
          e.employee_code,
          e.status as employee_status,
          e.photo_url as employee_photo_url,
          d.name as department_name
        FROM insurance_records ir
        JOIN employees e ON ir.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        ORDER BY ir.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const records: InsuranceWithEmployee[] = [];
    if (dataResult) {
      for await (const row of dataResult) {
        records.push(row);
      }
    }

    return {
      records,
      total: parseInt(countResult?.total || '0')
    };
  }
);
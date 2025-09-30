import { api } from "encore.dev/api";
import db from "../db";
import { Bonus, ListBonusesRequest, ListBonusesResponse } from "./types";

export const list = api<ListBonusesRequest, ListBonusesResponse>(
  { expose: true, method: "GET", path: "/bonuses" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;

    let bonuses: Bonus[];
    let countResult: { total: number } | null;

    if (
      req.employeeId ||
      req.bonusTypeId ||
      req.status ||
      req.search ||
      req.startDate ||
      req.endDate
    ) {
      // Apply filters
      let baseQuery = `
        SELECT 
          b.id, b.employee_id, b.bonus_type_id, b.title, b.description, CAST(b.amount AS TEXT) as amount,
          b.status, b.award_date, b.approved_by, b.approved_at, b.rejection_reason,
          b.created_by, b.created_at, b.updated_at,
          e.full_name as employee_name,
          e.employee_code,
          bt.name as bonus_type_name,
          bt.icon as bonus_type_icon,
          bt.color as bonus_type_color,
          approver.full_name as approved_by_name,
          creator.full_name as created_by_name
        FROM bonuses b
        LEFT JOIN employees e ON b.employee_id = e.id
        LEFT JOIN bonus_types bt ON b.bonus_type_id = bt.id
        LEFT JOIN employees approver ON b.approved_by = approver.id
        LEFT JOIN employees creator ON b.created_by = creator.id
        WHERE 1=1
      `;

      let countQuery = `
        SELECT COUNT(*) as total
        FROM bonuses b
        LEFT JOIN employees e ON b.employee_id = e.id
        LEFT JOIN bonus_types bt ON b.bonus_type_id = bt.id
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (req.employeeId) {
        baseQuery += ` AND b.employee_id = $${paramIndex}`;
        countQuery += ` AND b.employee_id = $${paramIndex}`;
        params.push(req.employeeId);
        paramIndex++;
      }

      if (req.bonusTypeId) {
        baseQuery += ` AND b.bonus_type_id = $${paramIndex}`;
        countQuery += ` AND b.bonus_type_id = $${paramIndex}`;
        params.push(req.bonusTypeId);
        paramIndex++;
      }

      if (req.status) {
        baseQuery += ` AND b.status = $${paramIndex}`;
        countQuery += ` AND b.status = $${paramIndex}`;
        params.push(req.status);
        paramIndex++;
      }

      if (req.search) {
        baseQuery += ` AND (e.full_name ILIKE $${paramIndex} OR e.employee_code ILIKE $${paramIndex} OR b.title ILIKE $${paramIndex})`;
        countQuery += ` AND (e.full_name ILIKE $${paramIndex} OR e.employee_code ILIKE $${paramIndex} OR b.title ILIKE $${paramIndex})`;
        params.push(`%${req.search}%`);
        paramIndex++;
      }

      if (req.startDate) {
        baseQuery += ` AND b.award_date >= $${paramIndex}`;
        countQuery += ` AND b.award_date >= $${paramIndex}`;
        params.push(req.startDate);
        paramIndex++;
      }

      if (req.endDate) {
        baseQuery += ` AND b.award_date <= $${paramIndex}`;
        countQuery += ` AND b.award_date <= $${paramIndex}`;
        params.push(req.endDate);
        paramIndex++;
      }

      baseQuery += ` ORDER BY b.created_at DESC LIMIT $${paramIndex} OFFSET $${
        paramIndex + 1
      }`;
      params.push(limit, offset);

      const rawBonuses = await db.rawQueryAll<any>(baseQuery, ...params);
      bonuses = rawBonuses.map((row) => ({
        id: row.id,
        employeeId: row.employee_id,
        employeeName: row.employee_name,
        employeeCode: row.employee_code,
        bonusTypeId: row.bonus_type_id,
        bonusTypeName: row.bonus_type_name,
        bonusTypeIcon: row.bonus_type_icon,
        bonusTypeColor: row.bonus_type_color,
        title: row.title,
        description: row.description,
        amount: parseFloat(row.amount),
        status: row.status,
        awardDate: row.award_date,
        approvedBy: row.approved_by,
        approvedByName: row.approved_by_name,
        approvedAt: row.approved_at,
        rejectionReason: row.rejection_reason,
        createdBy: row.created_by,
        createdByName: row.created_by_name,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      countResult = await db.rawQueryRow<{ total: number }>(
        countQuery,
        ...params.slice(0, -2)
      );
    } else {
      // No filters - use simple queries
      const rawBonuses = await db.queryAll<any>`
        SELECT 
          b.id, b.employee_id, b.bonus_type_id, b.title, b.description, CAST(b.amount AS TEXT) as amount,
          b.status, b.award_date, b.approved_by, b.approved_at, b.rejection_reason,
          b.created_by, b.created_at, b.updated_at,
          e.full_name as employee_name,
          e.employee_code,
          bt.name as bonus_type_name,
          bt.icon as bonus_type_icon,
          bt.color as bonus_type_color,
          approver.full_name as approved_by_name,
          creator.full_name as created_by_name
        FROM bonuses b
        LEFT JOIN employees e ON b.employee_id = e.id
        LEFT JOIN bonus_types bt ON b.bonus_type_id = bt.id
        LEFT JOIN employees approver ON b.approved_by = approver.id
        LEFT JOIN employees creator ON b.created_by = creator.id
        ORDER BY b.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      bonuses = rawBonuses.map((row) => ({
        id: row.id,
        employeeId: row.employee_id,
        employeeName: row.employee_name,
        employeeCode: row.employee_code,
        bonusTypeId: row.bonus_type_id,
        bonusTypeName: row.bonus_type_name,
        bonusTypeIcon: row.bonus_type_icon,
        bonusTypeColor: row.bonus_type_color,
        title: row.title,
        description: row.description,
        amount: parseFloat(row.amount),
        status: row.status,
        awardDate: row.award_date,
        approvedBy: row.approved_by,
        approvedByName: row.approved_by_name,
        approvedAt: row.approved_at,
        rejectionReason: row.rejection_reason,
        createdBy: row.created_by,
        createdByName: row.created_by_name,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      countResult = await db.queryRow<{ total: number }>`
        SELECT COUNT(*) as total
        FROM bonuses b
      `;
    }

    return {
      bonuses,
      total: countResult?.total || 0,
    };
  }
);

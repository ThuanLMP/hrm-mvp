import { api, Query } from "encore.dev/api";
import db from "../db";
import { LeaveRequest, ListLeaveRequestsResponse } from "./types";

interface ListLeaveRequestsRequest {
  limit?: Query<number>;
  offset?: Query<number>;
  employee_id?: Query<number>;
  status?: Query<string>;
  leave_type?: Query<string>;
}

// Lists leave requests with optional filtering
export const list = api<ListLeaveRequestsRequest, ListLeaveRequestsResponse>(
  { expose: true, method: "GET", path: "/leave/requests" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;

    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.employee_id) {
      whereClause += ` AND lr.employee_id = $${paramIndex}`;
      params.push(req.employee_id);
      paramIndex++;
    }

    if (req.status) {
      whereClause += ` AND lr.status = $${paramIndex}`;
      params.push(req.status);
      paramIndex++;
    }

    if (req.leave_type) {
      whereClause += ` AND lr.leave_type = $${paramIndex}`;
      params.push(req.leave_type);
      paramIndex++;
    }

    const query = `
      SELECT 
        lr.id, lr.employee_id, lr.leave_type, lr.start_date, lr.end_date,
        lr.total_days, lr.reason, lr.status, lr.approved_by, lr.approved_at,
        lr.rejection_reason, lr.created_at, lr.updated_at,
        e.full_name as employee_name, e.employee_code,
        a.full_name as approver_name
      FROM leave_requests lr
      LEFT JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN employees a ON lr.approved_by = a.id
      ${whereClause}
      ORDER BY lr.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM leave_requests lr
      ${whereClause}
    `;

    params.push(limit, offset);

    const leaveRequests = await db.rawQueryAll<LeaveRequest>(query, ...params);
    const countResult = await db.rawQueryRow<{ total: number }>(
      countQuery,
      ...params.slice(0, -2)
    );

    return {
      leave_requests: leaveRequests,
      total: countResult?.total || 0,
    };
  }
);

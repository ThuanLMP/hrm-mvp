import { api, APIError } from "encore.dev/api";
import db from "../db";
import { CreateLeaveRequest, LeaveRequest } from "./types";

// Creates a new leave request
export const create = api<CreateLeaveRequest, LeaveRequest>(
  { expose: true, method: "POST", path: "/leave/requests" },
  async (req) => {
    // Validate dates
    const startDate = new Date(req.start_date);
    const endDate = new Date(req.end_date);
    
    if (endDate < startDate) {
      throw APIError.invalidArgument("Ngày kết thúc không thể sớm hơn ngày bắt đầu");
    }

    // Calculate total days
    const timeDiff = endDate.getTime() - startDate.getTime();
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    // Check for overlapping leave requests
    const overlapping = await db.queryRow`
      SELECT id FROM leave_requests 
      WHERE employee_id = ${req.employee_id}
        AND status IN ('pending', 'approved')
        AND (
          (start_date <= ${req.start_date} AND end_date >= ${req.start_date})
          OR (start_date <= ${req.end_date} AND end_date >= ${req.end_date})
          OR (start_date >= ${req.start_date} AND end_date <= ${req.end_date})
        )
    `;

    if (overlapping) {
      throw APIError.failedPrecondition("Đã có đơn xin nghỉ trong khoảng thời gian này");
    }

    // Create leave request
    const leaveRequest = await db.queryRow<LeaveRequest>`
      INSERT INTO leave_requests (
        employee_id, leave_type, start_date, end_date, total_days, reason
      )
      VALUES (
        ${req.employee_id}, ${req.leave_type}, ${req.start_date}, 
        ${req.end_date}, ${totalDays}, ${req.reason}
      )
      RETURNING 
        id, employee_id, leave_type, start_date, end_date, total_days,
        reason, status, approved_by, approved_at, rejection_reason,
        created_at, updated_at
    `;

    if (!leaveRequest) {
      throw APIError.internal("Không thể tạo đơn xin nghỉ");
    }

    // Get employee info
    const employee = await db.queryRow<{ full_name: string; employee_code: string }>`
      SELECT full_name, employee_code FROM employees WHERE id = ${req.employee_id}
    `;

    if (employee) {
      leaveRequest.employee_name = employee.full_name;
      leaveRequest.employee_code = employee.employee_code;
    }

    return leaveRequest;
  }
);

import { api, APIError } from "encore.dev/api";
import db from "../db";
import { ApproveLeaveRequest, LeaveRequest } from "./types";

// Approves a leave request
export const approve = api<ApproveLeaveRequest, LeaveRequest>(
  { expose: true, method: "POST", path: "/leave/requests/:leave_request_id/approve" },
  async (req) => {
    // Check if leave request exists and is pending
    const existingRequest = await db.queryRow<{ status: string }>`
      SELECT status FROM leave_requests WHERE id = ${req.leave_request_id}
    `;

    if (!existingRequest) {
      throw APIError.notFound("Không tìm thấy đơn xin nghỉ");
    }

    if (existingRequest.status !== 'pending') {
      throw APIError.failedPrecondition("Đơn xin nghỉ đã được xử lý");
    }

    // Update leave request
    const leaveRequest = await db.queryRow<LeaveRequest>`
      UPDATE leave_requests 
      SET 
        status = 'approved',
        approved_by = ${req.approved_by},
        approved_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${req.leave_request_id}
      RETURNING 
        id, employee_id, leave_type, start_date, end_date, total_days,
        reason, status, approved_by, approved_at, rejection_reason,
        created_at, updated_at
    `;

    if (!leaveRequest) {
      throw APIError.internal("Không thể phê duyệt đơn xin nghỉ");
    }

    // Get employee and approver info
    const employee = await db.queryRow<{ full_name: string; employee_code: string }>`
      SELECT full_name, employee_code FROM employees WHERE id = ${leaveRequest.employee_id}
    `;

    const approver = await db.queryRow<{ full_name: string }>`
      SELECT full_name FROM employees WHERE id = ${req.approved_by}
    `;

    if (employee) {
      leaveRequest.employee_name = employee.full_name;
      leaveRequest.employee_code = employee.employee_code;
    }

    if (approver) {
      leaveRequest.approver_name = approver.full_name;
    }

    return leaveRequest;
  }
);

import { api, APIError } from "encore.dev/api";
import db from "../db";
import { CheckOutRequest, Timesheet } from "./types";

// Records employee check-out time and calculates total hours
export const checkOut = api<CheckOutRequest, Timesheet>(
  { expose: true, method: "POST", path: "/timesheet/checkout" },
  async (req) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if checked in today
    const existingRecord = await db.queryRow<{
      id: number;
      check_in: Date;
      check_out?: Date;
    }>`
      SELECT id, check_in, check_out FROM timesheets 
      WHERE employee_id = ${req.employee_id} AND work_date = ${today}
    `;

    if (!existingRecord || !existingRecord.check_in) {
      throw APIError.failedPrecondition("Chưa check-in hôm nay");
    }

    if (existingRecord.check_out) {
      throw APIError.failedPrecondition("Hôm nay đã check-out rồi");
    }

    const now = new Date();
    const checkInTime = new Date(existingRecord.check_in);
    const totalHours = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
    const overtimeHours = Math.max(0, totalHours - 8);

    // Update record with check-out time
    const timesheet = await db.queryRow<Timesheet>`
      UPDATE timesheets 
      SET 
        check_out = CURRENT_TIMESTAMP, 
        total_hours = ${totalHours},
        overtime_hours = ${overtimeHours},
        notes = ${req.notes || ''},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${existingRecord.id}
      RETURNING id, employee_id, check_in, check_out, work_date, total_hours, overtime_hours, notes, created_at, updated_at
    `;

    if (!timesheet) {
      throw APIError.internal("Không thể check-out");
    }

    // Get employee info
    const employee = await db.queryRow<{ full_name: string; employee_code: string }>`
      SELECT full_name, employee_code FROM employees WHERE id = ${req.employee_id}
    `;

    if (employee) {
      timesheet.employee_name = employee.full_name;
      timesheet.employee_code = employee.employee_code;
    }

    return timesheet;
  }
);

import { api, APIError } from "encore.dev/api";
import db from "../db";
import { CheckInRequest, Timesheet } from "./types";

// Records employee check-in time
export const checkIn = api<CheckInRequest, Timesheet>(
  { expose: true, method: "POST", path: "/timesheet/checkin" },
  async (req) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already checked in today
    const existingRecord = await db.queryRow`
      SELECT id, check_in FROM timesheets 
      WHERE employee_id = ${req.employee_id} AND work_date = ${today}
    `;

    if (existingRecord && existingRecord.check_in) {
      throw APIError.failedPrecondition("Hôm nay đã check-in rồi");
    }

    let timesheet: Timesheet;

    if (existingRecord) {
      // Update existing record
      const updated = await db.queryRow<Timesheet>`
        UPDATE timesheets 
        SET check_in = CURRENT_TIMESTAMP, notes = ${req.notes}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existingRecord.id}
        RETURNING id, employee_id, check_in, check_out, work_date, total_hours, overtime_hours, notes, created_at, updated_at
      `;
      timesheet = updated!;
    } else {
      // Create new record
      const created = await db.queryRow<Timesheet>`
        INSERT INTO timesheets (employee_id, check_in, work_date, notes)
        VALUES (${req.employee_id}, CURRENT_TIMESTAMP, ${today}, ${req.notes})
        RETURNING id, employee_id, check_in, check_out, work_date, total_hours, overtime_hours, notes, created_at, updated_at
      `;
      timesheet = created!;
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

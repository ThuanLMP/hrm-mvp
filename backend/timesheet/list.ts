import { api, Query } from "encore.dev/api";
import db from "../db";
import { ListTimesheetsResponse, Timesheet } from "./types";

interface ListTimesheetsRequest {
  limit?: Query<number>;
  offset?: Query<number>;
  employee_id?: Query<number>;
  start_date?: Query<string>;
  end_date?: Query<string>;
}

// Lists timesheets with optional filtering
export const list = api<ListTimesheetsRequest, ListTimesheetsResponse>(
  { expose: true, method: "GET", path: "/timesheets" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;

    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.employee_id) {
      whereClause += ` AND t.employee_id = $${paramIndex}`;
      params.push(req.employee_id);
      paramIndex++;
    }

    if (req.start_date) {
      whereClause += ` AND t.work_date >= $${paramIndex}`;
      params.push(req.start_date);
      paramIndex++;
    }

    if (req.end_date) {
      whereClause += ` AND t.work_date <= $${paramIndex}`;
      params.push(req.end_date);
      paramIndex++;
    }

    const query = `
      SELECT 
        t.id, t.employee_id, t.check_in, t.check_out, t.work_date,
        t.total_hours, t.overtime_hours, t.notes, t.created_at, t.updated_at,
        e.full_name as employee_name, e.employee_code,
        c1.config_value as work_start_time,
        c2.config_value as work_end_time
      FROM timesheets t
      LEFT JOIN employees e ON t.employee_id = e.id
      LEFT JOIN system_config c1 ON c1.config_key = 'work_start_time'
      LEFT JOIN system_config c2 ON c2.config_key = 'work_end_time'
      ${whereClause}
      ORDER BY t.work_date DESC, t.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM timesheets t
      ${whereClause}
    `;

    params.push(limit, offset);

    const rawTimesheets = await db.rawQueryAll<
      Timesheet & { work_start_time?: string; work_end_time?: string }
    >(query, ...params);
    const countResult = await db.rawQueryRow<{ total: number }>(
      countQuery,
      ...params.slice(0, -2)
    );

    // Process timesheets to calculate attendance status
    const timesheets = rawTimesheets.map((timesheet) => {
      const workStartTime = timesheet.work_start_time || "08:00:00";
      const workEndTime = timesheet.work_end_time || "17:30:00";

      let checkin_status: "on_time" | "late" = "on_time";
      let checkout_status: "on_time" | "early_leave" = "on_time";
      let late_minutes = 0;
      let early_leave_minutes = 0;

      if (timesheet.check_in || timesheet.check_out) {
        // Parse work start and end times
        const workDate = new Date(timesheet.work_date);

        const [startHour, startMinute] = workStartTime.split(":").map(Number);
        const [endHour, endMinute] = workEndTime.split(":").map(Number);

        const expectedStartTime = new Date(workDate);
        expectedStartTime.setHours(startHour, startMinute, 0, 0);

        const expectedEndTime = new Date(workDate);
        expectedEndTime.setHours(endHour, endMinute, 0, 0);

        // Check-in status
        if (timesheet.check_in) {
          const actualCheckIn = new Date(timesheet.check_in);
          if (actualCheckIn > expectedStartTime) {
            checkin_status = "late";
            late_minutes = Math.floor(
              (actualCheckIn.getTime() - expectedStartTime.getTime()) /
                (1000 * 60)
            );
          }
        }

        // Check-out status
        if (timesheet.check_out) {
          const actualCheckOut = new Date(timesheet.check_out);
          if (actualCheckOut < expectedEndTime) {
            checkout_status = "early_leave";
            early_leave_minutes = Math.floor(
              (expectedEndTime.getTime() - actualCheckOut.getTime()) /
                (1000 * 60)
            );
          }
        }
      }

      // Remove temporary fields and return processed timesheet
      const { work_start_time, work_end_time, ...processedTimesheet } =
        timesheet;
      return {
        ...processedTimesheet,
        checkin_status,
        checkout_status,
        late_minutes,
        early_leave_minutes,
      };
    });

    return {
      timesheets,
      total: countResult?.total || 0,
    };
  }
);

import { api, Query } from "encore.dev/api";
import db from "../db";
import { Timesheet, TodayTimesheetResponse } from "./types";

interface TodayTimesheetRequest {
  employee_id: Query<number>;
}

// Gets today's timesheet for an employee
export const today = api<TodayTimesheetRequest, TodayTimesheetResponse>(
  { expose: true, method: "GET", path: "/timesheet/today" },
  async (req) => {
    const today = new Date().toISOString().split('T')[0];

    const timesheet = await db.queryRow<Timesheet>`
      SELECT 
        t.id, t.employee_id, t.check_in, t.check_out, t.work_date,
        t.total_hours, t.overtime_hours, t.notes, t.created_at, t.updated_at,
        e.full_name as employee_name, e.employee_code
      FROM timesheets t
      LEFT JOIN employees e ON t.employee_id = e.id
      WHERE t.employee_id = ${req.employee_id} AND t.work_date = ${today}
    `;

    return { timesheet: timesheet || undefined };
  }
);

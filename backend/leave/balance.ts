import { api, Query } from "encore.dev/api";
import db from "../db";
import { LeaveBalance, LeaveBalanceResponse } from "./types";

interface GetLeaveBalanceRequest {
  employee_id: Query<number>;
  year?: Query<number>;
}

// Get leave balance for an employee
export const getBalance = api<GetLeaveBalanceRequest, LeaveBalanceResponse>(
  { expose: true, method: "GET", path: "/leave/balance" },
  async (req) => {
    const { employee_id, year = new Date().getFullYear() } = req;

    // Get employee info including leave days
    const employee = await db.queryRow<{
      id: number;
      full_name: string;
      employee_code: string;
      annual_leave_days: number | null;
      sick_leave_days: number | null;
    }>`
      SELECT e.id, e.full_name, e.employee_code, e.annual_leave_days, e.sick_leave_days
      FROM employees e
      WHERE e.id = ${employee_id} AND e.status = 'active'
    `;

    if (!employee) {
      throw new Error("Employee not found");
    }

    // Use employee-specific leave days or fallback to system config
    let annualLeaveDays = employee.annual_leave_days;
    let sickLeaveDays = employee.sick_leave_days;

    // If employee doesn't have specific leave days, get from system config
    if (annualLeaveDays === null || sickLeaveDays === null) {
      const configs = await db.queryAll<{
        config_key: string;
        config_value: string;
      }>`
        SELECT config_key, config_value 
        FROM system_config 
        WHERE config_key IN ('annual_leave_days', 'sick_leave_days')
      `;

      const defaultAnnualLeave = 12; // Default
      const defaultSickLeave = 30; // Default

      configs.forEach((config) => {
        if (config.config_key === "annual_leave_days") {
          if (annualLeaveDays === null) {
            annualLeaveDays =
              parseInt(config.config_value) || defaultAnnualLeave;
          }
        } else if (config.config_key === "sick_leave_days") {
          if (sickLeaveDays === null) {
            sickLeaveDays = parseInt(config.config_value) || defaultSickLeave;
          }
        }
      });

      // Final fallback to defaults if still null
      annualLeaveDays = annualLeaveDays || defaultAnnualLeave;
      sickLeaveDays = sickLeaveDays || defaultSickLeave;
    }

    // Ép primitive ngay từ đầu
    const empId = Number(employee_id);
    const yr = Number(year);

    // Annual
    const annualResult = await db.queryRow<{ total_days_text: string }>`
  SELECT COALESCE(SUM(total_days), 0)::text AS total_days_text
  FROM leave_requests
  WHERE employee_id = ${empId}::int
    AND status = 'approved'
    AND leave_type = 'annual'
    AND EXTRACT(YEAR FROM start_date)::int = ${yr}::int
`;

    // Sick
    const sickResult = await db.queryRow<{ total_days_text: string }>`
  SELECT COALESCE(SUM(total_days), 0)::text AS total_days_text
  FROM leave_requests
  WHERE employee_id = ${empId}::int
    AND status = 'approved'
    AND leave_type = 'sick'
    AND EXTRACT(YEAR FROM start_date)::int = ${yr}::int
`;

    const annualLeaveUsed = Number(annualResult?.total_days_text ?? "0");
    const sickLeaveUsed = Number(sickResult?.total_days_text ?? "0");

    const balance: LeaveBalance = {
      employee_id: employee.id,
      employee_name: employee.full_name,
      employee_code: employee.employee_code,
      annual_leave_total: annualLeaveDays,
      annual_leave_used: annualLeaveUsed,
      annual_leave_remaining: Math.max(0, annualLeaveDays - annualLeaveUsed),
      sick_leave_total: sickLeaveDays,
      sick_leave_used: sickLeaveUsed,
      sick_leave_remaining: Math.max(0, sickLeaveDays - sickLeaveUsed),
      year: year,
    };

    return {
      balance,
    };
  }
);

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

    // Get employee info
    const employee = await db.queryRow<{
      id: number;
      full_name: string;
      employee_code: string;
    }>`
      SELECT e.id, e.full_name, e.employee_code
      FROM employees e
      WHERE e.id = ${employee_id} AND e.status = 'active'
    `;

    if (!employee) {
      throw new Error("Employee not found");
    }

    // Get leave configuration from system config
    const configs = await db.queryAll<{
      config_key: string;
      config_value: string;
    }>`
      SELECT config_key, config_value 
      FROM system_config 
      WHERE config_key IN ('annual_leave_days', 'sick_leave_days')
    `;

    let annualLeaveDays = 12; // Default
    let sickLeaveDays = 30; // Default

    configs.forEach((config) => {
      if (config.config_key === "annual_leave_days") {
        annualLeaveDays = parseInt(config.config_value) || 12;
      } else if (config.config_key === "sick_leave_days") {
        sickLeaveDays = parseInt(config.config_value) || 30;
      }
    });

    // Calculate used leave days for the year - separate queries for safety

    const annualResult = await db.queryRow<{ total_days_text: string }>`
      SELECT CAST(COALESCE(SUM(total_days), 0) AS TEXT) as total_days_text
      FROM leave_requests 
      WHERE employee_id = ${employee_id} 
        AND status = 'approved'
        AND leave_type = 'annual'
        AND EXTRACT(YEAR FROM start_date) = ${year}
    `;

    const sickResult = await db.queryRow<{ total_days_text: string }>`
      SELECT CAST(COALESCE(SUM(total_days), 0) AS TEXT) as total_days_text
      FROM leave_requests 
      WHERE employee_id = ${employee_id} 
        AND status = 'approved'
        AND leave_type = 'sick'
        AND EXTRACT(YEAR FROM start_date) = ${year}
    `;

    const annualLeaveUsed = parseInt(annualResult?.total_days_text || "0") || 0;
    const sickLeaveUsed = parseInt(sickResult?.total_days_text || "0") || 0;

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

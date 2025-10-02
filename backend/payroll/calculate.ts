import { api } from "encore.dev/api";
import db from "../db";
import {
  MonthlyPayrollRequest,
  MonthlyPayrollResponse,
  PayrollRecord,
  PayrollSummary,
} from "./types";

// Calculate monthly payroll for all active employees
export const calculateMonthly = api<
  MonthlyPayrollRequest,
  MonthlyPayrollResponse
>({ expose: true, method: "POST", path: "/payroll/calculate" }, async (req) => {
  const { month, year, employee_id } = req;

  // Get payroll settings from system config
  const settings = await getPayrollSettings();

  // Get all active employees or specific employee

  let employees;

  if (employee_id) {
    employees = await db.queryAll<{
      id: number;
      employee_code: string;
      full_name: string;
      position?: string;
      salary_text: string;
      department_name?: string;
    }>`
      SELECT 
        e.id, e.employee_code, e.full_name, e.position, 
        CAST(COALESCE(e.salary, 0) AS TEXT) as salary_text,
        d.name as department_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.status = 'active' AND e.salary IS NOT NULL AND e.id = ${employee_id}
      ORDER BY e.employee_code
    `;
  } else {
    employees = await db.queryAll<{
      id: number;
      employee_code: string;
      full_name: string;
      position?: string;
      salary_text: string;
      department_name?: string;
    }>`
      SELECT 
        e.id, e.employee_code, e.full_name, e.position, 
        CAST(COALESCE(e.salary, 0) AS TEXT) as salary_text,
        d.name as department_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.status = 'active' AND e.salary IS NOT NULL
      ORDER BY e.employee_code
    `;
  }

  const payrollRecords: PayrollRecord[] = [];

  for (const employee of employees) {
    // Get basic attendance data for the month
    const attendanceResult = await db.queryRow<{
      total_records: number;
      work_days: number;
      total_overtime_text: string;
    }>`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN check_in IS NOT NULL AND check_out IS NOT NULL THEN 1 END) as work_days,
        CAST(COALESCE(SUM(overtime_hours), 0) AS TEXT) as total_overtime_text
      FROM timesheets t
      WHERE t.employee_id = ${employee.id} 
        AND EXTRACT(MONTH FROM t.work_date) = ${month} 
        AND EXTRACT(YEAR FROM t.work_date) = ${year}
    `;

    // Get detailed attendance status
    const statusResults = await db.queryAll<{
      work_date: Date;
      check_in?: Date;
      check_out?: Date;
      checkin_status: string;
      checkout_status: string;
    }>`
      SELECT 
        t.work_date,
        t.check_in,
        t.check_out,
        CASE 
          WHEN t.check_in IS NULL THEN 'absent'
          WHEN t.check_in > (t.work_date + INTERVAL '7 hours 5 minutes') THEN 'late'
          ELSE 'on_time'
        END as checkin_status,
        CASE 
          WHEN t.check_out IS NULL THEN 'incomplete'
          WHEN t.check_out < (t.work_date + INTERVAL '17 hours') THEN 'early_leave'
          ELSE 'on_time'
        END as checkout_status
      FROM timesheets t
      WHERE t.employee_id = ${employee.id} 
        AND EXTRACT(MONTH FROM t.work_date) = ${month} 
        AND EXTRACT(YEAR FROM t.work_date) = ${year}
    `;

    const attendance = attendanceResult || {
      total_records: 0,
      work_days: 0,
      total_overtime_text: "0",
    };

    // Parse numeric values from text
    const salary = parseFloat(employee.salary_text) || 0;
    const totalOvertimeHours = parseFloat(attendance.total_overtime_text) || 0;

    // Calculate attendance metrics
    const lateCount = statusResults.filter(
      (r) => r.checkin_status === "late"
    ).length;
    const earlyLeaveCount = statusResults.filter(
      (r) => r.checkout_status === "early_leave"
    ).length;

    // Calculate working days in the month (simple approximation)
    const daysInMonth = new Date(year, month, 0).getDate();
    const workingDaysInMonth = settings.working_days_per_month;

    // Calculate salary components
    const dailySalary = salary / settings.working_days_per_month;
    const baseSalaryAmount =
      dailySalary * Math.min(attendance.work_days, workingDaysInMonth);

    const overtimeAmount =
      (salary / settings.working_days_per_month / 8) *
      totalOvertimeHours *
      settings.overtime_rate;

    const latePenalty = lateCount * settings.late_penalty_per_day;
    const earlyLeavePenalty =
      earlyLeaveCount * settings.early_leave_penalty_per_day;
    const totalDeduction = latePenalty + earlyLeavePenalty;

    const grossSalary = baseSalaryAmount + overtimeAmount - totalDeduction;
    const taxAmount = grossSalary * (settings.tax_rate / 100);
    const insuranceAmount = grossSalary * (settings.insurance_rate / 100);
    const netSalary = grossSalary - taxAmount - insuranceAmount;

    const payrollRecord: PayrollRecord = {
      employee_id: employee.id,
      employee_name: employee.full_name,
      employee_code: employee.employee_code,
      department_name: employee.department_name,
      position: employee.position,
      base_salary: salary,
      month,
      year,

      total_work_days: workingDaysInMonth,
      actual_work_days: attendance.work_days,
      late_days: lateCount,
      early_leave_days: earlyLeaveCount,
      absent_days: Math.max(0, workingDaysInMonth - attendance.work_days),
      overtime_hours: totalOvertimeHours,

      base_salary_amount: Math.round(baseSalaryAmount),
      overtime_amount: Math.round(overtimeAmount),
      bonus_amount: 0,
      deduction_amount: Math.round(totalDeduction),
      gross_salary: Math.round(grossSalary),
      tax_amount: Math.round(taxAmount),
      insurance_amount: Math.round(insuranceAmount),
      net_salary: Math.round(netSalary),

      created_at: new Date(),
      updated_at: new Date(),
    };

    payrollRecords.push(payrollRecord);
  }

  // Calculate summary
  const summary: PayrollSummary = {
    month,
    year,
    total_employees: payrollRecords.length,
    total_gross_salary: payrollRecords.reduce(
      (sum, record) => sum + record.gross_salary,
      0
    ),
    total_net_salary: payrollRecords.reduce(
      (sum, record) => sum + record.net_salary,
      0
    ),
    total_overtime_amount: payrollRecords.reduce(
      (sum, record) => sum + record.overtime_amount,
      0
    ),
    total_bonus_amount: payrollRecords.reduce(
      (sum, record) => sum + record.bonus_amount,
      0
    ),
    total_deduction_amount: payrollRecords.reduce(
      (sum, record) => sum + record.deduction_amount,
      0
    ),
  };

  return {
    payroll_records: payrollRecords,
    summary,
    total: payrollRecords.length,
  };
});

// Helper function to get payroll settings
async function getPayrollSettings() {
  const configQuery = `
    SELECT config_key, config_value 
    FROM system_config 
    WHERE config_key IN (
      'working_days_per_month', 'overtime_rate', 'tax_rate', 
      'insurance_rate', 'late_penalty_per_day', 'early_leave_penalty_per_day'
    )
  `;

  const configs = await db.queryAll<{
    config_key: string;
    config_value: string;
  }>`
    SELECT config_key, config_value 
    FROM system_config 
    WHERE config_key IN (
      'working_days_per_month', 'overtime_rate', 'tax_rate', 
      'insurance_rate', 'late_penalty_per_day', 'early_leave_penalty_per_day'
    )
  `;

  const settings = {
    working_days_per_month: 22, // Default 22 working days per month
    overtime_rate: 1.5, // 1.5x for overtime
    tax_rate: 10, // 10% tax
    insurance_rate: 8, // 8% insurance
    late_penalty_per_day: 50000, // 50k VND per late day
    early_leave_penalty_per_day: 50000, // 50k VND per early leave day
  };

  configs.forEach((config) => {
    switch (config.config_key) {
      case "working_days_per_month":
        settings.working_days_per_month = parseInt(config.config_value);
        break;
      case "overtime_rate":
        settings.overtime_rate = parseFloat(config.config_value);
        break;
      case "tax_rate":
        settings.tax_rate = parseFloat(config.config_value);
        break;
      case "insurance_rate":
        settings.insurance_rate = parseFloat(config.config_value);
        break;
      case "late_penalty_per_day":
        settings.late_penalty_per_day = parseFloat(config.config_value);
        break;
      case "early_leave_penalty_per_day":
        settings.early_leave_penalty_per_day = parseFloat(config.config_value);
        break;
    }
  });

  return settings;
}

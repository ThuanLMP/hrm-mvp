export interface PayrollRecord {
  id?: number;
  employee_id: number;
  employee_name: string;
  employee_code: string;
  department_name?: string;
  position?: string;
  base_salary: number;
  month: number;
  year: number;
  
  // Attendance data
  total_work_days: number;
  actual_work_days: number;
  late_days: number;
  early_leave_days: number;
  absent_days: number;
  overtime_hours: number;
  
  // Salary calculation
  base_salary_amount: number;
  overtime_amount: number;
  bonus_amount: number;
  deduction_amount: number;
  gross_salary: number;
  tax_amount: number;
  insurance_amount: number;
  net_salary: number;
  
  created_at: Date;
  updated_at: Date;
}

export interface MonthlyPayrollRequest {
  month: number;
  year: number;
  employee_id?: number;
}

export interface PayrollSummary {
  month: number;
  year: number;
  total_employees: number;
  total_gross_salary: number;
  total_net_salary: number;
  total_overtime_amount: number;
  total_bonus_amount: number;
  total_deduction_amount: number;
}

export interface MonthlyPayrollResponse {
  payroll_records: PayrollRecord[];
  summary: PayrollSummary;
  total: number;
}

export interface PayrollSettings {
  working_days_per_month: number;
  overtime_rate: number; // Multiplier for overtime (e.g., 1.5)
  tax_rate: number; // Tax percentage
  insurance_rate: number; // Insurance percentage
  late_penalty_per_day: number;
  early_leave_penalty_per_day: number;
}
export interface Timesheet {
  id: number;
  employee_id: number;
  employee_name?: string;
  employee_code?: string;
  check_in?: Date;
  check_out?: Date;
  work_date: Date;
  total_hours?: number;
  overtime_hours?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  // Check-in status
  checkin_status?: 'on_time' | 'late';
  late_minutes?: number;
  // Check-out status
  checkout_status?: 'on_time' | 'early_leave';
  early_leave_minutes?: number;
}

export interface CheckInRequest {
  employee_id: number;
  notes?: string;
}

export interface CheckOutRequest {
  employee_id: number;
  notes?: string;
}

export interface ListTimesheetsResponse {
  timesheets: Timesheet[];
  total: number;
}

export interface TodayTimesheetResponse {
  timesheet?: Timesheet;
}

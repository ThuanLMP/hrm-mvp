export type LeaveType = 'annual' | 'sick' | 'personal' | 'maternity' | 'emergency';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest {
  id: number;
  employee_id: number;
  employee_name?: string;
  employee_code?: string;
  leave_type: LeaveType;
  start_date: Date;
  end_date: Date;
  total_days: number;
  reason?: string;
  status: LeaveStatus;
  approved_by?: number;
  approver_name?: string;
  approved_at?: Date;
  rejection_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateLeaveRequest {
  employee_id: number;
  leave_type: LeaveType;
  start_date: Date;
  end_date: Date;
  reason?: string;
}

export interface ApproveLeaveRequest {
  leave_request_id: number;
  approved_by: number;
  rejection_reason?: string;
}

export interface ListLeaveRequestsResponse {
  leave_requests: LeaveRequest[];
  total: number;
}

export interface LeaveBalance {
  employee_id: number;
  employee_name: string;
  employee_code: string;
  annual_leave_total: number;    // Total annual leave days per year
  annual_leave_used: number;     // Used annual leave days this year
  annual_leave_remaining: number; // Remaining annual leave days
  sick_leave_total: number;      // Total sick leave days per year
  sick_leave_used: number;       // Used sick leave days this year
  sick_leave_remaining: number;  // Remaining sick leave days
  year: number;
}

export interface LeaveBalanceResponse {
  balance: LeaveBalance;
}

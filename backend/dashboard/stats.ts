import { api } from "encore.dev/api";
import db from "../db";

export interface DepartmentStats {
  name: string;
  total_employees: number;
  present_today: number;
  attendance_rate: number;
}

export interface AttendanceTrend {
  date: string;
  total_employees: number;
  present_count: number;
  attendance_rate: number;
}

export interface LeaveStats {
  leave_type: string;
  count: number;
  percentage: number;
}

export interface OvertimeStats {
  department: string;
  total_overtime_hours: number;
  employee_count: number;
  avg_overtime_per_employee: number;
}

export interface RecentActivity {
  id: string;
  type: 'checkin' | 'checkout' | 'leave_request' | 'employee_added';
  message: string;
  timestamp: Date;
  employee_name: string;
}

export interface DashboardStats {
  // Basic stats
  total_employees: number;
  active_employees: number;
  checked_in_today: number;
  pending_leave_requests: number;
  total_departments: number;
  attendance_rate: number;
  
  // Detailed analytics
  department_stats: DepartmentStats[];
  attendance_trends: AttendanceTrend[];
  leave_statistics: LeaveStats[];
  overtime_analysis: OvertimeStats[];
  recent_activities: RecentActivity[];
  
  // Monthly summaries
  monthly_attendance_avg: number;
  monthly_leave_requests: number;
  new_employees_this_month: number;
  overtime_hours_this_month: number;
}

// Gets comprehensive dashboard statistics
export const stats = api<void, DashboardStats>(
  { expose: true, method: "GET", path: "/dashboard/stats" },
  async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentMonth = new Date().toISOString().slice(0, 7);

      // Single query for basic stats to reduce DB calls
      const basicStats = await db.queryRow<{
        total_employees: number;
        active_employees: number;
        checked_in_today: number;
        pending_leaves: number;
        total_departments: number;
        monthly_leaves: number;
        new_employees: number;
        overtime_hours: number;
      }>`
        SELECT 
          (SELECT COUNT(*) FROM employees) as total_employees,
          (SELECT COUNT(*) FROM employees WHERE status = 'active') as active_employees,
          (SELECT COUNT(*) FROM timesheets WHERE work_date = ${today} AND check_in IS NOT NULL) as checked_in_today,
          (SELECT COUNT(*) FROM leave_requests WHERE status = 'pending') as pending_leaves,
          (SELECT COUNT(*) FROM departments) as total_departments,
          (SELECT COUNT(*) FROM leave_requests WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_leaves,
          (SELECT COUNT(*) FROM employees WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) as new_employees,
          (SELECT COALESCE(SUM(overtime_hours), 0) FROM timesheets WHERE work_date >= DATE_TRUNC('month', CURRENT_DATE)) as overtime_hours
      `;

      const totalCount = basicStats?.total_employees || 0;
      const activeCount = basicStats?.active_employees || 0;
      const checkedInCount = basicStats?.checked_in_today || 0;
      const attendanceRate = activeCount > 0 ? (checkedInCount / activeCount) * 100 : 0;

      // Simplified department statistics
      const departmentStatsQuery = await db.query<DepartmentStats>`
        SELECT 
          d.name,
          COUNT(e.id)::int as total_employees,
          COUNT(t.id)::int as present_today,
          CASE 
            WHEN COUNT(e.id) > 0 THEN ROUND((COUNT(t.id) * 100.0 / COUNT(e.id))::numeric, 2)::float
            ELSE 0 
          END as attendance_rate
        FROM departments d
        LEFT JOIN employees e ON d.id = e.department_id AND e.status = 'active'
        LEFT JOIN timesheets t ON e.id = t.employee_id AND t.work_date = ${today} AND t.check_in IS NOT NULL
        GROUP BY d.id, d.name
        ORDER BY d.name
        LIMIT 10
      `;

      const departmentStats: DepartmentStats[] = [];
      for await (const row of departmentStatsQuery) {
        departmentStats.push(row);
      }

      // Simplified attendance trends (last 3 days only for performance)
      const last3Days = Array.from({ length: 3 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const attendanceTrends: AttendanceTrend[] = [];
      for (const date of last3Days) {
        const stats = await db.queryRow<{ total: number, present: number }>`
          SELECT 
            COUNT(DISTINCT e.id)::int as total,
            COUNT(DISTINCT t.employee_id)::int as present
          FROM employees e
          LEFT JOIN timesheets t ON e.id = t.employee_id AND t.work_date = ${date} AND t.check_in IS NOT NULL
          WHERE e.status = 'active'
        `;
        
        const total = stats?.total || 0;
        const present = stats?.present || 0;
        attendanceTrends.push({
          date,
          total_employees: total,
          present_count: present,
          attendance_rate: total > 0 ? Math.round((present / total) * 100 * 100) / 100 : 0
        });
      }

      // Simplified leave statistics
      const leaveStatsQuery = await db.query<{ leave_type: string, count: number }>`
        SELECT leave_type, COUNT(*)::int as count
        FROM leave_requests 
        WHERE start_date >= DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY leave_type
        ORDER BY count DESC
        LIMIT 5
      `;

      const leaveStatsArray: { leave_type: string, count: number }[] = [];
      for await (const row of leaveStatsQuery) {
        leaveStatsArray.push(row);
      }

      const totalLeaves = basicStats?.monthly_leaves || 0;
      const leaveStatistics: LeaveStats[] = leaveStatsArray.map(stat => ({
        leave_type: stat.leave_type,
        count: stat.count,
        percentage: totalLeaves > 0 ? Math.round((stat.count / totalLeaves) * 100 * 100) / 100 : 0
      }));

      // Overtime analysis by department (current month)
      const overtimeQuery = await db.query<{
        department: string;
        total_overtime_hours: number;
        employee_count: number;
        avg_overtime_per_employee: number;
      }>`
        SELECT 
          d.name as department,
          COALESCE(SUM(t.overtime_hours), 0)::float as total_overtime_hours,
          COUNT(DISTINCT e.id)::int as employee_count,
          CASE 
            WHEN COUNT(DISTINCT e.id) > 0 THEN ROUND((COALESCE(SUM(t.overtime_hours), 0) / COUNT(DISTINCT e.id))::numeric, 2)::float
            ELSE 0 
          END as avg_overtime_per_employee
        FROM departments d
        LEFT JOIN employees e ON d.id = e.department_id AND e.status = 'active'
        LEFT JOIN timesheets t ON e.id = t.employee_id 
          AND t.work_date >= DATE_TRUNC('month', CURRENT_DATE)
          AND t.overtime_hours > 0
        GROUP BY d.id, d.name
        HAVING COUNT(DISTINCT e.id) > 0
        ORDER BY total_overtime_hours DESC
        LIMIT 5
      `;

      const overtimeAnalysis: OvertimeStats[] = [];
      for await (const row of overtimeQuery) {
        overtimeAnalysis.push(row);
      }

      // Simplified recent activities (today only)
      const recentActivitiesQuery = await db.query<{ 
        id: string, 
        type: string, 
        message: string, 
        timestamp: Date, 
        employee_name: string 
      }>`
        SELECT 
          'checkin_' || t.id::text as id,
          'checkin' as type,
          'đã check-in lúc ' || TO_CHAR(t.check_in, 'HH24:MI') as message,
          t.check_in as timestamp,
          e.full_name as employee_name
        FROM timesheets t
        JOIN employees e ON t.employee_id = e.id
        WHERE t.work_date = ${today} AND t.check_in IS NOT NULL
        ORDER BY t.check_in DESC
        LIMIT 5
      `;

      const recentActivitiesArray: RecentActivity[] = [];
      for await (const row of recentActivitiesQuery) {
        recentActivitiesArray.push({
          id: row.id,
          type: row.type as 'checkin' | 'checkout' | 'leave_request' | 'employee_added',
          message: row.message,
          timestamp: row.timestamp,
          employee_name: row.employee_name
        });
      }

      // Calculate monthly attendance average from available data
      const monthlyAttendance = attendanceTrends.length > 0 
        ? attendanceTrends.reduce((sum, day) => sum + day.attendance_rate, 0) / attendanceTrends.length
        : 0;

      return {
        total_employees: totalCount,
        active_employees: activeCount,
        checked_in_today: checkedInCount,
        pending_leave_requests: basicStats?.pending_leaves || 0,
        total_departments: basicStats?.total_departments || 0,
        attendance_rate: Math.round(attendanceRate * 100) / 100,
        
        department_stats: departmentStats,
        attendance_trends: attendanceTrends,
        leave_statistics: leaveStatistics,
        overtime_analysis: overtimeAnalysis,
        recent_activities: recentActivitiesArray,
        
        monthly_attendance_avg: Math.round(monthlyAttendance * 100) / 100,
        monthly_leave_requests: basicStats?.monthly_leaves || 0,
        new_employees_this_month: basicStats?.new_employees || 0,
        overtime_hours_this_month: basicStats?.overtime_hours || 0,
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      
      // Return minimal safe data if queries fail
      return {
        total_employees: 0,
        active_employees: 0,
        checked_in_today: 0,
        pending_leave_requests: 0,
        total_departments: 0,
        attendance_rate: 0,
        department_stats: [],
        attendance_trends: [],
        leave_statistics: [],
        overtime_analysis: [],
        recent_activities: [],
        monthly_attendance_avg: 0,
        monthly_leave_requests: 0,
        new_employees_this_month: 0,
        overtime_hours_this_month: 0,
      };
    }
  }
);

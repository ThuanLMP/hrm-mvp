import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, Calendar, Building2, TrendingUp, DollarSign, UserPlus, Timer } from 'lucide-react';
import { useBackend } from '../hooks/useBackend';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AttendanceChart } from '../components/charts/AttendanceChart';
import { LeaveChart } from '../components/charts/LeaveChart';
import { DepartmentChart } from '../components/charts/DepartmentChart';
import { OvertimeChart } from '../components/charts/OvertimeChart';

export function DashboardPage() {
  const backend = useBackend();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => backend.dashboard.stats(),
  });
	console.log(stats);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const primaryStatsCards = [
    {
      title: 'Tổng số nhân viên',
      value: stats?.total_employees || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Đã chấm công hôm nay',
      value: stats?.checked_in_today || 0,
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Đơn nghỉ phép chờ duyệt',
      value: stats?.pending_leave_requests || 0,
      icon: Calendar,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Tổng số phòng ban',
      value: stats?.total_departments || 0,
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Tỷ lệ chấm công',
      value: `${stats?.attendance_rate || 0}%`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  const monthlyStatsCards = [
    {
      title: 'TB chấm công tháng này',
      value: `${stats?.monthly_attendance_avg || 0}%`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Đơn nghỉ phép tháng này',
      value: stats?.monthly_leave_requests || 0,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Nhân viên mới tháng này',
      value: stats?.new_employees_this_month || 0,
      icon: UserPlus,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    {
      title: 'Tổng giờ tăng ca',
      value: `${stats?.overtime_hours_this_month || 0}h`,
      icon: Timer,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'checkin': return 'bg-green-500';
      case 'checkout': return 'bg-blue-500';
      case 'leave_request': return 'bg-yellow-500';
      case 'employee_added': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const formatActivityTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tổng quan hệ thống</h1>
        <p className="text-gray-600">Thông tin chi tiết và phân tích dữ liệu nhân sự</p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {primaryStatsCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-md`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Thống kê tháng này</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {monthlyStatsCards.map((stat, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className={`${stat.bgColor} p-2 rounded-md`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{stat.value}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Xu hướng chấm công 7 ngày qua</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.attendance_trends ? (
              <AttendanceChart data={stats.attendance_trends} />
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                Không có dữ liệu chấm công
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leave Statistics Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Thống kê nghỉ phép tháng này</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.leave_statistics ? (
              <LeaveChart data={stats.leave_statistics} />
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                Không có dữ liệu nghỉ phép
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department and Overtime Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Department Stats */}
        <Card className="min-h-0">
          <CardHeader>
            <CardTitle className="text-lg">Thống kê theo phòng ban</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {stats?.department_stats ? (
              <DepartmentChart data={stats.department_stats} />
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                Không có dữ liệu phòng ban
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overtime Analysis */}
        <Card className="min-h-0">
          <CardHeader>
            <CardTitle className="text-lg">Phân tích tăng ca theo phòng ban</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {stats?.overtime_analysis ? (
              <OvertimeChart data={stats.overtime_analysis} />
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                Không có dữ liệu tăng ca
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {stats?.recent_activities && stats.recent_activities.length > 0 ? (
                stats.recent_activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 ${getActivityIcon(activity.type)} rounded-full mt-2`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium">
                        {activity.employee_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatActivityTime(activity.timestamp.toString())}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Không có hoạt động gần đây
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Thông báo hệ thống</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  📊 Báo cáo tự động
                </h4>
                <p className="text-sm text-blue-700">
                  Hệ thống đã tạo báo cáo chấm công tuần tự động. Tỷ lệ chấm công trung bình: {stats?.monthly_attendance_avg || 0}%
                </p>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-sm font-medium text-green-900 mb-2">
                  ✅ Dữ liệu đã cập nhật
                </h4>
                <p className="text-sm text-green-700">
                  Dữ liệu lương và phúc lợi đã được cập nhật cho tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-900 mb-2">
                    ⏳ Cần xử lý
                  </h4>
                  <p className="text-sm text-yellow-700">
                    Có {stats?.pending_leave_requests || 0} đơn nghỉ phép đang chờ duyệt
                  </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

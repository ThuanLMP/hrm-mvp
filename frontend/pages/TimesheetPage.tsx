import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, LogIn, LogOut, Calendar, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useBackend } from '../hooks/useBackend';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatTime, formatDate, formatDuration } from '../utils/dateHelpers';

export function TimesheetPage() {
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const backend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get current user's employee data
  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => backend.employee.list({ limit: 100 }),
  });

  const currentEmployee = employees?.employees.find(emp => emp.user_id === user?.id);

  // Get today's timesheet for current employee
  const { data: todayTimesheet, isLoading: todayLoading } = useQuery({
    queryKey: ['timesheet-today', currentEmployee?.id],
    queryFn: () => backend.timesheet.today({ employee_id: currentEmployee?.id! }),
    enabled: Boolean(currentEmployee?.id),
  });

  // Get timesheets list
  const { data: timesheets, isLoading: timesheetsLoading } = useQuery({
    queryKey: ['timesheets', selectedEmployee, dateFilter, currentEmployee?.id],
    queryFn: () => {
      // For employees, force their own data only
      const employeeId = canViewAllTimesheets 
        ? (selectedEmployee && selectedEmployee !== 'all' ? parseInt(selectedEmployee) : undefined)
        : currentEmployee?.id;
        
      return backend.timesheet.list({
        employee_id: employeeId,
        start_date: dateFilter,
        end_date: dateFilter,
        limit: 100,
      });
    },
    enabled: Boolean(currentEmployee?.id),
  });

  const checkInMutation = useMutation({
    mutationFn: () => backend.timesheet.checkIn({
      employee_id: currentEmployee?.id!,
    }),
    onSuccess: () => {
      toast({
        title: "Check-in thành công",
        description: "Bạn đã check-in thành công!",
      });
      queryClient.invalidateQueries({ queryKey: ['timesheet-today'] });
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
    onError: (error: any) => {
      console.error('Check-in error:', error);
      toast({
        title: "Check-in thất bại",
        description: error?.message || "Không thể check-in",
        variant: "destructive",
      });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: () => backend.timesheet.checkOut({
      employee_id: currentEmployee?.id!,
    }),
    onSuccess: () => {
      toast({
        title: "Check-out thành công",
        description: "Bạn đã check-out thành công!",
      });
      queryClient.invalidateQueries({ queryKey: ['timesheet-today'] });
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
    onError: (error: any) => {
      console.error('Check-out error:', error);
      toast({
        title: "Check-out thất bại",
        description: error?.message || "Không thể check-out",
        variant: "destructive",
      });
    },
  });

  const canViewAllTimesheets = user?.role === 'admin' || user?.role === 'hr' || user?.role === 'manager';



  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {canViewAllTimesheets ? 'Quản lý chấm công' : 'Chấm công của tôi'}
        </h1>
        <p className="text-gray-600">
          {canViewAllTimesheets ? 'Chấm công và theo dõi thời gian làm việc' : 'Chấm công và xem lịch sử làm việc'}
        </p>
      </div>

      {/* Current Employee Check-in/out */}
      {currentEmployee && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Chấm công hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Nhân viên: <span className="font-medium">{currentEmployee.full_name}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Ngày: <span className="font-medium">{new Date().toLocaleDateString('vi-VN')}</span>
                </p>
                {todayTimesheet?.timesheet && (
                  <div className="flex space-x-4 text-sm">
                    {todayTimesheet.timesheet.check_in && (
                      <span className="text-green-600">
                        <LogIn className="inline h-4 w-4 mr-1" />
                        Vào: {formatTime(todayTimesheet.timesheet.check_in)}
                      </span>
                    )}
                    {todayTimesheet.timesheet.check_out && (
                      <span className="text-red-600">
                        <LogOut className="inline h-4 w-4 mr-1" />
                        Ra: {formatTime(todayTimesheet.timesheet.check_out)}
                      </span>
                    )}
                    {todayTimesheet.timesheet.total_hours && (
                      <span className="text-blue-600">
                        Tổng: {formatDuration(todayTimesheet.timesheet.total_hours)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                {(!todayTimesheet?.timesheet || !todayTimesheet.timesheet.check_in) && (
                  <Button
                    onClick={() => checkInMutation.mutate()}
                    disabled={checkInMutation.isPending || todayLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Check-in
                  </Button>
                )}

                {todayTimesheet?.timesheet?.check_in && !todayTimesheet.timesheet.check_out && (
                  <Button
                    onClick={() => checkOutMutation.mutate()}
                    disabled={checkOutMutation.isPending}
                    variant="destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Check-out
                  </Button>
                )}

                {todayTimesheet?.timesheet?.check_in && todayTimesheet.timesheet.check_out && (
                  <Badge className="px-4 py-2">
                    <Clock className="h-4 w-4 mr-2" />
                    Đã hoàn thành
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timesheet History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Lịch sử chấm công
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Ngày</label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            {canViewAllTimesheets && (
              <div>
                <label className="text-sm font-medium mb-2 block">Nhân viên</label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả nhân viên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả nhân viên</SelectItem>
                    {employees?.employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.full_name} ({employee.employee_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedEmployee('all');
                  setDateFilter(new Date().toISOString().split('T')[0]);
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>

          {timesheetsLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nhân viên</th>
                    <th className="text-left py-3 px-4">Ngày</th>
                    <th className="text-left py-3 px-4">Check-in</th>
                    <th className="text-left py-3 px-4">Trạng thái vào</th>
                    <th className="text-left py-3 px-4">Check-out</th>
                    <th className="text-left py-3 px-4">Trạng thái ra</th>
                    <th className="text-left py-3 px-4">Tổng giờ</th>
                    <th className="text-left py-3 px-4">Tăng ca</th>
                    <th className="text-left py-3 px-4">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {timesheets?.timesheets.map((timesheet) => (
                    <tr key={timesheet.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <div>
                            <p className="font-medium">{timesheet.employee_name}</p>
                            <p className="text-sm text-gray-500">{timesheet.employee_code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(timesheet.work_date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-4">
                        {timesheet.check_in ? (
                          <Badge variant="secondary" className="text-green-700 bg-green-50">
                            {formatTime(timesheet.check_in)}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {timesheet.check_in ? (
                          timesheet.checkin_status === 'on_time' ? (
                            <Badge variant="secondary" className="text-green-700 bg-green-50">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Đúng giờ
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-orange-700 bg-orange-50">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Muộn {timesheet.late_minutes}p
                            </Badge>
                          )
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {timesheet.check_out ? (
                          <Badge variant="secondary" className="text-red-700 bg-red-50">
                            {formatTime(timesheet.check_out)}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {timesheet.check_out ? (
                          timesheet.checkout_status === 'on_time' ? (
                            <Badge variant="secondary" className="text-green-700 bg-green-50">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Đúng giờ
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-blue-700 bg-blue-50">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Về sớm {timesheet.early_leave_minutes}p
                            </Badge>
                          )
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {timesheet.total_hours ? (
                          <span className="font-medium">
                            {formatDuration(timesheet.total_hours)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {timesheet.overtime_hours && timesheet.overtime_hours > 0 ? (
                          <Badge variant="secondary" className="text-orange-700 bg-orange-50">
                            {formatDuration(timesheet.overtime_hours)}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {timesheet.notes || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {timesheets?.timesheets.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Không có dữ liệu chấm công
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, Calculator, TrendingUp, Users, Clock, AlertTriangle } from 'lucide-react';
import { useBackend } from '../hooks/useBackend';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function PayrollPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isCalculating, setIsCalculating] = useState(false);
  const backend = useBackend();

  // Get payroll data for selected month
  const { data: payrollData, isLoading, refetch } = useQuery({
    queryKey: ['payroll', selectedMonth, selectedYear],
    queryFn: () => backend.payroll.calculateMonthly({
      month: selectedMonth,
      year: selectedYear,
    }),
    enabled: false, // Only fetch when manually triggered
  });

  const handleCalculatePayroll = async () => {
    setIsCalculating(true);
    try {
      await refetch();
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const months = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bảng lương</h1>
        <p className="text-gray-600">Quản lý và tính toán bảng lương nhân viên theo tháng</p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Tính lương theo tháng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-2 block">Tháng</label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Năm</label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Button 
                onClick={handleCalculatePayroll}
                disabled={isCalculating}
                className="w-full"
              >
                {isCalculating ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Tính lương {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {payrollData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng nhân viên</p>
                  <p className="text-2xl font-bold text-gray-900">{payrollData.summary.total_employees}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng lương thực nhận</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(payrollData.summary.total_net_salary)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng tiền tăng ca</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(payrollData.summary.total_overtime_amount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng khấu trừ</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(payrollData.summary.total_deduction_amount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payroll Table */}
      {payrollData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Chi tiết bảng lương {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nhân viên</th>
                    <th className="text-left py-3 px-4">Chức vụ</th>
                    <th className="text-left py-3 px-4">Lương cơ bản</th>
                    <th className="text-left py-3 px-4">Công làm</th>
                    <th className="text-left py-3 px-4">Tăng ca</th>
                    <th className="text-left py-3 px-4">Khấu trừ</th>
                    <th className="text-left py-3 px-4">Thực nhận</th>
                    <th className="text-left py-3 px-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollData.payroll_records.map((record) => (
                    <tr key={record.employee_id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{record.employee_name}</p>
                          <p className="text-sm text-gray-500">{record.employee_code}</p>
                          {record.department_name && (
                            <p className="text-xs text-gray-400">{record.department_name}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{record.position || '-'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{formatCurrency(record.base_salary)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <span className="font-medium">{record.actual_work_days}</span>
                          <span className="text-gray-500">/{record.total_work_days}</span>
                          {record.absent_days > 0 && (
                            <p className="text-xs text-red-600">Vắng: {record.absent_days} ngày</p>
                          )}
                          {record.late_days > 0 && (
                            <p className="text-xs text-orange-600">Muộn: {record.late_days} lần</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {record.overtime_hours > 0 ? (
                          <div className="text-sm">
                            <p className="font-medium">{record.overtime_hours}h</p>
                            <p className="text-green-600">{formatCurrency(record.overtime_amount)}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {record.deduction_amount > 0 ? (
                          <span className="text-red-600 font-medium">
                            -{formatCurrency(record.deduction_amount)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-green-600">
                          {formatCurrency(record.net_salary)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {record.absent_days === 0 && record.late_days === 0 ? (
                          <Badge className="bg-green-50 text-green-700">Tốt</Badge>
                        ) : record.absent_days > 2 || record.late_days > 3 ? (
                          <Badge variant="destructive">Cần cải thiện</Badge>
                        ) : (
                          <Badge variant="secondary">Bình thường</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {payrollData.payroll_records.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Không có dữ liệu lương cho tháng này
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show loading state */}
      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </div>
      )}

      {/* Instructions */}
      {!payrollData && !isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tính lương theo tháng</h3>
              <p className="text-gray-600 mb-4">
                Chọn tháng và năm, sau đó nhấn "Tính lương" để xem bảng lương chi tiết.
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>• Lương được tính dựa trên số ngày làm việc thực tế</p>
                <p>• Bao gồm tính toán tăng ca, khấu trừ đi muộn/về sớm</p>
                <p>• Tự động tính thuế và bảo hiểm</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
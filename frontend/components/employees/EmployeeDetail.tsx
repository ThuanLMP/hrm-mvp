import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, User, Phone, MapPin, Calendar, Briefcase, Building2, Map } from 'lucide-react';
import { useBackend } from '../../hooks/useBackend';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/dateHelpers';

export function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const backend = useBackend();
  const { user } = useAuth();

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => backend.employee.get({ id: parseInt(id!) }),
    enabled: Boolean(id),
  });

  const canEdit = user?.role === 'admin' || user?.role === 'hr';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không tìm thấy nhân viên</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      terminated: 'destructive',
    } as const;
    
    const labels = {
      active: 'Đang làm việc',
      inactive: 'Tạm nghỉ',
      terminated: 'Đã nghỉ việc',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/employees')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết nhân viên</h1>
            <p className="text-gray-600">{employee.employee_code}</p>
          </div>
        </div>
        
        {canEdit && (
          <Button onClick={() => navigate(`/employees/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                {employee.photo_url ? (
                  <img
                    src={employee.photo_url}
                    alt={employee.full_name}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-gray-200"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.full_name)}&background=3b82f6&color=fff&size=96`;
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <h3 className="text-xl font-bold">{employee.full_name}</h3>
                <p className="text-gray-600">{employee.employee_code}</p>
                {getStatusBadge(employee.status)}
              </div>

              <div className="space-y-3 mt-6">
                {employee.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{employee.phone}</span>
                  </div>
                )}

                {employee.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-sm">{employee.address}</span>
                  </div>
                )}

                {employee.date_of_birth && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      Sinh ngày: {formatDate(employee.date_of_birth as any)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Thông tin công việc
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Ngày vào làm</Label>
                    <p className="font-medium">{formatDate(employee.hire_date as any)}</p>
                  </div>

                  {employee.position && (
                    <div>
                      <Label>Chức vụ</Label>
                      <p className="font-medium">{employee.position}</p>
                    </div>
                  )}

                  {employee.department_name && (
                    <div>
                      <Label>Phòng ban</Label>
                      <p className="font-medium flex items-center">
                        <Building2 className="h-4 w-4 mr-2" />
                        {employee.department_name}
                      </p>
                    </div>
                  )}

                  {employee.region_name && (
                    <div>
                      <Label>Khu vực</Label>
                      <p className="font-medium flex items-center">
                        <Map className="h-4 w-4 mr-2" />
                        {employee.region_name}
                      </p>
                    </div>
                  )}

                  {employee.salary && (
                    <div>
                      <Label>Lương</Label>
                      <p className="font-medium text-green-600">
                        {formatCurrency(employee.salary)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thống kê</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <p className="text-sm text-gray-600">Ngày nghỉ phép đã dùng</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">22</div>
                    <p className="text-sm text-gray-600">Ngày làm việc tháng này</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">2</div>
                    <p className="text-sm text-gray-600">Lần đi muộn tháng này</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-500 mb-1">{children}</p>;
}

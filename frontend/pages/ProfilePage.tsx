import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Building2, Camera, Save, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useBackend } from '../hooks/useBackend';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatDate } from '../utils/dateHelpers';

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    date_of_birth: '',
    position: '',
    photo_url: '',
  });

  const backend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get current user's employee data
  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => backend.employee.list({ limit: 100 }),
  });

  const currentEmployee = employees?.employees.find(emp => emp.user_id === user?.id);

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => backend.department.list(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => backend.employee.update({ id: currentEmployee?.id!, ...data }),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Thông tin cá nhân đã được cập nhật",
      });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      console.error('Update profile error:', error);
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể cập nhật thông tin",
        variant: "destructive",
      });
    },
  });

  // Initialize form data when employee data loads
  React.useEffect(() => {
    if (currentEmployee) {
      setFormData({
        full_name: currentEmployee.full_name,
        phone: currentEmployee.phone || '',
        address: currentEmployee.address || '',
        date_of_birth: currentEmployee.date_of_birth ? new Date(currentEmployee.date_of_birth).toISOString().split('T')[0] : '',
        position: currentEmployee.position || '',
        photo_url: currentEmployee.photo_url || '',
      });
    }
  }, [currentEmployee]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmployee) return;

    const submitData = {
      full_name: formData.full_name.trim(),
      phone: formData.phone && formData.phone.trim() !== '' ? formData.phone.trim() : undefined,
      address: formData.address && formData.address.trim() !== '' ? formData.address.trim() : undefined,
      date_of_birth: formData.date_of_birth && formData.date_of_birth.trim() !== '' ? new Date(formData.date_of_birth) : undefined,
      position: formData.position && formData.position.trim() !== '' ? formData.position.trim() : undefined,
      photo_url: formData.photo_url && formData.photo_url.trim() !== '' ? formData.photo_url.trim() : undefined,
    };

    updateMutation.mutate(submitData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentEmployee) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Không tìm thấy thông tin nhân viên</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin cá nhân của bạn</p>
        </div>
        <Button
          onClick={() => {
            if (isEditing) {
              setIsEditing(false);
              // Reset form data
              setFormData({
                full_name: currentEmployee.full_name,
                phone: currentEmployee.phone || '',
                address: currentEmployee.address || '',
                date_of_birth: currentEmployee.date_of_birth ? new Date(currentEmployee.date_of_birth).toISOString().split('T')[0] : '',
                position: currentEmployee.position || '',
                photo_url: currentEmployee.photo_url || '',
              });
            } else {
              setIsEditing(true);
            }
          }}
          variant={isEditing ? "outline" : "default"}
        >
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? 'Hủy' : 'Chỉnh sửa'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Thông tin cơ bản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="relative inline-block">
                {(isEditing ? formData.photo_url : currentEmployee.photo_url) ? (
                  <img
                    src={isEditing ? formData.photo_url : currentEmployee.photo_url}
                    alt={currentEmployee.full_name}
                    className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-gray-200"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentEmployee.full_name)}&background=3b82f6&color=fff&size=96`;
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                {isEditing && (
                  <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1">
                    <Camera className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="mt-4">
                  <Label htmlFor="photo_url">URL ảnh</Label>
                  <Input
                    id="photo_url"
                    type="url"
                    value={formData.photo_url}
                    onChange={(e) => handleInputChange('photo_url', e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-500">Mã nhân viên</Label>
                <p className="font-medium">{currentEmployee.employee_code}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Trạng thái</Label>
                <div className="mt-1">
                  {getStatusBadge(currentEmployee.status)}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="font-medium">{user?.email}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Vai trò</Label>
                <p className="font-medium capitalize">{user?.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin chi tiết</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Họ và tên *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="date_of_birth">Ngày sinh</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="position">Chức vụ</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Họ và tên</Label>
                      <p className="font-medium">{currentEmployee.full_name}</p>
                    </div>
                  </div>

                  {currentEmployee.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Số điện thoại</Label>
                        <p className="font-medium">{currentEmployee.phone}</p>
                      </div>
                    </div>
                  )}

                  {currentEmployee.date_of_birth && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Ngày sinh</Label>
                        <p className="font-medium">{formatDate(currentEmployee.date_of_birth as any)}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {currentEmployee.position && (
                    <div className="flex items-center space-x-3">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Chức vụ</Label>
                        <p className="font-medium">{currentEmployee.position}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Phòng ban</Label>
                      <p className="font-medium">{currentEmployee.department_name || 'Chưa phân công'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Ngày vào làm</Label>
                      <p className="font-medium">{formatDate(currentEmployee.hire_date as any)}</p>
                    </div>
                  </div>
                </div>

                {currentEmployee.address && (
                  <div className="md:col-span-2">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Địa chỉ</Label>
                        <p className="font-medium">{currentEmployee.address}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
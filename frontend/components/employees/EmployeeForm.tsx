import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useBackend } from '../../hooks/useBackend';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const backend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'employee',
    employee_code: '',
    full_name: '',
    phone: '',
    address: '',
    date_of_birth: '',
    hire_date: '',
    position: '',
    department_id: '',
    region_id: '',
    salary: '',
    status: 'active',
    photo_url: '',
  });

  const { data: employee, isLoading: employeeLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => backend.employee.get({ id: parseInt(id!) }),
    enabled: isEdit,
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => backend.department.list(),
  });

  const { data: regions } = useQuery({
    queryKey: ['regions'],
    queryFn: () => backend.region.list(),
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        email: '',
        password: '',
        role: 'employee',
        employee_code: employee.employee_code,
        full_name: employee.full_name,
        phone: employee.phone || '',
        address: employee.address || '',
        date_of_birth: employee.date_of_birth ? new Date(employee.date_of_birth).toISOString().split('T')[0] : '',
        hire_date: new Date(employee.hire_date).toISOString().split('T')[0],
        position: employee.position || '',
        department_id: employee.department_id?.toString() || '',
        region_id: employee.region_id?.toString() || '',
        salary: employee.salary?.toString() || '',
        status: employee.status,
        photo_url: employee.photo_url || '',
      });
    }
  }, [employee]);

  const createMutation = useMutation({
    mutationFn: (data: any) => backend.employee.create(data),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Nhân viên đã được tạo thành công",
      });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      navigate('/employees');
    },
    onError: (error: any) => {
      console.error('Create employee error:', error);
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể tạo nhân viên",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => backend.employee.update({ id: parseInt(id!), ...data }),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Thông tin nhân viên đã được cập nhật",
      });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      navigate('/employees');
    },
    onError: (error: any) => {
      console.error('Update employee error:', error);
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể cập nhật nhân viên",
        variant: "destructive",
      });
    },
  });

  if (isEdit && employeeLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.hire_date || formData.hire_date.trim() === '') {
      toast({
        title: "Lỗi",
        description: "Ngày vào làm là bắt buộc",
        variant: "destructive",
      });
      return;
    }
    
    const submitData = {
      employee_code: formData.employee_code.trim(),
      full_name: formData.full_name.trim(),
      role: formData.role,
      status: formData.status,
      department_id: formData.department_id && formData.department_id !== 'none' ? parseInt(formData.department_id) : undefined,
      region_id: formData.region_id && formData.region_id !== 'none' ? parseInt(formData.region_id) : undefined,
      salary: formData.salary && formData.salary.trim() !== '' ? parseFloat(formData.salary) : undefined,
      date_of_birth: formData.date_of_birth && formData.date_of_birth.trim() !== '' ? new Date(formData.date_of_birth) : undefined,
      hire_date: new Date(formData.hire_date.trim()),
      phone: formData.phone && formData.phone.trim() !== '' ? formData.phone.trim() : undefined,
      address: formData.address && formData.address.trim() !== '' ? formData.address.trim() : undefined,
      position: formData.position && formData.position.trim() !== '' ? formData.position.trim() : undefined,
      photo_url: formData.photo_url && formData.photo_url.trim() !== '' ? formData.photo_url.trim() : undefined,
      email: formData.email && formData.email.trim() !== '' ? formData.email.trim() : undefined,
      password: formData.password && formData.password.trim() !== '' ? formData.password.trim() : undefined,
    };

    if (isEdit) {
      const { email, password, role, employee_code, hire_date, ...updateData } = submitData;
      updateMutation.mutate(updateData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/employees')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="employee_code">Mã nhân viên *</Label>
                <Input
                  id="employee_code"
                  value={formData.employee_code}
                  onChange={(e) => handleInputChange('employee_code', e.target.value)}
                  required
                  disabled={isEdit}
                />
              </div>

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
                <Label htmlFor="photo_url">Ảnh nhân viên</Label>
                <Input
                  id="photo_url"
                  type="url"
                  value={formData.photo_url}
                  onChange={(e) => handleInputChange('photo_url', e.target.value)}
                  placeholder="URL ảnh nhân viên"
                />
                {formData.photo_url && (
                  <div className="mt-2">
                    <img
                      src={formData.photo_url}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
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
                <Label htmlFor="address">Địa chỉ</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin công việc</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hire_date">Ngày vào làm *</Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => handleInputChange('hire_date', e.target.value)}
                  required
                  disabled={isEdit}
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

              <div>
                <Label htmlFor="department_id">Phòng ban</Label>
                <Select value={formData.department_id} onValueChange={(value) => handleInputChange('department_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng ban" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không có</SelectItem>
                    {departments?.departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="region_id">Khu vực</Label>
                <Select value={formData.region_id} onValueChange={(value) => handleInputChange('region_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khu vực" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không có</SelectItem>
                    {regions?.regions.map((region) => (
                      <SelectItem key={region.id} value={region.id.toString()}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="salary">Lương (VND)</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                />
              </div>

              {isEdit && (
                <div>
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Đang làm việc</SelectItem>
                      <SelectItem value="inactive">Tạm nghỉ</SelectItem>
                      <SelectItem value="terminated">Đã nghỉ việc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {!isEdit && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Thông tin tài khoản (Tùy chọn)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Để trống nếu không tạo tài khoản"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Để trống nếu không tạo tài khoản"
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Vai trò</Label>
                    <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Nhân viên</SelectItem>
                        <SelectItem value="manager">Quản lý</SelectItem>
                        <SelectItem value="hr">Nhân sự</SelectItem>
                        <SelectItem value="admin">Quản trị viên</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/employees')}
          >
            Hủy
          </Button>
          <Button 
            type="submit" 
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </div>
      </form>
    </div>
  );
}

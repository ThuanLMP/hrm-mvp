import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Building2, Users, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useBackend } from '../hooks/useBackend';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function DepartmentsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any>(null);
  const backend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager_id: '',
  });

  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => backend.department.list(),
  });

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => backend.employee.list({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => backend.department.create(data),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Phòng ban đã được tạo thành công",
      });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Create department error:', error);
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể tạo phòng ban",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => backend.department.update(data),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Phòng ban đã được cập nhật",
      });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setEditingDepartment(null);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Update department error:', error);
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể cập nhật phòng ban",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => backend.department.deleteDepartment({ id }),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Phòng ban đã được xóa",
      });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (error: any) => {
      console.error('Delete department error:', error);
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể xóa phòng ban",
        variant: "destructive",
      });
    },
  });

  const canManage = user?.role === 'admin' || user?.role === 'hr';

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      manager_id: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      manager_id: formData.manager_id && formData.manager_id !== 'none' ? parseInt(formData.manager_id) : undefined,
    };

    if (editingDepartment) {
      updateMutation.mutate({
        id: editingDepartment.id,
        ...submitData,
      });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (department: any) => {
    setFormData({
      name: department.name,
      description: department.description || '',
      manager_id: department.manager_id?.toString() || '',
    });
    setEditingDepartment(department);
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa phòng ban "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý phòng ban</h1>
          <p className="text-gray-600">Danh sách và thông tin các phòng ban</p>
        </div>
        
        {canManage && (
          <Dialog 
            open={isCreateOpen || editingDepartment} 
            onOpenChange={(open) => {
              if (!open) {
                setIsCreateOpen(false);
                setEditingDepartment(null);
                resetForm();
              } else {
                setIsCreateOpen(true);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Thêm phòng ban
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingDepartment ? 'Chỉnh sửa phòng ban' : 'Thêm phòng ban mới'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Tên phòng ban *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="manager_id">Trưởng phòng</Label>
                  <Select 
                    value={formData.manager_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, manager_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trưởng phòng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không có</SelectItem>
                      {employees?.employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.full_name} ({employee.employee_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateOpen(false);
                      setEditingDepartment(null);
                      resetForm();
                    }}
                  >
                    Hủy
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending 
                      ? 'Đang lưu...' 
                      : editingDepartment ? 'Cập nhật' : 'Tạo mới'
                    }
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments?.departments.map((department) => (
          <Card key={department.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  <span>{department.name}</span>
                </div>
                {canManage && (
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(department)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(department.id, department.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {department.description && (
                  <p className="text-sm text-gray-600">
                    {department.description}
                  </p>
                )}
                
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{department.employee_count || 0} nhân viên</span>
                </div>
                
                {department.manager_name && (
                  <div className="text-sm">
                    <span className="text-gray-500">Trưởng phòng: </span>
                    <span className="font-medium">{department.manager_name}</span>
                  </div>
                )}
                
                <div className="text-xs text-gray-400">
                  Tạo: {new Date(department.created_at).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {departments?.departments.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Chưa có phòng ban nào</p>
            {canManage && (
              <p className="text-sm text-gray-400 mt-2">
                Nhấn "Thêm phòng ban" để tạo phòng ban đầu tiên
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { 
  Shield, 
  Plus, 
  Search, 
  Eye, 
  Edit2, 
  Trash2, 
  User, 
  FileText,
  Building,
  Calendar,
  CreditCard
} from 'lucide-react';
import { InsuranceForm } from '../components/insurance/InsuranceForm';
import { InsuranceDetail } from '../components/insurance/InsuranceDetail';
import backend from '~backend/client';
import { useAuth } from '../contexts/AuthContext';
import type { InsuranceWithEmployee } from '~backend/insurance/types';

type ViewMode = 'list' | 'form' | 'detail';

export function InsurancePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Check if user has permission to access insurance records
  if (!user || !['admin', 'hr'].includes(user.role)) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Truy cập bị từ chối</h2>
        <p className="text-gray-600">Chỉ có Admin và HR mới có thể truy cập chức năng quản lý bảo hiểm.</p>
      </div>
    );
  }
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [records, setRecords] = useState<InsuranceWithEmployee[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<InsuranceWithEmployee | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 20
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (viewMode === 'list') {
      loadRecords();
    }
  }, [viewMode, filters]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const response = await backend.insurance.list({
        page: filters.page,
        limit: filters.limit,
        search: filters.search || undefined,
        status: filters.status || undefined
      });
      setRecords(response.records);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load insurance records:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách hồ sơ bảo hiểm",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  const handleView = async (id: string) => {
    try {
      const record = await backend.insurance.get({ id });
      setSelectedRecord(record);
      setViewMode('detail');
    } catch (error) {
      console.error('Failed to load insurance record:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin hồ sơ bảo hiểm",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (record: InsuranceWithEmployee) => {
    setSelectedRecord(record);
    setViewMode('form');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hồ sơ bảo hiểm này?')) {
      return;
    }

    try {
      await backend.insurance.remove({ id });
      toast({
        title: "Thành công",
        description: "Xóa hồ sơ bảo hiểm thành công"
      });
      loadRecords();
    } catch (error) {
      console.error('Failed to delete insurance record:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa hồ sơ bảo hiểm",
        variant: "destructive"
      });
    }
  };

  const handleFormSuccess = () => {
    setViewMode('list');
    setSelectedRecord(null);
    loadRecords();
  };

  const handleFormCancel = () => {
    setViewMode('list');
    setSelectedRecord(null);
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive'
    } as const;

    const labels = {
      active: 'Hoạt động',
      inactive: 'Ngưng',
      suspended: 'Tạm ngưng'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  if (viewMode === 'form') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedRecord ? 'Chỉnh sửa hồ sơ bảo hiểm' : 'Tạo hồ sơ bảo hiểm mới'}
            </h1>
            <p className="text-gray-600">
              Quản lý thông tin pháp lý và bảo hiểm của nhân viên
            </p>
          </div>
        </div>
        <InsuranceForm
          record={selectedRecord || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  if (viewMode === 'detail' && selectedRecord) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết hồ sơ bảo hiểm</h1>
            <p className="text-gray-600">
              Thông tin chi tiết hồ sơ bảo hiểm của {selectedRecord.employee_name}
            </p>
          </div>
          <Button variant="outline" onClick={() => setViewMode('list')}>
            Quay lại danh sách
          </Button>
        </div>
        <InsuranceDetail
          record={selectedRecord}
          onEdit={() => handleEdit(selectedRecord)}
          onDelete={() => handleDelete(selectedRecord.id)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Bảo hiểm</h1>
          <p className="text-gray-600">
            Quản lý thông tin pháp lý, thuế TNCN, bảo hiểm xã hội và hợp đồng lao động
          </p>
        </div>
        <Button onClick={() => setViewMode('form')}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo hồ sơ mới
        </Button>
      </div>

      {/* Bộ lọc */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm theo tên, mã NV, MST, số BH..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? "" : value, page: 1 })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Ngưng hoạt động</SelectItem>
                <SelectItem value="suspended">Tạm ngưng</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng hồ sơ</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {records.filter(r => r.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tạm ngưng</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {records.filter(r => r.status === 'suspended').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ngưng hoạt động</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {records.filter(r => r.status === 'inactive').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danh sách hồ sơ */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách hồ sơ bảo hiểm</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không có hồ sơ bảo hiểm nào
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={record.employee_photo_url} />
                        <AvatarFallback>
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{record.employee_name}</h3>
                          <Badge variant="outline">ID: {record.id}</Badge>
                          {getStatusBadge(record.status)}
                          {record.is_shared && <Badge variant="secondary">Dùng chung</Badge>}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {record.employee_code}
                          </div>
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            {record.department_name || 'Chưa xác định'}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(record.date_created)}
                          </div>
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-1" />
                            {record.tax_code || 'Chưa có MST'}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Đơn vị:</span> {record.company_unit}
                          {record.social_insurance_number && (
                            <>
                              <span className="ml-4 font-medium">Số BH:</span> {record.social_insurance_number}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(record.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(record)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Phân trang */}
          {total > filters.limit && (
            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={filters.page === 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              >
                Trước
              </Button>
              <span className="flex items-center px-4">
                Trang {filters.page} / {Math.ceil(total / filters.limit)}
              </span>
              <Button
                variant="outline"
                disabled={filters.page >= Math.ceil(total / filters.limit)}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              >
                Sau
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
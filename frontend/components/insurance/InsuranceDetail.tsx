import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit2, Trash2, User, Calendar, CreditCard, MapPin, Phone, Building } from 'lucide-react';
import type { InsuranceWithEmployee } from '~backend/insurance/types';

interface InsuranceDetailProps {
  record: InsuranceWithEmployee;
  onEdit: () => void;
  onDelete: () => void;
  canEdit?: boolean;
}

export function InsuranceDetail({ record, onEdit, onDelete, canEdit = true }: InsuranceDetailProps) {
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
      active: 'Đang hoạt động',
      inactive: 'Ngưng hoạt động', 
      suspended: 'Tạm ngưng'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getMaritalStatusLabel = (status: string) => {
    const labels = {
      single: 'Độc thân',
      married: 'Đã kết hôn',
      divorced: 'Đã ly hôn',
      widowed: 'Góa bụa'
    } as const;
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header với thông tin nhân viên */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={record.employee_photo_url} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{record.employee_name}</h2>
                <p className="text-gray-600">Mã NV: {record.employee_code}</p>
                <p className="text-gray-600">Phòng ban: {record.department_name || 'Chưa xác định'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">ID: {record.id}</Badge>
                  {getStatusBadge(record.status)}
                  {record.is_shared && <Badge variant="secondary">Dùng chung</Badge>}
                </div>
              </div>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Sửa
                </Button>
                <Button variant="destructive" size="sm" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Xóa
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thông tin cơ bản */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Thông tin cơ bản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Đơn vị</label>
                <p className="font-medium">{record.company_unit}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày tạo hồ sơ</label>
                <p className="font-medium">{formatDate(record.date_created)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày ký HĐLĐ</label>
                <p className="font-medium">{formatDate(record.contract_date)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tình trạng hôn nhân</label>
                <p className="font-medium">{record.marital_status ? getMaritalStatusLabel(record.marital_status) : '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Số con hiện tại</label>
                <p className="font-medium">{record.number_of_children || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Giấy tờ tùy thân */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Giấy tờ tùy thân
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">CMND/Hộ chiếu</label>
                <p className="font-medium">{record.id_number || '-'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày cấp</label>
                  <p className="font-medium">{formatDate(record.id_issue_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nơi cấp</label>
                  <p className="font-medium">{record.id_issue_place || '-'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày hết hạn CCCD</label>
                <p className="font-medium">{formatDate(record.cccd_expiry_date)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Địa chỉ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Thông tin địa chỉ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Hộ khẩu</label>
              <p className="font-medium">{record.household_registration || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Nguyên quán</label>
              <p className="font-medium">{record.place_of_origin || '-'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Thông tin tài chính */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Thông tin tài chính & BH
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Mã số thuế cá nhân</label>
                <p className="font-medium">{record.tax_code || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Số sổ bảo hiểm</label>
                <p className="font-medium">{record.social_insurance_number || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tài khoản ngân hàng</label>
                <p className="font-medium">{record.bank_account || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tên ngân hàng</label>
                <p className="font-medium">{record.bank_name || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ghi chú */}
      {record.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Ghi chú</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{record.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Thông tin hệ thống */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin hệ thống</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium text-gray-500">Ngày tạo</label>
              <p>{formatDate(record.created_at)}</p>
            </div>
            <div>
              <label className="font-medium text-gray-500">Ngày cập nhật</label>
              <p>{formatDate(record.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
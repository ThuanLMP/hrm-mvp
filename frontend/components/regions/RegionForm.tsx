import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { Region, CreateRegionRequest, UpdateRegionRequest } from '~backend/region/types';

interface RegionFormProps {
  region?: Region;
  onSubmit: (data: CreateRegionRequest | UpdateRegionRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const timezones = [
  { value: 'Asia/Ho_Chi_Minh', label: 'Asia/Ho_Chi_Minh (UTC+7)' },
  { value: 'Asia/Bangkok', label: 'Asia/Bangkok (UTC+7)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (UTC+8)' },
  { value: 'Asia/Jakarta', label: 'Asia/Jakarta (UTC+7)' },
];

export default function RegionForm({ region, onSubmit, onCancel, isLoading }: RegionFormProps) {
  const [formData, setFormData] = useState({
    name: region?.name || '',
    code: region?.code || '',
    description: region?.description || '',
    timezone: region?.timezone || 'Asia/Ho_Chi_Minh',
    isActive: region?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (region) {
      onSubmit(formData as UpdateRegionRequest);
    } else {
      const { isActive, ...createData } = formData;
      onSubmit(createData as CreateRegionRequest);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Tên khu vực *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nhập tên khu vực"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="code">Mã khu vực *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
            placeholder="VD: HCM, HN"
            maxLength={10}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Mô tả về khu vực"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="timezone">Múi giờ</Label>
        <Select 
          value={formData.timezone} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn múi giờ" />
          </SelectTrigger>
          <SelectContent>
            {timezones.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {region && (
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
          />
          <Label htmlFor="isActive">Kích hoạt</Label>
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Đang xử lý...' : (region ? 'Cập nhật' : 'Tạo mới')}
        </Button>
      </div>
    </form>
  );
}
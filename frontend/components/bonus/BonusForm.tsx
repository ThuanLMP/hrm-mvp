import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import backend from '~backend/client';
import type { CreateBonusRequest, BonusType } from '~backend/bonus/types';
import type { Employee } from '~backend/employee/types';

interface BonusFormProps {
  onSubmit: (data: CreateBonusRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function BonusForm({ onSubmit, onCancel, isLoading }: BonusFormProps) {
  const [formData, setFormData] = useState({
    employeeId: '',
    bonusTypeId: '',
    title: '',
    description: '',
    amount: '',
    awardDate: new Date().toISOString().split('T')[0],
  });

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => backend.employee.list({ limit: 1000 }),
  });

  const { data: bonusTypes } = useQuery({
    queryKey: ['bonusTypes'],
    queryFn: () => backend.bonus.listBonusTypes(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      employeeId: parseInt(formData.employeeId),
      bonusTypeId: parseInt(formData.bonusTypeId),
      title: formData.title,
      description: formData.description || undefined,
      amount: parseFloat(formData.amount),
      awardDate: new Date(formData.awardDate),
    });
  };

  const getBonusTypeDisplay = (bonusType: BonusType) => (
    <div className="flex items-center space-x-2">
      <span className="text-lg">{bonusType.icon}</span>
      <span>{bonusType.name}</span>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="employeeId">Nhân viên *</Label>
          <Select 
            value={formData.employeeId} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn nhân viên" />
            </SelectTrigger>
            <SelectContent>
              {employees?.employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id.toString()}>
                  {employee.full_name} ({employee.employee_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="bonusTypeId">Loại thưởng *</Label>
          <Select 
            value={formData.bonusTypeId} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, bonusTypeId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại thưởng" />
            </SelectTrigger>
            <SelectContent>
              {bonusTypes?.bonusTypes.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  <div className="flex items-center space-x-2">
                    <span>{type.icon}</span>
                    <span>{type.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="title">Tiêu đề *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Nhập tiêu đề thưởng"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Mô tả chi tiết về thưởng"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Số tiền (VND) *</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="1000"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            placeholder="0"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="awardDate">Ngày thưởng *</Label>
          <Input
            id="awardDate"
            type="date"
            value={formData.awardDate}
            onChange={(e) => setFormData(prev => ({ ...prev, awardDate: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Đang tạo...' : 'Tạo thưởng'}
        </Button>
      </div>
    </form>
  );
}
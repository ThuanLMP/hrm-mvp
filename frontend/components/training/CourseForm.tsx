import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import backend from '~backend/client';
import type { CreateCourseRequest, TrainingCategory } from '~backend/training/types';

interface CourseFormProps {
  onSubmit: (data: CreateCourseRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CourseForm({ onSubmit, onCancel, isLoading }: CourseFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    instructor: '',
    durationHours: '',
    maxParticipants: '',
    startDate: '',
    endDate: '',
    location: '',
    courseType: 'in-person' as const,
    cost: '',
    imageUrl: '',
  });

  const { data: categories } = useQuery({
    queryKey: ['trainingCategories'],
    queryFn: () => backend.training.listCategories(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      title: formData.title,
      description: formData.description || undefined,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
      instructor: formData.instructor || undefined,
      durationHours: formData.durationHours ? parseInt(formData.durationHours) : undefined,
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      location: formData.location || undefined,
      courseType: formData.courseType,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      imageUrl: formData.imageUrl || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Tiêu đề khóa học *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Nhập tiêu đề khóa học"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Mô tả chi tiết về khóa học"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="categoryId">Danh mục</Label>
          <Select 
            value={formData.categoryId} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              {categories?.categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  <div className="flex items-center space-x-2">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="instructor">Giảng viên</Label>
          <Input
            id="instructor"
            value={formData.instructor}
            onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
            placeholder="Tên giảng viên"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="durationHours">Thời lượng (giờ)</Label>
          <Input
            id="durationHours"
            type="number"
            min="1"
            value={formData.durationHours}
            onChange={(e) => setFormData(prev => ({ ...prev, durationHours: e.target.value }))}
            placeholder="0"
          />
        </div>
        
        <div>
          <Label htmlFor="maxParticipants">Số lượng tối đa</Label>
          <Input
            id="maxParticipants"
            type="number"
            min="1"
            value={formData.maxParticipants}
            onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: e.target.value }))}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Ngày bắt đầu</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="endDate">Ngày kết thúc</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="courseType">Hình thức đào tạo</Label>
          <Select 
            value={formData.courseType} 
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, courseType: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in-person">Trực tiếp</SelectItem>
              <SelectItem value="online">Trực tuyến</SelectItem>
              <SelectItem value="hybrid">Kết hợp</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="cost">Chi phí (VND)</Label>
          <Input
            id="cost"
            type="number"
            min="0"
            step="1000"
            value={formData.cost}
            onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="location">Địa điểm</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          placeholder="Phòng họp, link Zoom, v.v."
        />
      </div>

      <div>
        <Label htmlFor="imageUrl">Hình ảnh</Label>
        <Input
          id="imageUrl"
          type="url"
          value={formData.imageUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
          placeholder="URL hình ảnh khóa học"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Đang tạo...' : 'Tạo khóa học'}
        </Button>
      </div>
    </form>
  );
}
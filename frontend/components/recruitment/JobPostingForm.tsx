import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import backend from '~backend/client';
import type { CreateJobPostingRequest } from '~backend/recruitment/types';

interface JobPostingFormProps {
  onSubmit: (data: CreateJobPostingRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function JobPostingForm({ onSubmit, onCancel, isLoading }: JobPostingFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departmentId: '',
    location: '',
    employmentType: 'full-time' as const,
    experienceLevel: 'mid' as const,
    salaryMin: '',
    salaryMax: '',
    requirements: '',
    benefits: '',
    skills: '',
    deadline: '',
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => backend.department.list(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse skills from comma-separated string
    const skillsArray = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [];
    
    onSubmit({
      title: formData.title,
      description: formData.description,
      departmentId: formData.departmentId ? parseInt(formData.departmentId) : undefined,
      location: formData.location || undefined,
      employmentType: formData.employmentType,
      experienceLevel: formData.experienceLevel,
      salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : undefined,
      salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : undefined,
      requirements: formData.requirements || undefined,
      benefits: formData.benefits || undefined,
      skills: skillsArray.length > 0 ? skillsArray : undefined,
      deadline: formData.deadline ? new Date(formData.deadline) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Tiêu đề công việc *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Ví dụ: Senior Frontend Developer"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Mô tả công việc *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Mô tả chi tiết về vị trí công việc, trách nhiệm và yêu cầu"
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="departmentId">Phòng ban</Label>
          <Select 
            value={formData.departmentId} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, departmentId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn phòng ban" />
            </SelectTrigger>
            <SelectContent>
              {departments?.departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="location">Địa điểm</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Ví dụ: Hồ Chí Minh, Hà Nội"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="employmentType">Loại hình làm việc</Label>
          <Select 
            value={formData.employmentType} 
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, employmentType: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">Toàn thời gian</SelectItem>
              <SelectItem value="part-time">Bán thời gian</SelectItem>
              <SelectItem value="contract">Hợp đồng</SelectItem>
              <SelectItem value="internship">Thực tập</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="experienceLevel">Cấp độ kinh nghiệm</Label>
          <Select 
            value={formData.experienceLevel} 
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, experienceLevel: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Mới tốt nghiệp</SelectItem>
              <SelectItem value="mid">Trung cấp</SelectItem>
              <SelectItem value="senior">Cấp cao</SelectItem>
              <SelectItem value="executive">Điều hành</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="salaryMin">Lương tối thiểu (VND)</Label>
          <Input
            id="salaryMin"
            type="number"
            min="0"
            step="1000000"
            value={formData.salaryMin}
            onChange={(e) => setFormData(prev => ({ ...prev, salaryMin: e.target.value }))}
            placeholder="15000000"
          />
        </div>
        
        <div>
          <Label htmlFor="salaryMax">Lương tối đa (VND)</Label>
          <Input
            id="salaryMax"
            type="number"
            min="0"
            step="1000000"
            value={formData.salaryMax}
            onChange={(e) => setFormData(prev => ({ ...prev, salaryMax: e.target.value }))}
            placeholder="25000000"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="requirements">Yêu cầu công việc</Label>
        <Textarea
          id="requirements"
          value={formData.requirements}
          onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
          placeholder="- Tối thiểu 3 năm kinh nghiệm&#10;- Thành thạo React, TypeScript&#10;- Kỹ năng giao tiếp tốt"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="benefits">Quyền lợi</Label>
        <Textarea
          id="benefits"
          value={formData.benefits}
          onChange={(e) => setFormData(prev => ({ ...prev, benefits: e.target.value }))}
          placeholder="- Lương cạnh tranh&#10;- Bảo hiểm đầy đủ&#10;- Cơ hội thăng tiến"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="skills">Kỹ năng (cách nhau bởi dấu phẩy)</Label>
        <Input
          id="skills"
          value={formData.skills}
          onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
          placeholder="React, TypeScript, JavaScript, HTML, CSS"
        />
      </div>

      <div>
        <Label htmlFor="deadline">Hạn ứng tuyển</Label>
        <Input
          id="deadline"
          type="date"
          value={formData.deadline}
          onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Đang tạo...' : 'Đăng tin tuyển dụng'}
        </Button>
      </div>
    </form>
  );
}
import { useState } from 'react';
import { Plus, Search, Filter, Briefcase, MapPin, Calendar, Users, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import JobPostingForm from '@/components/recruitment/JobPostingForm';
import { useAuthenticatedBackend } from '../hooks/useAuthenticatedBackend';
import backend from '~backend/client';
import type { JobPosting, CreateJobPostingRequest, RecruitmentStats } from '~backend/recruitment/types';
import { useAuth } from '../contexts/AuthContext';

export function RecruitmentPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const authBackend = useAuthenticatedBackend();
  const { user } = useAuth();

  const canManageJobs = user?.role === 'admin' || user?.role === 'hr';

  const { data: jobPostings, isLoading } = useQuery({
    queryKey: ['jobPostings', search, statusFilter, departmentFilter, employmentTypeFilter],
    queryFn: () => backend.recruitment.listJobPostings({
      search: search || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      departmentId: departmentFilter !== 'all' ? parseInt(departmentFilter) : undefined,
      employmentType: employmentTypeFilter !== 'all' ? employmentTypeFilter : undefined,
      limit: 100,
    }),
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => backend.department.list(),
  });

  const { data: stats } = useQuery({
    queryKey: ['recruitmentStats'],
    queryFn: () => backend.recruitment.getRecruitmentStats({}),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateJobPostingRequest) => authBackend.recruitment.createJobPosting(data),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đăng tin tuyển dụng thành công",
      });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['jobPostings'] });
      queryClient.invalidateQueries({ queryKey: ['recruitmentStats'] });
    },
    onError: (error: any) => {
      console.error('Failed to create job posting:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể đăng tin tuyển dụng",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      published: 'default',
      paused: 'secondary',
      closed: 'destructive',
      filled: 'default',
    } as const;
    
    const labels = {
      draft: 'Bản nháp',
      published: 'Đã đăng',
      paused: 'Tạm dừng',
      closed: 'Đã đóng',
      filled: 'Đã tuyển',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getEmploymentTypeBadge = (type: string) => {
    const labels = {
      'full-time': 'Toàn thời gian',
      'part-time': 'Bán thời gian',
      'contract': 'Hợp đồng',
      'internship': 'Thực tập',
    };

    return (
      <Badge variant="outline">
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const getExperienceLevelBadge = (level: string) => {
    const labels = {
      'entry': 'Mới tốt nghiệp',
      'mid': 'Trung cấp',
      'senior': 'Cấp cao',
      'executive': 'Điều hành',
    };

    return (
      <Badge variant="outline">
        {labels[level as keyof typeof labels] || level}
      </Badge>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Đăng tin tuyển dụng</h1>
          <p className="text-muted-foreground">Quản lý các vị trí tuyển dụng và ứng viên</p>
        </div>
        {canManageJobs && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Đăng tin mới
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng tin tuyển dụng</p>
                <p className="text-2xl font-bold">{stats?.totalJobPostings || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">vị trí</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Đang tuyển</p>
                <p className="text-2xl font-bold">{stats?.activeJobPostings || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">vị trí</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ứng viên</p>
                <p className="text-2xl font-bold">{stats?.totalCandidates || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">người</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Đã tuyển</p>
                <p className="text-2xl font-bold">{stats?.hiredCount || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">người</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Tìm kiếm và lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm kiếm vị trí..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Phòng ban" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phòng ban</SelectItem>
                {departments?.departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="published">Đã đăng</SelectItem>
                <SelectItem value="paused">Tạm dừng</SelectItem>
                <SelectItem value="closed">Đã đóng</SelectItem>
                <SelectItem value="filled">Đã tuyển</SelectItem>
              </SelectContent>
            </Select>

            <Select value={employmentTypeFilter} onValueChange={setEmploymentTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Loại hình" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại hình</SelectItem>
                <SelectItem value="full-time">Toàn thời gian</SelectItem>
                <SelectItem value="part-time">Bán thời gian</SelectItem>
                <SelectItem value="contract">Hợp đồng</SelectItem>
                <SelectItem value="internship">Thực tập</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setDepartmentFilter('all');
                setEmploymentTypeFilter('all');
              }}
            >
              Làm mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job Postings List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {jobPostings?.jobPostings.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <p className="text-muted-foreground">{job.departmentName}</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {getStatusBadge(job.status)}
                    {getEmploymentTypeBadge(job.employmentType)}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {job.description}
                </p>

                <div className="space-y-2 text-sm">
                  {job.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-muted-foreground">
                    <Briefcase className="h-4 w-4 mr-2" />
                    <span>{getExperienceLevelBadge(job.experienceLevel)}</span>
                  </div>
                  
                  {(job.salaryMin || job.salaryMax) && (
                    <div className="flex items-center text-green-600 font-medium">
                      <span>💰</span>
                      <span className="ml-2">
                        {job.salaryMin && job.salaryMax 
                          ? `${formatCurrency(job.salaryMin)} - ${formatCurrency(job.salaryMax)}`
                          : job.salaryMin 
                            ? `Từ ${formatCurrency(job.salaryMin)}`
                            : `Đến ${formatCurrency(job.salaryMax!)}`
                        }
                      </span>
                    </div>
                  )}
                  
                  {job.deadline && (
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Hạn: {formatDate(job.deadline)}</span>
                    </div>
                  )}
                </div>

                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {job.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {job.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{job.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-muted-foreground">
                    <Users className="h-4 w-4 inline mr-1" />
                    {job.applicationsCount || 0} ứng viên
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canManageJobs && (
                      <>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {jobPostings?.jobPostings.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Chưa có tin tuyển dụng nào</h3>
            <p className="text-muted-foreground text-center mb-4">
              Bắt đầu bằng cách đăng tin tuyển dụng đầu tiên
            </p>
            {canManageJobs && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Đăng tin tuyển dụng
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Job Posting Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Đăng tin tuyển dụng mới</DialogTitle>
          </DialogHeader>
          <JobPostingForm
            onSubmit={async (data) => { await createMutation.mutateAsync(data); }}
            onCancel={() => setShowForm(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
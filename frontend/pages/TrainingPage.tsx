import { useState } from 'react';
import { Plus, Search, Filter, Users, Clock, MapPin, Calendar, Eye, UserPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CourseForm from '@/components/training/CourseForm';
import { useAuthenticatedBackend } from '../hooks/useAuthenticatedBackend';
import backend from '~backend/client';
import type { TrainingCourse, CreateCourseRequest, TrainingStats } from '~backend/training/types';
import { useAuth } from '../contexts/AuthContext';

export function TrainingPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [courseTypeFilter, setCourseTypeFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const authBackend = useAuthenticatedBackend();
  const { user } = useAuth();

  const canManageTraining = user?.role === 'admin' || user?.role === 'hr' || user?.role === 'manager';

  // Get current month dates for filtering
  const getCurrentMonthDates = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0],
    };
  };

  const { data: courses, isLoading } = useQuery({
    queryKey: ['trainingCourses', search, statusFilter, categoryFilter, courseTypeFilter],
    queryFn: () => backend.training.listCourses({
      search: search || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      categoryId: categoryFilter !== 'all' ? parseInt(categoryFilter) : undefined,
      courseType: courseTypeFilter !== 'all' ? courseTypeFilter : undefined,
      limit: 100,
    }),
  });

  const { data: categories } = useQuery({
    queryKey: ['trainingCategories'],
    queryFn: () => backend.training.listCategories(),
  });

  const { data: stats } = useQuery({
    queryKey: ['trainingStats', selectedPeriod],
    queryFn: () => {
      if (selectedPeriod === 'current-month') {
        const { startDate, endDate } = getCurrentMonthDates();
        return backend.training.getStats({ startDate, endDate });
      }
      return backend.training.getStats({});
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCourseRequest) => authBackend.training.createCourse(data),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Tạo khóa học thành công",
      });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['trainingCourses'] });
      queryClient.invalidateQueries({ queryKey: ['trainingStats'] });
    },
    onError: (error: any) => {
      console.error('Failed to create course:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo khóa học",
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
      planning: 'secondary',
      ongoing: 'default',
      completed: 'default',
      cancelled: 'destructive',
    } as const;
    
    const labels = {
      planning: 'Lên kế hoạch',
      ongoing: 'Đang diễn ra',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getCourseTypeBadge = (type: string) => {
    const labels = {
      'in-person': 'Trực tiếp',
      'online': 'Trực tuyến',
      'hybrid': 'Kết hợp',
    };

    return (
      <Badge variant="outline">
        {labels[type as keyof typeof labels] || type}
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
          <h1 className="text-2xl font-bold text-foreground">Đào tạo và phát triển</h1>
          <p className="text-muted-foreground">Quản lý chương trình đào tạo và phát triển nhân viên</p>
        </div>
        {canManageTraining && (
          <div className="flex space-x-2">
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo khóa học
            </Button>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng khóa học</p>
                <p className="text-2xl font-bold">{stats?.totalCourses || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.monthlyGrowth && stats.monthlyGrowth > 0 ? '+' : ''}{stats?.monthlyGrowth || 0}%
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nhân viên tham gia</p>
                <p className="text-2xl font-bold">{stats?.totalParticipants || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">người</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hoàn thành</p>
                <p className="text-2xl font-bold">{stats?.completionRate || 0}%</p>
                <p className="text-xs text-muted-foreground mt-1">tỷ lệ</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Chi phí đào tạo</p>
                <p className="text-2xl font-bold">{((stats?.totalCost || 0) / 1000000).toFixed(0)}M</p>
                <p className="text-xs text-muted-foreground mt-1">VND</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
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
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm khóa học, nhân viên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Tháng này</SelectItem>
                <SelectItem value="all">Tất cả thời gian</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Phòng ban" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phòng ban</SelectItem>
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="planning">Lên kế hoạch</SelectItem>
                <SelectItem value="ongoing">Đang diễn ra</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>

            <Select value={courseTypeFilter} onValueChange={setCourseTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Hình thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả hình thức</SelectItem>
                <SelectItem value="in-person">Trực tiếp</SelectItem>
                <SelectItem value="online">Trực tuyến</SelectItem>
                <SelectItem value="hybrid">Kết hợp</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setCategoryFilter('all');
                setCourseTypeFilter('all');
              }}
            >
              Làm mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Course List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <div className="relative">
              {course.imageUrl ? (
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x200/e5e7eb/6b7280?text=Khóa+học';
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg flex items-center justify-center">
                  <span className="text-4xl text-blue-500">📚</span>
                </div>
              )}
              <div className="absolute top-4 left-4">
                {getStatusBadge(course.status)}
              </div>
              <div className="absolute top-4 right-4">
                {getCourseTypeBadge(course.courseType)}
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
                  {course.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  {course.instructor && (
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{course.instructor}</span>
                    </div>
                  )}
                  
                  {course.durationHours && (
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{course.durationHours} giờ</span>
                    </div>
                  )}
                  
                  {course.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">{course.location}</span>
                    </div>
                  )}
                  
                  {course.startDate && (
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(course.startDate)}</span>
                      {course.endDate && <span> - {formatDate(course.endDate)}</span>}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-muted-foreground">
                      {course.enrolledCount || 0}/{course.maxParticipants || '∞'} người
                    </span>
                    {course.cost && (
                      <span className="font-medium text-green-600">
                        {formatCurrency(course.cost)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    Xem
                  </Button>
                  {canManageTraining && (
                    <Button variant="outline" size="sm">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses?.courses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <span className="text-6xl mb-4">📚</span>
            <h3 className="text-lg font-medium mb-2">Chưa có khóa học nào</h3>
            <p className="text-muted-foreground text-center mb-4">
              Bắt đầu bằng cách tạo khóa học đào tạo đầu tiên
            </p>
            {canManageTraining && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo khóa học
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Course Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Tạo khóa học mới</DialogTitle>
          </DialogHeader>
          <CourseForm
            onSubmit={async (data) => { await createMutation.mutateAsync(data); }}
            onCancel={() => setShowForm(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Eye, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BonusForm from '@/components/bonus/BonusForm';
import { useAuthenticatedBackend } from '../hooks/useAuthenticatedBackend';
import backend from '~backend/client';
import type { Bonus, CreateBonusRequest, BonusStats } from '~backend/bonus/types';
import { useAuth } from '../contexts/AuthContext';

export function BonusPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bonusTypeFilter, setBonusTypeFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const authBackend = useAuthenticatedBackend();
  const { user } = useAuth();

  const canManageBonuses = user?.role === 'admin' || user?.role === 'hr';

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

  const { data: bonuses, isLoading } = useQuery({
    queryKey: ['bonuses', search, statusFilter, bonusTypeFilter],
    queryFn: () => backend.bonus.list({
      search: search || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      bonusTypeId: bonusTypeFilter !== 'all' ? parseInt(bonusTypeFilter) : undefined,
      limit: 100,
    }),
  });

  const { data: bonusTypes } = useQuery({
    queryKey: ['bonusTypes'],
    queryFn: () => backend.bonus.listBonusTypes(),
  });

  const { data: stats } = useQuery({
    queryKey: ['bonusStats', selectedPeriod],
    queryFn: () => {
      if (selectedPeriod === 'current-month') {
        const { startDate, endDate } = getCurrentMonthDates();
        return backend.bonus.stats({ startDate, endDate });
      }
      return backend.bonus.stats({});
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateBonusRequest) => authBackend.bonus.create(data),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Tạo thưởng thành công",
      });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['bonuses'] });
      queryClient.invalidateQueries({ queryKey: ['bonusStats'] });
    },
    onError: (error: any) => {
      console.error('Failed to create bonus:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo thưởng",
        variant: "destructive",
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, approvedBy }: { id: number; approvedBy: number }) => 
      authBackend.bonus.approve({ id, approvedBy }),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Phê duyệt thưởng thành công",
      });
      queryClient.invalidateQueries({ queryKey: ['bonuses'] });
      queryClient.invalidateQueries({ queryKey: ['bonusStats'] });
    },
    onError: (error: any) => {
      console.error('Failed to approve bonus:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể phê duyệt thưởng",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => 
      authBackend.bonus.reject({ id, rejectionReason: reason }),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Từ chối thưởng thành công",
      });
      queryClient.invalidateQueries({ queryKey: ['bonuses'] });
      queryClient.invalidateQueries({ queryKey: ['bonusStats'] });
    },
    onError: (error: any) => {
      console.error('Failed to reject bonus:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể từ chối thưởng",
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
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      paid: 'default',
    } as const;
    
    const labels = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Từ chối',
      paid: 'Đã chi trả',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const handleApprove = (bonus: Bonus) => {
    if (!user?.id) return;
    approveMutation.mutate({ id: bonus.id, approvedBy: user.id });
  };

  const handleReject = (bonus: Bonus) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (reason && reason.trim()) {
      rejectMutation.mutate({ id: bonus.id, reason: reason.trim() });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý thưởng</h1>
          <p className="text-muted-foreground">Theo dõi và quản lý các khoản thưởng nhân viên</p>
        </div>
        {canManageBonuses && (
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo thưởng mới
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
                <p className="text-sm font-medium text-muted-foreground">Tổng thưởng tháng này</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.totalAmount || 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.monthlyGrowth && stats.monthlyGrowth > 0 ? '+' : ''}{stats?.monthlyGrowth || 0}% so với tháng trước
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Số lượt thưởng</p>
                <p className="text-2xl font-bold">{stats?.totalCount || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">lượt</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Thưởng trung bình</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.averageAmount || 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">VND</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nhân viên được thưởng</p>
                <p className="text-2xl font-bold">{stats?.approvedCount || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">người</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
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
            Bộ lọc nâng cao
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm kiếm thưởng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Tháng này</SelectItem>
                <SelectItem value="all">Tất cả thời gian</SelectItem>
              </SelectContent>
            </Select>

            <Select value={bonusTypeFilter} onValueChange={setBonusTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại thưởng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại thưởng</SelectItem>
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
                <SelectItem value="paid">Đã chi trả</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setBonusTypeFilter('all');
              }}
            >
              Làm mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bonus List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Danh sách thưởng ({bonuses?.total || 0} khoản thưởng)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Nhân viên</th>
                  <th className="text-left py-3 px-4">Loại thưởng</th>
                  <th className="text-left py-3 px-4">Tiêu đề</th>
                  <th className="text-left py-3 px-4">Số tiền</th>
                  <th className="text-left py-3 px-4">Ngày</th>
                  <th className="text-left py-3 px-4">Trạng thái</th>
                  <th className="text-left py-3 px-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {bonuses?.bonuses.map((bonus) => (
                  <tr key={bonus.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-medium">{bonus.employeeName}</span>
                        <div className="text-sm text-muted-foreground">{bonus.employeeCode}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{bonus.bonusTypeIcon}</span>
                        <span className="text-sm">{bonus.bonusTypeName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-medium">{bonus.title}</span>
                        {bonus.description && (
                          <div className="text-sm text-muted-foreground">{bonus.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-green-600">
                      {formatCurrency(bonus.amount)}
                    </td>
                    <td className="py-3 px-4">{formatDate(bonus.awardDate)}</td>
                    <td className="py-3 px-4">
                      {getStatusBadge(bonus.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canManageBonuses && bonus.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(bonus)}
                              disabled={approveMutation.isPending}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(bonus)}
                              disabled={rejectMutation.isPending}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {bonuses?.bonuses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Không tìm thấy khoản thưởng nào
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Bonus Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Tạo thưởng mới</DialogTitle>
          </DialogHeader>
          <BonusForm
            onSubmit={async (data) => { await createMutation.mutateAsync(data); }}
            onCancel={() => setShowForm(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}